import Redis from 'ioredis';
import { logger } from '../utils/logger.js';

const globalForRedis = globalThis as unknown as {
  redis: Redis | null;
  redisPub: Redis | null;
  redisSub: Redis | null;
};

// Check if Redis URL is configured
const redisUrl = process.env.REDIS_URL;
const isRedisConfigured = redisUrl && !redisUrl.includes('PASTE_YOUR');

function createRedisClient(name: string): Redis | null {
  if (!isRedisConfigured) {
    logger.warn(`Redis ${name} not configured - running without Redis`);
    return null;
  }

  const client = new Redis(redisUrl!, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    tls: redisUrl!.startsWith('rediss://') ? {} : undefined,
  });

  client.on('connect', () => {
    logger.info(`Redis ${name} connected`);
  });

  client.on('error', (err) => {
    logger.error(`Redis ${name} error:`, err);
  });

  return client;
}

export const redis = globalForRedis.redis ?? createRedisClient('main');
export const redisPub = globalForRedis.redisPub ?? createRedisClient('publisher');
export const redisSub = globalForRedis.redisSub ?? createRedisClient('subscriber');

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
  globalForRedis.redisPub = redisPub;
  globalForRedis.redisSub = redisSub;
}

export async function connectRedis(): Promise<void> {
  if (!isRedisConfigured) {
    logger.warn('Skipping Redis connection - not configured');
    return;
  }

  await Promise.all([
    redis?.ping(),
    redisPub?.ping(),
    redisSub?.ping(),
  ]);
}

export async function disconnectRedis(): Promise<void> {
  if (!isRedisConfigured) return;

  await Promise.all([
    redis?.quit(),
    redisPub?.quit(),
    redisSub?.quit(),
  ]);
}
