import { Router } from 'express';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { validateQuery, validateParams } from '../middleware/validate.js';
import { readRateLimit, writeRateLimit } from '../middleware/rateLimit.js';
import { searchCoursesSchema, courseIdSchema, courseSlugSchema } from '../validators/course.js';
import { courseService } from '../services/courseService.js';
import type { AuthenticatedRequest } from '../types/index.js';
import type { Request, Response } from 'express';
import type { SearchCoursesInput } from '../validators/course.js';

const router = Router();

/**
 * @openapi
 * /api/courses:
 *   get:
 *     tags:
 *       - Courses
 *     summary: Search golf courses
 *     description: |
 *       Search for golf courses with various filters including location,
 *       course type, and rating. Supports cursor-based pagination.
 *
 *       **Location Search**: When latitude and longitude are provided,
 *       results are filtered by distance and sorted by proximity.
 *     security:
 *       - bearerAuth: []
 *       - {}
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search term for course name or location
 *         example: Pebble Beach
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *           minimum: -90
 *           maximum: 90
 *         description: Latitude for location-based search
 *         example: 37.7749
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: number
 *           minimum: -180
 *           maximum: 180
 *         description: Longitude for location-based search
 *         example: -122.4194
 *       - in: query
 *         name: radius
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 200
 *           default: 50
 *         description: Search radius in miles
 *       - in: query
 *         name: courseType
 *         schema:
 *           $ref: '#/components/schemas/CourseType'
 *         description: Filter by course type
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: number
 *           minimum: 0
 *           maximum: 5
 *         description: Minimum course rating
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *         description: Pagination cursor
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of results per page
 *     responses:
 *       200:
 *         description: Courses retrieved successfully
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
  validateQuery(searchCoursesSchema),
  async (req: Request, res: Response) => {
    const authReq = req as Partial<AuthenticatedRequest>;
    const query = req.query as unknown as SearchCoursesInput;

    const { courses, nextCursor, hasMore } = await courseService.search(query);

    // Check favorites if user is authenticated
    const coursesWithFavorites = await Promise.all(
      courses.map(async (course) => {
        let isFavorited = false;
        if (authReq.userId) {
          isFavorited = await courseService.isFavorited(authReq.userId, course.id);
        }
        return courseService.formatCourse(course, isFavorited);
      })
    );

    res.json({
      success: true,
      data: coursesWithFavorites,
      pagination: {
        nextCursor,
        hasMore,
      },
    });
  }
);

/**
 * @openapi
 * /api/courses/{slug}:
 *   get:
 *     tags:
 *       - Courses
 *     summary: Get course by slug
 *     description: |
 *       Retrieves detailed information about a specific golf course
 *       using its URL-friendly slug identifier.
 *     security:
 *       - bearerAuth: []
 *       - {}
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Course URL slug
 *         example: pebble-beach-golf-links
 *     responses:
 *       200:
 *         description: Course details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Course'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get(
  '/:slug',
  optionalAuth,
  readRateLimit,
  validateParams(courseSlugSchema),
  async (req: Request, res: Response) => {
    const authReq = req as Partial<AuthenticatedRequest>;
    const slug = req.params.slug as string;

    const course = await courseService.getBySlug(slug);

    let isFavorited = false;
    if (authReq.userId) {
      isFavorited = await courseService.isFavorited(authReq.userId, course.id);
    }

    res.json({
      success: true,
      data: courseService.formatCourse(course, isFavorited),
    });
  }
);

/**
 * @openapi
 * /api/courses/{id}/favorite:
 *   post:
 *     tags:
 *       - Courses
 *     summary: Toggle course favorite
 *     description: |
 *       Toggles the favorite status of a golf course for the current user.
 *       If the course is currently favorited, it will be unfavorited, and vice versa.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *         example: clh1234567890course
 *     responses:
 *       200:
 *         description: Favorite status toggled successfully
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
 *                     isFavorited:
 *                       type: boolean
 *                       example: true
 *                 message:
 *                   type: string
 *                   example: Course added to favorites
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.post(
  '/:id/favorite',
  requireAuth,
  writeRateLimit,
  validateParams(courseIdSchema),
  async (req: Request, res: Response) => {
    const { userId } = req as AuthenticatedRequest;
    const id = req.params.id as string;

    const isFavorited = await courseService.toggleFavorite(userId, id);

    res.json({
      success: true,
      data: { isFavorited },
      message: isFavorited ? 'Course added to favorites' : 'Course removed from favorites',
    });
  }
);

export { router as courseRoutes };
