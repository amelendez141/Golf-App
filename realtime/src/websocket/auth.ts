import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('websocket-auth');

export interface JWTPayload {
  sub: string;
  email: string;
  userId: string;
  iat: number;
  exp: number;
}

export interface AuthResult {
  success: boolean;
  userId?: string;
  email?: string;
  error?: string;
}

export function verifyToken(token: string): AuthResult {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;

    // Check if token has required fields
    if (!decoded.userId && !decoded.sub) {
      return { success: false, error: 'Token missing user identifier' };
    }

    return {
      success: true,
      userId: decoded.userId || decoded.sub,
      email: decoded.email,
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      logger.debug('Token expired');
      return { success: false, error: 'Token expired' };
    }

    if (error instanceof jwt.JsonWebTokenError) {
      logger.debug({ error: error.message }, 'Invalid token');
      return { success: false, error: 'Invalid token' };
    }

    logger.error({ error }, 'Token verification error');
    return { success: false, error: 'Authentication failed' };
  }
}

export function extractTokenFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url, 'ws://localhost');
    return urlObj.searchParams.get('token');
  } catch {
    return null;
  }
}
