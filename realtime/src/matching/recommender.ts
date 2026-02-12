import { cacheClient, REDIS_KEYS } from '../config/redis.js';
import { createLogger } from '../utils/logger.js';
import { metrics } from '../utils/metrics.js';
import { matchingEngine } from './engine.js';
import { TeeTimeMatch } from './types.js';

const logger = createLogger('recommender');

const CACHE_TTL_SECONDS = 5 * 60; // 5 minutes

interface CachedRecommendations {
  teeTimeIds: string[];
  scores: Record<string, number>;
  reasons: Record<string, string[]>;
  generatedAt: string;
}

class Recommender {
  async getRecommendationsForUser(
    userId: string,
    options: { forceRefresh?: boolean; limit?: number } = {}
  ): Promise<TeeTimeMatch[]> {
    const { forceRefresh = false, limit = 50 } = options;

    // Check cache first
    if (!forceRefresh) {
      const cached = await this.getCachedRecommendations(userId);
      if (cached) {
        metrics.matchingCacheHit();
        logger.debug({ userId, count: cached.length }, 'Returning cached recommendations');
        return cached.slice(0, limit);
      }
    }

    metrics.matchingCacheMiss();

    // Generate fresh recommendations
    const recommendations = await matchingEngine.findMatchingTeeTimesForUser(userId, {
      limit: 50, // Always cache up to 50
      minScore: 40,
    });

    // Cache the results
    await this.cacheRecommendations(userId, recommendations);

    logger.info(
      { userId, count: recommendations.length },
      'Generated and cached new recommendations'
    );

    return recommendations.slice(0, limit);
  }

  async invalidateUserRecommendations(userId: string): Promise<void> {
    const key = REDIS_KEYS.USER_RECOMMENDATIONS(userId);
    await cacheClient.del(key);
    logger.debug({ userId }, 'Invalidated user recommendations cache');
  }

  async invalidateTeeTimeMatches(teeTimeId: string): Promise<void> {
    const key = REDIS_KEYS.TEE_TIME_MATCHES(teeTimeId);
    await cacheClient.del(key);
    logger.debug({ teeTimeId }, 'Invalidated tee time matches cache');
  }

  private async getCachedRecommendations(userId: string): Promise<TeeTimeMatch[] | null> {
    const key = REDIS_KEYS.USER_RECOMMENDATIONS(userId);

    try {
      const cached = await cacheClient.get(key);
      if (!cached) return null;

      const data: CachedRecommendations = JSON.parse(cached);

      // Reconstruct TeeTimeMatch objects
      return data.teeTimeIds.map((teeTimeId) => ({
        userId,
        teeTimeId,
        score: data.scores[teeTimeId] || 0,
        reasons: data.reasons[teeTimeId] || [],
        breakdown: {
          industryMatch: 0,
          proximity: 0,
          skillCompatibility: 0,
          timeRelevance: 0,
          availability: 0,
          social: 0,
        }, // Breakdown not cached for space
      }));
    } catch (error) {
      logger.error({ error, userId }, 'Failed to parse cached recommendations');
      return null;
    }
  }

  private async cacheRecommendations(
    userId: string,
    recommendations: TeeTimeMatch[]
  ): Promise<void> {
    const key = REDIS_KEYS.USER_RECOMMENDATIONS(userId);

    const data: CachedRecommendations = {
      teeTimeIds: recommendations.map((r) => r.teeTimeId),
      scores: Object.fromEntries(recommendations.map((r) => [r.teeTimeId, r.score])),
      reasons: Object.fromEntries(recommendations.map((r) => [r.teeTimeId, r.reasons])),
      generatedAt: new Date().toISOString(),
    };

    try {
      await cacheClient.setex(key, CACHE_TTL_SECONDS, JSON.stringify(data));
    } catch (error) {
      logger.error({ error, userId }, 'Failed to cache recommendations');
    }
  }

  // Precompute recommendations for active users
  async precomputeRecommendations(userIds: string[]): Promise<void> {
    logger.info({ userCount: userIds.length }, 'Starting recommendation precomputation');

    let computed = 0;
    let errors = 0;

    for (const userId of userIds) {
      try {
        await this.getRecommendationsForUser(userId, { forceRefresh: true });
        computed++;
      } catch (error) {
        errors++;
        logger.error({ error, userId }, 'Failed to precompute recommendations');
      }
    }

    logger.info({ computed, errors }, 'Completed recommendation precomputation');
  }
}

export const recommender = new Recommender();
