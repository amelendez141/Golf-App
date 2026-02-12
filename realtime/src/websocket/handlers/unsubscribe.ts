import { WebSocket } from 'ws';
import { z } from 'zod';
import { connectionManager } from '../connectionManager.js';
import { createLogger } from '../../utils/logger.js';

const logger = createLogger('ws-unsubscribe');

const unsubscribeSchema = z.object({
  type: z.literal('unsubscribe'),
  room: z.string().min(1),
});

export type UnsubscribeMessage = z.infer<typeof unsubscribeSchema>;

export function handleUnsubscribe(ws: WebSocket, data: unknown): void {
  const result = unsubscribeSchema.safeParse(data);

  if (!result.success) {
    ws.send(JSON.stringify({
      type: 'error',
      code: 'INVALID_MESSAGE',
      message: 'Invalid unsubscribe message',
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

  const success = connectionManager.unsubscribeFromRoom(ws, room);

  if (success) {
    logger.info({ userId: connection.userId, room }, 'User unsubscribed from room');

    ws.send(JSON.stringify({
      type: 'unsubscribed',
      room,
      timestamp: new Date().toISOString(),
    }));
  } else {
    ws.send(JSON.stringify({
      type: 'error',
      code: 'UNSUBSCRIBE_FAILED',
      message: 'Failed to unsubscribe from room',
    }));
  }
}
