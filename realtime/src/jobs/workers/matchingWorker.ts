import { Worker, Job } from 'bullmq';
import { prisma } from '../../config/database.js';
import { createLogger } from '../../utils/logger.js';
import { metrics } from '../../utils/metrics.js';
import { matchingEngine } from '../../matching/engine.js';
import { recommender } from '../../matching/recommender.js';
import { notificationQueue } from '../queue.js';

const logger = createLogger('matching-worker');

const connection = {
  host: new URL(process.env.REDIS_URL || 'redis://localhost:6379').hostname,
  port: parseInt(new URL(process.env.REDIS_URL || 'redis://localhost:6379').port || '6379'),
};

async function processMatchingJob(job: Job): Promise<void> {
  const { type, ...data } = job.data;

  logger.info({ jobId: job.id, type }, 'Processing matching job');

  try {
    switch (type) {
      case 'FIND_MATCHES_FOR_TEE_TIME':
        await handleFindMatchesForTeeTime(data);
        break;

      case 'FIND_MATCHES_FOR_USER':
        await handleFindMatchesForUser(data);
        break;

      case 'PRECOMPUTE_RECOMMENDATIONS':
        await handlePrecomputeRecommendations(data);
        break;

      case 'INVALIDATE_CACHE':
        await handleInvalidateCache(data);
        break;

      default:
        logger.warn({ type }, 'Unknown matching job type');
    }

    metrics.jobProcessed();
  } catch (error) {
    logger.error({ error, jobId: job.id, type }, 'Matching job failed');
    metrics.jobFailed();
    throw error;
  }
}

async function handleFindMatchesForTeeTime(data: any): Promise<void> {
  const { teeTimeId, notifyUsers = true, minScore = 50, limit = 20 } = data;

  const matches = await matchingEngine.findMatchesForTeeTime(teeTimeId, {
    minScore,
    limit,
  });

  logger.info(
    { teeTimeId, matchCount: matches.length },
    'Found matches for tee time'
  );

  if (notifyUsers) {
    for (const match of matches) {
      await notificationQueue.add(`new-match-${match.userId}`, {
        type: 'NEW_MATCH',
        userId: match.userId,
        teeTimeId,
        score: match.score,
        reasons: match.reasons,
      });
    }
  }
}

async function handleFindMatchesForUser(data: any): Promise<void> {
  const { userId, limit = 50 } = data;

  const recommendations = await recommender.getRecommendationsForUser(userId, {
    forceRefresh: true,
    limit,
  });

  logger.info(
    { userId, recommendationCount: recommendations.length },
    'Generated recommendations for user'
  );
}

async function handlePrecomputeRecommendations(data: any): Promise<void> {
  const { userIds, batchSize = 10 } = data;

  // Process in batches to avoid overwhelming the system
  for (let i = 0; i < userIds.length; i += batchSize) {
    const batch = userIds.slice(i, i + batchSize);
    await recommender.precomputeRecommendations(batch);

    // Small delay between batches
    if (i + batchSize < userIds.length) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  logger.info(
    { totalUsers: userIds.length },
    'Completed recommendation precomputation'
  );
}

async function handleInvalidateCache(data: any): Promise<void> {
  const { userId, teeTimeId } = data;

  if (userId) {
    await recommender.invalidateUserRecommendations(userId);
  }

  if (teeTimeId) {
    await recommender.invalidateTeeTimeMatches(teeTimeId);
  }

  logger.debug({ userId, teeTimeId }, 'Cache invalidated');
}

let worker: Worker | null = null;

export function startMatchingWorker(): Worker {
  worker = new Worker('matching', processMatchingJob, {
    connection,
    concurrency: 3, // Lower concurrency for CPU-intensive matching
  });

  worker.on('completed', (job) => {
    logger.debug({ jobId: job.id }, 'Matching job completed');
  });

  worker.on('failed', (job, error) => {
    logger.error({ jobId: job?.id, error: error.message }, 'Matching job failed');
  });

  logger.info('Matching worker started');

  return worker;
}

export async function stopMatchingWorker(): Promise<void> {
  if (worker) {
    await worker.close();
    worker = null;
    logger.info('Matching worker stopped');
  }
}
