import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validateBody, validateQuery, validateParams } from '../middleware/validate.js';
import { readRateLimit, writeRateLimit } from '../middleware/rateLimit.js';
import { updateUserSchema, type UpdateUserInput } from '../validators/user.js';
import { listNotificationsSchema, notificationIdSchema, type ListNotificationsInput } from '../validators/notification.js';
import { userService } from '../services/userService.js';
import { notificationService } from '../services/notificationService.js';
import { courseService } from '../services/courseService.js';
import { teeTimeService } from '../services/teeTimeService.js';
import type { AuthenticatedRequest } from '../types/index.js';
import type { Request, Response } from 'express';

const router = Router();

// All routes require authentication
router.use(requireAuth);

/**
 * @openapi
 * /api/users/me:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get current user profile
 *     description: |
 *       Retrieves the complete profile of the currently authenticated user,
 *       including personal information, golf statistics, and preferences.
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
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
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/me', readRateLimit, async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;

  res.json({
    success: true,
    data: userService.formatUserPrivate(user),
  });
});

/**
 * @openapi
 * /api/users/me:
 *   patch:
 *     tags:
 *       - Users
 *     summary: Update current user profile
 *     description: |
 *       Updates the profile of the currently authenticated user.
 *       Only provided fields will be updated; omitted fields remain unchanged.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *           example:
 *             firstName: John
 *             lastName: Smith
 *             industry: TECHNOLOGY
 *             company: Acme Corporation
 *             jobTitle: Senior Software Engineer
 *             handicap: 12.5
 *             skillLevel: INTERMEDIATE
 *             bio: Passionate golfer looking to connect with fellow tech professionals.
 *     responses:
 *       200:
 *         description: Profile updated successfully
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
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.patch(
  '/me',
  writeRateLimit,
  validateBody(updateUserSchema),
  async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;
    const body = req.body as UpdateUserInput;

    const updated = await userService.update(userId, body);

    res.json({
      success: true,
      data: userService.formatUserPrivate(updated),
    });
  }
);

/**
 * @openapi
 * /api/users/me/notifications:
 *   get:
 *     tags:
 *       - Notifications
 *     summary: Get user notifications
 *     description: |
 *       Retrieves a paginated list of notifications for the current user.
 *       Notifications include tee time updates, messages, and match recommendations.
 *     parameters:
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Filter to show only unread notifications
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *         description: Pagination cursor for fetching next page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of notifications to return
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
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
 *                     $ref: '#/components/schemas/Notification'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     nextCursor:
 *                       type: string
 *                       nullable: true
 *                     hasMore:
 *                       type: boolean
 *                 meta:
 *                   type: object
 *                   properties:
 *                     unreadCount:
 *                       type: integer
 *                       description: Total number of unread notifications
 *                       example: 5
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get(
  '/me/notifications',
  readRateLimit,
  validateQuery(listNotificationsSchema),
  async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;
    const query = req.query as unknown as ListNotificationsInput;

    const { notifications, nextCursor, hasMore, unreadCount } =
      await notificationService.list(userId, query);

    res.json({
      success: true,
      data: notifications.map(notificationService.formatNotification),
      pagination: {
        nextCursor,
        hasMore,
      },
      meta: {
        unreadCount,
      },
    });
  }
);

/**
 * @openapi
 * /api/users/me/notifications/{id}/read:
 *   patch:
 *     tags:
 *       - Notifications
 *     summary: Mark notification as read
 *     description: Marks a specific notification as read for the current user.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *         example: clh1234567890notif
 *     responses:
 *       200:
 *         description: Notification marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Notification'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch(
  '/me/notifications/:id/read',
  writeRateLimit,
  validateParams(notificationIdSchema),
  async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;
    const id = req.params.id as string;

    const notification = await notificationService.markAsRead(id, userId);

    res.json({
      success: true,
      data: notificationService.formatNotification(notification),
    });
  }
);

/**
 * @openapi
 * /api/users/me/notifications/read-all:
 *   post:
 *     tags:
 *       - Notifications
 *     summary: Mark all notifications as read
 *     description: Marks all unread notifications as read for the current user.
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: All notifications marked as read
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post(
  '/me/notifications/read-all',
  writeRateLimit,
  async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;

    await notificationService.markAllAsRead(userId);

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  }
);

/**
 * @openapi
 * /api/users/me/favorites:
 *   get:
 *     tags:
 *       - Users
 *       - Courses
 *     summary: Get favorite courses
 *     description: Retrieves the list of golf courses the current user has favorited.
 *     responses:
 *       200:
 *         description: Favorite courses retrieved successfully
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
 *                     $ref: '#/components/schemas/Course'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/me/favorites', readRateLimit, async (req: Request, res: Response) => {
  const { userId } = req as AuthenticatedRequest;

  const courses = await courseService.getFavorites(userId);

  res.json({
    success: true,
    data: courses.map((course) => courseService.formatCourse(course, true)),
  });
});

/**
 * @openapi
 * /api/users/me/tee-times:
 *   get:
 *     tags:
 *       - Users
 *       - Tee Times
 *     summary: Get user's tee times
 *     description: |
 *       Retrieves all tee times the current user is participating in,
 *       including both hosted and joined tee times.
 *     responses:
 *       200:
 *         description: Tee times retrieved successfully
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
 *                     $ref: '#/components/schemas/TeeTime'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/me/tee-times', readRateLimit, async (req: Request, res: Response) => {
  const { userId } = req as AuthenticatedRequest;

  const teeTimes = await teeTimeService.getUserTeeTimes(userId);

  res.json({
    success: true,
    data: teeTimes.map(teeTimeService.formatTeeTime),
  });
});

export { router as userRoutes };
