import type { Request, Response, NextFunction } from 'express';
import { redis } from '../config/redis.js';
import { RateLimitError } from '../utils/errors.js';
import type { AuthenticatedRequest } from '../types/index.js';

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  keyPrefix: string;
}

function getClientIdentifier(req: Request): string {
  const authReq = req as AuthenticatedRequest;
  if (authReq.userId) {
    return `user:${authReq.userId}`;
  }
  return `ip:${req.ip ?? req.socket.remoteAddress ?? 'unknown'}`;
}

export function rateLimit(options: RateLimitOptions) {
  const { windowMs, maxRequests, keyPrefix } = options;
  const windowSeconds = Math.ceil(windowMs / 1000);

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Skip rate limiting if Redis is not configured
    if (!redis) {
      next();
      return;
    }

    const identifier = getClientIdentifier(req);
    const key = `ratelimit:${keyPrefix}:${identifier}`;

    const multi = redis.multi();
    multi.incr(key);
    multi.pttl(key);

    const results = await multi.exec();

    if (!results) {
      next();
      return;
    }

    const [[, count], [, ttl]] = results as [[null, number], [null, number]];

    if (ttl === -1) {
      await redis.expire(key, windowSeconds);
    }

    const remaining = Math.max(0, maxRequests - count);
    const resetTime = ttl > 0 ? ttl : windowMs;

    res.set({
      'X-RateLimit-Limit': maxRequests.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': Math.ceil(Date.now() / 1000 + resetTime / 1000).toString(),
    });

    if (count > maxRequests) {
      const retryAfter = Math.ceil(resetTime / 1000);
      res.set('Retry-After', retryAfter.toString());
      throw new RateLimitError(retryAfter);
    }

    next();
  };
}

const readPerMin = parseInt(process.env.RATE_LIMIT_READ_PER_MIN ?? '100', 10);
const writePerMin = parseInt(process.env.RATE_LIMIT_WRITE_PER_MIN ?? '20', 10);

export const readRateLimit = rateLimit({
  windowMs: 60 * 1000,
  maxRequests: readPerMin,
  keyPrefix: 'read',
});

export const writeRateLimit = rateLimit({
  windowMs: 60 * 1000,
  maxRequests: writePerMin,
  keyPrefix: 'write',
});
