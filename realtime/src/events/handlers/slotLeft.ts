import { SlotLeftEvent } from '../eventTypes.js';
import { broadcastSlotLeft } from '../../websocket/broadcaster.js';
import { createLogger } from '../../utils/logger.js';
import { notificationQueue } from '../../jobs/queue.js';

const logger = createLogger('event-slot-left');

export async function handleSlotLeft(event: SlotLeftEvent): Promise<void> {
  const { payload, correlationId } = event;
  const { teeTimeId, userId, slotNumber, hostId, openSlots } = payload;

  logger.info(
    { teeTimeId, userId, slotNumber, openSlots },
    'Processing SLOT_LEFT event'
  );

  // 1. Broadcast to WebSocket clients
  broadcastSlotLeft(teeTimeId, userId, slotNumber, correlationId);

  // 2. Notify the host that someone left
  if (userId !== hostId) {
    await notificationQueue.add('slot-left', {
      type: 'SLOT_LEFT',
      recipientId: hostId,
      actorId: userId,
      teeTimeId,
      slotNumber,
      openSlots,
    });
  }

  // 3. If this was a previously full tee time, potentially re-notify matched users
  if (openSlots === 1) {
    logger.info({ teeTimeId }, 'Tee time has new opening, may trigger new match notifications');
    // Could add logic here to re-notify users who were previously matched
  }
}
