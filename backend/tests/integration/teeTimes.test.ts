/**
 * Tee Time API Integration Tests
 *
 * Tests the tee time API endpoints including listing, creation,
 * and joining/leaving tee times.
 */

import request from 'supertest';
import { app } from '../../src/app';
import { teeTimeRepository } from '../../src/repositories/teeTimeRepository';
import { courseRepository } from '../../src/repositories/courseRepository';
import {
  createMockUser,
  createMockCourse,
  createMockTeeTimeWithRelations,
} from '../mocks/factories';
import type { Industry, SkillLevel } from '@prisma/client';

// Mock dependencies
jest.mock('../../src/repositories/teeTimeRepository');
jest.mock('../../src/repositories/courseRepository');
jest.mock('../../src/services/notificationService', () => ({
  notificationService: {
    notifyTeeTimeUpdate: jest.fn().mockResolvedValue(undefined),
    notifyTeeTimeCancelled: jest.fn().mockResolvedValue(undefined),
    notifySlotJoined: jest.fn().mockResolvedValue(undefined),
    notifySlotLeft: jest.fn().mockResolvedValue(undefined),
  },
}));
jest.mock('../../src/services/eventService', () => ({
  eventService: {
    publishTeeTimeUpdate: jest.fn().mockResolvedValue(undefined),
    publishSlotJoined: jest.fn().mockResolvedValue(undefined),
    publishSlotLeft: jest.fn().mockResolvedValue(undefined),
  },
}));
jest.mock('../../src/config/database', () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

const testUser = createMockUser({ id: 'test-user-id' });

// Mock auth
jest.mock('../../src/middleware/auth', () => ({
  requireAuth: jest.fn((req, res, next) => {
    req.user = testUser;
    req.userId = 'test-user-id';
    next();
  }),
  optionalAuth: jest.fn((req, res, next) => {
    req.user = testUser;
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

const mockTeeTimeRepository = teeTimeRepository as jest.Mocked<typeof teeTimeRepository>;
const mockCourseRepository = courseRepository as jest.Mocked<typeof courseRepository>;

describe('Tee Time API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/tee-times', () => {
    it('should return list of tee times', async () => {
      const teeTimes = [
        createMockTeeTimeWithRelations(),
        createMockTeeTimeWithRelations(),
      ];

      mockTeeTimeRepository.list.mockResolvedValue({
        teeTimes,
        hasMore: false,
      });

      const response = await request(app)
        .get('/api/tee-times')
        .query({ limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination.hasMore).toBe(false);
    });

    it('should filter tee times by course', async () => {
      mockTeeTimeRepository.list.mockResolvedValue({
        teeTimes: [],
        hasMore: false,
      });

      await request(app)
        .get('/api/tee-times')
        .query({ courseId: 'course-123', limit: 10 })
        .expect(200);

      expect(mockTeeTimeRepository.list).toHaveBeenCalledWith(
        expect.objectContaining({ courseId: 'course-123' })
      );
    });

    it('should filter tee times by date range', async () => {
      const fromDate = '2024-03-01T00:00:00Z';
      const toDate = '2024-03-07T23:59:59Z';

      mockTeeTimeRepository.list.mockResolvedValue({
        teeTimes: [],
        hasMore: false,
      });

      await request(app)
        .get('/api/tee-times')
        .query({ fromDate, toDate, limit: 10 })
        .expect(200);

      expect(mockTeeTimeRepository.list).toHaveBeenCalledWith(
        expect.objectContaining({ fromDate, toDate })
      );
    });

    it('should filter by location', async () => {
      mockTeeTimeRepository.list.mockResolvedValue({
        teeTimes: [],
        hasMore: false,
      });

      await request(app)
        .get('/api/tee-times')
        .query({
          latitude: '37.7749',
          longitude: '-122.4194',
          radius: '50',
          limit: '10',
        })
        .expect(200);

      expect(mockTeeTimeRepository.list).toHaveBeenCalledWith(
        expect.objectContaining({
          latitude: 37.7749,
          longitude: -122.4194,
          radius: 50,
        })
      );
    });

    it('should return formatted tee times with slot information', async () => {
      const teeTime = createMockTeeTimeWithRelations({
        teeTime: { totalSlots: 4 },
        filledSlots: 2,
      });

      mockTeeTimeRepository.list.mockResolvedValue({
        teeTimes: [teeTime],
        hasMore: false,
      });

      const response = await request(app)
        .get('/api/tee-times')
        .query({ limit: 10 })
        .expect(200);

      expect(response.body.data[0]).toHaveProperty('totalSlots', 4);
      expect(response.body.data[0]).toHaveProperty('filledSlots', 2);
      expect(response.body.data[0]).toHaveProperty('availableSlots', 2);
      expect(response.body.data[0]).toHaveProperty('host');
      expect(response.body.data[0]).toHaveProperty('course');
      expect(response.body.data[0]).toHaveProperty('slots');
    });

    it('should handle pagination', async () => {
      const teeTimes = [
        createMockTeeTimeWithRelations({ teeTime: { id: 'tt-1' } }),
        createMockTeeTimeWithRelations({ teeTime: { id: 'tt-2' } }),
      ];

      mockTeeTimeRepository.list.mockResolvedValue({
        teeTimes,
        hasMore: true,
      });

      const response = await request(app)
        .get('/api/tee-times')
        .query({ limit: 2 })
        .expect(200);

      expect(response.body.pagination.hasMore).toBe(true);
      expect(response.body.pagination.nextCursor).toBe('tt-2');
    });
  });

  describe('GET /api/tee-times/:id', () => {
    it('should return tee time by id', async () => {
      const teeTime = createMockTeeTimeWithRelations({
        teeTime: { id: 'tee-time-123' },
      });

      mockTeeTimeRepository.findById.mockResolvedValue(teeTime);

      const response = await request(app)
        .get('/api/tee-times/tee-time-123')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('tee-time-123');
    });

    it('should return 404 for non-existent tee time', async () => {
      mockTeeTimeRepository.findById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/tee-times/nonexistent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('POST /api/tee-times', () => {
    const mockCourse = createMockCourse({ id: 'course-123' });

    beforeEach(() => {
      mockCourseRepository.findById.mockResolvedValue(mockCourse);
    });

    it('should create tee time successfully', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const createData = {
        courseId: 'course-123',
        dateTime: futureDate.toISOString(),
        totalSlots: 4,
        industryPreference: ['TECHNOLOGY'],
        skillPreference: ['INTERMEDIATE'],
        notes: 'Test tee time',
      };

      const createdTeeTime = createMockTeeTimeWithRelations({
        teeTime: {
          hostId: 'test-user-id',
          courseId: 'course-123',
          ...createData,
        },
      });

      mockTeeTimeRepository.create.mockResolvedValue(createdTeeTime);

      const response = await request(app)
        .post('/api/tee-times')
        .send(createData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.totalSlots).toBe(4);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/tee-times')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject past dates', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const response = await request(app)
        .post('/api/tee-times')
        .send({
          courseId: 'course-123',
          dateTime: pastDate.toISOString(),
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should apply default values', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const createdTeeTime = createMockTeeTimeWithRelations({
        teeTime: {
          totalSlots: 4,
          industryPreference: [],
          skillPreference: [],
        },
      });

      mockTeeTimeRepository.create.mockResolvedValue(createdTeeTime);

      const response = await request(app)
        .post('/api/tee-times')
        .send({
          courseId: 'course-123',
          dateTime: futureDate.toISOString(),
        })
        .expect(201);

      expect(response.body.data.totalSlots).toBe(4);
    });
  });

  describe('POST /api/tee-times/:id/join', () => {
    it('should join tee time successfully', async () => {
      const teeTime = createMockTeeTimeWithRelations();
      const joinedTeeTime = createMockTeeTimeWithRelations({ filledSlots: 2 });

      mockTeeTimeRepository.findById
        .mockResolvedValueOnce(teeTime)
        .mockResolvedValueOnce(joinedTeeTime);
      mockTeeTimeRepository.joinSlot.mockResolvedValue({
        id: 'slot-2',
        teeTimeId: teeTime.id,
        userId: 'test-user-id',
        slotNumber: 2,
        joinedAt: new Date(),
      });
      mockTeeTimeRepository.getParticipantIds.mockResolvedValue([
        teeTime.hostId,
        'test-user-id',
      ]);

      const response = await request(app)
        .post(`/api/tee-times/${teeTime.id}/join`)
        .send({})
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Successfully joined tee time');
    });

    it('should join specific slot when provided', async () => {
      const teeTime = createMockTeeTimeWithRelations();

      mockTeeTimeRepository.findById.mockResolvedValue(teeTime);
      mockTeeTimeRepository.joinSlot.mockResolvedValue({
        id: 'slot-3',
        teeTimeId: teeTime.id,
        userId: 'test-user-id',
        slotNumber: 3,
        joinedAt: new Date(),
      });
      mockTeeTimeRepository.getParticipantIds.mockResolvedValue([
        teeTime.hostId,
        'test-user-id',
      ]);

      await request(app)
        .post(`/api/tee-times/${teeTime.id}/join`)
        .send({ slotNumber: 3 })
        .expect(200);

      expect(mockTeeTimeRepository.joinSlot).toHaveBeenCalledWith(
        teeTime.id,
        'test-user-id',
        3
      );
    });

    it('should return 404 for non-existent tee time', async () => {
      mockTeeTimeRepository.findById.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/tee-times/nonexistent/join')
        .send({})
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should validate slot number range', async () => {
      const response = await request(app)
        .post('/api/tee-times/some-id/join')
        .send({ slotNumber: 5 })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/tee-times/:id/leave', () => {
    it('should leave tee time successfully', async () => {
      const teeTime = createMockTeeTimeWithRelations();

      mockTeeTimeRepository.findById.mockResolvedValue(teeTime);
      mockTeeTimeRepository.leaveSlot.mockResolvedValue();
      mockTeeTimeRepository.getParticipantIds.mockResolvedValue([teeTime.hostId]);

      const response = await request(app)
        .delete(`/api/tee-times/${teeTime.id}/leave`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Successfully left tee time');
    });

    it('should return 404 for non-existent tee time', async () => {
      mockTeeTimeRepository.findById.mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/tee-times/nonexistent/leave')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/tee-times/:id', () => {
    it('should update tee time when user is host', async () => {
      const teeTime = createMockTeeTimeWithRelations({
        teeTime: { hostId: 'test-user-id' },
      });

      mockTeeTimeRepository.findById.mockResolvedValue(teeTime);
      mockTeeTimeRepository.update.mockResolvedValue({
        ...teeTime,
        notes: 'Updated notes',
      });
      mockTeeTimeRepository.getParticipantIds.mockResolvedValue(['test-user-id']);

      const response = await request(app)
        .patch(`/api/tee-times/${teeTime.id}`)
        .send({ notes: 'Updated notes' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return 403 when non-host tries to update', async () => {
      const teeTime = createMockTeeTimeWithRelations({
        teeTime: { hostId: 'different-user' },
      });

      mockTeeTimeRepository.findById.mockResolvedValue(teeTime);

      const response = await request(app)
        .patch(`/api/tee-times/${teeTime.id}`)
        .send({ notes: 'Test' })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('DELETE /api/tee-times/:id', () => {
    it('should delete tee time when user is host', async () => {
      const teeTime = createMockTeeTimeWithRelations({
        teeTime: { hostId: 'test-user-id' },
      });

      mockTeeTimeRepository.findById.mockResolvedValue(teeTime);
      mockTeeTimeRepository.getParticipantIds.mockResolvedValue(['test-user-id']);
      mockTeeTimeRepository.delete.mockResolvedValue();

      const response = await request(app)
        .delete(`/api/tee-times/${teeTime.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Tee time deleted successfully');
    });

    it('should return 403 when non-host tries to delete', async () => {
      const teeTime = createMockTeeTimeWithRelations({
        teeTime: { hostId: 'different-user' },
      });

      mockTeeTimeRepository.findById.mockResolvedValue(teeTime);

      const response = await request(app)
        .delete(`/api/tee-times/${teeTime.id}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });
});
