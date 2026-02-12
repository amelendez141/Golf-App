import { prisma } from '../config/database.js';
import type { Course, Prisma } from '@prisma/client';
import { getBoundingBox, calculateDistance } from '../utils/haversine.js';
import type { SearchCoursesInput } from '../validators/course.js';

export interface CourseWithDistance extends Course {
  distance?: number;
}

export const courseRepository = {
  async findById(id: string): Promise<Course | null> {
    return prisma.course.findUnique({
      where: { id },
    });
  },

  async findBySlug(slug: string): Promise<Course | null> {
    return prisma.course.findUnique({
      where: { slug },
    });
  },

  async search(params: SearchCoursesInput): Promise<{ courses: CourseWithDistance[]; hasMore: boolean }> {
    const { query, latitude, longitude, radius, courseType, minRating, cursor, limit } = params;

    const where: Prisma.CourseWhereInput = {};

    // Text search
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { city: { contains: query, mode: 'insensitive' } },
        { state: { contains: query, mode: 'insensitive' } },
      ];
    }

    // Geospatial filter using bounding box
    if (latitude !== undefined && longitude !== undefined) {
      const bbox = getBoundingBox({ latitude, longitude }, radius);
      where.latitude = { gte: bbox.minLat, lte: bbox.maxLat };
      where.longitude = { gte: bbox.minLng, lte: bbox.maxLng };
    }

    if (courseType) {
      where.courseType = courseType;
    }

    if (minRating !== undefined) {
      where.rating = { gte: minRating };
    }

    if (cursor) {
      where.id = { lt: cursor };
    }

    let courses = await prisma.course.findMany({
      where,
      take: limit + 1,
      orderBy: { id: 'desc' },
    });

    // Calculate distances and filter by actual radius
    if (latitude !== undefined && longitude !== undefined) {
      courses = courses
        .map((course) => ({
          ...course,
          distance: calculateDistance(
            { latitude, longitude },
            { latitude: course.latitude, longitude: course.longitude }
          ),
        }))
        .filter((course) => (course.distance ?? 0) <= radius)
        .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
    }

    const hasMore = courses.length > limit;
    if (hasMore) {
      courses.pop();
    }

    return { courses, hasMore };
  },

  async findNearby(
    latitude: number,
    longitude: number,
    radiusMiles: number,
    limit: number = 20
  ): Promise<CourseWithDistance[]> {
    const bbox = getBoundingBox({ latitude, longitude }, radiusMiles);

    const courses = await prisma.course.findMany({
      where: {
        latitude: { gte: bbox.minLat, lte: bbox.maxLat },
        longitude: { gte: bbox.minLng, lte: bbox.maxLng },
      },
      take: limit * 2, // Fetch extra to account for radius filtering
    });

    return courses
      .map((course) => ({
        ...course,
        distance: calculateDistance(
          { latitude, longitude },
          { latitude: course.latitude, longitude: course.longitude }
        ),
      }))
      .filter((course) => (course.distance ?? 0) <= radiusMiles)
      .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0))
      .slice(0, limit);
  },

  async create(data: Prisma.CourseCreateInput): Promise<Course> {
    return prisma.course.create({
      data,
    });
  },

  async update(id: string, data: Prisma.CourseUpdateInput): Promise<Course> {
    return prisma.course.update({
      where: { id },
      data,
    });
  },

  async isFavorited(userId: string, courseId: string): Promise<boolean> {
    const favorite = await prisma.favoriteCourse.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
    });
    return !!favorite;
  },

  async addFavorite(userId: string, courseId: string): Promise<void> {
    await prisma.favoriteCourse.upsert({
      where: {
        userId_courseId: { userId, courseId },
      },
      create: { userId, courseId },
      update: {},
    });
  },

  async removeFavorite(userId: string, courseId: string): Promise<void> {
    await prisma.favoriteCourse.deleteMany({
      where: { userId, courseId },
    });
  },

  async getFavorites(userId: string): Promise<Course[]> {
    const favorites = await prisma.favoriteCourse.findMany({
      where: { userId },
      include: { course: true },
      orderBy: { createdAt: 'desc' },
    });
    return favorites.map((f) => f.course);
  },
};
