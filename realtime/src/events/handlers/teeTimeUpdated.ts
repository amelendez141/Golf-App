import { TeeTimeUpdatedEvent } from '../eventTypes.js';
import { broadcastTeeTimeUpdated } from '../../websocket/broadcaster.js';
import { createLogger } from '../../utils/logger.js';
import { notificationQueue } from '../../jobs/queue.js';

const logger = createLogger('event-tee-time-updated');

// Fields that warrant notifying participants
const SIGNIFICANT_FIELDS = ['dateTime', 'courseId', 'pricePerPerson', 'notes'];

export async function handleTeeTimeUpdated(event: TeeTimeUpdatedEvent): Promise<void> {
  const { payload, correlationId } = event;
  const { teeTimeId, hostId, changes, participantIds } = payload;

  logger.info(
    { teeTimeId, hostId, changedFields: Object.keys(changes) },
    'Processing TEE_TIME_UPDATED event'
  );

  // 1. Broadcast to WebSocket clients
  broadcastTeeTimeUpdated(teeTimeId, changes, correlationId);

  // 2. Check if changes are significant enough to notify participants
  const significantChanges = Object.keys(changes).filter((key) =>
    SIGNIFICANT_FIELDS.includes(key)
  );

  if (significantChanges.length > 0) {
    // Notify participants (excluding the host who made the change)
    const recipientIds = participantIds.filter((id) => id !== hostId);

    for (const userId of recipientIds) {
      await notificationQueue.add('tee-time-updated', {
        type: 'TEE_TIME_UPDATED',
        recipientId: userId,
        teeTimeId,
        hostId,
        changes: Object.fromEntries(
          Object.entries(changes).filter(([key]) => significantChanges.includes(key))
        ),
      });
    }

    logger.info(
      { teeTimeId, significantChanges, notifiedUsers: recipientIds.length },
      'Queued update notifications for significant changes'
    );
  }
}
