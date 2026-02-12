import { prisma } from '../config/database.js';
import { createLogger } from '../utils/logger.js';
import { metrics } from '../utils/metrics.js';
import { calculateScore } from './scorer.js';
import { MatchResult, TeeTimeMatch, MatchingContext } from './types.js';

const logger = createLogger('matching-engine');

interface FindMatchesOptions {
  limit?: number;
  minScore?: number;
  excludeUserIds?: string[];
}

class MatchingEngine {
  async findMatchesForTeeTime(
    teeTimeId: string,
    options: FindMatchesOptions = {}
  ): Promise<MatchResult[]> {
    const { limit = 50, minScore = 40, excludeUserIds = [] } = options;

    metrics.matchingQueryExecuted();

    // Fetch tee time with course and host
    const teeTime = await prisma.teeTime.findUnique({
      where: { id: teeTimeId },
      include: {
        course: true,
        host: true,
        slots: {
          where: { userId: { not: null } },
          select: { userId: true },
        },
      },
    });

    if (!teeTime) {
      logger.warn({ teeTimeId }, 'Tee time not found for matching');
      return [];
    }

    // Calculate filled slots
    const filledSlots = teeTime.slots.length;
    const existingUserIds = teeTime.slots.map((s) => s.userId).filter(Boolean) as string[];

    // Build exclusion list (host + already joined + explicit exclusions)
    const excludeIds = new Set([teeTime.hostId, ...existingUserIds, ...excludeUserIds]);

    // Fetch potential users based on criteria
    const potentialUsers = await this.findPotentialUsers(teeTime, excludeIds);

    logger.debug(
      { teeTimeId, potentialUsers: potentialUsers.length },
      'Found potential users for matching'
    );

    // Score each user
    const matches: MatchResult[] = [];

    for (const user of potentialUsers) {
      const context: MatchingContext = {
        user: {
          id: user.id,
          industry: user.industry,
          subIndustry: user.subIndustry,
          latitude: user.latitude,
          longitude: user.longitude,
          skillLevel: user.skillLevel,
          city: user.city,
        },
        teeTime: {
          id: teeTime.id,
          dateTime: teeTime.dateTime,
          industryPreference: teeTime.industryPreference,
          skillLevel: teeTime.skillLevel,
          totalSlots: teeTime.totalSlots,
          filledSlots,
          course: {
            id: teeTime.course.id,
            latitude: teeTime.course.latitude,
            longitude: teeTime.course.longitude,
            city: teeTime.course.city,
          },
          host: {
            id: teeTime.host.id,
            industry: teeTime.host.industry,
          },
        },
      };

      const result = calculateScore(context);

      if (result.totalScore >= minScore) {
        matches.push({
          userId: user.id,
          score: result.totalScore,
          reasons: result.reasons,
          breakdown: result.breakdown,
        });
      }
    }

    // Sort by score and limit
    matches.sort((a, b) => b.score - a.score);

    return matches.slice(0, limit);
  }

  async findMatchingTeeTimesForUser(
    userId: string,
    options: FindMatchesOptions = {}
  ): Promise<TeeTimeMatch[]> {
    const { limit = 50, minScore = 40 } = options;

    metrics.matchingQueryExecuted();

    // Fetch user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      logger.warn({ userId }, 'User not found for matching');
      return [];
    }

    // Fetch potential tee times
    const teeTimes = await this.findPotentialTeeTimes(userId);

    logger.debug(
      { userId, potentialTeeTimes: teeTimes.length },
      'Found potential tee times for matching'
    );

    // Score each tee time
    const matches: TeeTimeMatch[] = [];

    for (const teeTime of teeTimes) {
      const filledSlots = teeTime.slots.filter((s) => s.userId !== null).length;

      const context: MatchingContext = {
        user: {
          id: user.id,
          industry: user.industry,
          subIndustry: user.subIndustry,
          latitude: user.latitude,
          longitude: user.longitude,
          skillLevel: user.skillLevel,
          city: user.city,
        },
        teeTime: {
          id: teeTime.id,
          dateTime: teeTime.dateTime,
          industryPreference: teeTime.industryPreference,
          skillLevel: teeTime.skillLevel,
          totalSlots: teeTime.totalSlots,
          filledSlots,
          course: {
            id: teeTime.course.id,
            latitude: teeTime.course.latitude,
            longitude: teeTime.course.longitude,
            city: teeTime.course.city,
          },
          host: {
            id: teeTime.host.id,
            industry: teeTime.host.industry,
          },
        },
      };

      const result = calculateScore(context);

      if (result.totalScore >= minScore) {
        matches.push({
          userId,
          teeTimeId: teeTime.id,
          score: result.totalScore,
          reasons: result.reasons,
          breakdown: result.breakdown,
        });
      }
    }

    // Sort by score and limit
    matches.sort((a, b) => b.score - a.score);

    return matches.slice(0, limit);
  }

  private async findPotentialUsers(
    teeTime: {
      industryPreference: any;
      course: { latitude: number; longitude: number };
    },
    excludeIds: Set<string>
  ) {
    // Build where clause based on tee time preferences
    const whereClause: any = {
      id: { notIn: Array.from(excludeIds) },
      isPublic: true,
    };

    // If industry preference, prioritize but don't exclude others
    // We'll handle this in scoring

    // Fetch users - in production, add geo-filtering for performance
    return prisma.user.findMany({
      where: whereClause,
      take: 200, // Limit for performance
      select: {
        id: true,
        industry: true,
        subIndustry: true,
        latitude: true,
        longitude: true,
        skillLevel: true,
        city: true,
      },
    });
  }

  private async findPotentialTeeTimes(userId: string) {
    const now = new Date();

    // Fetch tee times with open slots, in the future, and public
    return prisma.teeTime.findMany({
      where: {
        status: 'OPEN',
        isPublic: true,
        dateTime: { gt: now },
        hostId: { not: userId },
        slots: {
          some: {
            status: 'OPEN',
            userId: null,
          },
        },
      },
      include: {
        course: true,
        host: {
          select: { id: true, industry: true },
        },
        slots: {
          select: { userId: true, status: true },
        },
      },
      take: 200, // Limit for performance
      orderBy: { dateTime: 'asc' },
    });
  }
}

export const matchingEngine = new MatchingEngine();
