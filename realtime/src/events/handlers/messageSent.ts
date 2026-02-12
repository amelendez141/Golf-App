import { MessageSentEvent } from '../eventTypes.js';
import { broadcastMessage } from '../../websocket/broadcaster.js';
import { createLogger } from '../../utils/logger.js';
import { connectionManager } from '../../websocket/connectionManager.js';
import { notificationQueue } from '../../jobs/queue.js';

const logger = createLogger('event-message-sent');

export async function handleMessageSent(event: MessageSentEvent): Promise<void> {
  const { payload, correlationId } = event;
  const { messageId, teeTimeId, senderId, senderName, content, participantIds } = payload;

  logger.info(
    { messageId, teeTimeId, senderId, participantCount: participantIds.length },
    'Processing MESSAGE_SENT event'
  );

  // 1. Broadcast to WebSocket clients subscribed to this tee time
  broadcastMessage(
    teeTimeId,
    {
      id: messageId,
      senderId,
      content,
      createdAt: event.timestamp,
    },
    correlationId
  );

  // 2. For participants who are offline, queue push notifications
  const offlineParticipants = participantIds.filter(
    (userId) => userId !== senderId && !connectionManager.isUserOnline(userId)
  );

  for (const userId of offlineParticipants) {
    await notificationQueue.add('message-notification', {
      type: 'MESSAGE_RECEIVED',
      recipientId: userId,
      senderId,
      senderName,
      teeTimeId,
      messagePreview: content.substring(0, 100),
    });
  }

  logger.debug(
    {
      teeTimeId,
      onlineParticipants: participantIds.length - offlineParticipants.length - 1,
      offlineParticipants: offlineParticipants.length,
    },
    'Message notifications processed'
  );
}
