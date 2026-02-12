/**
 * Tee Time Service Unit Tests
 *
 * Tests the tee time service which handles tee time operations including
 * creation, updates, joining/leaving, and data formatting.
 */

import { teeTimeService } from '../../src/services/teeTimeService';
import { teeTimeRepository } from '../../src/repositories/teeTimeRepository';
import { courseService } from '../../src/services/courseService';
import { notificationService } from '../../src/services/notificationService';
import { eventService } from '../../src/services/eventService';
import { NotFoundError, ForbiddenError } from '../../src/utils/errors';
import {
  createMockTeeTime,
  createMockTeeTimeWithRelations,
  createMockCourse,
  createMockUser,
} from '../mocks/factories';
import type { TeeTimeStatus, Industry, SkillLevel } from '@prisma/client';

// Mock dependencies
jest.mock('../../src/repositories/teeTimeRepository');
jest.mock('../../src/services/courseService');
jest.mock('../../src/services/notificationService');
jest.mock('../../src/services/eventService');

const mockTeeTimeRepository = teeTimeRepository as jest.Mocked<typeof teeTimeRepository>;
const mockCourseService = courseService as jest.Mocked<typeof courseService>;
const mockNotificationService = notificationService as jest.Mocked<typeof notificationService>;
const mockEventService = eventService as jest.Mocked<typeof eventService>;

describe('TeeTimeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    mockNotificationService.notifyTeeTimeUpdate.mockResolvedValue();
    mockNotificationService.notifyTeeTimeCancelled.mockResolvedValue();
    mockNotificationService.notifySlotJoined.mockResolvedValue();
    mockNotificationService.notifySlotLeft.mockResolvedValue();
    mockEventService.publishTeeTimeUpdate.mockResolvedValue();
    mockEventService.publishSlotJoined.mockResolvedValue();
    mockEventService.publishSlotLeft.mockResolvedValue();
  });

  describe('getById', () => {
    it('should return tee time when found', async () => {
      const mockTeeTime = createMockTeeTimeWithRelations();
      mockTeeTimeRepository.findById.mockResolvedValue(mockTeeTime);

      const result = await teeTimeService.getById(mockTeeTime.id);

      expect(result).toEqual(mockTeeTime);
      expect(mockTeeTimeRepository.findById).toHaveBeenCalledWith(mockTeeTime.id);
    });

    it('should throw NotFoundError when tee time not found', async () => {
      mockTeeTimeRepository.findById.mockResolvedValue(null);

      await expect(teeTimeService.getById('nonexistent')).rejects.toThrow(
        NotFoundError
      );
      await expect(teeTimeService.getById('nonexistent')).rejects.toThrow(
        'Tee time not found'
      );
    });
  });

  describe('list', () => {
    it('should return tee times with pagination', async () => {
      const teeTimes = [
        createMockTeeTimeWithRelations(),
        createMockTeeTimeWithRelations(),
      ];

      mockTeeTimeRepository.list.mockResolvedValue({
        teeTimes,
        hasMore: true,
      });

      const result = await teeTimeService.list({ limit: 2 });

      expect(result.teeTimes).toHaveLength(2);
      expect(result.hasMore).toBe(true);
      expect(result.nextCursor).toBe(teeTimes[1].id);
    });

    it('should return null cursor when no more results', async () => {
      const teeTimes = [createMockTeeTimeWithRelations()];

      mockTeeTimeRepository.list.mockResolvedValue({
        teeTimes,
        hasMore: false,
      });

      const result = await teeTimeService.list({ limit: 10 });

      expect(result.hasMore).toBe(false);
      expect(result.nextCursor).toBeNull();
    });

    it('should handle empty results', async () => {
      mockTeeTimeRepository.list.mockResolvedValue({
        teeTimes: [],
        hasMore: false,
      });

      const result = await teeTimeService.list({ limit: 10 });

      expect(result.teeTimes).toHaveLength(0);
      expect(result.nextCursor).toBeNull();
    });
  });

  describe('create', () => {
    const mockCourse = createMockCourse({ id: 'course-123' });

    beforeEach(() => {
      mockCourseService.getById.mockResolvedValue(mockCourse);
    });

    it('should create tee time successfully', async () => {
      const userId = 'user-host';
      const createData = {
        courseId: 'course-123',
        dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        totalSlots: 4,
        industryPreference: ['TECHNOLOGY'] as Industry[],
        skillPreference: ['INTERMEDIATE'] as SkillLevel[],
        notes: 'Looking forward to playing!',
      };

      const createdTeeTime = createMockTeeTimeWithRelations({
        teeTime: {
          hostId: userId,
          courseId: 'course-123',
          totalSlots: 4,
          industryPreference: createData.industryPreference,
          skillPreference: createData.skillPreference,
          notes: createData.notes,
        },
      });

      mockTeeTimeRepository.create.mockResolvedValue(createdTeeTime);

      const result = await teeTimeService.create(userId, createData);

      expect(result).toEqual(createdTeeTime);
      expect(mockCourseService.getById).toHaveBeenCalledWith('course-123');
      expect(mockTeeTimeRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          host: { connect: { id: userId } },
          course: { connect: { id: 'course-123' } },
          totalSlots: 4,
          industryPreference: ['TECHNOLOGY'],
          skillPreference: ['INTERMEDIATE'],
          notes: 'Looking forward to playing!',
        }),
        userId
      );
    });

    it('should throw NotFoundError for invalid course', async () => {
      mockCourseService.getById.mockRejectedValue(new NotFoundError('Course not found'));

      const createData = {
        courseId: 'nonexistent',
        dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      await expect(
        teeTimeService.create('user-123', createData)
      ).rejects.toThrow(NotFoundError);
    });

    it('should handle null notes', async () => {
      const createData = {
        courseId: 'course-123',
        dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      const createdTeeTime = createMockTeeTimeWithRelations();
      mockTeeTimeRepository.create.mockResolvedValue(createdTeeTime);

      await teeTimeService.create('user-123', createData);

      expect(mockTeeTimeRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          notes: null,
        }),
        'user-123'
      );
    });
  });

  describe('update', () => {
    it('should update tee time when user is host', async () => {
      const hostId = 'user-host';
      const teeTime = createMockTeeTimeWithRelations({
        teeTime: { hostId, version: 0 },
      });
      const updatedTeeTime = { ...teeTime, notes: 'Updated notes' };

      mockTeeTimeRepository.findById.mockResolvedValue(teeTime);
      mockTeeTimeRepository.update.mockResolvedValue(updatedTeeTime);
      mockTeeTimeRepository.getParticipantIds.mockResolvedValue([hostId, 'user-2']);

      const result = await teeTimeService.update(teeTime.id, hostId, {
        notes: 'Updated notes',
      });

      expect(result.notes).toBe('Updated notes');
      expect(mockTeeTimeRepository.update).toHaveBeenCalledWith(
        teeTime.id,
        { notes: 'Updated notes' },
        0
      );
    });

    it('should throw ForbiddenError when non-host tries to update', async () => {
      const teeTime = createMockTeeTimeWithRelations({
        teeTime: { hostId: 'host-user' },
      });

      mockTeeTimeRepository.findById.mockResolvedValue(teeTime);

      await expect(
        teeTimeService.update(teeTime.id, 'different-user', { notes: 'Test' })
      ).rejects.toThrow(ForbiddenError);
    });

    it('should notify participants of update', async () => {
      const hostId = 'user-host';
      const teeTime = createMockTeeTimeWithRelations({
        teeTime: { hostId },
      });

      mockTeeTimeRepository.findById.mockResolvedValue(teeTime);
      mockTeeTimeRepository.update.mockResolvedValue(teeTime);
      mockTeeTimeRepository.getParticipantIds.mockResolvedValue([hostId, 'user-2', 'user-3']);

      await teeTimeService.update(teeTime.id, hostId, { notes: 'Test' });

      expect(mockNotificationService.notifyTeeTimeUpdate).toHaveBeenCalledWith(
        ['user-2', 'user-3'], // Host excluded
        teeTime
      );
    });

    it('should publish update event', async () => {
      const hostId = 'user-host';
      const teeTime = createMockTeeTimeWithRelations({
        teeTime: { hostId },
      });

      mockTeeTimeRepository.findById.mockResolvedValue(teeTime);
      mockTeeTimeRepository.update.mockResolvedValue(teeTime);
      mockTeeTimeRepository.getParticipantIds.mockResolvedValue([hostId]);

      await teeTimeService.update(teeTime.id, hostId, { notes: 'Test' });

      expect(mockEventService.publishTeeTimeUpdate).toHaveBeenCalledWith(
        teeTime.id,
        teeTime
      );
    });

    it('should handle all updatable fields', async () => {
      const hostId = 'user-host';
      const teeTime = createMockTeeTimeWithRelations({
        teeTime: { hostId, version: 1 },
      });

      mockTeeTimeRepository.findById.mockResolvedValue(teeTime);
      mockTeeTimeRepository.update.mockResolvedValue(teeTime);
      mockTeeTimeRepository.getParticipantIds.mockResolvedValue([hostId]);

      const updateData = {
        dateTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        totalSlots: 3,
        industryPreference: ['FINANCE'] as Industry[],
        skillPreference: ['ADVANCED'] as SkillLevel[],
        notes: 'Updated',
        status: 'CANCELLED' as TeeTimeStatus,
      };

      await teeTimeService.update(teeTime.id, hostId, updateData);

      expect(mockTeeTimeRepository.update).toHaveBeenCalledWith(
        teeTime.id,
        expect.objectContaining({
          totalSlots: 3,
          industryPreference: ['FINANCE'],
          skillPreference: ['ADVANCED'],
          notes: 'Updated',
          status: 'CANCELLED',
        }),
        1
      );
    });
  });

  describe('delete', () => {
    it('should delete tee time when user is host', async () => {
      const hostId = 'user-host';
      const teeTime = createMockTeeTimeWithRelations({
        teeTime: { hostId },
      });

      mockTeeTimeRepository.findById.mockResolvedValue(teeTime);
      mockTeeTimeRepository.getParticipantIds.mockResolvedValue([hostId, 'user-2']);
      mockTeeTimeRepository.delete.mockResolvedValue();

      await teeTimeService.delete(teeTime.id, hostId);

      expect(mockTeeTimeRepository.delete).toHaveBeenCalledWith(teeTime.id);
    });

    it('should throw ForbiddenError when non-host tries to delete', async () => {
      const teeTime = createMockTeeTimeWithRelations({
        teeTime: { hostId: 'host-user' },
      });

      mockTeeTimeRepository.findById.mockResolvedValue(teeTime);

      await expect(
        teeTimeService.delete(teeTime.id, 'different-user')
      ).rejects.toThrow(ForbiddenError);
    });

    it('should notify participants before deletion', async () => {
      const hostId = 'user-host';
      const teeTime = createMockTeeTimeWithRelations({
        teeTime: { hostId },
      });

      mockTeeTimeRepository.findById.mockResolvedValue(teeTime);
      mockTeeTimeRepository.getParticipantIds.mockResolvedValue([hostId, 'user-2', 'user-3']);
      mockTeeTimeRepository.delete.mockResolvedValue();

      await teeTimeService.delete(teeTime.id, hostId);

      expect(mockNotificationService.notifyTeeTimeCancelled).toHaveBeenCalledWith(
        ['user-2', 'user-3'], // Host excluded
        teeTime
      );
    });
  });

  describe('join', () => {
    it('should allow user to join tee time', async () => {
      const teeTime = createMockTeeTimeWithRelations();
      const joinedTeeTime = createMockTeeTimeWithRelations({ filledSlots: 2 });

      mockTeeTimeRepository.findById
        .mockResolvedValueOnce(teeTime)
        .mockResolvedValueOnce(joinedTeeTime);
      mockTeeTimeRepository.joinSlot.mockResolvedValue({
        id: 'slot-2',
        teeTimeId: teeTime.id,
        userId: 'new-user',
        slotNumber: 2,
        joinedAt: new Date(),
      });
      mockTeeTimeRepository.getParticipantIds.mockResolvedValue([teeTime.hostId, 'new-user']);

      const result = await teeTimeService.join(teeTime.id, 'new-user');

      expect(result).toEqual(joinedTeeTime);
      expect(mockTeeTimeRepository.joinSlot).toHaveBeenCalledWith(
        teeTime.id,
        'new-user',
        undefined
      );
    });

    it('should allow joining specific slot', async () => {
      const teeTime = createMockTeeTimeWithRelations();

      mockTeeTimeRepository.findById.mockResolvedValue(teeTime);
      mockTeeTimeRepository.joinSlot.mockResolvedValue({
        id: 'slot-3',
        teeTimeId: teeTime.id,
        userId: 'new-user',
        slotNumber: 3,
        joinedAt: new Date(),
      });
      mockTeeTimeRepository.getParticipantIds.mockResolvedValue([teeTime.hostId, 'new-user']);

      await teeTimeService.join(teeTime.id, 'new-user', 3);

      expect(mockTeeTimeRepository.joinSlot).toHaveBeenCalledWith(
        teeTime.id,
        'new-user',
        3
      );
    });

    it('should notify other participants when user joins', async () => {
      const teeTime = createMockTeeTimeWithRelations();

      mockTeeTimeRepository.findById.mockResolvedValue(teeTime);
      mockTeeTimeRepository.joinSlot.mockResolvedValue({
        id: 'slot-2',
        teeTimeId: teeTime.id,
        userId: 'new-user',
        slotNumber: 2,
        joinedAt: new Date(),
      });
      mockTeeTimeRepository.getParticipantIds.mockResolvedValue([teeTime.hostId, 'existing-user', 'new-user']);

      await teeTimeService.join(teeTime.id, 'new-user');

      expect(mockNotificationService.notifySlotJoined).toHaveBeenCalledWith(
        [teeTime.hostId, 'existing-user'], // New user excluded
        expect.any(Object),
        'new-user'
      );
    });

    it('should publish join event', async () => {
      const teeTime = createMockTeeTimeWithRelations();

      mockTeeTimeRepository.findById.mockResolvedValue(teeTime);
      mockTeeTimeRepository.joinSlot.mockResolvedValue({
        id: 'slot-2',
        teeTimeId: teeTime.id,
        userId: 'new-user',
        slotNumber: 2,
        joinedAt: new Date(),
      });
      mockTeeTimeRepository.getParticipantIds.mockResolvedValue([teeTime.hostId, 'new-user']);

      await teeTimeService.join(teeTime.id, 'new-user');

      expect(mockEventService.publishSlotJoined).toHaveBeenCalledWith(
        teeTime.id,
        'new-user'
      );
    });
  });

  describe('leave', () => {
    it('should allow user to leave tee time', async () => {
      const teeTime = createMockTeeTimeWithRelations();

      mockTeeTimeRepository.findById.mockResolvedValue(teeTime);
      mockTeeTimeRepository.leaveSlot.mockResolvedValue();
      mockTeeTimeRepository.getParticipantIds.mockResolvedValue([teeTime.hostId]);

      await teeTimeService.leave(teeTime.id, 'leaving-user');

      expect(mockTeeTimeRepository.leaveSlot).toHaveBeenCalledWith(
        teeTime.id,
        'leaving-user'
      );
    });

    it('should notify other participants when user leaves', async () => {
      const teeTime = createMockTeeTimeWithRelations();

      mockTeeTimeRepository.findById.mockResolvedValue(teeTime);
      mockTeeTimeRepository.leaveSlot.mockResolvedValue();
      mockTeeTimeRepository.getParticipantIds.mockResolvedValue([teeTime.hostId, 'remaining-user']);

      await teeTimeService.leave(teeTime.id, 'leaving-user');

      expect(mockNotificationService.notifySlotLeft).toHaveBeenCalledWith(
        [teeTime.hostId, 'remaining-user'],
        teeTime,
        'leaving-user'
      );
    });

    it('should publish leave event', async () => {
      const teeTime = createMockTeeTimeWithRelations();

      mockTeeTimeRepository.findById.mockResolvedValue(teeTime);
      mockTeeTimeRepository.leaveSlot.mockResolvedValue();
      mockTeeTimeRepository.getParticipantIds.mockResolvedValue([teeTime.hostId]);

      await teeTimeService.leave(teeTime.id, 'leaving-user');

      expect(mockEventService.publishSlotLeft).toHaveBeenCalledWith(
        teeTime.id,
        'leaving-user'
      );
    });
  });

  describe('getUserTeeTimes', () => {
    it('should return user tee times', async () => {
      const teeTimes = [
        createMockTeeTimeWithRelations(),
        createMockTeeTimeWithRelations(),
      ];

      mockTeeTimeRepository.getUserTeeTimes.mockResolvedValue(teeTimes);

      const result = await teeTimeService.getUserTeeTimes('user-123');

      expect(result).toEqual(teeTimes);
      expect(mockTeeTimeRepository.getUserTeeTimes).toHaveBeenCalledWith('user-123');
    });

    it('should return empty array when user has no tee times', async () => {
      mockTeeTimeRepository.getUserTeeTimes.mockResolvedValue([]);

      const result = await teeTimeService.getUserTeeTimes('user-123');

      expect(result).toHaveLength(0);
    });
  });

  describe('isParticipant', () => {
    it('should return true when user is participant', async () => {
      mockTeeTimeRepository.getParticipantIds.mockResolvedValue(['user-1', 'user-2', 'user-3']);

      const result = await teeTimeService.isParticipant('tee-time-123', 'user-2');

      expect(result).toBe(true);
    });

    it('should return false when user is not participant', async () => {
      mockTeeTimeRepository.getParticipantIds.mockResolvedValue(['user-1', 'user-2']);

      const result = await teeTimeService.isParticipant('tee-time-123', 'user-3');

      expect(result).toBe(false);
    });
  });

  describe('formatTeeTime', () => {
    it('should format tee time with all fields', () => {
      const teeTime = createMockTeeTimeWithRelations({
        teeTime: {
          totalSlots: 4,
          industryPreference: ['TECHNOLOGY', 'FINANCE'],
          skillPreference: ['INTERMEDIATE'],
          notes: 'Test notes',
          status: 'OPEN' as TeeTimeStatus,
        },
        filledSlots: 2,
      });

      const result = teeTimeService.formatTeeTime(teeTime);

      expect(result).toHaveProperty('id', teeTime.id);
      expect(result).toHaveProperty('dateTime', teeTime.dateTime);
      expect(result).toHaveProperty('totalSlots', 4);
      expect(result).toHaveProperty('filledSlots', 2);
      expect(result).toHaveProperty('availableSlots', 2);
      expect(result).toHaveProperty('industryPreference', ['TECHNOLOGY', 'FINANCE']);
      expect(result).toHaveProperty('skillPreference', ['INTERMEDIATE']);
      expect(result).toHaveProperty('notes', 'Test notes');
      expect(result).toHaveProperty('status', 'OPEN');
      expect(result).toHaveProperty('host');
      expect(result).toHaveProperty('course');
      expect(result).toHaveProperty('slots');
    });

    it('should calculate correct available slots', () => {
      const fullTeeTime = createMockTeeTimeWithRelations({
        teeTime: { totalSlots: 4 },
        filledSlots: 4,
      });

      const result = teeTimeService.formatTeeTime(fullTeeTime);

      expect(result.filledSlots).toBe(4);
      expect(result.availableSlots).toBe(0);
    });

    it('should format slots correctly', () => {
      const teeTime = createMockTeeTimeWithRelations({
        teeTime: { totalSlots: 3 },
        filledSlots: 2,
      });

      const result = teeTimeService.formatTeeTime(teeTime);

      expect(result.slots).toHaveLength(3);
      result.slots.forEach((slot, index) => {
        expect(slot).toHaveProperty('slotNumber', index + 1);
        expect(slot).toHaveProperty('user');
        expect(slot).toHaveProperty('joinedAt');
      });
    });
  });
});
