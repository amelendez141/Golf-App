import { TeeTimeCreatedEvent } from '../eventTypes.js';
import { broadcastTeeTimeCreated } from '../../websocket/broadcaster.js';
import { createLogger } from '../../utils/logger.js';
import { matchingEngine } from '../../matching/engine.js';
import { notificationQueue } from '../../jobs/queue.js';

const logger = createLogger('event-tee-time-created');

export async function handleTeeTimeCreated(event: TeeTimeCreatedEvent): Promise<void> {
  const { payload, correlationId } = event;
  const { teeTimeId, hostId, industryPreference, courseId } = payload;

  logger.info({ teeTimeId, hostId, industryPreference }, 'Processing TEE_TIME_CREATED event');

  // 1. Broadcast to WebSocket clients
  broadcastTeeTimeCreated(
    {
      id: teeTimeId,
      hostId,
      industryPreference,
      courseId,
    },
    correlationId
  );

  // 2. Find potential matches and queue notifications
  try {
    const matches = await matchingEngine.findMatchesForTeeTime(teeTimeId, {
      limit: 20,
      minScore: 50,
    });

    logger.info(
      { teeTimeId, matchCount: matches.length },
      'Found potential matches for new tee time'
    );

    // Queue notifications for matched users
    for (const match of matches) {
      await notificationQueue.add('new-match', {
        type: 'NEW_MATCH',
        userId: match.userId,
        teeTimeId,
        score: match.score,
        reasons: match.reasons,
      });
    }
  } catch (error) {
    logger.error({ error, teeTimeId }, 'Failed to process matches for new tee time');
    // Don't throw - the broadcast already succeeded
  }
}
