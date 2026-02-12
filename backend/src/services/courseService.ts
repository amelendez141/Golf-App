import { courseRepository } from '../repositories/courseRepository.js';
import { NotFoundError } from '../utils/errors.js';
import type { Course } from '@prisma/client';
import type { SearchCoursesInput } from '../validators/course.js';
import type { CourseWithDistance } from '../repositories/courseRepository.js';

export const courseService = {
  async getById(id: string): Promise<Course> {
    const course = await courseRepository.findById(id);
    if (!course) {
      throw new NotFoundError('Course not found');
    }
    return course;
  },

  async getBySlug(slug: string): Promise<Course> {
    const course = await courseRepository.findBySlug(slug);
    if (!course) {
      throw new NotFoundError('Course not found');
    }
    return course;
  },

  async search(params: SearchCoursesInput): Promise<{
    courses: CourseWithDistance[];
    nextCursor: string | null;
    hasMore: boolean;
  }> {
    const { courses, hasMore } = await courseRepository.search(params);

    const lastCourse = courses[courses.length - 1];
    const nextCursor = hasMore && lastCourse ? lastCourse.id : null;

    return { courses, nextCursor, hasMore };
  },

  async getNearby(
    latitude: number,
    longitude: number,
    radiusMiles: number
  ): Promise<CourseWithDistance[]> {
    return courseRepository.findNearby(latitude, longitude, radiusMiles);
  },

  async toggleFavorite(userId: string, courseId: string): Promise<boolean> {
    await this.getById(courseId);

    const isFavorited = await courseRepository.isFavorited(userId, courseId);

    if (isFavorited) {
      await courseRepository.removeFavorite(userId, courseId);
      return false;
    } else {
      await courseRepository.addFavorite(userId, courseId);
      return true;
    }
  },

  async getFavorites(userId: string): Promise<Course[]> {
    return courseRepository.getFavorites(userId);
  },

  async isFavorited(userId: string, courseId: string): Promise<boolean> {
    return courseRepository.isFavorited(userId, courseId);
  },

  formatCourse(course: Course & { distance?: number }, isFavorited?: boolean) {
    return {
      id: course.id,
      name: course.name,
      slug: course.slug,
      address: course.address,
      city: course.city,
      state: course.state,
      zipCode: course.zipCode,
      country: course.country,
      latitude: course.latitude,
      longitude: course.longitude,
      phone: course.phone,
      website: course.website,
      courseType: course.courseType,
      holes: course.holes,
      par: course.par,
      rating: course.rating,
      slope: course.slope,
      yardage: course.yardage,
      greenFee: course.greenFee,
      amenities: course.amenities,
      imageUrl: course.imageUrl,
      description: course.description,
      distance: course.distance,
      isFavorited,
    };
  },
};
