import { redisPub } from '../config/redis.js';
import { logger } from '../utils/logger.js';
import type { EventType, PubSubEvent } from '../types/index.js';
import type { TeeTimeWithRelations } from '../repositories/teeTimeRepository.js';
import type { MessageWithSender } from '../repositories/messageRepository.js';

function createEvent(type: EventType, payload: Record<string, unknown>): PubSubEvent {
  return {
    type,
    payload,
    timestamp: new Date().toISOString(),
  };
}

async function publish(channel: string, event: PubSubEvent): Promise<void> {
  // Skip if Redis is not configured
  if (!redisPub) {
    logger.debug(`Skipping publish to ${channel} (Redis not configured):`, { type: event.type });
    return;
  }

  try {
    await redisPub.publish(channel, JSON.stringify(event));
    logger.debug(`Published event to ${channel}:`, { type: event.type });
  } catch (error) {
    logger.error('Failed to publish event:', error);
  }
}

export const eventService = {
  // Tee time channels
  getTeeTimeChannel(teeTimeId: string): string {
    return `tee-time:${teeTimeId}`;
  },

  getUserChannel(userId: string): string {
    return `user:${userId}`;
  },

  async publishTeeTimeUpdate(
    teeTimeId: string,
    teeTime: TeeTimeWithRelations
  ): Promise<void> {
    const event = createEvent('TEE_TIME_UPDATED', {
      teeTimeId,
      status: teeTime.status,
      dateTime: teeTime.dateTime,
      totalSlots: teeTime.totalSlots,
      filledSlots: teeTime.slots.filter((s) => s.userId !== null).length,
    });

    await publish(this.getTeeTimeChannel(teeTimeId), event);
  },

  async publishSlotJoined(teeTimeId: string, userId: string): Promise<void> {
    const event = createEvent('SLOT_JOINED', {
      teeTimeId,
      userId,
    });

    await publish(this.getTeeTimeChannel(teeTimeId), event);
  },

  async publishSlotLeft(teeTimeId: string, userId: string): Promise<void> {
    const event = createEvent('SLOT_LEFT', {
      teeTimeId,
      userId,
    });

    await publish(this.getTeeTimeChannel(teeTimeId), event);
  },

  async publishNewMessage(
    teeTimeId: string,
    message: MessageWithSender
  ): Promise<void> {
    const event = createEvent('NEW_MESSAGE', {
      teeTimeId,
      messageId: message.id,
      senderId: message.senderId,
      senderName: `${message.sender.firstName ?? ''} ${message.sender.lastName ?? ''}`.trim(),
      content: message.content,
      createdAt: message.createdAt,
    });

    await publish(this.getTeeTimeChannel(teeTimeId), event);
  },

  async publishNotification(
    userId: string,
    notification: { type: string; title: string; body: string; id?: string; data?: unknown }
  ): Promise<void> {
    const event = createEvent('NOTIFICATION', {
      notificationId: notification.id,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      data: notification.data,
    });

    await publish(this.getUserChannel(userId), event);
  },
};
