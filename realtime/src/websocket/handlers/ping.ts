import { WebSocket } from 'ws';
import { z } from 'zod';
import { connectionManager } from '../connectionManager.js';
import { createLogger } from '../../utils/logger.js';

const logger = createLogger('ws-ping');

const pingSchema = z.object({
  type: z.literal('ping'),
  timestamp: z.string().optional(),
});

export type PingMessage = z.infer<typeof pingSchema>;

export function handlePing(ws: WebSocket, data: unknown): void {
  const result = pingSchema.safeParse(data);

  if (!result.success) {
    ws.send(JSON.stringify({
      type: 'error',
      code: 'INVALID_MESSAGE',
      message: 'Invalid ping message',
    }));
    return;
  }

  // Update last ping time
  connectionManager.updatePing(ws);

  const connection = connectionManager.getConnection(ws);

  logger.trace({ userId: connection?.userId }, 'Ping received');

  // Send pong response
  ws.send(JSON.stringify({
    type: 'pong',
    timestamp: new Date().toISOString(),
    clientTimestamp: result.data.timestamp,
  }));
}
