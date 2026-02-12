import { teeTimeRepository, type TeeTimeWithRelations } from '../repositories/teeTimeRepository.js';
import { courseService } from './courseService.js';
import { notificationService } from './notificationService.js';
import { eventService } from './eventService.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import type { CreateTeeTimeInput, UpdateTeeTimeInput, ListTeeTimesInput } from '../validators/teeTime.js';
import type { Prisma } from '@prisma/client';

export const teeTimeService = {
  async getById(id: string): Promise<TeeTimeWithRelations> {
    const teeTime = await teeTimeRepository.findById(id);
    if (!teeTime) {
      throw new NotFoundError('Tee time not found');
    }
    return teeTime;
  },

  async list(params: ListTeeTimesInput): Promise<{
    teeTimes: TeeTimeWithRelations[];
    nextCursor: string | null;
    hasMore: boolean;
  }> {
    const { teeTimes, hasMore } = await teeTimeRepository.list(params);

    const lastTeeTime = teeTimes[teeTimes.length - 1];
    const nextCursor = hasMore && lastTeeTime ? lastTeeTime.id : null;

    return { teeTimes, nextCursor, hasMore };
  },

  async create(userId: string, data: CreateTeeTimeInput): Promise<TeeTimeWithRelations> {
    // Verify course exists
    await courseService.getById(data.courseId);

    const createData: Prisma.TeeTimeCreateInput = {
      host: { connect: { id: userId } },
      course: { connect: { id: data.courseId } },
      dateTime: new Date(data.dateTime),
      totalSlots: data.totalSlots,
      industryPreference: data.industryPreference,
      skillPreference: data.skillPreference,
      notes: data.notes ?? null,
    };

    const teeTime = await teeTimeRepository.create(createData, userId);

    return teeTime;
  },

  async update(
    id: string,
    userId: string,
    data: UpdateTeeTimeInput
  ): Promise<TeeTimeWithRelations> {
    const teeTime = await this.getById(id);

    if (teeTime.hostId !== userId) {
      throw new ForbiddenError('Only the host can update this tee time');
    }

    const updateData: Prisma.TeeTimeUpdateInput = {};

    if (data.dateTime !== undefined) {
      updateData.dateTime = new Date(data.dateTime);
    }
    if (data.totalSlots !== undefined) {
      updateData.totalSlots = data.totalSlots;
    }
    if (data.industryPreference !== undefined) {
      updateData.industryPreference = data.industryPreference;
    }
    if (data.skillPreference !== undefined) {
      updateData.skillPreference = data.skillPreference;
    }
    if (data.notes !== undefined) {
      updateData.notes = data.notes;
    }
    if (data.status !== undefined) {
      updateData.status = data.status;
    }

    const updated = await teeTimeRepository.update(id, updateData, teeTime.version);

    // Notify participants of update
    const participantIds = await teeTimeRepository.getParticipantIds(id);
    await notificationService.notifyTeeTimeUpdate(
      participantIds.filter((pid) => pid !== userId),
      teeTime
    );

    // Publish event
    await eventService.publishTeeTimeUpdate(id, updated);

    return updated;
  },

  async delete(id: string, userId: string): Promise<void> {
    const teeTime = await this.getById(id);

    if (teeTime.hostId !== userId) {
      throw new ForbiddenError('Only the host can delete this tee time');
    }

    // Notify participants before deletion
    const participantIds = await teeTimeRepository.getParticipantIds(id);
    await notificationService.notifyTeeTimeCancelled(
      participantIds.filter((pid) => pid !== userId),
      teeTime
    );

    await teeTimeRepository.delete(id);
  },

  async join(teeTimeId: string, userId: string, slotNumber?: number): Promise<TeeTimeWithRelations> {
    await this.getById(teeTimeId);

    await teeTimeRepository.joinSlot(teeTimeId, userId, slotNumber);

    const updated = await this.getById(teeTimeId);

    // Notify other participants
    const participantIds = await teeTimeRepository.getParticipantIds(teeTimeId);
    await notificationService.notifySlotJoined(
      participantIds.filter((pid) => pid !== userId),
      updated,
      userId
    );

    // Publish event
    await eventService.publishSlotJoined(teeTimeId, userId);

    return updated;
  },

  async leave(teeTimeId: string, userId: string): Promise<void> {
    const teeTime = await this.getById(teeTimeId);

    await teeTimeRepository.leaveSlot(teeTimeId, userId);

    // Notify other participants
    const participantIds = await teeTimeRepository.getParticipantIds(teeTimeId);
    await notificationService.notifySlotLeft(participantIds, teeTime, userId);

    // Publish event
    await eventService.publishSlotLeft(teeTimeId, userId);
  },

  async getUserTeeTimes(userId: string): Promise<TeeTimeWithRelations[]> {
    return teeTimeRepository.getUserTeeTimes(userId);
  },

  async isParticipant(teeTimeId: string, userId: string): Promise<boolean> {
    const participantIds = await teeTimeRepository.getParticipantIds(teeTimeId);
    return participantIds.includes(userId);
  },

  formatTeeTime(teeTime: TeeTimeWithRelations) {
    const filledSlots = teeTime.slots.filter((s) => s.userId !== null).length;
    const availableSlots = teeTime.totalSlots - filledSlots;

    return {
      id: teeTime.id,
      dateTime: teeTime.dateTime,
      totalSlots: teeTime.totalSlots,
      filledSlots,
      availableSlots,
      industryPreference: teeTime.industryPreference,
      skillPreference: teeTime.skillPreference,
      notes: teeTime.notes,
      status: teeTime.status,
      createdAt: teeTime.createdAt,
      host: teeTime.host,
      course: teeTime.course,
      slots: teeTime.slots.map((slot) => ({
        slotNumber: slot.slotNumber,
        user: (slot as { user?: unknown }).user ?? null,
        joinedAt: slot.joinedAt,
      })),
    };
  },
};
