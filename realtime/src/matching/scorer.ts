import { Industry, SkillLevel, TeeTimeSkillLevel } from '@prisma/client';
import { differenceInHours, differenceInDays } from 'date-fns';
import {
  MatchingContext,
  ScoringResult,
  ScoringBreakdown,
  SCORE_WEIGHTS,
  INDUSTRY_RELATIONS,
  SKILL_ADJACENCY,
} from './types.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('matcher-scorer');

export function calculateScore(context: MatchingContext): ScoringResult {
  const breakdown: ScoringBreakdown = {
    industryMatch: scoreIndustryMatch(context),
    proximity: scoreProximity(context),
    skillCompatibility: scoreSkillCompatibility(context),
    timeRelevance: scoreTimeRelevance(context),
    availability: scoreAvailability(context),
    social: scoreSocial(context),
  };

  const totalScore = Object.values(breakdown).reduce((sum, score) => sum + score, 0);
  const reasons = generateReasons(breakdown, context);

  logger.debug(
    { userId: context.user.id, teeTimeId: context.teeTime.id, totalScore, breakdown },
    'Calculated match score'
  );

  return { totalScore, breakdown, reasons };
}

function scoreIndustryMatch(context: MatchingContext): number {
  const { user, teeTime } = context;
  const maxScore = SCORE_WEIGHTS.INDUSTRY_MATCH; // 30

  // If tee time is open to all industries
  if (!teeTime.industryPreference) {
    // Still give some points for industry match with host
    if (user.industry === teeTime.host.industry) {
      return 20; // Good match with host
    }
    if (INDUSTRY_RELATIONS[user.industry]?.includes(teeTime.host.industry)) {
      return 15; // Related industry
    }
    return 10; // Open to all, baseline score
  }

  // Exact industry match
  if (user.industry === teeTime.industryPreference) {
    return maxScore; // 30 points
  }

  // Check if industries are related
  const relatedIndustries = INDUSTRY_RELATIONS[user.industry] || [];
  if (relatedIndustries.includes(teeTime.industryPreference)) {
    // Determine closeness of relation
    const isStrongRelation = INDUSTRY_RELATIONS[teeTime.industryPreference]?.includes(user.industry);
    return isStrongRelation ? 25 : 20;
  }

  // Sub-industry bonus (if both have same sub-industry)
  if (user.subIndustry && user.subIndustry === teeTime.industryPreference) {
    return 28;
  }

  // No industry match, but not excluded
  return 5;
}

function scoreProximity(context: MatchingContext): number {
  const { user, teeTime } = context;
  const maxScore = SCORE_WEIGHTS.PROXIMITY; // 25

  // If user has no location, give partial score
  if (!user.latitude || !user.longitude) {
    return 10;
  }

  const distance = calculateDistance(
    user.latitude,
    user.longitude,
    teeTime.course.latitude,
    teeTime.course.longitude
  );

  // Same city bonus
  if (user.city && user.city.toLowerCase() === teeTime.course.city.toLowerCase()) {
    return maxScore; // 25 points
  }

  // Distance-based scoring
  if (distance < 10) return maxScore;      // < 10 km: 25 points
  if (distance < 25) return 22;            // < 25 km: 22 points
  if (distance < 50) return 18;            // < 50 km: 18 points
  if (distance < 100) return 14;           // < 100 km: 14 points
  if (distance < 200) return 10;           // < 200 km: 10 points
  if (distance < 500) return 5;            // < 500 km: 5 points (traveling golfer)

  return 2; // Very far, but could be destination golf
}

function scoreSkillCompatibility(context: MatchingContext): number {
  const { user, teeTime } = context;
  const maxScore = SCORE_WEIGHTS.SKILL_COMPATIBILITY; // 15

  // If tee time accepts ANY skill level
  if (teeTime.skillLevel === 'ANY') {
    return 12; // Good for everyone
  }

  // Map tee time skill level to user skill level
  const skillMapping: Record<TeeTimeSkillLevel, SkillLevel[]> = {
    ANY: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'COMPETITIVE'],
    BEGINNER_FRIENDLY: ['BEGINNER', 'INTERMEDIATE'],
    INTERMEDIATE: ['INTERMEDIATE', 'ADVANCED'],
    COMPETITIVE: ['ADVANCED', 'COMPETITIVE'],
  };

  const matchingSkills = skillMapping[teeTime.skillLevel];

  // Exact match
  if (matchingSkills.includes(user.skillLevel)) {
    return maxScore; // 15 points
  }

  // Adjacent skill level
  const adjacentSkills = SKILL_ADJACENCY[user.skillLevel] || [];
  const hasAdjacentMatch = adjacentSkills.some((skill) => matchingSkills.includes(skill));
  if (hasAdjacentMatch) {
    return 10; // Close match
  }

  // No compatibility
  return 3;
}

function scoreTimeRelevance(context: MatchingContext): number {
  const { teeTime } = context;
  const maxScore = SCORE_WEIGHTS.TIME_RELEVANCE; // 15

  const now = new Date();
  const hoursUntil = differenceInHours(teeTime.dateTime, now);
  const daysUntil = differenceInDays(teeTime.dateTime, now);

  // Past tee times get no score
  if (hoursUntil < 0) return 0;

  // Time-based scoring (sooner = more relevant for filling slots)
  if (hoursUntil <= 48) return maxScore;   // Within 48h: 15 points (urgent)
  if (daysUntil <= 7) return 12;           // Within a week: 12 points
  if (daysUntil <= 14) return 8;           // Within 2 weeks: 8 points
  if (daysUntil <= 30) return 5;           // Within a month: 5 points

  return 2; // More than a month out
}

function scoreAvailability(context: MatchingContext): number {
  const { teeTime } = context;
  const maxScore = SCORE_WEIGHTS.AVAILABILITY; // 10

  const openSlots = teeTime.totalSlots - teeTime.filledSlots;

  // More open slots = higher score (easier to join, less commitment feeling)
  if (openSlots >= 3) return maxScore;     // 3+ slots: 10 points
  if (openSlots === 2) return 7;           // 2 slots: 7 points
  if (openSlots === 1) return 4;           // 1 slot: 4 points (last spot pressure)

  return 0; // No open slots
}

function scoreSocial(context: MatchingContext): number {
  // For now, return a baseline score
  // Future: Check mutual connections, user ratings, past rounds together
  return 2;
}

function generateReasons(breakdown: ScoringBreakdown, context: MatchingContext): string[] {
  const reasons: string[] = [];

  if (breakdown.industryMatch >= 25) {
    reasons.push(`Great industry match (${context.user.industry})`);
  } else if (breakdown.industryMatch >= 15) {
    reasons.push('Related industry');
  }

  if (breakdown.proximity >= 20) {
    reasons.push('Near you');
  }

  if (breakdown.skillCompatibility >= 12) {
    reasons.push('Skill level compatible');
  }

  if (breakdown.timeRelevance >= 12) {
    const daysUntil = differenceInDays(context.teeTime.dateTime, new Date());
    if (daysUntil <= 2) {
      reasons.push('Playing soon!');
    } else {
      reasons.push('Coming up this week');
    }
  }

  if (breakdown.availability >= 7) {
    const openSlots = context.teeTime.totalSlots - context.teeTime.filledSlots;
    reasons.push(`${openSlots} spots available`);
  }

  return reasons;
}

// Haversine formula to calculate distance between two points
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
