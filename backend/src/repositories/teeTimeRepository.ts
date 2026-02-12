import { prisma } from '../config/database.js';
import type { TeeTime, TeeTimeSlot, Prisma, TeeTimeStatus } from '@prisma/client';
import { getBoundingBox } from '../utils/haversine.js';
import { SlotUnavailableError, TeeTimeFullError, AlreadyJoinedError, ConflictError } from '../utils/errors.js';
import type { ListTeeTimesInput } from '../validators/teeTime.js';

export interface TeeTimeWithRelations extends TeeTime {
  host: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
    industry: string | null;
    handicap: number | null;
  };
  course: {
    id: string;
    name: string;
    slug: string;
    city: string;
    state: string;
    latitude: number;
    longitude: number;
  };
  slots: TeeTimeSlot[];
  _count: {
    slots: number;
  };
}

const teeTimeInclude = {
  host: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      industry: true,
      handicap: true,
    },
  },
  course: {
    select: {
      id: true,
      name: true,
      slug: true,
      city: true,
      state: true,
      latitude: true,
      longitude: true,
    },
  },
  slots: {
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          industry: true,
          handicap: true,
        },
      },
    },
    orderBy: { slotNumber: 'asc' as const },
  },
  _count: {
    select: { slots: true },
  },
};

export const teeTimeRepository = {
  async findById(id: string): Promise<TeeTimeWithRelations | null> {
    return prisma.teeTime.findUnique({
      where: { id },
      include: teeTimeInclude,
    }) as Promise<TeeTimeWithRelations | null>;
  },

  async list(params: ListTeeTimesInput): Promise<{ teeTimes: TeeTimeWithRelations[]; hasMore: boolean }> {
    const {
      courseId,
      hostId,
      status,
      industry,
      skillLevel,
      latitude,
      longitude,
      radius,
      fromDate,
      toDate,
      hasAvailableSlots,
      cursor,
      limit,
    } = params;

    const where: Prisma.TeeTimeWhereInput = {};

    if (courseId) {
      where.courseId = courseId;
    }

    if (hostId) {
      where.hostId = hostId;
    }

    if (status) {
      where.status = status;
    } else {
      // Default to showing only OPEN tee times
      where.status = 'OPEN';
    }

    if (industry) {
      where.industryPreference = { has: industry };
    }

    if (skillLevel) {
      where.skillPreference = { has: skillLevel };
    }

    // Date range filter
    if (fromDate || toDate) {
      where.dateTime = {};
      if (fromDate) {
        where.dateTime.gte = new Date(fromDate);
      }
      if (toDate) {
        where.dateTime.lte = new Date(toDate);
      }
    } else {
      // Default to future tee times
      where.dateTime = { gte: new Date() };
    }

    // Geospatial filter
    if (latitude !== undefined && longitude !== undefined) {
      const bbox = getBoundingBox({ latitude, longitude }, radius);
      where.course = {
        latitude: { gte: bbox.minLat, lte: bbox.maxLat },
        longitude: { gte: bbox.minLng, lte: bbox.maxLng },
      };
    }

    if (cursor) {
      where.id = { lt: cursor };
    }

    let teeTimes = await prisma.teeTime.findMany({
      where,
      include: teeTimeInclude,
      take: limit + 1,
      orderBy: { dateTime: 'asc' },
    }) as TeeTimeWithRelations[];

    // Filter by available slots
    if (hasAvailableSlots) {
      teeTimes = teeTimes.filter((tt) => {
        const filledSlots = tt.slots.filter((s) => s.userId !== null).length;
        return filledSlots < tt.totalSlots;
      });
    }

    const hasMore = teeTimes.length > limit;
    if (hasMore) {
      teeTimes.pop();
    }

    return { teeTimes, hasMore };
  },

  async create(data: Prisma.TeeTimeCreateInput, userId: string): Promise<TeeTimeWithRelations> {
    return prisma.$transaction(async (tx) => {
      const teeTime = await tx.teeTime.create({
        data,
        include: teeTimeInclude,
      });

      // Create slots and assign host to slot 1
      const slotPromises = [];
      for (let i = 1; i <= teeTime.totalSlots; i++) {
        slotPromises.push(
          tx.teeTimeSlot.create({
            data: {
              teeTimeId: teeTime.id,
              slotNumber: i,
              userId: i === 1 ? userId : null,
              joinedAt: i === 1 ? new Date() : null,
            },
          })
        );
      }
      await Promise.all(slotPromises);

      return tx.teeTime.findUnique({
        where: { id: teeTime.id },
        include: teeTimeInclude,
      }) as Promise<TeeTimeWithRelations>;
    });
  },

  async update(
    id: string,
    data: Prisma.TeeTimeUpdateInput,
    expectedVersion: number
  ): Promise<TeeTimeWithRelations> {
    // Optimistic locking
    const result = await prisma.teeTime.updateMany({
      where: { id, version: expectedVersion },
      data: {
        ...data,
        version: { increment: 1 },
      },
    });

    if (result.count === 0) {
      throw new ConflictError('Tee time was modified by another request. Please refresh and try again.');
    }

    return prisma.teeTime.findUnique({
      where: { id },
      include: teeTimeInclude,
    }) as Promise<TeeTimeWithRelations>;
  },

  async delete(id: string): Promise<void> {
    await prisma.teeTime.delete({
      where: { id },
    });
  },

  async joinSlot(
    teeTimeId: string,
    userId: string,
    preferredSlot?: number
  ): Promise<TeeTimeSlot> {
    return prisma.$transaction(async (tx) => {
      // Check if user already joined
      const existingSlot = await tx.teeTimeSlot.findFirst({
        where: { teeTimeId, userId },
      });

      if (existingSlot) {
        throw new AlreadyJoinedError();
      }

      // Get tee time with slots
      const teeTime = await tx.teeTime.findUnique({
        where: { id: teeTimeId },
        include: { slots: true },
      });

      if (!teeTime) {
        throw new SlotUnavailableError('Tee time not found');
      }

      if (teeTime.status !== 'OPEN') {
        throw new SlotUnavailableError('Tee time is no longer available');
      }

      // Find available slot
      const availableSlots = teeTime.slots
        .filter((s) => s.userId === null)
        .sort((a, b) => a.slotNumber - b.slotNumber);

      if (availableSlots.length === 0) {
        throw new TeeTimeFullError();
      }

      let targetSlot = availableSlots[0];

      if (preferredSlot) {
        const preferred = availableSlots.find((s) => s.slotNumber === preferredSlot);
        if (preferred) {
          targetSlot = preferred;
        }
      }

      if (!targetSlot) {
        throw new SlotUnavailableError();
      }

      // Atomic update with null check (race condition prevention)
      const updated = await tx.teeTimeSlot.updateMany({
        where: {
          id: targetSlot.id,
          userId: null, // Only update if still available
        },
        data: {
          userId,
          joinedAt: new Date(),
        },
      });

      if (updated.count === 0) {
        throw new SlotUnavailableError('Slot was taken by another user');
      }

      // Check if tee time is now full
      const remainingSlots = await tx.teeTimeSlot.count({
        where: { teeTimeId, userId: null },
      });

      if (remainingSlots === 0) {
        await tx.teeTime.update({
          where: { id: teeTimeId },
          data: { status: 'FULL' },
        });
      }

      return tx.teeTimeSlot.findUnique({
        where: { id: targetSlot.id },
      }) as Promise<TeeTimeSlot>;
    }, {
      isolationLevel: 'Serializable',
    });
  },

  async leaveSlot(teeTimeId: string, userId: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const slot = await tx.teeTimeSlot.findFirst({
        where: { teeTimeId, userId },
      });

      if (!slot) {
        throw new SlotUnavailableError('You are not in this tee time');
      }

      // Check if user is host
      const teeTime = await tx.teeTime.findUnique({
        where: { id: teeTimeId },
      });

      if (teeTime?.hostId === userId) {
        throw new ConflictError('Host cannot leave. Cancel the tee time instead.');
      }

      await tx.teeTimeSlot.update({
        where: { id: slot.id },
        data: {
          userId: null,
          joinedAt: null,
        },
      });

      // Reopen tee time if it was full
      if (teeTime?.status === 'FULL') {
        await tx.teeTime.update({
          where: { id: teeTimeId },
          data: { status: 'OPEN' },
        });
      }
    });
  },

  async getParticipantIds(teeTimeId: string): Promise<string[]> {
    const slots = await prisma.teeTimeSlot.findMany({
      where: { teeTimeId, userId: { not: null } },
      select: { userId: true },
    });
    return slots.map((s) => s.userId).filter((id): id is string => id !== null);
  },

  async getUserTeeTimes(
    userId: string,
    status?: TeeTimeStatus
  ): Promise<TeeTimeWithRelations[]> {
    const where: Prisma.TeeTimeWhereInput = {
      OR: [
        { hostId: userId },
        { slots: { some: { userId } } },
      ],
    };

    if (status) {
      where.status = status;
    }

    return prisma.teeTime.findMany({
      where,
      include: teeTimeInclude,
      orderBy: { dateTime: 'asc' },
    }) as Promise<TeeTimeWithRelations[]>;
  },
};
