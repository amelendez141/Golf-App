import { connectionManager } from './connectionManager.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('broadcaster');

export interface BroadcastMessage {
  type: string;
  payload: unknown;
  timestamp: string;
  correlationId?: string;
}

// Backpressure configuration
const MAX_BUFFER_SIZE = 16 * 1024; // 16KB

function canSendToConnection(ws: { bufferedAmount: number }): boolean {
  return ws.bufferedAmount < MAX_BUFFER_SIZE;
}

export function broadcastToRoom(
  room: string,
  message: BroadcastMessage,
  excludeUserId?: string
): { sent: number; dropped: number } {
  const connections = connectionManager.getRoomConnections(room);
  const messageStr = JSON.stringify(message);

  let sent = 0;
  let dropped = 0;

  for (const conn of connections) {
    if (excludeUserId && conn.userId === excludeUserId) continue;

    if (canSendToConnection(conn.ws)) {
      conn.ws.send(messageStr);
      sent++;
    } else {
      dropped++;
      logger.warn({ userId: conn.userId, room }, 'Dropped message due to backpressure');
    }
  }

  logger.debug({ room, sent, dropped, total: connections.size }, 'Broadcast to room');
  return { sent, dropped };
}

export function broadcastToUser(
  userId: string,
  message: BroadcastMessage
): { sent: number; dropped: number } {
  const connections = connectionManager.getUserConnections(userId);
  const messageStr = JSON.stringify(message);

  let sent = 0;
  let dropped = 0;

  for (const conn of connections) {
    if (canSendToConnection(conn.ws)) {
      conn.ws.send(messageStr);
      sent++;
    } else {
      dropped++;
      logger.warn({ userId }, 'Dropped message due to backpressure');
    }
  }

  logger.debug({ userId, sent, dropped, total: connections.size }, 'Broadcast to user');
  return { sent, dropped };
}

export function broadcastToUsers(
  userIds: string[],
  message: BroadcastMessage
): { sent: number; dropped: number } {
  let totalSent = 0;
  let totalDropped = 0;

  for (const userId of userIds) {
    const { sent, dropped } = broadcastToUser(userId, message);
    totalSent += sent;
    totalDropped += dropped;
  }

  return { sent: totalSent, dropped: totalDropped };
}

export function broadcastToAll(
  message: BroadcastMessage
): { sent: number; dropped: number } {
  const messageStr = JSON.stringify(message);
  let sent = 0;
  let dropped = 0;

  const stats = connectionManager.getStats();

  // Use the internal broadcast method
  sent = connectionManager.broadcastToAll(messageStr);

  logger.debug({ sent, dropped, total: stats.totalConnections }, 'Broadcast to all');
  return { sent, dropped };
}

// Specialized broadcast functions for specific events
export function broadcastTeeTimeCreated(
  teeTime: {
    id: string;
    hostId: string;
    industryPreference?: string | null;
    courseId: string;
  },
  correlationId?: string
): void {
  const message: BroadcastMessage = {
    type: 'TEE_TIME_CREATED',
    payload: teeTime,
    timestamp: new Date().toISOString(),
    correlationId,
  };

  // Broadcast to main feed
  broadcastToRoom('feed', message);

  // If industry-specific, also broadcast to that industry room
  if (teeTime.industryPreference) {
    broadcastToRoom(`feed:industry:${teeTime.industryPreference}`, message);
  }
}

export function broadcastSlotJoined(
  teeTimeId: string,
  userId: string,
  slotNumber: number,
  correlationId?: string
): void {
  const message: BroadcastMessage = {
    type: 'SLOT_JOINED',
    payload: { teeTimeId, userId, slotNumber },
    timestamp: new Date().toISOString(),
    correlationId,
  };

  // Broadcast to tee time room
  broadcastToRoom(`tee-time:${teeTimeId}`, message);

  // Also broadcast to feed so counts update
  broadcastToRoom('feed', message);
}

export function broadcastSlotLeft(
  teeTimeId: string,
  userId: string,
  slotNumber: number,
  correlationId?: string
): void {
  const message: BroadcastMessage = {
    type: 'SLOT_LEFT',
    payload: { teeTimeId, userId, slotNumber },
    timestamp: new Date().toISOString(),
    correlationId,
  };

  broadcastToRoom(`tee-time:${teeTimeId}`, message);
  broadcastToRoom('feed', message);
}

export function broadcastTeeTimeCancelled(
  teeTimeId: string,
  hostId: string,
  correlationId?: string
): void {
  const message: BroadcastMessage = {
    type: 'TEE_TIME_CANCELLED',
    payload: { teeTimeId, hostId },
    timestamp: new Date().toISOString(),
    correlationId,
  };

  broadcastToRoom(`tee-time:${teeTimeId}`, message);
  broadcastToRoom('feed', message);
}

export function broadcastMessage(
  teeTimeId: string,
  messageData: { id: string; senderId: string; content: string; createdAt: string },
  correlationId?: string
): void {
  const message: BroadcastMessage = {
    type: 'MESSAGE_SENT',
    payload: { teeTimeId, message: messageData },
    timestamp: new Date().toISOString(),
    correlationId,
  };

  broadcastToRoom(`tee-time:${teeTimeId}`, message);
}

export function broadcastTeeTimeUpdated(
  teeTimeId: string,
  changes: Record<string, unknown>,
  correlationId?: string
): void {
  const message: BroadcastMessage = {
    type: 'TEE_TIME_UPDATED',
    payload: { teeTimeId, changes },
    timestamp: new Date().toISOString(),
    correlationId,
  };

  broadcastToRoom(`tee-time:${teeTimeId}`, message);
  broadcastToRoom('feed', message);
}
