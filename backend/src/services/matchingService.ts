import { prisma } from '../config/database.js';
import { teeTimeRepository, type TeeTimeWithRelations } from '../repositories/teeTimeRepository.js';
import { calculateDistance } from '../utils/haversine.js';
import type { User, Industry, SkillLevel } from '@prisma/client';
import type { MatchScore } from '../types/index.js';

// Industry affinity groups - industries that often network together
const INDUSTRY_AFFINITIES: Record<Industry, Industry[]> = {
  TECHNOLOGY: ['ENGINEERING', 'ENTREPRENEURSHIP', 'CONSULTING'],
  FINANCE: ['CONSULTING', 'LEGAL', 'REAL_ESTATE'],
  HEALTHCARE: ['CONSULTING', 'LEGAL'],
  LEGAL: ['FINANCE', 'REAL_ESTATE', 'HEALTHCARE'],
  REAL_ESTATE: ['FINANCE', 'LEGAL', 'SALES'],
  CONSULTING: ['TECHNOLOGY', 'FINANCE', 'EXECUTIVE'],
  MARKETING: ['SALES', 'TECHNOLOGY', 'ENTREPRENEURSHIP'],
  SALES: ['MARKETING', 'REAL_ESTATE', 'ENTREPRENEURSHIP'],
  ENGINEERING: ['TECHNOLOGY', 'CONSULTING'],
  EXECUTIVE: ['CONSULTING', 'ENTREPRENEURSHIP', 'FINANCE'],
  ENTREPRENEURSHIP: ['TECHNOLOGY', 'SALES', 'MARKETING'],
  OTHER: [],
};

const SKILL_LEVEL_ORDER: SkillLevel[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'];

// Scoring weights
const WEIGHTS = {
  industry: 0.35,
  skill: 0.25,
  distance: 0.25,
  timing: 0.15,
};

// Type for slot with user included
interface SlotWithUser {
  id: string;
  slotNumber: number;
  userId: string | null;
  user?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
    industry: string | null;
    handicap: number | null;
    skillLevel?: SkillLevel | null;
  } | null;
}

export const matchingService = {
  async getRecommendedTeeTimes(
    user: User,
    limit: number = 20
  ): Promise<{ teeTime: TeeTimeWithRelations; score: MatchScore }[]> {
    if (!user.latitude || !user.longitude) {
      // No location, return tee times sorted by date
      const { teeTimes } = await teeTimeRepository.list({
        hasAvailableSlots: true,
        limit,
        radius: 100,
      });

      return teeTimes.map((teeTime) => ({
        teeTime,
        score: this.calculateScore(user, teeTime, 0),
      }));
    }

    // Get tee times within user's search radius
    const { teeTimes } = await teeTimeRepository.list({
      latitude: user.latitude,
      longitude: user.longitude,
      radius: user.searchRadius,
      hasAvailableSlots: true,
      limit: 100, // Get more for scoring
    });

    // Calculate scores for each tee time
    const scored = teeTimes.map((teeTime) => {
      const distance = calculateDistance(
        { latitude: user.latitude!, longitude: user.longitude! },
        { latitude: teeTime.course.latitude, longitude: teeTime.course.longitude }
      );

      return {
        teeTime,
        score: this.calculateScore(user, teeTime, distance),
      };
    });

    // Sort by total score descending
    scored.sort((a, b) => b.score.score - a.score.score);

    return scored.slice(0, limit);
  },

  calculateScore(
    user: User,
    teeTime: TeeTimeWithRelations,
    distance: number
  ): MatchScore {
    const industryScore = this.calculateIndustryScore(user, teeTime);
    const skillScore = this.calculateSkillScore(user, teeTime);
    const distanceScore = this.calculateDistanceScore(distance, user.searchRadius);
    const timingScore = this.calculateTimingScore(teeTime.dateTime);

    const totalScore =
      industryScore * WEIGHTS.industry +
      skillScore * WEIGHTS.skill +
      distanceScore * WEIGHTS.distance +
      timingScore * WEIGHTS.timing;

    return {
      teeTimeId: teeTime.id,
      score: Math.round(totalScore * 100) / 100,
      breakdown: {
        industryScore: Math.round(industryScore * 100) / 100,
        skillScore: Math.round(skillScore * 100) / 100,
        distanceScore: Math.round(distanceScore * 100) / 100,
        timingScore: Math.round(timingScore * 100) / 100,
      },
    };
  },

  calculateIndustryScore(user: User, teeTime: TeeTimeWithRelations): number {
    if (!user.industry) {
      return 0.5; // Neutral score if user has no industry set
    }

    const preferences = teeTime.industryPreference;

    // No preference means open to all
    if (preferences.length === 0) {
      return 0.7;
    }

    // Exact match
    if (preferences.includes(user.industry)) {
      return 1.0;
    }

    // Check affinity
    const affinities = INDUSTRY_AFFINITIES[user.industry] ?? [];
    const hasAffinity = preferences.some((pref) => affinities.includes(pref));

    if (hasAffinity) {
      return 0.8;
    }

    // Check if host/participants share user's industry
    if (teeTime.host.industry === user.industry) {
      return 0.9;
    }

    const slots = teeTime.slots as SlotWithUser[];
    const participants = slots
      .filter((s) => s.user)
      .map((s) => s.user);

    const hasIndustryMatch = participants.some(
      (p) => p?.industry === user.industry
    );

    if (hasIndustryMatch) {
      return 0.85;
    }

    return 0.3; // Low score if no match
  },

  calculateSkillScore(user: User, teeTime: TeeTimeWithRelations): number {
    if (!user.skillLevel) {
      return 0.5; // Neutral score if user has no skill level set
    }

    const preferences = teeTime.skillPreference;

    // No preference means open to all
    if (preferences.length === 0) {
      return 0.7;
    }

    // Exact match
    if (preferences.includes(user.skillLevel)) {
      return 1.0;
    }

    // Adjacent skill levels
    const userIndex = SKILL_LEVEL_ORDER.indexOf(user.skillLevel);
    const adjacentLevels = [
      SKILL_LEVEL_ORDER[userIndex - 1],
      SKILL_LEVEL_ORDER[userIndex + 1],
    ].filter(Boolean) as SkillLevel[];

    const hasAdjacentMatch = preferences.some((pref) =>
      adjacentLevels.includes(pref)
    );

    if (hasAdjacentMatch) {
      return 0.75;
    }

    // Check average skill of current participants
    const slots = teeTime.slots as SlotWithUser[];
    const participantSkills = slots
      .filter((s) => s.user?.skillLevel)
      .map((s) => {
        const skillLevel = s.user?.skillLevel;
        return skillLevel ? SKILL_LEVEL_ORDER.indexOf(skillLevel) : -1;
      })
      .filter((idx) => idx >= 0);

    if (participantSkills.length > 0) {
      const avgIndex = participantSkills.reduce((a, b) => a + b, 0) / participantSkills.length;
      const diff = Math.abs(userIndex - avgIndex);

      // Score based on proximity to average
      if (diff <= 0.5) return 0.9;
      if (diff <= 1) return 0.7;
      if (diff <= 1.5) return 0.5;
    }

    return 0.3; // Low score if skill mismatch
  },

  calculateDistanceScore(distance: number, searchRadius: number): number {
    if (distance <= 5) {
      return 1.0; // Very close
    }

    if (distance <= 15) {
      return 0.9;
    }

    if (distance <= 30) {
      return 0.75;
    }

    // Linear decay from 30 miles to search radius
    const ratio = (searchRadius - distance) / (searchRadius - 30);
    return Math.max(0.2, 0.75 * ratio);
  },

  calculateTimingScore(dateTime: Date): number {
    const now = new Date();
    const hoursUntil = (dateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Sweet spot is 24-72 hours away
    if (hoursUntil >= 24 && hoursUntil <= 72) {
      return 1.0;
    }

    // Within 24 hours (less time to plan)
    if (hoursUntil < 24 && hoursUntil >= 4) {
      return 0.8;
    }

    // Very soon (< 4 hours)
    if (hoursUntil < 4) {
      return 0.5;
    }

    // 3-7 days out
    if (hoursUntil <= 168) {
      return 0.9;
    }

    // 1-2 weeks out
    if (hoursUntil <= 336) {
      return 0.7;
    }

    // More than 2 weeks out
    return 0.5;
  },

  async findMatchesForTeeTime(
    teeTime: TeeTimeWithRelations,
    limit: number = 20
  ): Promise<{ userId: string; score: number }[]> {
    // Find users who might be interested in this tee time
    const existingUserIds = teeTime.slots
      .map((s) => s.userId)
      .filter((id): id is string => id !== null);

    const users = await prisma.user.findMany({
      where: {
        id: { notIn: existingUserIds },
        latitude: { not: null },
        longitude: { not: null },
      },
    });

    const matches = users
      .map((user) => {
        const distance = calculateDistance(
          { latitude: user.latitude!, longitude: user.longitude! },
          { latitude: teeTime.course.latitude, longitude: teeTime.course.longitude }
        );

        if (distance > user.searchRadius) {
          return null;
        }

        const score = this.calculateScore(user, teeTime, distance);

        return {
          userId: user.id,
          score: score.score,
        };
      })
      .filter((m): m is { userId: string; score: number } => m !== null && m.score >= 0.6);

    matches.sort((a, b) => b.score - a.score);

    return matches.slice(0, limit);
  },
};
