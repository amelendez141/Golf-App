import { Webhook } from 'svix';
import { env, isClerkConfigured } from '../config/env.js';
import { userService } from './userService.js';
import { logger } from '../utils/logger.js';
import { BadRequestError } from '../utils/errors.js';

interface ClerkUserEvent {
  data: {
    id: string;
    email_addresses: Array<{ email_address: string }>;
    first_name: string | null;
    last_name: string | null;
    image_url: string | null;
  };
  type: string;
}

// Check if webhook verification is available
const webhooksEnabled = isClerkConfigured();

if (!webhooksEnabled) {
  logger.info('Clerk webhooks disabled - webhook secret not configured');
  logger.info('In production, set CLERK_WEBHOOK_SECRET to enable user sync from Clerk');
}

export const webhookService = {
  /**
   * Verify a Clerk webhook signature
   * In demo mode (no webhook secret), this will reject all webhooks
   */
  async verifyClerkWebhook(
    payload: string,
    headers: {
      'svix-id'?: string;
      'svix-timestamp'?: string;
      'svix-signature'?: string;
    }
  ): Promise<ClerkUserEvent> {
    // If webhooks are not configured, reject the request
    if (!webhooksEnabled) {
      logger.warn('Webhook received but Clerk webhook secret is not configured');
      throw new BadRequestError(
        'Webhooks are not configured. Set CLERK_WEBHOOK_SECRET to enable.'
      );
    }

    const wh = new Webhook(env.CLERK_WEBHOOK_SECRET);

    const svixId = headers['svix-id'];
    const svixTimestamp = headers['svix-timestamp'];
    const svixSignature = headers['svix-signature'];

    if (!svixId || !svixTimestamp || !svixSignature) {
      throw new BadRequestError('Missing svix headers');
    }

    try {
      return wh.verify(payload, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as ClerkUserEvent;
    } catch (error) {
      logger.error('Webhook verification failed:', error);
      throw new BadRequestError('Invalid webhook signature');
    }
  },

  /**
   * Handle Clerk user events (created, updated, deleted)
   * Syncs user data from Clerk to the local database
   */
  async handleClerkEvent(event: ClerkUserEvent): Promise<void> {
    const { type, data } = event;

    logger.info(`Processing Clerk webhook: ${type}`, { clerkId: data.id });

    switch (type) {
      case 'user.created':
      case 'user.updated': {
        const primaryEmail = data.email_addresses[0]?.email_address;

        if (!primaryEmail) {
          logger.warn('User has no email address', { clerkId: data.id });
          return;
        }

        await userService.syncFromClerk(
          data.id,
          primaryEmail,
          data.first_name,
          data.last_name,
          data.image_url
        );

        logger.info(`User synced: ${data.id}`);
        break;
      }

      case 'user.deleted': {
        try {
          await userService.deleteByClerkId(data.id);
          logger.info(`User deleted: ${data.id}`);
        } catch (error) {
          // User might not exist in our database
          logger.warn(`Failed to delete user ${data.id}:`, error);
        }
        break;
      }

      default:
        logger.debug(`Unhandled webhook type: ${type}`);
    }
  },

  /**
   * Check if webhooks are enabled
   */
  isEnabled(): boolean {
    return webhooksEnabled;
  },
};
