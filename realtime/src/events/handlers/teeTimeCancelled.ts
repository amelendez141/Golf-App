import { TeeTimeCancelledEvent } from '../eventTypes.js';
import { broadcastTeeTimeCancelled } from '../../websocket/broadcaster.js';
import { createLogger } from '../../utils/logger.js';
import { notificationQueue } from '../../jobs/queue.js';

const logger = createLogger('event-tee-time-cancelled');

export async function handleTeeTimeCancelled(event: TeeTimeCancelledEvent): Promise<void> {
  const { payload, correlationId } = event;
  const { teeTimeId, hostId, affectedUserIds, reason } = payload;

  logger.info(
    { teeTimeId, hostId, affectedUsers: affectedUserIds.length, reason },
    'Processing TEE_TIME_CANCELLED event'
  );

  // 1. Broadcast to WebSocket clients
  broadcastTeeTimeCancelled(teeTimeId, hostId, correlationId);

  // 2. Notify all affected users (those who had joined)
  for (const userId of affectedUserIds) {
    if (userId !== hostId) {
      await notificationQueue.add('tee-time-cancelled', {
        type: 'TEE_TIME_CANCELLED',
        recipientId: userId,
        teeTimeId,
        hostId,
        reason,
      });
    }
  }

  logger.info(
    { teeTimeId, notificationsQueued: affectedUserIds.filter((id) => id !== hostId).length },
    'Queued cancellation notifications'
  );
}
