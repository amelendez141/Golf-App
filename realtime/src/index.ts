import { logger } from './utils/logger.js';
import { metrics } from './utils/metrics.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { connectRedis, disconnectRedis, isRedisVersionSupported } from './config/redis.js';
import { createWebSocketServer, closeWebSocketServer, getServerStats } from './websocket/server.js';
import { startEventSubscriber, stopEventSubscriber } from './events/subscriber.js';
import { env } from './config/env.js';

// Job system imports (optional - requires Redis 5.0+)
let jobsEnabled = true;
let setupQueueEvents: () => void;
let closeQueues: () => Promise<void>;
let getQueueStats: () => Promise<any>;
let startNotificationWorker: () => any;
let stopNotificationWorker: () => Promise<void>;
let startMatchingWorker: () => any;
let stopMatchingWorker: () => Promise<void>;
let startReminderWorker: () => any;
let stopReminderWorker: () => Promise<void>;
let startCleanupWorker: () => any;
let stopCleanupWorker: () => Promise<void>;
let startReminderScheduler: () => void;
let stopReminderScheduler: () => void;
let runInitialReminderCheck: () => Promise<void>;
let startDigestScheduler: () => void;
let stopDigestScheduler: () => void;

let isShuttingDown = false;

async function loadJobSystem(): Promise<boolean> {
  try {
    const queueModule = await import('./jobs/queue.js');
    setupQueueEvents = queueModule.setupQueueEvents;
    closeQueues = queueModule.closeQueues;
    getQueueStats = queueModule.getQueueStats;

    const notificationWorker = await import('./jobs/workers/notificationWorker.js');
    startNotificationWorker = notificationWorker.startNotificationWorker;
    stopNotificationWorker = notificationWorker.stopNotificationWorker;

    const matchingWorker = await import('./jobs/workers/matchingWorker.js');
    startMatchingWorker = matchingWorker.startMatchingWorker;
    stopMatchingWorker = matchingWorker.stopMatchingWorker;

    const reminderWorker = await import('./jobs/workers/reminderWorker.js');
    startReminderWorker = reminderWorker.startReminderWorker;
    stopReminderWorker = reminderWorker.stopReminderWorker;

    const cleanupWorker = await import('./jobs/workers/cleanupWorker.js');
    startCleanupWorker = cleanupWorker.startCleanupWorker;
    stopCleanupWorker = cleanupWorker.stopCleanupWorker;

    const reminderScheduler = await import('./jobs/schedulers/reminderScheduler.js');
    startReminderScheduler = reminderScheduler.startReminderScheduler;
    stopReminderScheduler = reminderScheduler.stopReminderScheduler;
    runInitialReminderCheck = reminderScheduler.runInitialReminderCheck;

    const digestScheduler = await import('./jobs/schedulers/digestScheduler.js');
    startDigestScheduler = digestScheduler.startDigestScheduler;
    stopDigestScheduler = digestScheduler.stopDigestScheduler;

    return true;
  } catch (error) {
    logger.warn({ error }, 'Job system not available (requires Redis 5.0+). Running without job queues.');
    return false;
  }
}

async function main(): Promise<void> {
  logger.info('Starting LinkUp Golf Real-Time Engine...');

  try {
    // Connect to databases
    logger.info('Connecting to PostgreSQL...');
    await connectDatabase();

    logger.info('Connecting to Redis...');
    await connectRedis();

    // Check Redis version before loading job system
    const redisSupported = await isRedisVersionSupported();

    // Try to load job system (optional - requires Redis 5.0+)
    if (redisSupported) {
      logger.info('Loading job system...');
      jobsEnabled = await loadJobSystem();
    } else {
      logger.info('Skipping job system (Redis version too old)');
      jobsEnabled = false;
    }

    if (jobsEnabled) {
      try {
        // Setup job queues
        logger.info('Setting up job queues...');
        setupQueueEvents();

        // Start workers
        logger.info('Starting job workers...');
        startNotificationWorker();
        startMatchingWorker();
        startReminderWorker();
        startCleanupWorker();

        // Start schedulers
        logger.info('Starting schedulers...');
        startReminderScheduler();
        startDigestScheduler();

        // Run initial reminder check
        await runInitialReminderCheck();
      } catch (error: any) {
        if (error.message?.includes('Redis version')) {
          logger.warn('Redis version too old for BullMQ. Job system disabled.');
          jobsEnabled = false;
        } else {
          throw error;
        }
      }
    }

    // Start WebSocket server
    logger.info('Starting WebSocket server...');
    createWebSocketServer();

    // Start event subscriber
    logger.info('Starting Redis event subscriber...');
    await startEventSubscriber();

    // Start metrics logging
    metrics.startPeriodicLogging(60000); // Log every minute

    logger.info({
      wsPort: env.WS_PORT,
      nodeEnv: env.NODE_ENV,
      jobsEnabled,
    }, 'LinkUp Golf Real-Time Engine started successfully');

    // Log initial stats
    const wsStats = getServerStats();
    if (jobsEnabled) {
      const queueStats = await getQueueStats();
      logger.info({ wsStats, queueStats }, 'Initial system stats');
    } else {
      logger.info({ wsStats }, 'Initial system stats (jobs disabled)');
    }

  } catch (error) {
    logger.fatal({ error }, 'Failed to start Real-Time Engine');
    process.exit(1);
  }
}

async function shutdown(signal: string): Promise<void> {
  if (isShuttingDown) {
    logger.warn('Shutdown already in progress');
    return;
  }

  isShuttingDown = true;
  logger.info({ signal }, 'Shutting down Real-Time Engine...');

  // Stop metrics logging
  metrics.stopPeriodicLogging();

  // Log final metrics
  const finalMetrics = metrics.getMetrics();
  logger.info({ metrics: finalMetrics }, 'Final metrics');

  try {
    if (jobsEnabled) {
      // Stop schedulers first
      logger.info('Stopping schedulers...');
      stopReminderScheduler();
      stopDigestScheduler();

      // Stop workers (let them finish current jobs)
      logger.info('Stopping workers...');
      await Promise.all([
        stopNotificationWorker(),
        stopMatchingWorker(),
        stopReminderWorker(),
        stopCleanupWorker(),
      ]);

      // Close job queues
      logger.info('Closing job queues...');
      await closeQueues();
    }

    // Stop event subscriber
    logger.info('Stopping event subscriber...');
    await stopEventSubscriber();

    // Close WebSocket server (gracefully closes connections)
    logger.info('Closing WebSocket server...');
    await closeWebSocketServer();

    // Disconnect from Redis
    logger.info('Disconnecting from Redis...');
    await disconnectRedis();

    // Disconnect from database
    logger.info('Disconnecting from database...');
    await disconnectDatabase();

    logger.info('Real-Time Engine shut down complete');
    process.exit(0);
  } catch (error) {
    logger.error({ error }, 'Error during shutdown');
    process.exit(1);
  }
}

// Handle shutdown signals
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.fatal({ error }, 'Uncaught exception');
  shutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.fatal({ reason, promise }, 'Unhandled rejection');
  shutdown('unhandledRejection');
});

// Start the application
main().catch((error) => {
  logger.fatal({ error }, 'Failed to start application');
  process.exit(1);
});
