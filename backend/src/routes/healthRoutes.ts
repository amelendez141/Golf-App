import { Router, Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { redis } from '../config/redis.js';
import { logger } from '../utils/logger.js';

const router = Router();

// Read version from package.json at startup
const VERSION = process.env.npm_package_version || '1.0.0';

interface HealthStatus {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  version: string;
}

interface ReadinessStatus extends HealthStatus {
  checks: {
    database: {
      status: 'ok' | 'error';
      latency?: number;
      error?: string;
    };
    redis: {
      status: 'ok' | 'error' | 'not_configured';
      latency?: number;
      error?: string;
    };
  };
}

/**
 * @openapi
 * /health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Basic health check
 *     description: |
 *       Returns the current health status of the API server with version info.
 *       Use this endpoint to verify the API is running and responsive.
 *     security: []
 *     responses:
 *       200:
 *         description: API is healthy and operational
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: '2024-03-15T10:30:00.000Z'
 *                 version:
 *                   type: string
 *                   example: '1.0.0'
 */
router.get('/', (_req: Request, res: Response) => {
  const health: HealthStatus = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: VERSION,
  };

  res.json(health);
});

/**
 * @openapi
 * /health/live:
 *   get:
 *     tags:
 *       - Health
 *     summary: Liveness check
 *     description: |
 *       Simple liveness probe to check if the server process is running.
 *       Use this for Kubernetes liveness probes or similar orchestration systems.
 *     security: []
 *     responses:
 *       200:
 *         description: Server is alive
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
router.get('/live', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

/**
 * @openapi
 * /health/ready:
 *   get:
 *     tags:
 *       - Health
 *     summary: Readiness check
 *     description: |
 *       Checks if the server is ready to accept traffic by verifying
 *       connectivity to required dependencies (database and Redis).
 *       Use this for Kubernetes readiness probes or load balancer health checks.
 *     security: []
 *     responses:
 *       200:
 *         description: Server is ready to accept traffic
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [ok, degraded]
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 version:
 *                   type: string
 *                 checks:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           enum: [ok, error]
 *                         latency:
 *                           type: number
 *                           description: Response time in milliseconds
 *                     redis:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           enum: [ok, error, not_configured]
 *                         latency:
 *                           type: number
 *                           description: Response time in milliseconds
 *       503:
 *         description: Server is not ready (dependency check failed)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 checks:
 *                   type: object
 */
router.get('/ready', async (_req: Request, res: Response) => {
  const readiness: ReadinessStatus = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: VERSION,
    checks: {
      database: { status: 'ok' },
      redis: { status: 'ok' },
    },
  };

  // Check database connectivity
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    readiness.checks.database.latency = Date.now() - dbStart;
  } catch (error) {
    readiness.checks.database.status = 'error';
    readiness.checks.database.error = error instanceof Error ? error.message : 'Unknown database error';
    readiness.status = 'error';
    logger.error('Database health check failed:', error);
  }

  // Check Redis connectivity
  if (redis) {
    try {
      const redisStart = Date.now();
      await redis.ping();
      readiness.checks.redis.latency = Date.now() - redisStart;
    } catch (error) {
      readiness.checks.redis.status = 'error';
      readiness.checks.redis.error = error instanceof Error ? error.message : 'Unknown Redis error';
      // Redis errors result in degraded status, not full error (since it's optional)
      if (readiness.status !== 'error') {
        readiness.status = 'degraded';
      }
      logger.error('Redis health check failed:', error);
    }
  } else {
    readiness.checks.redis.status = 'not_configured';
    // Not having Redis configured is acceptable, don't change overall status
  }

  // Return appropriate status code
  const statusCode = readiness.status === 'error' ? 503 : 200;
  res.status(statusCode).json(readiness);
});

export { router as healthRoutes };
