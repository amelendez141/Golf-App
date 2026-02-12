/**
 * Course Service Unit Tests
 *
 * Tests the course service which handles course operations including
 * search, favorites management, and data formatting.
 */

import { courseService } from '../../src/services/courseService';
import { courseRepository } from '../../src/repositories/courseRepository';
import { NotFoundError } from '../../src/utils/errors';
import { createMockCourse, createMockCourseWithDistance } from '../mocks/factories';
import type { Course, CourseType } from '@prisma/client';

// Mock the courseRepository
jest.mock('../../src/repositories/courseRepository');

const mockCourseRepository = courseRepository as jest.Mocked<typeof courseRepository>;

describe('CourseService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getById', () => {
    it('should return course when found', async () => {
      const mockCourse = createMockCourse({ id: 'course-123' });
      mockCourseRepository.findById.mockResolvedValue(mockCourse);

      const result = await courseService.getById('course-123');

      expect(result).toEqual(mockCourse);
      expect(mockCourseRepository.findById).toHaveBeenCalledWith('course-123');
    });

    it('should throw NotFoundError when course not found', async () => {
      mockCourseRepository.findById.mockResolvedValue(null);

      await expect(courseService.getById('nonexistent')).rejects.toThrow(
        NotFoundError
      );
      await expect(courseService.getById('nonexistent')).rejects.toThrow(
        'Course not found'
      );
    });

    it('should propagate repository errors', async () => {
      mockCourseRepository.findById.mockRejectedValue(new Error('DB Error'));

      await expect(courseService.getById('course-123')).rejects.toThrow(
        'DB Error'
      );
    });
  });

  describe('getBySlug', () => {
    it('should return course when found by slug', async () => {
      const mockCourse = createMockCourse({
        id: 'course-123',
        slug: 'pebble-beach',
      });
      mockCourseRepository.findBySlug.mockResolvedValue(mockCourse);

      const result = await courseService.getBySlug('pebble-beach');

      expect(result).toEqual(mockCourse);
      expect(mockCourseRepository.findBySlug).toHaveBeenCalledWith(
        'pebble-beach'
      );
    });

    it('should throw NotFoundError when slug not found', async () => {
      mockCourseRepository.findBySlug.mockResolvedValue(null);

      await expect(
        courseService.getBySlug('nonexistent-slug')
      ).rejects.toThrow(NotFoundError);
    });

    it('should handle slugs with special characters', async () => {
      const mockCourse = createMockCourse({
        slug: 'st-andrews-old-course',
      });
      mockCourseRepository.findBySlug.mockResolvedValue(mockCourse);

      const result = await courseService.getBySlug('st-andrews-old-course');

      expect(result.slug).toBe('st-andrews-old-course');
    });
  });

  describe('search', () => {
    it('should return search results with pagination', async () => {
      const courses = [
        createMockCourseWithDistance({ id: 'course-1', distance: 5 }),
        createMockCourseWithDistance({ id: 'course-2', distance: 10 }),
      ];

      mockCourseRepository.search.mockResolvedValue({
        courses,
        hasMore: true,
      });

      const result = await courseService.search({
        latitude: 37.7749,
        longitude: -122.4194,
        radius: 50,
        limit: 2,
      });

      expect(result.courses).toHaveLength(2);
      expect(result.hasMore).toBe(true);
      expect(result.nextCursor).toBe('course-2');
    });

    it('should return null cursor when no more results', async () => {
      const courses = [
        createMockCourseWithDistance({ id: 'course-1' }),
      ];

      mockCourseRepository.search.mockResolvedValue({
        courses,
        hasMore: false,
      });

      const result = await courseService.search({
        latitude: 37.7749,
        longitude: -122.4194,
        radius: 50,
        limit: 10,
      });

      expect(result.hasMore).toBe(false);
      expect(result.nextCursor).toBeNull();
    });

    it('should handle empty search results', async () => {
      mockCourseRepository.search.mockResolvedValue({
        courses: [],
        hasMore: false,
      });

      const result = await courseService.search({
        query: 'nonexistent course',
        limit: 10,
      });

      expect(result.courses).toHaveLength(0);
      expect(result.hasMore).toBe(false);
      expect(result.nextCursor).toBeNull();
    });

    it('should pass search parameters to repository', async () => {
      mockCourseRepository.search.mockResolvedValue({
        courses: [],
        hasMore: false,
      });

      const searchParams = {
        query: 'golf',
        latitude: 37.7749,
        longitude: -122.4194,
        radius: 25,
        courseType: 'PUBLIC' as CourseType,
        minRating: 4.0,
        cursor: 'cursor-123',
        limit: 20,
      };

      await courseService.search(searchParams);

      expect(mockCourseRepository.search).toHaveBeenCalledWith(searchParams);
    });
  });

  describe('getNearby', () => {
    it('should return nearby courses sorted by distance', async () => {
      const nearbyCourses = [
        createMockCourseWithDistance({ id: 'near-1', distance: 2 }),
        createMockCourseWithDistance({ id: 'near-2', distance: 5 }),
        createMockCourseWithDistance({ id: 'near-3', distance: 8 }),
      ];

      mockCourseRepository.findNearby.mockResolvedValue(nearbyCourses);

      const result = await courseService.getNearby(37.7749, -122.4194, 10);

      expect(result).toHaveLength(3);
      expect(result[0].distance).toBe(2);
      expect(mockCourseRepository.findNearby).toHaveBeenCalledWith(
        37.7749,
        -122.4194,
        10
      );
    });

    it('should return empty array when no courses nearby', async () => {
      mockCourseRepository.findNearby.mockResolvedValue([]);

      const result = await courseService.getNearby(37.7749, -122.4194, 5);

      expect(result).toHaveLength(0);
    });
  });

  describe('toggleFavorite', () => {
    const mockCourse = createMockCourse({ id: 'course-fav' });

    beforeEach(() => {
      mockCourseRepository.findById.mockResolvedValue(mockCourse);
    });

    it('should add course to favorites when not favorited', async () => {
      mockCourseRepository.isFavorited.mockResolvedValue(false);
      mockCourseRepository.addFavorite.mockResolvedValue();

      const result = await courseService.toggleFavorite('user-123', 'course-fav');

      expect(result).toBe(true);
      expect(mockCourseRepository.addFavorite).toHaveBeenCalledWith(
        'user-123',
        'course-fav'
      );
      expect(mockCourseRepository.removeFavorite).not.toHaveBeenCalled();
    });

    it('should remove course from favorites when already favorited', async () => {
      mockCourseRepository.isFavorited.mockResolvedValue(true);
      mockCourseRepository.removeFavorite.mockResolvedValue();

      const result = await courseService.toggleFavorite('user-123', 'course-fav');

      expect(result).toBe(false);
      expect(mockCourseRepository.removeFavorite).toHaveBeenCalledWith(
        'user-123',
        'course-fav'
      );
      expect(mockCourseRepository.addFavorite).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError for nonexistent course', async () => {
      mockCourseRepository.findById.mockResolvedValue(null);

      await expect(
        courseService.toggleFavorite('user-123', 'nonexistent')
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('getFavorites', () => {
    it('should return user favorite courses', async () => {
      const favorites = [
        createMockCourse({ id: 'fav-1' }),
        createMockCourse({ id: 'fav-2' }),
      ];

      mockCourseRepository.getFavorites.mockResolvedValue(favorites);

      const result = await courseService.getFavorites('user-123');

      expect(result).toHaveLength(2);
      expect(mockCourseRepository.getFavorites).toHaveBeenCalledWith('user-123');
    });

    it('should return empty array when no favorites', async () => {
      mockCourseRepository.getFavorites.mockResolvedValue([]);

      const result = await courseService.getFavorites('user-123');

      expect(result).toHaveLength(0);
    });
  });

  describe('isFavorited', () => {
    it('should return true when course is favorited', async () => {
      mockCourseRepository.isFavorited.mockResolvedValue(true);

      const result = await courseService.isFavorited('user-123', 'course-123');

      expect(result).toBe(true);
      expect(mockCourseRepository.isFavorited).toHaveBeenCalledWith(
        'user-123',
        'course-123'
      );
    });

    it('should return false when course is not favorited', async () => {
      mockCourseRepository.isFavorited.mockResolvedValue(false);

      const result = await courseService.isFavorited('user-123', 'course-123');

      expect(result).toBe(false);
    });
  });

  describe('formatCourse', () => {
    it('should format course with all fields', () => {
      const course = createMockCourse({
        id: 'course-123',
        name: 'Pebble Beach Golf Links',
        slug: 'pebble-beach-golf-links',
        address: '1700 17-Mile Drive',
        city: 'Pebble Beach',
        state: 'CA',
        zipCode: '93953',
        country: 'USA',
        latitude: 36.5669,
        longitude: -121.9471,
        phone: '831-624-3811',
        website: 'https://www.pebblebeach.com',
        courseType: 'RESORT' as CourseType,
        holes: 18,
        par: 72,
        rating: 75.5,
        slope: 145,
        yardage: 6828,
        greenFee: 55000, // $550 in cents
        amenities: ['Pro Shop', 'Restaurant', 'Caddie Service'],
        imageUrl: 'https://example.com/pebble.jpg',
        description: 'Iconic oceanfront golf course',
      });

      const result = courseService.formatCourse(course);

      expect(result).toEqual({
        id: 'course-123',
        name: 'Pebble Beach Golf Links',
        slug: 'pebble-beach-golf-links',
        address: '1700 17-Mile Drive',
        city: 'Pebble Beach',
        state: 'CA',
        zipCode: '93953',
        country: 'USA',
        latitude: 36.5669,
        longitude: -121.9471,
        phone: '831-624-3811',
        website: 'https://www.pebblebeach.com',
        courseType: 'RESORT',
        holes: 18,
        par: 72,
        rating: 75.5,
        slope: 145,
        yardage: 6828,
        greenFee: 55000,
        amenities: ['Pro Shop', 'Restaurant', 'Caddie Service'],
        imageUrl: 'https://example.com/pebble.jpg',
        description: 'Iconic oceanfront golf course',
        distance: undefined,
        isFavorited: undefined,
      });
    });

    it('should include distance when available', () => {
      const courseWithDistance = {
        ...createMockCourse(),
        distance: 5.5,
      };

      const result = courseService.formatCourse(courseWithDistance);

      expect(result.distance).toBe(5.5);
    });

    it('should include isFavorited when provided', () => {
      const course = createMockCourse();

      const resultFavorited = courseService.formatCourse(course, true);
      const resultNotFavorited = courseService.formatCourse(course, false);

      expect(resultFavorited.isFavorited).toBe(true);
      expect(resultNotFavorited.isFavorited).toBe(false);
    });

    it('should handle null optional fields', () => {
      const course = createMockCourse({
        phone: null,
        website: null,
        par: null,
        rating: null,
        slope: null,
        yardage: null,
        greenFee: null,
        imageUrl: null,
        description: null,
      });

      const result = courseService.formatCourse(course);

      expect(result.phone).toBeNull();
      expect(result.website).toBeNull();
      expect(result.par).toBeNull();
      expect(result.rating).toBeNull();
      expect(result.slope).toBeNull();
      expect(result.yardage).toBeNull();
      expect(result.greenFee).toBeNull();
      expect(result.imageUrl).toBeNull();
      expect(result.description).toBeNull();
    });

    it('should handle empty amenities array', () => {
      const course = createMockCourse({
        amenities: [],
      });

      const result = courseService.formatCourse(course);

      expect(result.amenities).toEqual([]);
    });
  });

  describe('edge cases', () => {
    it('should handle course types correctly', () => {
      const courseTypes: CourseType[] = [
        'PUBLIC',
        'PRIVATE',
        'SEMI_PRIVATE',
        'RESORT',
        'MUNICIPAL',
      ];

      courseTypes.forEach((courseType) => {
        const course = createMockCourse({ courseType });
        const result = courseService.formatCourse(course);
        expect(result.courseType).toBe(courseType);
      });
    });

    it('should handle special characters in course names', () => {
      const course = createMockCourse({
        name: "St. Andrew's Old Course (Links)",
        slug: 'st-andrews-old-course-links',
      });

      const result = courseService.formatCourse(course);

      expect(result.name).toBe("St. Andrew's Old Course (Links)");
      expect(result.slug).toBe('st-andrews-old-course-links');
    });
  });
});
