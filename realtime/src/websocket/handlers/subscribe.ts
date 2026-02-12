import { WebSocket } from 'ws';
import { z } from 'zod';
import { connectionManager } from '../connectionManager.js';
import { createLogger } from '../../utils/logger.js';

const logger = createLogger('ws-subscribe');

const subscribeSchema = z.object({
  type: z.literal('subscribe'),
  room: z.string().min(1),
});

export type SubscribeMessage = z.infer<typeof subscribeSchema>;

// Valid room patterns
const ROOM_PATTERNS = {
  feed: /^feed(?::industry:[\w]+)?$/,
  teeTime: /^tee-time:[\w-]+$/,
  user: /^user:[\w-]+$/,
};

function isValidRoom(room: string): boolean {
  return Object.values(ROOM_PATTERNS).some((pattern) => pattern.test(room));
}

export function handleSubscribe(ws: WebSocket, data: unknown): void {
  const result = subscribeSchema.safeParse(data);

  if (!result.success) {
    ws.send(JSON.stringify({
      type: 'error',
      code: 'INVALID_MESSAGE',
      message: 'Invalid subscribe message',
    }));
    return;
  }

  const { room } = result.data;
  const connection = connectionManager.getConnection(ws);

  if (!connection) {
    ws.send(JSON.stringify({
      type: 'error',
      code: 'NOT_AUTHENTICATED',
      message: 'Connection not found',
    }));
    return;
  }

  // Validate room format
  if (!isValidRoom(room)) {
    ws.send(JSON.stringify({
      type: 'error',
      code: 'INVALID_ROOM',
      message: `Invalid room format: ${room}`,
    }));
    return;
  }

  // Special handling for user-specific rooms (can only subscribe to own)
  if (room.startsWith('user:')) {
    const roomUserId = room.split(':')[1];
    if (roomUserId !== connection.userId) {
      ws.send(JSON.stringify({
        type: 'error',
        code: 'FORBIDDEN',
        message: 'Cannot subscribe to another user\'s room',
      }));
      return;
    }
  }

  const success = connectionManager.subscribeToRoom(ws, room);

  if (success) {
    logger.info({ userId: connection.userId, room }, 'User subscribed to room');

    ws.send(JSON.stringify({
      type: 'subscribed',
      room,
      timestamp: new Date().toISOString(),
    }));
  } else {
    ws.send(JSON.stringify({
      type: 'error',
      code: 'SUBSCRIBE_FAILED',
      message: 'Failed to subscribe to room',
    }));
  }
}

// Helper to get appropriate rooms for a user
export function getDefaultRoomsForUser(userId: string, industry?: string): string[] {
  const rooms = [
    'feed', // Main feed
    `user:${userId}`, // User-specific notifications
  ];

  if (industry) {
    rooms.push(`feed:industry:${industry}`);
  }

  return rooms;
}
