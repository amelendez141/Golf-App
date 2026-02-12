import { notificationRepository } from '../repositories/notificationRepository.js';
import { userRepository } from '../repositories/userRepository.js';
import { eventService } from './eventService.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import type { Notification, NotificationType, Prisma } from '@prisma/client';
import type { TeeTimeWithRelations } from '../repositories/teeTimeRepository.js';
import type { MessageWithSender } from '../repositories/messageRepository.js';
import type { ListNotificationsInput } from '../validators/notification.js';

export const notificationService = {
  async list(
    userId: string,
    params: ListNotificationsInput
  ): Promise<{
    notifications: Notification[];
    nextCursor: string | null;
    hasMore: boolean;
    unreadCount: number;
  }> {
    const [{ notifications, hasMore }, unreadCount] = await Promise.all([
      notificationRepository.listByUser(userId, params.unreadOnly, params.cursor, params.limit),
      notificationRepository.getUnreadCount(userId),
    ]);

    const lastNotification = notifications[notifications.length - 1];
    const nextCursor = hasMore && lastNotification ? lastNotification.id : null;

    return { notifications, nextCursor, hasMore, unreadCount };
  },

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await notificationRepository.findById(id);

    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenError('You cannot mark this notification as read');
    }

    const updated = await notificationRepository.markAsRead(id, userId);
    if (!updated) {
      throw new NotFoundError('Notification not found');
    }

    return updated;
  },

  async markAllAsRead(userId: string): Promise<void> {
    await notificationRepository.markAllAsRead(userId);
  },

  async create(
    userId: string,
    type: NotificationType,
    title: string,
    body: string,
    data?: Record<string, unknown>
  ): Promise<Notification> {
    const createInput: Prisma.NotificationCreateInput = {
      user: { connect: { id: userId } },
      type,
      title,
      body,
      data: data as Prisma.InputJsonValue,
    };

    const notification = await notificationRepository.create(createInput);

    // Publish real-time event
    await eventService.publishNotification(userId, notification);

    return notification;
  },

  async createMany(
    userIds: string[],
    type: NotificationType,
    title: string,
    body: string,
    data?: Record<string, unknown>
  ): Promise<void> {
    if (userIds.length === 0) return;

    const notifications: Prisma.NotificationCreateManyInput[] = userIds.map((userId) => ({
      userId,
      type,
      title,
      body,
      data: data as Prisma.InputJsonValue,
    }));

    await notificationRepository.createMany(notifications);

    // Publish real-time events
    for (const userId of userIds) {
      await eventService.publishNotification(userId, { type, title, body, data });
    }
  },

  async notifyTeeTimeUpdate(
    userIds: string[],
    teeTime: TeeTimeWithRelations
  ): Promise<void> {
    await this.createMany(
      userIds,
      'TEE_TIME_REMINDER',
      'Tee Time Updated',
      `The tee time at ${teeTime.course.name} has been updated`,
      { teeTimeId: teeTime.id }
    );
  },

  async notifyTeeTimeCancelled(
    userIds: string[],
    teeTime: TeeTimeWithRelations
  ): Promise<void> {
    await this.createMany(
      userIds,
      'TEE_TIME_CANCELLED',
      'Tee Time Cancelled',
      `The tee time at ${teeTime.course.name} on ${teeTime.dateTime.toLocaleDateString()} has been cancelled`,
      { teeTimeId: teeTime.id }
    );
  },

  async notifySlotJoined(
    userIds: string[],
    teeTime: TeeTimeWithRelations,
    joinedUserId: string
  ): Promise<void> {
    const user = await userRepository.findById(joinedUserId);
    const userName = user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'Someone' : 'Someone';

    await this.createMany(
      userIds,
      'TEE_TIME_JOINED',
      'New Player Joined',
      `${userName} joined your tee time at ${teeTime.course.name}`,
      { teeTimeId: teeTime.id, userId: joinedUserId }
    );
  },

  async notifySlotLeft(
    userIds: string[],
    teeTime: TeeTimeWithRelations,
    leftUserId: string
  ): Promise<void> {
    const user = await userRepository.findById(leftUserId);
    const userName = user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'Someone' : 'Someone';

    await this.createMany(
      userIds,
      'TEE_TIME_LEFT',
      'Player Left',
      `${userName} left the tee time at ${teeTime.course.name}`,
      { teeTimeId: teeTime.id, userId: leftUserId }
    );
  },

  async notifyNewMessage(
    userIds: string[],
    teeTime: TeeTimeWithRelations,
    message: MessageWithSender
  ): Promise<void> {
    const senderName = `${message.sender.firstName ?? ''} ${message.sender.lastName ?? ''}`.trim() || 'Someone';

    await this.createMany(
      userIds,
      'NEW_MESSAGE',
      'New Message',
      `${senderName}: ${message.content.slice(0, 50)}${message.content.length > 50 ? '...' : ''}`,
      { teeTimeId: teeTime.id, messageId: message.id }
    );
  },

  async notifyMatchFound(
    userId: string,
    teeTime: TeeTimeWithRelations
  ): Promise<void> {
    await this.create(
      userId,
      'MATCH_FOUND',
      'Match Found!',
      `We found a tee time that matches your preferences at ${teeTime.course.name}`,
      { teeTimeId: teeTime.id }
    );
  },

  formatNotification(notification: Notification) {
    return {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      data: notification.data,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
    };
  },
};
