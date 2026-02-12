import webpush from 'web-push';
import { env } from '../config/env.js';
import { prisma } from '../config/database.js';
import { createLogger } from '../utils/logger.js';
import { metrics } from '../utils/metrics.js';

const logger = createLogger('push-notifications');

// Configure web-push with VAPID keys
webpush.setVapidDetails(
  env.VAPID_SUBJECT,
  env.VAPID_PUBLIC_KEY,
  env.VAPID_PRIVATE_KEY
);

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

export async function sendPushNotification(
  userId: string,
  payload: PushNotificationPayload
): Promise<{ success: number; failed: number }> {
  // Get all push subscriptions for this user
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  });

  if (subscriptions.length === 0) {
    logger.debug({ userId }, 'No push subscriptions for user');
    return { success: 0, failed: 0 };
  }

  const notificationPayload = JSON.stringify({
    ...payload,
    timestamp: Date.now(),
  });

  let success = 0;
  let failed = 0;
  const expiredSubscriptionIds: string[] = [];

  for (const subscription of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
        },
        notificationPayload,
        {
          TTL: 86400, // 24 hours
          urgency: 'normal',
        }
      );

      success++;
      metrics.pushNotificationSent();
    } catch (error: any) {
      failed++;

      // Handle expired/invalid subscriptions
      if (error.statusCode === 404 || error.statusCode === 410) {
        logger.info({ subscriptionId: subscription.id }, 'Removing expired push subscription');
        expiredSubscriptionIds.push(subscription.id);
      } else {
        logger.error(
          { error: error.message, statusCode: error.statusCode, userId },
          'Failed to send push notification'
        );
      }
    }
  }

  // Clean up expired subscriptions
  if (expiredSubscriptionIds.length > 0) {
    await prisma.pushSubscription.deleteMany({
      where: { id: { in: expiredSubscriptionIds } },
    });
  }

  logger.info({ userId, success, failed }, 'Push notification batch completed');

  return { success, failed };
}

export async function sendPushToMultipleUsers(
  userIds: string[],
  payload: PushNotificationPayload
): Promise<{ totalSuccess: number; totalFailed: number }> {
  let totalSuccess = 0;
  let totalFailed = 0;

  for (const userId of userIds) {
    const { success, failed } = await sendPushNotification(userId, payload);
    totalSuccess += success;
    totalFailed += failed;
  }

  return { totalSuccess, totalFailed };
}

// Register a new push subscription
export async function registerPushSubscription(
  userId: string,
  subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  }
): Promise<void> {
  await prisma.pushSubscription.upsert({
    where: { endpoint: subscription.endpoint },
    create: {
      userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
    update: {
      userId,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
  });

  logger.info({ userId }, 'Push subscription registered');
}

// Unregister a push subscription
export async function unregisterPushSubscription(endpoint: string): Promise<void> {
  await prisma.pushSubscription.deleteMany({
    where: { endpoint },
  });

  logger.info({ endpoint: endpoint.substring(0, 50) }, 'Push subscription unregistered');
}
