import Redis from 'ioredis';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

function createRedisClient(name: string): Redis {
  const client = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    lazyConnect: true,
  });

  client.on('connect', () => {
    logger.info({ client: name }, 'Redis client connected');
  });

  client.on('error', (error) => {
    logger.error({ client: name, error }, 'Redis client error');
  });

  client.on('close', () => {
    logger.warn({ client: name }, 'Redis client connection closed');
  });

  return client;
}

// Separate clients for different purposes
// Subscriber client - dedicated for pub/sub (cannot be used for other commands while subscribed)
export const subscriberClient = createRedisClient('subscriber');

// Publisher client - for publishing events
export const publisherClient = createRedisClient('publisher');

// Cache client - for general caching operations
export const cacheClient = createRedisClient('cache');

// Queue client - used by BullMQ
export const queueClient = createRedisClient('queue');

export async function connectRedis(): Promise<void> {
  try {
    await Promise.all([
      subscriberClient.connect(),
      publisherClient.connect(),
      cacheClient.connect(),
      queueClient.connect(),
    ]);
    logger.info('All Redis clients connected');
  } catch (error) {
    logger.error({ error }, 'Failed to connect Redis clients');
    throw error;
  }
}

export async function disconnectRedis(): Promise<void> {
  await Promise.all([
    subscriberClient.quit(),
    publisherClient.quit(),
    cacheClient.quit(),
    queueClient.quit(),
  ]);
  logger.info('All Redis clients disconnected');
}

// Redis key prefixes
export const REDIS_KEYS = {
  // Matching cache
  USER_RECOMMENDATIONS: (userId: string) => `linkup:recommendations:${userId}`,
  TEE_TIME_MATCHES: (teeTimeId: string) => `linkup:matches:${teeTimeId}`,

  // Rate limiting
  RATE_LIMIT: (userId: string, action: string) => `linkup:ratelimit:${userId}:${action}`,

  // Online users
  ONLINE_USERS: 'linkup:online',
  USER_CONNECTIONS: (userId: string) => `linkup:connections:${userId}`,

  // Room subscriptions
  ROOM_SUBSCRIBERS: (room: string) => `linkup:room:${room}`,
} as const;

// Pub/Sub channel
export const EVENTS_CHANNEL = 'linkup:events';

// Check Redis version (BullMQ requires 5.0+)
export async function getRedisVersion(): Promise<string> {
  const info = await cacheClient.info('server');
  const match = info.match(/redis_version:(\d+\.\d+\.\d+)/);
  return match ? match[1] : '0.0.0';
}

export async function isRedisVersionSupported(): Promise<boolean> {
  const version = await getRedisVersion();
  const [major] = version.split('.').map(Number);
  const supported = (major ?? 0) >= 5;
  if (!supported) {
    logger.warn({ version }, 'Redis version too old for BullMQ (requires 5.0+). Job queues disabled.');
  }
  return supported;
}
