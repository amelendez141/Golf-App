import { Industry, SkillLevel, TeeTimeSkillLevel } from '@prisma/client';

export interface MatchingContext {
  user: {
    id: string;
    industry: Industry;
    subIndustry?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    skillLevel: SkillLevel;
    city?: string | null;
  };
  teeTime: {
    id: string;
    dateTime: Date;
    industryPreference?: Industry | null;
    skillLevel: TeeTimeSkillLevel;
    totalSlots: number;
    filledSlots: number;
    course: {
      id: string;
      latitude: number;
      longitude: number;
      city: string;
    };
    host: {
      id: string;
      industry: Industry;
    };
  };
}

export interface ScoringResult {
  totalScore: number;
  breakdown: ScoringBreakdown;
  reasons: string[];
}

export interface ScoringBreakdown {
  industryMatch: number;
  proximity: number;
  skillCompatibility: number;
  timeRelevance: number;
  availability: number;
  social: number;
}

export interface MatchResult {
  userId: string;
  score: number;
  reasons: string[];
  breakdown: ScoringBreakdown;
}

export interface TeeTimeMatch extends MatchResult {
  teeTimeId: string;
}

export interface UserMatch extends MatchResult {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    industry: Industry;
    company?: string | null;
    avatarUrl?: string | null;
  };
}

// Score weights (must sum to 100)
export const SCORE_WEIGHTS = {
  INDUSTRY_MATCH: 30,    // 0-30 points
  PROXIMITY: 25,         // 0-25 points
  SKILL_COMPATIBILITY: 15, // 0-15 points
  TIME_RELEVANCE: 15,    // 0-15 points
  AVAILABILITY: 10,      // 0-10 points
  SOCIAL: 5,             // 0-5 points
} as const;

// Industry relationships for partial matching
export const INDUSTRY_RELATIONS: Record<Industry, Industry[]> = {
  FINANCE: ['PRIVATE_CAPITAL', 'CONSULTING', 'REAL_ESTATE'],
  PRIVATE_CAPITAL: ['FINANCE', 'CONSULTING', 'TECH'],
  TECH: ['PRIVATE_CAPITAL', 'MEDIA_ENTERTAINMENT', 'CONSULTING'],
  HEALTHCARE: ['EDUCATION', 'GOVERNMENT'],
  LEGAL: ['FINANCE', 'REAL_ESTATE', 'CONSULTING'],
  REAL_ESTATE: ['FINANCE', 'LEGAL', 'PRIVATE_CAPITAL'],
  CONSULTING: ['FINANCE', 'TECH', 'PRIVATE_CAPITAL', 'LEGAL'],
  ENERGY: ['FINANCE', 'GOVERNMENT'],
  MEDIA_ENTERTAINMENT: ['TECH', 'CONSULTING'],
  GOVERNMENT: ['EDUCATION', 'HEALTHCARE'],
  EDUCATION: ['GOVERNMENT', 'HEALTHCARE'],
  RETIRED: [],
  OTHER: [],
};

// Skill level adjacency for compatibility
export const SKILL_ADJACENCY: Record<SkillLevel, SkillLevel[]> = {
  BEGINNER: ['INTERMEDIATE'],
  INTERMEDIATE: ['BEGINNER', 'ADVANCED'],
  ADVANCED: ['INTERMEDIATE', 'COMPETITIVE'],
  COMPETITIVE: ['ADVANCED'],
};
