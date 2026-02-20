import type { Request, Response, NextFunction } from 'express';
import { verifyToken as verifyClerkToken } from '@clerk/backend';
import { env, isClerkConfigured } from '../config/env.js';
import { prisma } from '../config/database.js';
import { UnauthorizedError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { verifyToken as verifyLocalToken } from '../services/authService.js';
import type { AuthenticatedRequest } from '../types/index.js';

// Check if demo mode is enabled (for deployments without real auth)
const isDemoMode = process.env.DEMO_MODE === 'true';

// Check if Clerk is properly configured (not using placeholder values)
const clerkEnabled = !isDemoMode && isClerkConfigured();

// Check if local auth is enabled (default: true when Clerk is not configured)
const localAuthEnabled = process.env.LOCAL_AUTH_ENABLED !== 'false';

if (!clerkEnabled && !localAuthEnabled) {
  logger.warn('====================================================');
  logger.warn('RUNNING IN DEMO MODE - Authentication bypassed');
  logger.warn('To enable authentication:');
  logger.warn('  - Configure Clerk API keys, OR');
  logger.warn('  - Use local auth (enabled by default)');
  logger.warn('See AUTHENTICATION.md for setup instructions');
  logger.warn('====================================================');
} else if (localAuthEnabled && !clerkEnabled) {
  logger.info('====================================================');
  logger.info('LOCAL AUTHENTICATION ENABLED');
  logger.info('Using JWT-based local authentication');
  logger.info('====================================================');
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

/**
 * Verify a JWT token (either Clerk or local)
 */
async function verifyAuthToken(token: string) {
  // First, try local JWT verification
  if (localAuthEnabled) {
    const localPayload = verifyLocalToken(token);
    if (localPayload) {
      const user = await prisma.user.findUnique({
        where: { id: localPayload.userId },
      });
      if (user) {
        return { user, source: 'local' as const };
      }
    }
  }

  // Then, try Clerk verification if enabled
  if (clerkEnabled) {
    try {
      const clerkPayload = await verifyClerkToken(token, {
        secretKey: env.CLERK_SECRET_KEY,
      });

      if (clerkPayload.sub) {
        const user = await prisma.user.findUnique({
          where: { clerkId: clerkPayload.sub },
        });
        if (user) {
          return { user, source: 'clerk' as const };
        }
      }
    } catch {
      // Clerk verification failed, continue
    }
  }

  return null;
}

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  // Demo mode - use mock user (only if both auth methods are disabled)
  if (!clerkEnabled && !localAuthEnabled) {
    const devUser = await getDevUser();
    (req as AuthenticatedRequest).user = devUser;
    (req as AuthenticatedRequest).userId = devUser.id;
    next();
    return;
  }

  // Production/local mode - verify token
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid authorization header');
  }

  const token = authHeader.slice(7);

  const result = await verifyAuthToken(token);

  if (!result) {
    throw new UnauthorizedError('Invalid or expired token');
  }

  (req as AuthenticatedRequest).user = result.user;
  (req as AuthenticatedRequest).userId = result.user.id;

  next();
}

export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  // Demo mode - always attach dev user (only if both auth methods are disabled)
  if (!clerkEnabled && !localAuthEnabled) {
    const devUser = await getDevUser();
    (req as AuthenticatedRequest).user = devUser;
    (req as AuthenticatedRequest).userId = devUser.id;
    next();
    return;
  }

  // Production/local mode - verify token if present
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    next();
    return;
  }

  const token = authHeader.slice(7);

  try {
    const result = await verifyAuthToken(token);

    if (result) {
      (req as AuthenticatedRequest).user = result.user;
      (req as AuthenticatedRequest).userId = result.user.id;
    }
  } catch {
    // Optional auth - continue without user
  }

  next();
}

// Export helper for other modules to check auth mode
export function isAuthEnabled(): boolean {
  return clerkEnabled || localAuthEnabled;
}

export function isLocalAuthEnabled(): boolean {
  return localAuthEnabled;
}
