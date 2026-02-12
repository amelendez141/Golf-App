import { SlotJoinedEvent } from '../eventTypes.js';
import { broadcastSlotJoined } from '../../websocket/broadcaster.js';
import { createLogger } from '../../utils/logger.js';
import { notificationQueue } from '../../jobs/queue.js';

const logger = createLogger('event-slot-joined');

export async function handleSlotJoined(event: SlotJoinedEvent): Promise<void> {
  const { payload, correlationId } = event;
  const { teeTimeId, userId, slotNumber, hostId, remainingSlots } = payload;

  logger.info(
    { teeTimeId, userId, slotNumber, remainingSlots },
    'Processing SLOT_JOINED event'
  );

  // 1. Broadcast to WebSocket clients
  broadcastSlotJoined(teeTimeId, userId, slotNumber, correlationId);

  // 2. Notify the host that someone joined
  if (userId !== hostId) {
    await notificationQueue.add('slot-joined', {
      type: 'SLOT_JOINED',
      recipientId: hostId,
      actorId: userId,
      teeTimeId,
      slotNumber,
    });
  }

  // 3. If tee time is now full, notify all participants
  if (remainingSlots === 0) {
    await notificationQueue.add('slot-filled', {
      type: 'SLOT_FILLED',
      teeTimeId,
      notifyHost: true,
    });
  }
}
