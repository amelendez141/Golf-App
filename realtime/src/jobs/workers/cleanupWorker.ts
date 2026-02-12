import { Worker, Job } from 'bullmq';
import { prisma } from '../../config/database.js';
import { createLogger } from '../../utils/logger.js';
import { metrics } from '../../utils/metrics.js';
import { deleteOldNotifications } from '../../notifications/inApp.js';
import { cacheClient } from '../../config/redis.js';

const logger = createLogger('cleanup-worker');

const connection = {
  host: new URL(process.env.REDIS_URL || 'redis://localhost:6379').hostname,
  port: parseInt(new URL(process.env.REDIS_URL || 'redis://localhost:6379').port || '6379'),
};

async function processCleanupJob(job: Job): Promise<void> {
  const { type, ...data } = job.data;

  logger.info({ jobId: job.id, type }, 'Processing cleanup job');

  try {
    switch (type) {
      case 'CLEANUP_OLD_NOTIFICATIONS':
        await handleCleanupOldNotifications(data);
        break;

      case 'CLEANUP_EXPIRED_TEE_TIMES':
        await handleCleanupExpiredTeeTimes();
        break;

      case 'CLEANUP_STALE_CACHE':
        await handleCleanupStaleCache(data);
        break;

      case 'CLEANUP_OLD_MESSAGES':
        await handleCleanupOldMessages(data);
        break;

      default:
        logger.warn({ type }, 'Unknown cleanup job type');
    }

    metrics.jobProcessed();
  } catch (error) {
    logger.error({ error, jobId: job.id, type }, 'Cleanup job failed');
    metrics.jobFailed();
    throw error;
  }
}

async function handleCleanupOldNotifications(data: any): Promise<void> {
  const { daysOld = 90 } = data;

  const deletedCount = await deleteOldNotifications(daysOld);

  logger.info({ deletedCount, daysOld }, 'Cleaned up old notifications');
}

async function handleCleanupExpiredTeeTimes(): Promise<void> {
  const now = new Date();
  const cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

  // Mark past tee times as completed
  const result = await prisma.teeTime.updateMany({
    where: {
      dateTime: { lt: cutoffDate },
      status: { in: ['OPEN', 'FULL'] },
    },
    data: {
      status: 'COMPLETED',
    },
  });

  logger.info({ count: result.count }, 'Marked expired tee times as completed');
}

async function handleCleanupStaleCache(data: any): Promise<void> {
  const { pattern = 'linkup:recommendations:*' } = data;

  // Scan for matching keys
  let cursor = '0';
  let deletedCount = 0;

  do {
    const [newCursor, keys] = await cacheClient.scan(
      cursor,
      'MATCH',
      pattern,
      'COUNT',
      100
    );
    cursor = newCursor;

    if (keys.length > 0) {
      // Check TTL and delete if expired or very old
      for (const key of keys) {
        const ttl = await cacheClient.ttl(key);
        // Delete keys with no TTL (shouldn't happen) or negative TTL
        if (ttl < 0) {
          await cacheClient.del(key);
          deletedCount++;
        }
      }
    }
  } while (cursor !== '0');

  logger.info({ pattern, deletedCount }, 'Cleaned up stale cache entries');
}

async function handleCleanupOldMessages(data: any): Promise<void> {
  const { daysOld = 365 } = data;

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  // Only delete messages from completed tee times that are old
  const result = await prisma.message.deleteMany({
    where: {
      createdAt: { lt: cutoffDate },
      teeTime: {
        status: 'COMPLETED',
      },
    },
  });

  logger.info({ deletedCount: result.count, daysOld }, 'Cleaned up old messages');
}

let worker: Worker | null = null;

export function startCleanupWorker(): Worker {
  worker = new Worker('cleanup', processCleanupJob, {
    connection,
    concurrency: 1, // Run cleanup jobs sequentially
  });

  worker.on('completed', (job) => {
    logger.debug({ jobId: job.id }, 'Cleanup job completed');
  });

  worker.on('failed', (job, error) => {
    logger.error({ jobId: job?.id, error: error.message }, 'Cleanup job failed');
  });

  logger.info('Cleanup worker started');

  return worker;
}

export async function stopCleanupWorker(): Promise<void> {
  if (worker) {
    await worker.close();
    worker = null;
    logger.info('Cleanup worker stopped');
  }
}
