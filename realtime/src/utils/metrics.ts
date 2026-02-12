import { createLogger } from './logger.js';

const logger = createLogger('metrics');

interface Metrics {
  // WebSocket metrics
  activeConnections: number;
  totalConnectionsOpened: number;
  totalConnectionsClosed: number;
  messagesSent: number;
  messagesReceived: number;

  // Event metrics
  eventsProcessed: number;
  eventErrors: number;

  // Job metrics
  jobsProcessed: number;
  jobsFailed: number;

  // Notification metrics
  pushNotificationsSent: number;
  emailsSent: number;
  inAppNotificationsCreated: number;

  // Matching metrics
  matchingQueriesExecuted: number;
  matchingCacheHits: number;
  matchingCacheMisses: number;
}

class MetricsCollector {
  private metrics: Metrics = {
    activeConnections: 0,
    totalConnectionsOpened: 0,
    totalConnectionsClosed: 0,
    messagesSent: 0,
    messagesReceived: 0,
    eventsProcessed: 0,
    eventErrors: 0,
    jobsProcessed: 0,
    jobsFailed: 0,
    pushNotificationsSent: 0,
    emailsSent: 0,
    inAppNotificationsCreated: 0,
    matchingQueriesExecuted: 0,
    matchingCacheHits: 0,
    matchingCacheMisses: 0,
  };

  private startTime = Date.now();
  private logInterval: NodeJS.Timeout | null = null;

  startPeriodicLogging(intervalMs: number = 60000): void {
    this.logInterval = setInterval(() => {
      this.logMetrics();
    }, intervalMs);
  }

  stopPeriodicLogging(): void {
    if (this.logInterval) {
      clearInterval(this.logInterval);
      this.logInterval = null;
    }
  }

  // WebSocket metrics
  connectionOpened(): void {
    this.metrics.activeConnections++;
    this.metrics.totalConnectionsOpened++;
  }

  connectionClosed(): void {
    this.metrics.activeConnections--;
    this.metrics.totalConnectionsClosed++;
  }

  messageSent(): void {
    this.metrics.messagesSent++;
  }

  messageReceived(): void {
    this.metrics.messagesReceived++;
  }

  // Event metrics
  eventProcessed(): void {
    this.metrics.eventsProcessed++;
  }

  eventError(): void {
    this.metrics.eventErrors++;
  }

  // Job metrics
  jobProcessed(): void {
    this.metrics.jobsProcessed++;
  }

  jobFailed(): void {
    this.metrics.jobsFailed++;
  }

  // Notification metrics
  pushNotificationSent(): void {
    this.metrics.pushNotificationsSent++;
  }

  emailSent(): void {
    this.metrics.emailsSent++;
  }

  inAppNotificationCreated(): void {
    this.metrics.inAppNotificationsCreated++;
  }

  // Matching metrics
  matchingQueryExecuted(): void {
    this.metrics.matchingQueriesExecuted++;
  }

  matchingCacheHit(): void {
    this.metrics.matchingCacheHits++;
  }

  matchingCacheMiss(): void {
    this.metrics.matchingCacheMisses++;
  }

  getMetrics(): Metrics & { uptimeSeconds: number } {
    return {
      ...this.metrics,
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
    };
  }

  logMetrics(): void {
    const metrics = this.getMetrics();
    logger.info({ metrics }, 'Metrics snapshot');
  }

  reset(): void {
    const activeConnections = this.metrics.activeConnections;
    this.metrics = {
      activeConnections,
      totalConnectionsOpened: 0,
      totalConnectionsClosed: 0,
      messagesSent: 0,
      messagesReceived: 0,
      eventsProcessed: 0,
      eventErrors: 0,
      jobsProcessed: 0,
      jobsFailed: 0,
      pushNotificationsSent: 0,
      emailsSent: 0,
      inAppNotificationsCreated: 0,
      matchingQueriesExecuted: 0,
      matchingCacheHits: 0,
      matchingCacheMisses: 0,
    };
    this.startTime = Date.now();
  }
}

export const metrics = new MetricsCollector();
