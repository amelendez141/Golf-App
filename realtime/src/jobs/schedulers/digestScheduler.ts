import cron from 'node-cron';
import { prisma } from '../../config/database.js';
import { createLogger } from '../../utils/logger.js';
import { reminderQueue, cleanupQueue } from '../queue.js';

const logger = createLogger('digest-scheduler');

let digestTask: cron.ScheduledTask | null = null;
let cleanupTask: cron.ScheduledTask | null = null;

export function startDigestScheduler(): void {
  // Run weekly digest every Sunday at 9am
  digestTask = cron.schedule('0 9 * * 0', async () => {
    logger.info('Running weekly digest');

    try {
      await scheduleWeeklyDigests();
    } catch (error) {
      logger.error({ error }, 'Failed to schedule weekly digests');
    }
  });

  // Run cleanup every day at 3am
  cleanupTask = cron.schedule('0 3 * * *', async () => {
    logger.info('Running daily cleanup');

    try {
      await scheduleDailyCleanup();
    } catch (error) {
      logger.error({ error }, 'Failed to schedule cleanup');
    }
  });

  logger.info('Digest scheduler started (Sundays 9am) and cleanup scheduler (daily 3am)');
}

export function stopDigestScheduler(): void {
  if (digestTask) {
    digestTask.stop();
    digestTask = null;
  }
  if (cleanupTask) {
    cleanupTask.stop();
    cleanupTask = null;
  }
  logger.info('Digest and cleanup schedulers stopped');
}

async function scheduleWeeklyDigests(): Promise<void> {
  // Get all active users (users who have logged in recently or have upcoming tee times)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const activeUsers = await prisma.user.findMany({
    where: {
      OR: [
        // Users with upcoming tee times
        {
          slots: {
            some: {
              status: 'FILLED',
              teeTime: {
                dateTime: { gte: new Date() },
                status: { in: ['OPEN', 'FULL'] },
              },
            },
          },
        },
        // Users who hosted recently
        {
          hostedTeeTimes: {
            some: {
              createdAt: { gte: thirtyDaysAgo },
            },
          },
        },
      ],
    },
    select: { id: true },
  });

  logger.info({ userCount: activeUsers.length }, 'Scheduling weekly digests');

  // Queue digest for each active user
  const batchSize = 100;
  for (let i = 0; i < activeUsers.length; i += batchSize) {
    const batch = activeUsers.slice(i, i + batchSize);

    for (const user of batch) {
      await reminderQueue.add(
        `digest-${user.id}`,
        {
          type: 'WEEKLY_DIGEST',
          userId: user.id,
        },
        {
          // Spread out over 2 hours to avoid overwhelming the system
          delay: Math.floor(Math.random() * 2 * 60 * 60 * 1000),
        }
      );
    }
  }
}

async function scheduleDailyCleanup(): Promise<void> {
  // Queue cleanup jobs
  const jobs = [
    {
      name: 'cleanup-notifications',
      data: { type: 'CLEANUP_OLD_NOTIFICATIONS', daysOld: 90 },
    },
    {
      name: 'cleanup-tee-times',
      data: { type: 'CLEANUP_EXPIRED_TEE_TIMES' },
    },
    {
      name: 'cleanup-cache',
      data: { type: 'CLEANUP_STALE_CACHE', pattern: 'linkup:recommendations:*' },
    },
  ];

  for (const job of jobs) {
    await cleanupQueue.add(job.name, job.data);
  }

  logger.info({ jobCount: jobs.length }, 'Scheduled daily cleanup jobs');
}

// Manually trigger cleanup (for testing or admin use)
export async function triggerCleanup(): Promise<void> {
  logger.info('Manually triggering cleanup');
  await scheduleDailyCleanup();
}

// Manually trigger digests (for testing)
export async function triggerDigests(): Promise<void> {
  logger.info('Manually triggering weekly digests');
  await scheduleWeeklyDigests();
}
