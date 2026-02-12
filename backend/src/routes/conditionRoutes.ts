import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { validateBody, validateParams, validateQuery } from '../middleware/validate.js';
import { readRateLimit, writeRateLimit } from '../middleware/rateLimit.js';
import { prisma } from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';
import type { AuthenticatedRequest } from '../types/index.js';
import type { Request, Response } from 'express';

const router = Router();

// Validation schemas
const createConditionSchema = z.object({
  courseId: z.string(),
  greens: z.number().min(1).max(5),
  fairways: z.number().min(1).max(5),
  bunkers: z.number().min(1).max(5).optional(),
  pace: z.number().min(0).max(120).optional(), // minutes over par time
  notes: z.string().max(500).optional(),
  alerts: z.array(z.string()).optional(),
  photoUrl: z.string().url().optional(),
});

const courseIdParamSchema = z.object({
  courseId: z.string(),
});

const conditionIdParamSchema = z.object({
  id: z.string(),
});

const listConditionsQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(50).optional().default(10),
  cursor: z.string().optional(),
});

/**
 * @openapi
 * /api/conditions/{courseId}:
 *   get:
 *     tags:
 *       - Course Conditions
 *     summary: Get condition reports for a course
 *     description: Returns recent condition reports submitted by users for a specific course.
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Condition reports retrieved successfully
 */
router.get(
  '/:courseId',
  optionalAuth,
  readRateLimit,
  validateParams(courseIdParamSchema),
  validateQuery(listConditionsQuerySchema),
  async (req: Request, res: Response) => {
    const { courseId } = req.params;
    const { limit, cursor } = req.query as { limit: number; cursor?: string };

    const conditions = await prisma.courseCondition.findMany({
      where: { courseId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
    });

    const hasMore = conditions.length > limit;
    const data = hasMore ? conditions.slice(0, -1) : conditions;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    // Calculate average ratings
    const allConditions = await prisma.courseCondition.findMany({
      where: { courseId },
      select: { greens: true, fairways: true, bunkers: true },
    });

    const avgGreens = allConditions.length > 0
      ? allConditions.reduce((sum, c) => sum + c.greens, 0) / allConditions.length
      : null;
    const avgFairways = allConditions.length > 0
      ? allConditions.reduce((sum, c) => sum + c.fairways, 0) / allConditions.length
      : null;
    const avgBunkers = allConditions.filter(c => c.bunkers).length > 0
      ? allConditions.filter(c => c.bunkers).reduce((sum, c) => sum + (c.bunkers || 0), 0) / allConditions.filter(c => c.bunkers).length
      : null;

    // Get recent alerts
    const recentAlerts = await prisma.courseCondition.findMany({
      where: {
        courseId,
        alerts: { isEmpty: false },
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Last 7 days
      },
      select: { alerts: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const activeAlerts = [...new Set(recentAlerts.flatMap(r => r.alerts))];

    res.json({
      success: true,
      data: {
        reports: data.map(formatConditionReport),
        summary: {
          totalReports: allConditions.length,
          averageGreens: avgGreens ? Number(avgGreens.toFixed(1)) : null,
          averageFairways: avgFairways ? Number(avgFairways.toFixed(1)) : null,
          averageBunkers: avgBunkers ? Number(avgBunkers.toFixed(1)) : null,
          activeAlerts,
        },
      },
      pagination: { nextCursor, hasMore },
    });
  }
);

/**
 * @openapi
 * /api/conditions:
 *   post:
 *     tags:
 *       - Course Conditions
 *     summary: Submit a condition report
 *     description: Submit a new condition report for a golf course.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseId
 *               - greens
 *               - fairways
 *             properties:
 *               courseId:
 *                 type: string
 *               greens:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               fairways:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               bunkers:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               pace:
 *                 type: integer
 *                 description: Minutes over par time
 *               notes:
 *                 type: string
 *                 maxLength: 500
 *               alerts:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Condition report created successfully
 */
router.post(
  '/',
  requireAuth,
  writeRateLimit,
  validateBody(createConditionSchema),
  async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;
    const data = req.body as z.infer<typeof createConditionSchema>;

    // Verify course exists
    const course = await prisma.course.findUnique({
      where: { id: data.courseId },
    });

    if (!course) {
      throw new NotFoundError('Course not found');
    }

    const condition = await prisma.courseCondition.create({
      data: {
        ...data,
        userId,
        alerts: data.alerts || [],
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: formatConditionReport(condition),
      message: 'Condition report submitted successfully',
    });
  }
);

/**
 * @openapi
 * /api/conditions/{id}:
 *   delete:
 *     tags:
 *       - Course Conditions
 *     summary: Delete a condition report
 *     description: Delete your own condition report.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Condition report deleted successfully
 */
router.delete(
  '/:id',
  requireAuth,
  writeRateLimit,
  validateParams(conditionIdParamSchema),
  async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;
    const { id } = req.params;

    const condition = await prisma.courseCondition.findUnique({
      where: { id },
    });

    if (!condition) {
      throw new NotFoundError('Condition report not found');
    }

    if (condition.userId !== userId) {
      res.status(403).json({
        success: false,
        error: { message: 'You can only delete your own reports' },
      });
      return;
    }

    await prisma.courseCondition.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Condition report deleted successfully',
    });
  }
);

// Format condition report for response
function formatConditionReport(condition: any) {
  return {
    id: condition.id,
    courseId: condition.courseId,
    greens: condition.greens,
    fairways: condition.fairways,
    bunkers: condition.bunkers,
    pace: condition.pace,
    notes: condition.notes,
    alerts: condition.alerts,
    photoUrl: condition.photoUrl,
    createdAt: condition.createdAt,
    user: condition.user,
  };
}

export { router as conditionRoutes };
