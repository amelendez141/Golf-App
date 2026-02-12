import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { env } from '../config/env.js';
import { createLogger } from '../utils/logger.js';
import { metrics } from '../utils/metrics.js';
import { connectionManager } from './connectionManager.js';
import { verifyToken, extractTokenFromUrl } from './auth.js';
import { handleSubscribe, getDefaultRoomsForUser } from './handlers/subscribe.js';
import { handleUnsubscribe } from './handlers/unsubscribe.js';
import { handlePing } from './handlers/ping.js';
import { prisma } from '../config/database.js';

const logger = createLogger('websocket-server');

let wss: WebSocketServer | null = null;
let cleanupInterval: NodeJS.Timeout | null = null;

export function createWebSocketServer(): WebSocketServer {
  wss = new WebSocketServer({
    port: env.WS_PORT,
    clientTracking: false, // We use our own connection manager
  });

  logger.info({ port: env.WS_PORT }, 'WebSocket server started');

  wss.on('connection', handleConnection);

  wss.on('error', (error) => {
    logger.error({ error }, 'WebSocket server error');
  });

  // Start cleanup interval (every 30 seconds)
  cleanupInterval = setInterval(() => {
    const cleaned = connectionManager.cleanupStaleConnections();
    if (cleaned > 0) {
      logger.info({ cleaned }, 'Cleaned up stale connections');
    }
  }, 30000);

  return wss;
}

async function handleConnection(ws: WebSocket, req: IncomingMessage): Promise<void> {
  const url = req.url || '';
  const token = extractTokenFromUrl(url);

  logger.debug({ url: url.substring(0, 50) }, 'New connection attempt');

  if (!token) {
    logger.warn('Connection rejected: No token provided');
    ws.close(4001, 'No authentication token');
    return;
  }

  const authResult = verifyToken(token);

  if (!authResult.success || !authResult.userId) {
    logger.warn({ error: authResult.error }, 'Connection rejected: Invalid token');
    ws.close(4002, authResult.error || 'Invalid token');
    return;
  }

  const { userId, email } = authResult;

  // Add connection to manager
  const connection = connectionManager.addConnection(ws, userId, email);

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connected',
    userId,
    timestamp: new Date().toISOString(),
    message: 'Successfully connected to LinkUp Golf real-time service',
  }));

  // Auto-subscribe to default rooms
  try {
    // Fetch user's industry for industry-specific room
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { industry: true },
    });

    const defaultRooms = getDefaultRoomsForUser(userId, user?.industry);

    for (const room of defaultRooms) {
      connectionManager.subscribeToRoom(ws, room);
    }

    logger.info({ userId, rooms: defaultRooms }, 'User auto-subscribed to default rooms');
  } catch (error) {
    logger.error({ userId, error }, 'Failed to fetch user for auto-subscription');
    // Continue anyway with basic subscription
    connectionManager.subscribeToRoom(ws, 'feed');
    connectionManager.subscribeToRoom(ws, `user:${userId}`);
  }

  // Handle incoming messages
  ws.on('message', (data) => {
    metrics.messageReceived();
    handleMessage(ws, data);
  });

  // Handle close
  ws.on('close', (code, reason) => {
    logger.info({ userId, code, reason: reason.toString() }, 'Connection closed');
    connectionManager.removeConnection(ws);
  });

  // Handle errors
  ws.on('error', (error) => {
    logger.error({ userId, error }, 'WebSocket error');
    connectionManager.removeConnection(ws);
  });

  // Handle pong (response to server ping)
  ws.on('pong', () => {
    connectionManager.updatePing(ws);
  });
}

function handleMessage(ws: WebSocket, rawData: WebSocket.RawData): void {
  let data: unknown;

  try {
    data = JSON.parse(rawData.toString());
  } catch {
    ws.send(JSON.stringify({
      type: 'error',
      code: 'INVALID_JSON',
      message: 'Invalid JSON message',
    }));
    return;
  }

  const message = data as { type?: string };

  if (!message.type) {
    ws.send(JSON.stringify({
      type: 'error',
      code: 'MISSING_TYPE',
      message: 'Message must have a type field',
    }));
    return;
  }

  switch (message.type) {
    case 'subscribe':
      handleSubscribe(ws, data);
      break;

    case 'unsubscribe':
      handleUnsubscribe(ws, data);
      break;

    case 'ping':
      handlePing(ws, data);
      break;

    default:
      ws.send(JSON.stringify({
        type: 'error',
        code: 'UNKNOWN_MESSAGE_TYPE',
        message: `Unknown message type: ${message.type}`,
      }));
  }
}

export function getWebSocketServer(): WebSocketServer | null {
  return wss;
}

export async function closeWebSocketServer(): Promise<void> {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }

  if (wss) {
    logger.info('Closing WebSocket server...');

    // Close all connections gracefully
    const stats = connectionManager.getStats();
    logger.info({ connections: stats.totalConnections }, 'Closing active connections');

    return new Promise((resolve) => {
      wss!.close(() => {
        logger.info('WebSocket server closed');
        wss = null;
        resolve();
      });
    });
  }
}

// Server health check
export function getServerStats() {
  return {
    ...connectionManager.getStats(),
    wsServerRunning: wss !== null,
    port: env.WS_PORT,
  };
}
