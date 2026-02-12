import { NotificationType } from '@prisma/client';
import { prisma } from '../config/database.js';
import { createLogger } from '../utils/logger.js';
import { metrics } from '../utils/metrics.js';
import { broadcastToUser } from '../websocket/broadcaster.js';

const logger = createLogger('in-app-notifications');

export interface InAppNotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export async function createInAppNotification(
  notification: InAppNotificationData
): Promise<string> {
  const { userId, type, title, body, data } = notification;

  // Create notification in database
  const created = await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      body,
      data: data ?? undefined,
    },
  });

  metrics.inAppNotificationCreated();

  // Broadcast to user's WebSocket connections
  broadcastToUser(userId, {
    type: 'NOTIFICATION',
    payload: {
      id: created.id,
      type: created.type,
      title: created.title,
      body: created.body,
      data: created.data,
      isRead: false,
      createdAt: created.createdAt.toISOString(),
    },
    timestamp: new Date().toISOString(),
  });

  logger.info({ userId, notificationId: created.id, type }, 'In-app notification created');

  return created.id;
}

export async function createBulkInAppNotifications(
  notifications: InAppNotificationData[]
): Promise<string[]> {
  const ids: string[] = [];

  for (const notification of notifications) {
    const id = await createInAppNotification(notification);
    ids.push(id);
  }

  return ids;
}

export async function markNotificationAsRead(
  notificationId: string,
  userId: string
): Promise<boolean> {
  try {
    await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId, // Ensure user owns this notification
      },
      data: { isRead: true },
    });

    return true;
  } catch (error) {
    logger.error({ error, notificationId, userId }, 'Failed to mark notification as read');
    return false;
  }
}

export async function markAllNotificationsAsRead(userId: string): Promise<number> {
  const result = await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: { isRead: true },
  });

  logger.info({ userId, count: result.count }, 'Marked all notifications as read');

  return result.count;
}

export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });
}

export async function deleteOldNotifications(daysOld: number = 90): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await prisma.notification.deleteMany({
    where: {
      createdAt: { lt: cutoffDate },
      isRead: true, // Only delete read notifications
    },
  });

  logger.info({ count: result.count, daysOld }, 'Deleted old notifications');

  return result.count;
}
