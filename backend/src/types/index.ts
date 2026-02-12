import type { User } from '@prisma/client';
import type { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user: User;
  userId: string;
}

export interface ClerkJWTPayload {
  sub: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  image_url?: string;
}

export interface PubSubEvent {
  type: EventType;
  payload: Record<string, unknown>;
  timestamp: string;
}

export type EventType =
  | 'TEE_TIME_UPDATED'
  | 'SLOT_JOINED'
  | 'SLOT_LEFT'
  | 'NEW_MESSAGE'
  | 'NOTIFICATION';

export interface MatchScore {
  teeTimeId: string;
  score: number;
  breakdown: {
    industryScore: number;
    skillScore: number;
    distanceScore: number;
    timingScore: number;
  };
}
