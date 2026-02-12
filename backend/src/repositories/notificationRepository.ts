import { prisma } from '../config/database.js';
import type { Notification, Prisma } from '@prisma/client';

export const notificationRepository = {
  async findById(id: string): Promise<Notification | null> {
    return prisma.notification.findUnique({
      where: { id },
    });
  },

  async listByUser(
    userId: string,
    unreadOnly: boolean = false,
    cursor?: string,
    limit: number = 20
  ): Promise<{ notifications: Notification[]; hasMore: boolean }> {
    const where: Prisma.NotificationWhereInput = { userId };

    if (unreadOnly) {
      where.isRead = false;
    }

    if (cursor) {
      where.id = { lt: cursor };
    }

    const notifications = await prisma.notification.findMany({
      where,
      take: limit + 1,
      orderBy: { createdAt: 'desc' },
    });

    const hasMore = notifications.length > limit;
    if (hasMore) {
      notifications.pop();
    }

    return { notifications, hasMore };
  },

  async create(data: Prisma.NotificationCreateInput): Promise<Notification> {
    return prisma.notification.create({
      data,
    });
  },

  async createMany(
    notifications: Prisma.NotificationCreateManyInput[]
  ): Promise<void> {
    await prisma.notification.createMany({
      data: notifications,
    });
  },

  async markAsRead(id: string, userId: string): Promise<Notification | null> {
    return prisma.notification.update({
      where: { id, userId },
      data: { isRead: true },
    });
  },

  async markAllAsRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  },

  async getUnreadCount(userId: string): Promise<number> {
    return prisma.notification.count({
      where: { userId, isRead: false },
    });
  },

  async delete(id: string): Promise<void> {
    await prisma.notification.delete({
      where: { id },
    });
  },

  async deleteOld(userId: string, olderThanDays: number = 30): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    await prisma.notification.deleteMany({
      where: {
        userId,
        isRead: true,
        createdAt: { lt: cutoffDate },
      },
    });
  },
};
