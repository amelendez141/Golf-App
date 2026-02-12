import { Queue, QueueEvents } from 'bullmq';
import { queueClient } from '../config/redis.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('job-queue');

// Queue connection options
const connection = {
  host: new URL(process.env.REDIS_URL || 'redis://localhost:6379').hostname,
  port: parseInt(new URL(process.env.REDIS_URL || 'redis://localhost:6379').port || '6379'),
};

// Queue definitions
export const notificationQueue = new Queue('notifications', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: {
      count: 1000, // Keep last 1000 completed jobs
    },
    removeOnFail: {
      count: 5000, // Keep last 5000 failed jobs for debugging
    },
  },
});

export const matchingQueue = new Queue('matching', {
  connection,
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      count: 500,
    },
    removeOnFail: {
      count: 1000,
    },
  },
});

export const reminderQueue = new Queue('reminders', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: {
      count: 2000,
    },
    removeOnFail: {
      count: 2000,
    },
  },
});

export const cleanupQueue = new Queue('cleanup', {
  connection,
  defaultJobOptions: {
    attempts: 1,
    removeOnComplete: true,
    removeOnFail: {
      count: 100,
    },
  },
});

// Queue events for logging
const queues = [
  { name: 'notifications', queue: notificationQueue },
  { name: 'matching', queue: matchingQueue },
  { name: 'reminders', queue: reminderQueue },
  { name: 'cleanup', queue: cleanupQueue },
];

export function setupQueueEvents(): void {
  for (const { name, queue } of queues) {
    const events = new QueueEvents(name, { connection });

    events.on('completed', ({ jobId }) => {
      logger.debug({ queue: name, jobId }, 'Job completed');
    });

    events.on('failed', ({ jobId, failedReason }) => {
      logger.error({ queue: name, jobId, reason: failedReason }, 'Job failed');
    });

    events.on('stalled', ({ jobId }) => {
      logger.warn({ queue: name, jobId }, 'Job stalled');
    });
  }

  logger.info('Queue events setup complete');
}

export async function getQueueStats() {
  const stats: Record<string, any> = {};

  for (const { name, queue } of queues) {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ]);

    stats[name] = { waiting, active, completed, failed, delayed };
  }

  return stats;
}

export async function closeQueues(): Promise<void> {
  await Promise.all([
    notificationQueue.close(),
    matchingQueue.close(),
    reminderQueue.close(),
    cleanupQueue.close(),
  ]);
  logger.info('All queues closed');
}
