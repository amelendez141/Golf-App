import { subscriberClient, EVENTS_CHANNEL } from '../config/redis.js';
import { createLogger } from '../utils/logger.js';
import { metrics } from '../utils/metrics.js';
import { eventSchema, LinkUpEvent, EVENT_TYPES } from './eventTypes.js';
import { handleTeeTimeCreated } from './handlers/teeTimeCreated.js';
import { handleSlotJoined } from './handlers/slotJoined.js';
import { handleSlotLeft } from './handlers/slotLeft.js';
import { handleTeeTimeCancelled } from './handlers/teeTimeCancelled.js';
import { handleMessageSent } from './handlers/messageSent.js';
import { handleTeeTimeUpdated } from './handlers/teeTimeUpdated.js';

const logger = createLogger('event-subscriber');

let isSubscribed = false;

type EventHandler = (event: LinkUpEvent) => Promise<void>;

const eventHandlers: Record<string, EventHandler> = {
  [EVENT_TYPES.TEE_TIME_CREATED]: handleTeeTimeCreated as EventHandler,
  [EVENT_TYPES.SLOT_JOINED]: handleSlotJoined as EventHandler,
  [EVENT_TYPES.SLOT_LEFT]: handleSlotLeft as EventHandler,
  [EVENT_TYPES.TEE_TIME_CANCELLED]: handleTeeTimeCancelled as EventHandler,
  [EVENT_TYPES.MESSAGE_SENT]: handleMessageSent as EventHandler,
  [EVENT_TYPES.TEE_TIME_UPDATED]: handleTeeTimeUpdated as EventHandler,
};

async function handleEvent(message: string): Promise<void> {
  let event: unknown;

  try {
    event = JSON.parse(message);
  } catch {
    logger.error({ message: message.substring(0, 100) }, 'Failed to parse event JSON');
    metrics.eventError();
    return;
  }

  const result = eventSchema.safeParse(event);

  if (!result.success) {
    logger.error(
      { errors: result.error.errors, event: (event as { type?: string }).type },
      'Event validation failed'
    );
    metrics.eventError();
    return;
  }

  const validEvent = result.data;

  logger.info(
    {
      type: validEvent.type,
      correlationId: validEvent.correlationId,
    },
    'Processing event'
  );

  const handler = eventHandlers[validEvent.type];

  if (!handler) {
    logger.warn({ type: validEvent.type }, 'No handler for event type');
    return;
  }

  try {
    await handler(validEvent);
    metrics.eventProcessed();
    logger.debug({ type: validEvent.type }, 'Event processed successfully');
  } catch (error) {
    logger.error({ error, type: validEvent.type }, 'Event handler error');
    metrics.eventError();
  }
}

export async function startEventSubscriber(): Promise<void> {
  if (isSubscribed) {
    logger.warn('Event subscriber already started');
    return;
  }

  try {
    // Subscribe to the events channel
    await subscriberClient.subscribe(EVENTS_CHANNEL);
    isSubscribed = true;

    logger.info({ channel: EVENTS_CHANNEL }, 'Subscribed to events channel');

    // Handle incoming messages
    subscriberClient.on('message', (channel, message) => {
      if (channel === EVENTS_CHANNEL) {
        handleEvent(message).catch((error) => {
          logger.error({ error }, 'Unhandled error in event handler');
        });
      }
    });

    // Handle subscription errors
    subscriberClient.on('error', (error) => {
      logger.error({ error }, 'Redis subscriber error');
    });
  } catch (error) {
    logger.error({ error }, 'Failed to start event subscriber');
    throw error;
  }
}

export async function stopEventSubscriber(): Promise<void> {
  if (!isSubscribed) {
    return;
  }

  try {
    await subscriberClient.unsubscribe(EVENTS_CHANNEL);
    isSubscribed = false;
    logger.info('Event subscriber stopped');
  } catch (error) {
    logger.error({ error }, 'Error stopping event subscriber');
  }
}

export function isEventSubscriberRunning(): boolean {
  return isSubscribed;
}
