import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@clerk/backend';
import { env } from '../config/env.js';
import { prisma } from '../config/database.js';
import { UnauthorizedError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import type { AuthenticatedRequest } from '../types/index.js';

// Check if demo mode is enabled (for deployments without real Clerk)
const isDemoMode = process.env.DEMO_MODE === 'true';

// Check if Clerk is properly configured (not using placeholder values)
const isClerkConfigured =
  !isDemoMode &&
  env.CLERK_SECRET_KEY &&
  !env.CLERK_SECRET_KEY.includes('your_clerk') &&
  !env.CLERK_SECRET_KEY.includes('sk_test_your');

if (!isClerkConfigured) {
  logger.warn('Running in DEMO MODE - authentication bypassed');
}

// Store current demo user ID (can be switched via /api/demo/switch-user)
let currentDemoUserId: string | null = null;

export function setDemoUserId(id: string | null) {
  currentDemoUserId = id;
}

export function getDemoUserId(): string | null {
  return currentDemoUserId;
}

// Get or create a dev user for testing
async function getDevUser() {
  // If a specific demo user is set, use that
  if (currentDemoUserId) {
    const demoUser = await prisma.user.findUnique({
      where: { id: currentDemoUserId },
    });
    if (demoUser) {
      return demoUser;
    }
  }

  // Try to find an existing user to use as dev user
  let user = await prisma.user.findFirst({
    orderBy: { createdAt: 'asc' },
  });

  // If no users exist, create a dev user
  if (!user) {
    user = await prisma.user.create({
      data: {
        clerkId: 'dev_user_001',
        email: 'dev@linkupgolf.com',
        firstName: 'Dev',
        lastName: 'User',
        industry: 'TECHNOLOGY',
        skillLevel: 'INTERMEDIATE',
        handicap: 15,
        city: 'San Francisco',
        state: 'CA',
        latitude: 37.7749,
        longitude: -122.4194,
      },
    });
    logger.info('Created dev user for testing');
  }

  // Store the current user ID
  currentDemoUserId = user.id;
  return user;
}

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  // Development mode - use mock user
  if (!isClerkConfigured) {
    const devUser = await getDevUser();
    (req as AuthenticatedRequest).user = devUser;
    (req as AuthenticatedRequest).userId = devUser.id;
    next();
    return;
  }

  // Production mode - verify Clerk token
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid authorization header');
  }

  const token = authHeader.slice(7);

  try {
    const payload = await verifyToken(token, {
      secretKey: env.CLERK_SECRET_KEY,
    });

    if (!payload.sub) {
      throw new UnauthorizedError('Invalid token payload');
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    (req as AuthenticatedRequest).user = user;
    (req as AuthenticatedRequest).userId = user.id;

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    throw new UnauthorizedError('Invalid or expired token');
  }
}

export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  // Development mode - always attach dev user
  if (!isClerkConfigured) {
    const devUser = await getDevUser();
    (req as AuthenticatedRequest).user = devUser;
    (req as AuthenticatedRequest).userId = devUser.id;
    next();
    return;
  }

  // Production mode - verify Clerk token if present
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    next();
    return;
  }

  const token = authHeader.slice(7);

  try {
    const payload = await verifyToken(token, {
      secretKey: env.CLERK_SECRET_KEY,
    });

    if (payload.sub) {
      const user = await prisma.user.findUnique({
        where: { clerkId: payload.sub },
      });

      if (user) {
        (req as AuthenticatedRequest).user = user;
        (req as AuthenticatedRequest).userId = user.id;
      }
    }
  } catch {
    // Optional auth - continue without user
  }

  next();
}
