import { WebSocket } from 'ws';
import { createLogger } from '../utils/logger.js';
import { metrics } from '../utils/metrics.js';

const logger = createLogger('connection-manager');

export interface Connection {
  ws: WebSocket;
  userId: string;
  email?: string;
  connectedAt: Date;
  subscribedRooms: Set<string>;
  lastPingAt: Date;
}

class ConnectionManager {
  // Map userId to Set of connections (one user can have multiple tabs/devices)
  private userConnections = new Map<string, Set<Connection>>();

  // Map room name to Set of connections
  private roomSubscriptions = new Map<string, Set<Connection>>();

  // Map WebSocket to Connection for quick lookup
  private wsToConnection = new Map<WebSocket, Connection>();

  addConnection(ws: WebSocket, userId: string, email?: string): Connection {
    const connection: Connection = {
      ws,
      userId,
      email,
      connectedAt: new Date(),
      subscribedRooms: new Set(),
      lastPingAt: new Date(),
    };

    // Add to user connections
    if (!this.userConnections.has(userId)) {
      this.userConnections.set(userId, new Set());
    }
    this.userConnections.get(userId)!.add(connection);

    // Add to ws lookup
    this.wsToConnection.set(ws, connection);

    metrics.connectionOpened();
    logger.info({ userId, totalConnections: this.getTotalConnections() }, 'Connection added');

    return connection;
  }

  removeConnection(ws: WebSocket): void {
    const connection = this.wsToConnection.get(ws);
    if (!connection) return;

    const { userId } = connection;

    // Remove from all subscribed rooms
    for (const room of connection.subscribedRooms) {
      const roomConns = this.roomSubscriptions.get(room);
      if (roomConns) {
        roomConns.delete(connection);
        if (roomConns.size === 0) {
          this.roomSubscriptions.delete(room);
        }
      }
    }

    // Remove from user connections
    const userConns = this.userConnections.get(userId);
    if (userConns) {
      userConns.delete(connection);
      if (userConns.size === 0) {
        this.userConnections.delete(userId);
      }
    }

    // Remove from ws lookup
    this.wsToConnection.delete(ws);

    metrics.connectionClosed();
    logger.info({ userId, totalConnections: this.getTotalConnections() }, 'Connection removed');
  }

  getConnection(ws: WebSocket): Connection | undefined {
    return this.wsToConnection.get(ws);
  }

  getUserConnections(userId: string): Set<Connection> {
    return this.userConnections.get(userId) || new Set();
  }

  isUserOnline(userId: string): boolean {
    const conns = this.userConnections.get(userId);
    return conns !== undefined && conns.size > 0;
  }

  subscribeToRoom(ws: WebSocket, room: string): boolean {
    const connection = this.wsToConnection.get(ws);
    if (!connection) return false;

    // Add room to connection
    connection.subscribedRooms.add(room);

    // Add connection to room
    if (!this.roomSubscriptions.has(room)) {
      this.roomSubscriptions.set(room, new Set());
    }
    this.roomSubscriptions.get(room)!.add(connection);

    logger.debug({ userId: connection.userId, room }, 'Subscribed to room');
    return true;
  }

  unsubscribeFromRoom(ws: WebSocket, room: string): boolean {
    const connection = this.wsToConnection.get(ws);
    if (!connection) return false;

    // Remove room from connection
    connection.subscribedRooms.delete(room);

    // Remove connection from room
    const roomConns = this.roomSubscriptions.get(room);
    if (roomConns) {
      roomConns.delete(connection);
      if (roomConns.size === 0) {
        this.roomSubscriptions.delete(room);
      }
    }

    logger.debug({ userId: connection.userId, room }, 'Unsubscribed from room');
    return true;
  }

  getRoomConnections(room: string): Set<Connection> {
    return this.roomSubscriptions.get(room) || new Set();
  }

  updatePing(ws: WebSocket): void {
    const connection = this.wsToConnection.get(ws);
    if (connection) {
      connection.lastPingAt = new Date();
    }
  }

  // Broadcast to a specific room
  broadcastToRoom(room: string, message: string, excludeWs?: WebSocket): number {
    const connections = this.getRoomConnections(room);
    let sent = 0;

    for (const conn of connections) {
      if (excludeWs && conn.ws === excludeWs) continue;
      if (conn.ws.readyState === WebSocket.OPEN) {
        conn.ws.send(message);
        sent++;
        metrics.messageSent();
      }
    }

    return sent;
  }

  // Broadcast to a specific user (all their connections)
  broadcastToUser(userId: string, message: string): number {
    const connections = this.getUserConnections(userId);
    let sent = 0;

    for (const conn of connections) {
      if (conn.ws.readyState === WebSocket.OPEN) {
        conn.ws.send(message);
        sent++;
        metrics.messageSent();
      }
    }

    return sent;
  }

  // Broadcast to all connections
  broadcastToAll(message: string): number {
    let sent = 0;

    for (const conn of this.wsToConnection.values()) {
      if (conn.ws.readyState === WebSocket.OPEN) {
        conn.ws.send(message);
        sent++;
        metrics.messageSent();
      }
    }

    return sent;
  }

  getTotalConnections(): number {
    return this.wsToConnection.size;
  }

  getOnlineUserCount(): number {
    return this.userConnections.size;
  }

  getRoomCount(): number {
    return this.roomSubscriptions.size;
  }

  getStats() {
    return {
      totalConnections: this.getTotalConnections(),
      onlineUsers: this.getOnlineUserCount(),
      rooms: this.getRoomCount(),
      roomDetails: Array.from(this.roomSubscriptions.entries()).map(([room, conns]) => ({
        room,
        subscribers: conns.size,
      })),
    };
  }

  // Cleanup stale connections (no ping in last 2 minutes)
  cleanupStaleConnections(): number {
    const staleThreshold = 2 * 60 * 1000; // 2 minutes
    const now = Date.now();
    let cleaned = 0;

    for (const [ws, connection] of this.wsToConnection) {
      if (now - connection.lastPingAt.getTime() > staleThreshold) {
        logger.warn({ userId: connection.userId }, 'Cleaning up stale connection');
        ws.terminate();
        this.removeConnection(ws);
        cleaned++;
      }
    }

    return cleaned;
  }
}

export const connectionManager = new ConnectionManager();
