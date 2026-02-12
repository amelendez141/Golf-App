import { Router } from 'express';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { validateBody, validateQuery, validateParams } from '../middleware/validate.js';
import { readRateLimit, writeRateLimit } from '../middleware/rateLimit.js';
import {
  createTeeTimeSchema,
  updateTeeTimeSchema,
  listTeeTimesSchema,
  teeTimeIdSchema,
  joinTeeTimeSchema,
} from '../validators/teeTime.js';
import { createMessageSchema, listMessagesSchema } from '../validators/message.js';
import { teeTimeService } from '../services/teeTimeService.js';
import { messageService } from '../services/messageService.js';
import { matchingService } from '../services/matchingService.js';
import type { AuthenticatedRequest } from '../types/index.js';
import type { Request, Response } from 'express';
import type { ListTeeTimesInput, CreateTeeTimeInput, UpdateTeeTimeInput, JoinTeeTimeInput } from '../validators/teeTime.js';
import type { CreateMessageInput, ListMessagesInput } from '../validators/message.js';

const router = Router();

/**
 * @openapi
 * /api/tee-times:
 *   get:
 *     tags:
 *       - Tee Times
 *     summary: List available tee times
 *     description: |
 *       Search and filter tee times with various criteria including
 *       location, date range, industry, and skill level preferences.
 *
 *       Results are sorted by date/time and can be filtered to show
 *       only tee times with available slots.
 *     security:
 *       - bearerAuth: []
 *       - {}
 *     parameters:
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *         description: Filter by specific course
 *       - in: query
 *         name: hostId
 *         schema:
 *           type: string
 *         description: Filter by host user
 *       - in: query
 *         name: status
 *         schema:
 *           $ref: '#/components/schemas/TeeTimeStatus'
 *         description: Filter by status
 *       - in: query
 *         name: industry
 *         schema:
 *           $ref: '#/components/schemas/Industry'
 *         description: Filter by preferred industry
 *       - in: query
 *         name: skillLevel
 *         schema:
 *           $ref: '#/components/schemas/SkillLevel'
 *         description: Filter by preferred skill level
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *         description: Latitude for location-based filtering
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: number
 *         description: Longitude for location-based filtering
 *       - in: query
 *         name: radius
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Search radius in miles
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start of date range filter
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End of date range filter
 *       - in: query
 *         name: hasAvailableSlots
 *         schema:
 *           type: boolean
 *         description: Only show tee times with open slots
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *         description: Pagination cursor
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Results per page
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
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     nextCursor:
 *                       type: string
 *                       nullable: true
 *                     hasMore:
 *                       type: boolean
 */
router.get(
  '/',
  optionalAuth,
  readRateLimit,
  validateQuery(listTeeTimesSchema),
  async (req: Request, res: Response) => {
    const query = req.query as unknown as ListTeeTimesInput;
    const { teeTimes, nextCursor, hasMore } = await teeTimeService.list(query);

    res.json({
      success: true,
      data: teeTimes.map(teeTimeService.formatTeeTime),
      pagination: {
        nextCursor,
        hasMore,
      },
    });
  }
);

/**
 * @openapi
 * /api/tee-times/recommended:
 *   get:
 *     tags:
 *       - Tee Times
 *     summary: Get recommended tee times
 *     description: |
 *       Returns AI-powered tee time recommendations personalized for the current user.
 *
 *       The matching algorithm considers:
 *       - **Industry alignment**: Professionals from similar or complementary industries
 *       - **Skill compatibility**: Players with compatible handicaps and skill levels
 *       - **Location proximity**: Courses within the user's preferred search radius
 *       - **Timing preferences**: Based on user's typical playing patterns
 *
 *       Each recommendation includes a `matchScore` (0-100) indicating compatibility.
 *     responses:
 *       200:
 *         description: Recommendations retrieved successfully
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
 *                     allOf:
 *                       - $ref: '#/components/schemas/TeeTime'
 *                       - type: object
 *                         properties:
 *                           matchScore:
 *                             type: number
 *                             description: Match compatibility score (0-100)
 *                             example: 87.5
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get(
  '/recommended',
  requireAuth,
  readRateLimit,
  async (req: Request, res: Response) => {
    const { user } = req as AuthenticatedRequest;

    const recommendations = await matchingService.getRecommendedTeeTimes(user);

    res.json({
      success: true,
      data: recommendations.map(({ teeTime, score }) => ({
        ...teeTimeService.formatTeeTime(teeTime),
        matchScore: score,
      })),
    });
  }
);

/**
 * @openapi
 * /api/tee-times:
 *   post:
 *     tags:
 *       - Tee Times
 *     summary: Create a new tee time
 *     description: |
 *       Creates a new tee time at the specified course. The authenticated user
 *       automatically becomes the host and occupies the first slot.
 *
 *       You can specify preferences for playing partners by industry and skill level.
 *       These preferences are used for matching recommendations but do not restrict
 *       who can join.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTeeTimeRequest'
 *           example:
 *             courseId: clh1234567890course
 *             dateTime: '2024-03-15T10:30:00.000Z'
 *             totalSlots: 4
 *             industryPreference:
 *               - TECHNOLOGY
 *               - FINANCE
 *             skillPreference:
 *               - INTERMEDIATE
 *               - ADVANCED
 *             notes: Looking for a fun round with networking focus. Drinks after!
 *     responses:
 *       201:
 *         description: Tee time created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/TeeTime'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Course not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  '/',
  requireAuth,
  writeRateLimit,
  validateBody(createTeeTimeSchema),
  async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;
    const body = req.body as CreateTeeTimeInput;

    const teeTime = await teeTimeService.create(userId, body);

    res.status(201).json({
      success: true,
      data: teeTimeService.formatTeeTime(teeTime),
    });
  }
);

/**
 * @openapi
 * /api/tee-times/{id}:
 *   get:
 *     tags:
 *       - Tee Times
 *     summary: Get tee time details
 *     description: |
 *       Retrieves complete details for a specific tee time, including
 *       course information, host details, and all player slots.
 *     security:
 *       - bearerAuth: []
 *       - {}
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tee time ID
 *         example: clh1234567890teetime
 *     responses:
 *       200:
 *         description: Tee time details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/TeeTime'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get(
  '/:id',
  optionalAuth,
  readRateLimit,
  validateParams(teeTimeIdSchema),
  async (req: Request, res: Response) => {
    const id = req.params.id as string;

    const teeTime = await teeTimeService.getById(id);

    res.json({
      success: true,
      data: teeTimeService.formatTeeTime(teeTime),
    });
  }
);

/**
 * @openapi
 * /api/tee-times/{id}:
 *   patch:
 *     tags:
 *       - Tee Times
 *     summary: Update tee time
 *     description: |
 *       Updates an existing tee time. Only the host can modify the tee time.
 *
 *       **Note**: If players have already joined, reducing `totalSlots` below
 *       the current number of joined players will fail.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tee time ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTeeTimeRequest'
 *           example:
 *             dateTime: '2024-03-15T11:00:00.000Z'
 *             notes: Updated meeting point - let's meet at the pro shop
 *     responses:
 *       200:
 *         description: Tee time updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/TeeTime'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch(
  '/:id',
  requireAuth,
  writeRateLimit,
  validateParams(teeTimeIdSchema),
  validateBody(updateTeeTimeSchema),
  async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;
    const id = req.params.id as string;
    const body = req.body as UpdateTeeTimeInput;

    const teeTime = await teeTimeService.update(id, userId, body);

    res.json({
      success: true,
      data: teeTimeService.formatTeeTime(teeTime),
    });
  }
);

/**
 * @openapi
 * /api/tee-times/{id}:
 *   delete:
 *     tags:
 *       - Tee Times
 *     summary: Delete tee time
 *     description: |
 *       Deletes a tee time. Only the host can delete the tee time.
 *
 *       All joined players will be notified of the cancellation.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tee time ID
 *     responses:
 *       200:
 *         description: Tee time deleted successfully
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
 *                   example: Tee time deleted successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete(
  '/:id',
  requireAuth,
  writeRateLimit,
  validateParams(teeTimeIdSchema),
  async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;
    const id = req.params.id as string;

    await teeTimeService.delete(id, userId);

    res.json({
      success: true,
      message: 'Tee time deleted successfully',
    });
  }
);

/**
 * @openapi
 * /api/tee-times/{id}/join:
 *   post:
 *     tags:
 *       - Tee Times
 *     summary: Join a tee time
 *     description: |
 *       Join an available slot in a tee time. You can optionally specify
 *       which slot number you'd like to join, or let the system auto-assign
 *       the next available slot.
 *
 *       The host and all other players will be notified when you join.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tee time ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JoinTeeTimeRequest'
 *           example:
 *             slotNumber: 2
 *     responses:
 *       200:
 *         description: Successfully joined tee time
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/TeeTime'
 *                 message:
 *                   type: string
 *                   example: Successfully joined tee time
 *       400:
 *         description: No available slots or already joined
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.post(
  '/:id/join',
  requireAuth,
  writeRateLimit,
  validateParams(teeTimeIdSchema),
  validateBody(joinTeeTimeSchema),
  async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;
    const id = req.params.id as string;
    const body = req.body as JoinTeeTimeInput;

    const teeTime = await teeTimeService.join(id, userId, body.slotNumber);

    res.json({
      success: true,
      data: teeTimeService.formatTeeTime(teeTime),
      message: 'Successfully joined tee time',
    });
  }
);

/**
 * @openapi
 * /api/tee-times/{id}/leave:
 *   delete:
 *     tags:
 *       - Tee Times
 *     summary: Leave a tee time
 *     description: |
 *       Leave a tee time you've previously joined. Your slot will become
 *       available for other players.
 *
 *       **Note**: The host cannot leave their own tee time. Use DELETE
 *       to cancel the entire tee time instead.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tee time ID
 *     responses:
 *       200:
 *         description: Successfully left tee time
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
 *                   example: Successfully left tee time
 *       400:
 *         description: Cannot leave (e.g., you are the host)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete(
  '/:id/leave',
  requireAuth,
  writeRateLimit,
  validateParams(teeTimeIdSchema),
  async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;
    const id = req.params.id as string;

    await teeTimeService.leave(id, userId);

    res.json({
      success: true,
      message: 'Successfully left tee time',
    });
  }
);

/**
 * @openapi
 * /api/tee-times/{id}/messages:
 *   get:
 *     tags:
 *       - Messages
 *     summary: Get tee time messages
 *     description: |
 *       Retrieves the message history for a tee time group chat.
 *       Only participants (host and joined players) can view messages.
 *
 *       Messages are returned in reverse chronological order (newest first).
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tee time ID
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *         description: Pagination cursor for older messages
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Number of messages to return
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
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
 *                     $ref: '#/components/schemas/Message'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     nextCursor:
 *                       type: string
 *                       nullable: true
 *                     hasMore:
 *                       type: boolean
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Not a participant in this tee time
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get(
  '/:id/messages',
  requireAuth,
  readRateLimit,
  validateParams(teeTimeIdSchema),
  validateQuery(listMessagesSchema),
  async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;
    const id = req.params.id as string;
    const query = req.query as unknown as ListMessagesInput;

    const { messages, nextCursor, hasMore } = await messageService.list(
      id,
      userId,
      query
    );

    res.json({
      success: true,
      data: messages.map(messageService.formatMessage),
      pagination: {
        nextCursor,
        hasMore,
      },
    });
  }
);

/**
 * @openapi
 * /api/tee-times/{id}/messages:
 *   post:
 *     tags:
 *       - Messages
 *     summary: Send a message
 *     description: |
 *       Sends a message to the tee time group chat. Only participants
 *       (host and joined players) can send messages.
 *
 *       All other participants will receive a real-time notification
 *       of the new message.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tee time ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMessageRequest'
 *           example:
 *             content: "Looking forward to the round! Should we meet 30 minutes early at the clubhouse?"
 *     responses:
 *       201:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Message'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Not a participant in this tee time
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.post(
  '/:id/messages',
  requireAuth,
  writeRateLimit,
  validateParams(teeTimeIdSchema),
  validateBody(createMessageSchema),
  async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;
    const id = req.params.id as string;
    const body = req.body as CreateMessageInput;

    const message = await messageService.create(id, userId, body);

    res.status(201).json({
      success: true,
      data: messageService.formatMessage(message),
    });
  }
);

export { router as teeTimeRoutes };
