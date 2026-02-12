import { Router } from 'express';
import { prisma } from '../config/database.js';
import { logger } from '../utils/logger.js';
import { setDemoUserId, getDemoUserId } from '../middleware/auth.js';

const router = Router();

/**
 * @openapi
 * /api/demo/users:
 *   get:
 *     tags:
 *       - Demo
 *     summary: Get demo users
 *     description: |
 *       Returns a list of available demo users for the user switcher.
 *       This endpoint is for demo/testing purposes only.
 *     security: []
 *     responses:
 *       200:
 *         description: Demo users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       firstName:
 *                         type: string
 *                       lastName:
 *                         type: string
 *                       avatarUrl:
 *                         type: string
 *                       industry:
 *                         $ref: '#/components/schemas/Industry'
 *                       skillLevel:
 *                         $ref: '#/components/schemas/SkillLevel'
 *                       handicap:
 *                         type: number
 *                       city:
 *                         type: string
 *                       state:
 *                         type: string
 */
router.get('/users', async (_req, res) => {
  const users = await prisma.user.findMany({
    take: 20,
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      industry: true,
      skillLevel: true,
      handicap: true,
      city: true,
      state: true,
    },
  });

  res.json({ success: true, data: users });
});

/**
 * @openapi
 * /api/demo/switch-user:
 *   post:
 *     tags:
 *       - Demo
 *     summary: Switch demo user
 *     description: |
 *       Switches the current demo session to a different user.
 *       Use this to test the application from different user perspectives.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user to switch to
 *                 example: clh1234567890user
 *     responses:
 *       200:
 *         description: User switched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.post('/switch-user', async (req, res) => {
  const { userId } = req.body;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'User not found' },
    });
  }

  setDemoUserId(userId);
  logger.info(`Demo user switched to: ${user.firstName} ${user.lastName}`);

  res.json({ success: true, data: { userId } });
});

/**
 * @openapi
 * /api/demo/current-user:
 *   get:
 *     tags:
 *       - Demo
 *     summary: Get current demo user
 *     description: |
 *       Returns the currently active demo user for the session.
 *       If no user is set, returns the first available user.
 *     security: []
 *     responses:
 *       200:
 *         description: Current demo user retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: No demo users available
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/current-user', async (_req, res) => {
  let currentDemoUserId = getDemoUserId();

  if (!currentDemoUserId) {
    // Return first user as default
    const user = await prisma.user.findFirst({
      orderBy: { createdAt: 'asc' },
    });
    if (user) {
      setDemoUserId(user.id);
      currentDemoUserId = user.id;
    }
  }

  if (!currentDemoUserId) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'No demo user available' },
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: currentDemoUserId },
  });

  res.json({ success: true, data: user });
});

/**
 * @openapi
 * /api/demo/stats:
 *   get:
 *     tags:
 *       - Demo
 *     summary: Get demo statistics
 *     description: |
 *       Returns aggregate statistics about the demo data including
 *       user counts, course counts, and distribution breakdowns.
 *
 *       Useful for displaying demo dashboards and understanding
 *       the state of the demo environment.
 *     security: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/DemoStats'
 *             example:
 *               success: true
 *               data:
 *                 users: 150
 *                 courses: 50
 *                 teeTimes: 300
 *                 openTeeTimes: 45
 *                 industryDistribution:
 *                   - industry: TECHNOLOGY
 *                     count: 35
 *                   - industry: FINANCE
 *                     count: 28
 *                 skillDistribution:
 *                   - skillLevel: INTERMEDIATE
 *                     count: 55
 *                   - skillLevel: BEGINNER
 *                     count: 40
 */
router.get('/stats', async (_req, res) => {
  const [userCount, courseCount, teeTimeCount, openTeeTimeCount] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.teeTime.count(),
    prisma.teeTime.count({
      where: {
        status: 'OPEN',
        dateTime: { gte: new Date() },
      },
    }),
  ]);

  // Get industry distribution
  const industryDistribution = await prisma.user.groupBy({
    by: ['industry'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
  });

  // Get skill level distribution
  const skillDistribution = await prisma.user.groupBy({
    by: ['skillLevel'],
    _count: { id: true },
  });

  res.json({
    success: true,
    data: {
      users: userCount,
      courses: courseCount,
      teeTimes: teeTimeCount,
      openTeeTimes: openTeeTimeCount,
      industryDistribution: industryDistribution.map((i) => ({
        industry: i.industry,
        count: i._count.id,
      })),
      skillDistribution: skillDistribution.map((s) => ({
        skillLevel: s.skillLevel,
        count: s._count.id,
      })),
    },
  });
});

export { router as demoRoutes };
