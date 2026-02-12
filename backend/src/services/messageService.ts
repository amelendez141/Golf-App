import { messageRepository, type MessageWithSender } from '../repositories/messageRepository.js';
import { teeTimeService } from './teeTimeService.js';
import { teeTimeRepository } from '../repositories/teeTimeRepository.js';
import { notificationService } from './notificationService.js';
import { eventService } from './eventService.js';
import { ForbiddenError } from '../utils/errors.js';
import type { CreateMessageInput, ListMessagesInput } from '../validators/message.js';

export const messageService = {
  async list(
    teeTimeId: string,
    userId: string,
    params: ListMessagesInput
  ): Promise<{
    messages: MessageWithSender[];
    nextCursor: string | null;
    hasMore: boolean;
  }> {
    // Verify user is participant
    const isParticipant = await teeTimeService.isParticipant(teeTimeId, userId);
    if (!isParticipant) {
      throw new ForbiddenError('You must be a participant to view messages');
    }

    const { messages, hasMore } = await messageRepository.listByTeeTime(
      teeTimeId,
      params.cursor,
      params.limit
    );

    const lastMessage = messages[messages.length - 1];
    const nextCursor = hasMore && lastMessage ? lastMessage.id : null;

    return { messages, nextCursor, hasMore };
  },

  async create(
    teeTimeId: string,
    userId: string,
    data: CreateMessageInput
  ): Promise<MessageWithSender> {
    // Verify user is participant
    const isParticipant = await teeTimeService.isParticipant(teeTimeId, userId);
    if (!isParticipant) {
      throw new ForbiddenError('You must be a participant to send messages');
    }

    const message = await messageRepository.create({
      teeTime: { connect: { id: teeTimeId } },
      sender: { connect: { id: userId } },
      content: data.content,
    });

    // Notify other participants
    const participantIds = await teeTimeRepository.getParticipantIds(teeTimeId);
    const teeTime = await teeTimeService.getById(teeTimeId);

    await notificationService.notifyNewMessage(
      participantIds.filter((pid) => pid !== userId),
      teeTime,
      message
    );

    // Publish event
    await eventService.publishNewMessage(teeTimeId, message);

    return message;
  },

  formatMessage(message: MessageWithSender) {
    return {
      id: message.id,
      content: message.content,
      createdAt: message.createdAt,
      sender: message.sender,
    };
  },
};
