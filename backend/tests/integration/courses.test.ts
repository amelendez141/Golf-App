/**
 * Course API Integration Tests
 *
 * Tests the course API endpoints including search, get by slug,
 * and favorites functionality.
 */

import request from 'supertest';
import { app } from '../../src/app';
import { courseRepository } from '../../src/repositories/courseRepository';
import { createMockCourse, createMockCourseWithDistance, createMockUser } from '../mocks/factories';

// Mock dependencies
jest.mock('../../src/repositories/courseRepository');
jest.mock('../../src/config/database', () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// Mock auth to always return a test user
jest.mock('../../src/middleware/auth', () => ({
  requireAuth: jest.fn((req, res, next) => {
    req.user = createMockUser({ id: 'test-user-id' });
    req.userId = 'test-user-id';
    next();
  }),
  optionalAuth: jest.fn((req, res, next) => {
    req.user = createMockUser({ id: 'test-user-id' });
    req.userId = 'test-user-id';
    next();
  }),
  setDemoUserId: jest.fn(),
  getDemoUserId: jest.fn(),
}));

// Mock rate limiting
jest.mock('../../src/middleware/rateLimit', () => ({
  readRateLimit: (req: any, res: any, next: any) => next(),
  writeRateLimit: (req: any, res: any, next: any) => next(),
}));

const mockCourseRepository = courseRepository as jest.Mocked<typeof courseRepository>;

describe('Course API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/courses', () => {
    it('should return list of courses', async () => {
      const courses = [
        createMockCourseWithDistance({ id: 'course-1', name: 'Pebble Beach', distance: 5 }),
        createMockCourseWithDistance({ id: 'course-2', name: 'Augusta National', distance: 10 }),
      ];

      mockCourseRepository.search.mockResolvedValue({
        courses,
        hasMore: false,
      });
      mockCourseRepository.isFavorited.mockResolvedValue(false);

      const response = await request(app)
        .get('/api/courses')
        .query({ limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toHaveProperty('name', 'Pebble Beach');
      expect(response.body.pagination).toHaveProperty('hasMore', false);
    });

    it('should search courses by query', async () => {
      const courses = [
        createMockCourseWithDistance({ name: 'Pebble Beach Golf Links' }),
      ];

      mockCourseRepository.search.mockResolvedValue({
        courses,
        hasMore: false,
      });
      mockCourseRepository.isFavorited.mockResolvedValue(false);

      const response = await request(app)
        .get('/api/courses')
        .query({ query: 'pebble', limit: 10 })
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(mockCourseRepository.search).toHaveBeenCalledWith(
        expect.objectContaining({ query: 'pebble' })
      );
    });

    it('should filter courses by location', async () => {
      mockCourseRepository.search.mockResolvedValue({
        courses: [],
        hasMore: false,
      });
      mockCourseRepository.isFavorited.mockResolvedValue(false);

      await request(app)
        .get('/api/courses')
        .query({
          latitude: '37.7749',
          longitude: '-122.4194',
          radius: '25',
          limit: '10',
        })
        .expect(200);

      expect(mockCourseRepository.search).toHaveBeenCalledWith(
        expect.objectContaining({
          latitude: 37.7749,
          longitude: -122.4194,
          radius: 25,
        })
      );
    });

    it('should include pagination cursor', async () => {
      const courses = [
        createMockCourseWithDistance({ id: 'course-1' }),
        createMockCourseWithDistance({ id: 'course-2' }),
      ];

      mockCourseRepository.search.mockResolvedValue({
        courses,
        hasMore: true,
      });
      mockCourseRepository.isFavorited.mockResolvedValue(false);

      const response = await request(app)
        .get('/api/courses')
        .query({ limit: 2 })
        .expect(200);

      expect(response.body.pagination.hasMore).toBe(true);
      expect(response.body.pagination.nextCursor).toBe('course-2');
    });

    it('should return empty list when no courses found', async () => {
      mockCourseRepository.search.mockResolvedValue({
        courses: [],
        hasMore: false,
      });

      const response = await request(app)
        .get('/api/courses')
        .query({ query: 'nonexistent', limit: 10 })
        .expect(200);

      expect(response.body.data).toHaveLength(0);
      expect(response.body.pagination.hasMore).toBe(false);
      expect(response.body.pagination.nextCursor).toBeNull();
    });
  });

  describe('GET /api/courses/:slug', () => {
    it('should return course by slug', async () => {
      const course = createMockCourse({
        id: 'course-123',
        slug: 'pebble-beach',
        name: 'Pebble Beach Golf Links',
      });

      mockCourseRepository.findBySlug.mockResolvedValue(course);
      mockCourseRepository.isFavorited.mockResolvedValue(false);

      const response = await request(app)
        .get('/api/courses/pebble-beach')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Pebble Beach Golf Links');
      expect(response.body.data.slug).toBe('pebble-beach');
    });

    it('should return 404 for non-existent slug', async () => {
      mockCourseRepository.findBySlug.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/courses/nonexistent-course')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should include favorite status when user is authenticated', async () => {
      const course = createMockCourse({ slug: 'favorite-course' });

      mockCourseRepository.findBySlug.mockResolvedValue(course);
      mockCourseRepository.isFavorited.mockResolvedValue(true);

      const response = await request(app)
        .get('/api/courses/favorite-course')
        .expect(200);

      expect(response.body.data.isFavorited).toBe(true);
    });
  });

  describe('POST /api/courses/:id/favorite', () => {
    it('should add course to favorites', async () => {
      const course = createMockCourse({ id: 'course-to-favorite' });

      mockCourseRepository.findById.mockResolvedValue(course);
      mockCourseRepository.isFavorited.mockResolvedValue(false);
      mockCourseRepository.addFavorite.mockResolvedValue();

      const response = await request(app)
        .post('/api/courses/course-to-favorite/favorite')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isFavorited).toBe(true);
      expect(response.body.message).toBe('Course added to favorites');
    });

    it('should remove course from favorites', async () => {
      const course = createMockCourse({ id: 'course-to-unfavorite' });

      mockCourseRepository.findById.mockResolvedValue(course);
      mockCourseRepository.isFavorited.mockResolvedValue(true);
      mockCourseRepository.removeFavorite.mockResolvedValue();

      const response = await request(app)
        .post('/api/courses/course-to-unfavorite/favorite')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isFavorited).toBe(false);
      expect(response.body.message).toBe('Course removed from favorites');
    });

    it('should return 404 for non-existent course', async () => {
      mockCourseRepository.findById.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/courses/nonexistent/favorite')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
