import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database.js';
import {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  validatePassword,
  validateEmail,
} from '../services/authService.js';
import { BadRequestError, UnauthorizedError, ConflictError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

const router = Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Create a new user account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Account created successfully
 *       400:
 *         description: Invalid input
 *       409:
 *         description: Email already exists
 */
router.post('/register', async (req: Request, res: Response) => {
  const parseResult = registerSchema.safeParse(req.body);

  if (!parseResult.success) {
    const errors = parseResult.error.errors.map(e => e.message).join(', ');
    throw new BadRequestError(errors);
  }

  const { email, password, firstName, lastName } = parseResult.data;

  // Validate email format
  if (!validateEmail(email)) {
    throw new BadRequestError('Invalid email format');
  }

  // Validate password strength
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    throw new BadRequestError(passwordValidation.message || 'Invalid password');
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    throw new ConflictError('An account with this email already exists');
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      passwordHash,
      firstName,
      lastName,
      clerkId: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Generate unique ID for local auth
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      industry: true,
      skillLevel: true,
      createdAt: true,
    },
  });

  // Generate JWT token
  const token = generateToken(user.id, user.email);

  logger.info('User registered successfully', { userId: user.id, email: user.email });

  res.status(201).json({
    success: true,
    data: {
      user,
      token,
    },
    message: 'Account created successfully',
  });
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Sign in with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', async (req: Request, res: Response) => {
  const parseResult = loginSchema.safeParse(req.body);

  if (!parseResult.success) {
    const errors = parseResult.error.errors.map(e => e.message).join(', ');
    throw new BadRequestError(errors);
  }

  const { email, password } = parseResult.data;

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Check if user has a password (local auth users)
  if (!user.passwordHash) {
    throw new UnauthorizedError('This account uses external authentication. Please sign in with your provider.');
  }

  // Verify password
  const isValidPassword = await comparePassword(password, user.passwordHash);

  if (!isValidPassword) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Generate JWT token
  const token = generateToken(user.id, user.email);

  logger.info('User logged in successfully', { userId: user.id, email: user.email });

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
        industry: user.industry,
        skillLevel: user.skillLevel,
        handicap: user.handicap,
        city: user.city,
        state: user.state,
        company: user.company,
        jobTitle: user.jobTitle,
        bio: user.bio,
      },
      token,
    },
    message: 'Login successful',
  });
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [Authentication]
 *     summary: Sign out (client should discard token)
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post('/logout', async (_req: Request, res: Response) => {
  // With JWT, logout is handled client-side by discarding the token
  // In a more sophisticated setup, you might maintain a token blacklist
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags: [Authentication]
 *     summary: Get current user from JWT token
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user data
 *       401:
 *         description: Not authenticated
 */
router.get('/me', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('No authentication token provided');
  }

  const token = authHeader.slice(7);
  const payload = verifyToken(token);

  if (!payload) {
    throw new UnauthorizedError('Invalid or expired token');
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      industry: true,
      company: true,
      jobTitle: true,
      bio: true,
      handicap: true,
      skillLevel: true,
      latitude: true,
      longitude: true,
      city: true,
      state: true,
      searchRadius: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new UnauthorizedError('User not found');
  }

  res.json({
    success: true,
    data: user,
  });
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     tags: [Authentication]
 *     summary: Refresh JWT token
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: New token issued
 *       401:
 *         description: Invalid token
 */
router.post('/refresh', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('No authentication token provided');
  }

  const token = authHeader.slice(7);
  const payload = verifyToken(token);

  if (!payload) {
    throw new UnauthorizedError('Invalid or expired token');
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true },
  });

  if (!user) {
    throw new UnauthorizedError('User not found');
  }

  // Generate new token
  const newToken = generateToken(user.id, user.email);

  res.json({
    success: true,
    data: { token: newToken },
    message: 'Token refreshed successfully',
  });
});

export { router as authRoutes };
