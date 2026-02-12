/**
 * Matching Service Unit Tests
 *
 * Tests the matching algorithm that calculates compatibility scores
 * between users and tee times based on industry, skill level, distance, and timing.
 */

import { matchingService } from '../../src/services/matchingService';
import type { User, Industry, SkillLevel } from '@prisma/client';
import type { TeeTimeWithRelations } from '../../src/repositories/teeTimeRepository';
import {
  createMockUser,
  createMockTeeTimeWithRelations,
  INDUSTRY_AFFINITIES,
  SKILL_LEVEL_ORDER,
} from '../mocks/factories';

describe('MatchingService', () => {
  describe('calculateIndustryScore', () => {
    describe('exact industry matches', () => {
      it('should return 1.0 for exact industry match', () => {
        const user = createMockUser({ industry: 'TECHNOLOGY' });
        const teeTime = createMockTeeTimeWithRelations({
          teeTime: { industryPreference: ['TECHNOLOGY'] },
        });

        const score = matchingService.calculateIndustryScore(user, teeTime);

        expect(score).toBe(1.0);
      });

      it('should return 1.0 when user industry is in multiple preferences', () => {
        const user = createMockUser({ industry: 'FINANCE' });
        const teeTime = createMockTeeTimeWithRelations({
          teeTime: { industryPreference: ['TECHNOLOGY', 'FINANCE', 'LEGAL'] },
        });

        const score = matchingService.calculateIndustryScore(user, teeTime);

        expect(score).toBe(1.0);
      });
    });

    describe('industry affinity matches', () => {
      it('should return 0.8 for affinity industry match', () => {
        const user = createMockUser({ industry: 'TECHNOLOGY' });
        const teeTime = createMockTeeTimeWithRelations({
          teeTime: { industryPreference: ['ENGINEERING'] },
        });

        const score = matchingService.calculateIndustryScore(user, teeTime);

        expect(score).toBe(0.8);
      });

      it.each([
        ['TECHNOLOGY', 'CONSULTING'],
        ['FINANCE', 'LEGAL'],
        ['HEALTHCARE', 'CONSULTING'],
        ['MARKETING', 'SALES'],
        ['EXECUTIVE', 'FINANCE'],
      ] as [Industry, Industry][])(
        'should return 0.8 when %s user matches %s preference (affinity)',
        (userIndustry, preferredIndustry) => {
          const user = createMockUser({ industry: userIndustry });
          const teeTime = createMockTeeTimeWithRelations({
            teeTime: { industryPreference: [preferredIndustry] },
          });

          const score = matchingService.calculateIndustryScore(user, teeTime);

          expect(score).toBe(0.8);
        }
      );
    });

    describe('no preference scenarios', () => {
      it('should return 0.7 for no industry preference (open to all)', () => {
        const user = createMockUser({ industry: 'TECHNOLOGY' });
        const teeTime = createMockTeeTimeWithRelations({
          teeTime: { industryPreference: [] },
        });

        const score = matchingService.calculateIndustryScore(user, teeTime);

        expect(score).toBe(0.7);
      });

      it('should return 0.5 for user with no industry set', () => {
        const user = createMockUser({ industry: null });
        const teeTime = createMockTeeTimeWithRelations({
          teeTime: { industryPreference: ['TECHNOLOGY'] },
        });

        const score = matchingService.calculateIndustryScore(user, teeTime);

        expect(score).toBe(0.5);
      });
    });

    describe('host industry matching', () => {
      it('should return 0.9 when user industry matches host industry', () => {
        const user = createMockUser({ industry: 'HEALTHCARE' });
        const teeTime = createMockTeeTimeWithRelations({
          host: { industry: 'HEALTHCARE' },
          teeTime: { industryPreference: ['FINANCE'] }, // Different from user
        });

        const score = matchingService.calculateIndustryScore(user, teeTime);

        expect(score).toBe(0.9);
      });
    });

    describe('no match scenarios', () => {
      it('should return 0.3 for complete industry mismatch', () => {
        const user = createMockUser({ industry: 'HEALTHCARE' });
        const teeTime = createMockTeeTimeWithRelations({
          host: { industry: 'TECHNOLOGY' },
          teeTime: { industryPreference: ['FINANCE'] },
        });

        const score = matchingService.calculateIndustryScore(user, teeTime);

        expect(score).toBe(0.3);
      });
    });
  });

  describe('calculateSkillScore', () => {
    describe('exact skill matches', () => {
      it('should return 1.0 for exact skill match', () => {
        const user = createMockUser({ skillLevel: 'INTERMEDIATE' });
        const teeTime = createMockTeeTimeWithRelations({
          teeTime: { skillPreference: ['INTERMEDIATE'] },
        });

        const score = matchingService.calculateSkillScore(user, teeTime);

        expect(score).toBe(1.0);
      });

      it.each([
        'BEGINNER',
        'INTERMEDIATE',
        'ADVANCED',
        'EXPERT',
      ] as SkillLevel[])(
        'should return 1.0 for exact %s skill match',
        (skillLevel) => {
          const user = createMockUser({ skillLevel });
          const teeTime = createMockTeeTimeWithRelations({
            teeTime: { skillPreference: [skillLevel] },
          });

          const score = matchingService.calculateSkillScore(user, teeTime);

          expect(score).toBe(1.0);
        }
      );
    });

    describe('adjacent skill matches', () => {
      it('should return 0.75 for adjacent skill level (one step up)', () => {
        const user = createMockUser({ skillLevel: 'INTERMEDIATE' });
        const teeTime = createMockTeeTimeWithRelations({
          teeTime: { skillPreference: ['ADVANCED'] },
        });

        const score = matchingService.calculateSkillScore(user, teeTime);

        expect(score).toBe(0.75);
      });

      it('should return 0.75 for adjacent skill level (one step down)', () => {
        const user = createMockUser({ skillLevel: 'ADVANCED' });
        const teeTime = createMockTeeTimeWithRelations({
          teeTime: { skillPreference: ['INTERMEDIATE'] },
        });

        const score = matchingService.calculateSkillScore(user, teeTime);

        expect(score).toBe(0.75);
      });

      it.each([
        ['BEGINNER', 'INTERMEDIATE'],
        ['INTERMEDIATE', 'BEGINNER'],
        ['INTERMEDIATE', 'ADVANCED'],
        ['ADVANCED', 'INTERMEDIATE'],
        ['ADVANCED', 'EXPERT'],
        ['EXPERT', 'ADVANCED'],
      ] as [SkillLevel, SkillLevel][])(
        'should return 0.75 when %s user matches %s preference',
        (userSkill, preferredSkill) => {
          const user = createMockUser({ skillLevel: userSkill });
          const teeTime = createMockTeeTimeWithRelations({
            teeTime: { skillPreference: [preferredSkill] },
          });

          const score = matchingService.calculateSkillScore(user, teeTime);

          expect(score).toBe(0.75);
        }
      );
    });

    describe('no preference scenarios', () => {
      it('should return 0.7 for no skill preference', () => {
        const user = createMockUser({ skillLevel: 'INTERMEDIATE' });
        const teeTime = createMockTeeTimeWithRelations({
          teeTime: { skillPreference: [] },
        });

        const score = matchingService.calculateSkillScore(user, teeTime);

        expect(score).toBe(0.7);
      });

      it('should return 0.5 for user with no skill level set', () => {
        const user = createMockUser({ skillLevel: null });
        const teeTime = createMockTeeTimeWithRelations({
          teeTime: { skillPreference: ['INTERMEDIATE'] },
        });

        const score = matchingService.calculateSkillScore(user, teeTime);

        expect(score).toBe(0.5);
      });
    });

    describe('large skill gap scenarios', () => {
      it('should return 0.3 for large skill mismatch (BEGINNER vs EXPERT)', () => {
        const user = createMockUser({ skillLevel: 'BEGINNER' });
        const teeTime = createMockTeeTimeWithRelations({
          teeTime: { skillPreference: ['EXPERT'] },
        });

        const score = matchingService.calculateSkillScore(user, teeTime);

        expect(score).toBe(0.3);
      });
    });
  });

  describe('calculateDistanceScore', () => {
    describe('very close distances', () => {
      it('should return 1.0 for distances <= 5 miles', () => {
        expect(matchingService.calculateDistanceScore(0, 50)).toBe(1.0);
        expect(matchingService.calculateDistanceScore(3, 50)).toBe(1.0);
        expect(matchingService.calculateDistanceScore(5, 50)).toBe(1.0);
      });
    });

    describe('close distances', () => {
      it('should return 0.9 for distances 5-15 miles', () => {
        expect(matchingService.calculateDistanceScore(6, 50)).toBe(0.9);
        expect(matchingService.calculateDistanceScore(10, 50)).toBe(0.9);
        expect(matchingService.calculateDistanceScore(15, 50)).toBe(0.9);
      });
    });

    describe('moderate distances', () => {
      it('should return 0.75 for distances 15-30 miles', () => {
        expect(matchingService.calculateDistanceScore(16, 50)).toBe(0.75);
        expect(matchingService.calculateDistanceScore(25, 50)).toBe(0.75);
        expect(matchingService.calculateDistanceScore(30, 50)).toBe(0.75);
      });
    });

    describe('far distances', () => {
      it('should decay linearly beyond 30 miles', () => {
        const score35 = matchingService.calculateDistanceScore(35, 50);
        const score45 = matchingService.calculateDistanceScore(45, 50);

        expect(score35).toBeGreaterThan(score45);
        expect(score35).toBeLessThan(0.75);
        expect(score45).toBeGreaterThan(0.2);
      });

      it('should never go below 0.2', () => {
        const score = matchingService.calculateDistanceScore(100, 50);
        expect(score).toBeGreaterThanOrEqual(0.2);
      });
    });

    describe('boundary conditions', () => {
      it('should handle exactly 5 miles as close', () => {
        expect(matchingService.calculateDistanceScore(5, 50)).toBe(1.0);
      });

      it('should handle exactly 15 miles as moderate', () => {
        expect(matchingService.calculateDistanceScore(15, 50)).toBe(0.9);
      });

      it('should handle exactly 30 miles as moderate', () => {
        expect(matchingService.calculateDistanceScore(30, 50)).toBe(0.75);
      });
    });
  });

  describe('calculateTimingScore', () => {
    const createDateHoursFromNow = (hours: number) => {
      const date = new Date();
      date.setTime(date.getTime() + hours * 60 * 60 * 1000);
      return date;
    };

    describe('optimal timing (24-72 hours)', () => {
      it('should return 1.0 for tee times 24-72 hours away', () => {
        expect(matchingService.calculateTimingScore(createDateHoursFromNow(24))).toBe(1.0);
        expect(matchingService.calculateTimingScore(createDateHoursFromNow(48))).toBe(1.0);
        expect(matchingService.calculateTimingScore(createDateHoursFromNow(72))).toBe(1.0);
      });
    });

    describe('short notice (4-24 hours)', () => {
      it('should return 0.8 for tee times 4-24 hours away', () => {
        expect(matchingService.calculateTimingScore(createDateHoursFromNow(4))).toBe(0.8);
        expect(matchingService.calculateTimingScore(createDateHoursFromNow(12))).toBe(0.8);
        expect(matchingService.calculateTimingScore(createDateHoursFromNow(20))).toBe(0.8);
      });
    });

    describe('very soon (< 4 hours)', () => {
      it('should return 0.5 for tee times less than 4 hours away', () => {
        expect(matchingService.calculateTimingScore(createDateHoursFromNow(1))).toBe(0.5);
        expect(matchingService.calculateTimingScore(createDateHoursFromNow(2))).toBe(0.5);
        expect(matchingService.calculateTimingScore(createDateHoursFromNow(3))).toBe(0.5);
      });
    });

    describe('3-7 days out', () => {
      it('should return 0.9 for tee times 3-7 days away', () => {
        expect(matchingService.calculateTimingScore(createDateHoursFromNow(96))).toBe(0.9);  // 4 days
        expect(matchingService.calculateTimingScore(createDateHoursFromNow(120))).toBe(0.9); // 5 days
        expect(matchingService.calculateTimingScore(createDateHoursFromNow(168))).toBe(0.9); // 7 days
      });
    });

    describe('1-2 weeks out', () => {
      it('should return 0.7 for tee times 1-2 weeks away', () => {
        expect(matchingService.calculateTimingScore(createDateHoursFromNow(192))).toBe(0.7); // 8 days
        expect(matchingService.calculateTimingScore(createDateHoursFromNow(240))).toBe(0.7); // 10 days
        expect(matchingService.calculateTimingScore(createDateHoursFromNow(336))).toBe(0.7); // 14 days
      });
    });

    describe('far future (> 2 weeks)', () => {
      it('should return 0.5 for tee times more than 2 weeks away', () => {
        expect(matchingService.calculateTimingScore(createDateHoursFromNow(400))).toBe(0.5); // ~17 days
        expect(matchingService.calculateTimingScore(createDateHoursFromNow(720))).toBe(0.5); // 30 days
      });
    });
  });

  describe('calculateScore', () => {
    describe('perfect match scenarios', () => {
      it('should return high score for perfect match', () => {
        const tomorrow = new Date();
        tomorrow.setTime(tomorrow.getTime() + 36 * 60 * 60 * 1000);

        const user = createMockUser({
          industry: 'TECHNOLOGY',
          skillLevel: 'INTERMEDIATE',
          latitude: 37.7749,
          longitude: -122.4194,
          searchRadius: 50,
        });

        const teeTime = createMockTeeTimeWithRelations({
          teeTime: {
            dateTime: tomorrow,
            industryPreference: ['TECHNOLOGY'],
            skillPreference: ['INTERMEDIATE'],
          },
        });

        const result = matchingService.calculateScore(user, teeTime, 3); // 3 miles away

        expect(result.score).toBeGreaterThan(0.95);
        expect(result.breakdown.industryScore).toBe(1.0);
        expect(result.breakdown.skillScore).toBe(1.0);
        expect(result.breakdown.distanceScore).toBe(1.0);
        expect(result.breakdown.timingScore).toBe(1.0);
      });
    });

    describe('poor match scenarios', () => {
      it('should return low score for poor match', () => {
        const farFuture = new Date();
        farFuture.setDate(farFuture.getDate() + 20);

        const user = createMockUser({
          industry: 'HEALTHCARE',
          skillLevel: 'BEGINNER',
          searchRadius: 50,
        });

        const teeTime = createMockTeeTimeWithRelations({
          host: { industry: 'TECHNOLOGY' },
          teeTime: {
            dateTime: farFuture,
            industryPreference: ['FINANCE'],
            skillPreference: ['EXPERT'],
          },
        });

        const result = matchingService.calculateScore(user, teeTime, 45);

        expect(result.score).toBeLessThan(0.5);
      });
    });

    describe('weight validation', () => {
      it('should apply correct weights to each factor', () => {
        // Weights: industry=0.35, skill=0.25, distance=0.25, timing=0.15
        const tomorrow = new Date();
        tomorrow.setTime(tomorrow.getTime() + 36 * 60 * 60 * 1000);

        const user = createMockUser({
          industry: 'TECHNOLOGY',
          skillLevel: 'INTERMEDIATE',
          searchRadius: 50,
        });

        const teeTime = createMockTeeTimeWithRelations({
          teeTime: {
            dateTime: tomorrow,
            industryPreference: ['TECHNOLOGY'],
            skillPreference: ['INTERMEDIATE'],
          },
        });

        const result = matchingService.calculateScore(user, teeTime, 3);

        // With all 1.0 scores, total should be 1.0
        const expectedScore = 1.0 * 0.35 + 1.0 * 0.25 + 1.0 * 0.25 + 1.0 * 0.15;
        expect(result.score).toBe(expectedScore);
      });
    });

    describe('score breakdown', () => {
      it('should include detailed breakdown in result', () => {
        const user = createMockUser();
        const teeTime = createMockTeeTimeWithRelations();

        const result = matchingService.calculateScore(user, teeTime, 10);

        expect(result).toHaveProperty('teeTimeId');
        expect(result).toHaveProperty('score');
        expect(result).toHaveProperty('breakdown');
        expect(result.breakdown).toHaveProperty('industryScore');
        expect(result.breakdown).toHaveProperty('skillScore');
        expect(result.breakdown).toHaveProperty('distanceScore');
        expect(result.breakdown).toHaveProperty('timingScore');
      });

      it('should round scores to 2 decimal places', () => {
        const user = createMockUser();
        const teeTime = createMockTeeTimeWithRelations();

        const result = matchingService.calculateScore(user, teeTime, 10);

        // Check that scores are rounded
        const checkRounded = (n: number) => {
          const str = n.toString();
          const decimalPart = str.split('.')[1];
          return !decimalPart || decimalPart.length <= 2;
        };

        expect(checkRounded(result.score)).toBe(true);
        expect(checkRounded(result.breakdown.industryScore)).toBe(true);
        expect(checkRounded(result.breakdown.skillScore)).toBe(true);
        expect(checkRounded(result.breakdown.distanceScore)).toBe(true);
        expect(checkRounded(result.breakdown.timingScore)).toBe(true);
      });
    });
  });

  describe('edge cases', () => {
    it('should handle user with null location', () => {
      const user = createMockUser({
        latitude: null,
        longitude: null,
      });
      const teeTime = createMockTeeTimeWithRelations();

      // Should not throw
      const result = matchingService.calculateScore(user, teeTime, 0);
      expect(result).toBeDefined();
    });

    it('should handle empty slots array', () => {
      const user = createMockUser();
      const teeTime = createMockTeeTimeWithRelations({
        slots: [],
      });

      const score = matchingService.calculateSkillScore(user, teeTime);
      expect(score).toBeDefined();
    });

    it('should handle OTHER industry type', () => {
      const user = createMockUser({ industry: 'OTHER' as Industry });
      const teeTime = createMockTeeTimeWithRelations({
        teeTime: { industryPreference: ['TECHNOLOGY'] },
      });

      const score = matchingService.calculateIndustryScore(user, teeTime);
      expect(score).toBeDefined();
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });
  });
});
