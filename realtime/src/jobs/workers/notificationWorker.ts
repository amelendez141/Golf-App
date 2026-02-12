import { Worker, Job } from 'bullmq';
import { prisma } from '../../config/database.js';
import { createLogger } from '../../utils/logger.js';
import { metrics } from '../../utils/metrics.js';
import { sendPushNotification } from '../../notifications/push.js';
import { sendEmail } from '../../notifications/email.js';
import { createInAppNotification } from '../../notifications/inApp.js';
import {
  newMatchPushNotification,
  newMatchEmail,
  newMatchInAppNotification,
} from '../../notifications/templates/newMatch.js';
import {
  slotFilledPushNotification,
  slotFilledEmail,
  slotFilledInAppNotification,
} from '../../notifications/templates/slotFilled.js';
import {
  welcomePushNotification,
  welcomeEmail,
  welcomeInAppNotification,
} from '../../notifications/templates/welcome.js';

const logger = createLogger('notification-worker');

const connection = {
  host: new URL(process.env.REDIS_URL || 'redis://localhost:6379').hostname,
  port: parseInt(new URL(process.env.REDIS_URL || 'redis://localhost:6379').port || '6379'),
};

async function processNotificationJob(job: Job): Promise<void> {
  const { type, ...data } = job.data;

  logger.info({ jobId: job.id, type }, 'Processing notification job');

  try {
    switch (type) {
      case 'NEW_MATCH':
        await handleNewMatchNotification(data);
        break;

      case 'SLOT_JOINED':
        await handleSlotJoinedNotification(data);
        break;

      case 'SLOT_LEFT':
        await handleSlotLeftNotification(data);
        break;

      case 'SLOT_FILLED':
        await handleSlotFilledNotification(data);
        break;

      case 'TEE_TIME_CANCELLED':
        await handleTeeTimeCancelledNotification(data);
        break;

      case 'TEE_TIME_UPDATED':
        await handleTeeTimeUpdatedNotification(data);
        break;

      case 'MESSAGE_RECEIVED':
        await handleMessageNotification(data);
        break;

      case 'WELCOME':
        await handleWelcomeNotification(data);
        break;

      default:
        logger.warn({ type }, 'Unknown notification type');
    }

    metrics.jobProcessed();
  } catch (error) {
    logger.error({ error, jobId: job.id, type }, 'Notification job failed');
    metrics.jobFailed();
    throw error;
  }
}

async function handleNewMatchNotification(data: any): Promise<void> {
  const { userId, teeTimeId, score, reasons } = data;

  // Fetch user and tee time details
  const [user, teeTime] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.teeTime.findUnique({
      where: { id: teeTimeId },
      include: {
        course: true,
        host: true,
      },
    }),
  ]);

  if (!user || !teeTime) {
    logger.warn({ userId, teeTimeId }, 'User or tee time not found for notification');
    return;
  }

  const filledSlots = await prisma.teeTimeSlot.count({
    where: { teeTimeId, status: 'FILLED' },
  });

  const notificationData = {
    userId: user.id,
    userEmail: user.email,
    userName: user.firstName,
    teeTime: {
      id: teeTime.id,
      dateTime: teeTime.dateTime,
      courseName: teeTime.course.name,
      hostName: `${teeTime.host.firstName} ${teeTime.host.lastName}`,
      openSlots: teeTime.totalSlots - filledSlots,
      matchScore: score,
      matchReasons: reasons,
    },
  };

  // Send all notification types
  await Promise.all([
    sendPushNotification(userId, newMatchPushNotification(notificationData)),
    sendEmail(newMatchEmail(notificationData)),
    createInAppNotification(newMatchInAppNotification(notificationData)),
  ]);
}

async function handleSlotJoinedNotification(data: any): Promise<void> {
  const { recipientId, actorId, teeTimeId, slotNumber } = data;

  const [recipient, actor, teeTime] = await Promise.all([
    prisma.user.findUnique({ where: { id: recipientId } }),
    prisma.user.findUnique({ where: { id: actorId } }),
    prisma.teeTime.findUnique({
      where: { id: teeTimeId },
      include: { course: true },
    }),
  ]);

  if (!recipient || !actor || !teeTime) return;

  await createInAppNotification({
    userId: recipientId,
    type: 'SLOT_JOINED',
    title: 'New Player Joined',
    body: `${actor.firstName} ${actor.lastName} joined your tee time at ${teeTime.course.name}`,
    data: {
      teeTimeId,
      actorId,
      actorName: `${actor.firstName} ${actor.lastName}`,
      slotNumber,
    },
  });
}

async function handleSlotLeftNotification(data: any): Promise<void> {
  const { recipientId, actorId, teeTimeId, slotNumber, openSlots } = data;

  const [recipient, actor, teeTime] = await Promise.all([
    prisma.user.findUnique({ where: { id: recipientId } }),
    prisma.user.findUnique({ where: { id: actorId } }),
    prisma.teeTime.findUnique({
      where: { id: teeTimeId },
      include: { course: true },
    }),
  ]);

  if (!recipient || !actor || !teeTime) return;

  await createInAppNotification({
    userId: recipientId,
    type: 'SLOT_LEFT',
    title: 'Player Left',
    body: `${actor.firstName} ${actor.lastName} left your tee time at ${teeTime.course.name}. ${openSlots} spot${openSlots > 1 ? 's' : ''} now available.`,
    data: {
      teeTimeId,
      actorId,
      actorName: `${actor.firstName} ${actor.lastName}`,
      slotNumber,
      openSlots,
    },
  });
}

async function handleSlotFilledNotification(data: any): Promise<void> {
  const { teeTimeId, notifyHost } = data;

  const teeTime = await prisma.teeTime.findUnique({
    where: { id: teeTimeId },
    include: {
      course: true,
      host: true,
      slots: {
        where: { status: 'FILLED' },
        include: { user: true },
      },
    },
  });

  if (!teeTime) return;

  const participants = teeTime.slots
    .filter((s) => s.user)
    .map((s) => ({
      id: s.user!.id,
      name: `${s.user!.firstName} ${s.user!.lastName}`,
      email: s.user!.email,
      company: s.user!.company,
      industry: s.user!.industry,
    }));

  for (const participant of participants) {
    const notificationData = {
      userId: participant.id,
      userEmail: participant.email,
      userName: participant.name.split(' ')[0] || '',
      teeTime: {
        id: teeTime.id,
        dateTime: teeTime.dateTime,
        courseName: teeTime.course.name,
        totalSlots: teeTime.totalSlots,
      },
      participants: participants.map((p) => ({
        name: p.name,
        company: p.company,
        industry: p.industry,
      })),
      isHost: participant.id === teeTime.hostId,
    };

    await Promise.all([
      sendPushNotification(participant.id, slotFilledPushNotification(notificationData)),
      sendEmail(slotFilledEmail(notificationData)),
      createInAppNotification(slotFilledInAppNotification(notificationData)),
    ]);
  }
}

async function handleTeeTimeCancelledNotification(data: any): Promise<void> {
  const { recipientId, teeTimeId, hostId, reason } = data;

  const [recipient, host, teeTime] = await Promise.all([
    prisma.user.findUnique({ where: { id: recipientId } }),
    prisma.user.findUnique({ where: { id: hostId } }),
    prisma.teeTime.findUnique({
      where: { id: teeTimeId },
      include: { course: true },
    }),
  ]);

  if (!recipient || !host || !teeTime) return;

  await Promise.all([
    sendPushNotification(recipientId, {
      title: 'Tee Time Cancelled',
      body: `${host.firstName} cancelled the tee time at ${teeTime.course.name}`,
      icon: '/icons/cancelled.png',
      data: { type: 'TEE_TIME_CANCELLED', teeTimeId },
    }),
    createInAppNotification({
      userId: recipientId,
      type: 'TEE_TIME_CANCELLED',
      title: 'Tee Time Cancelled',
      body: `${host.firstName} ${host.lastName} cancelled the tee time at ${teeTime.course.name}${reason ? `: ${reason}` : ''}`,
      data: { teeTimeId, hostId, reason },
    }),
  ]);
}

async function handleTeeTimeUpdatedNotification(data: any): Promise<void> {
  const { recipientId, teeTimeId, hostId, changes } = data;

  const teeTime = await prisma.teeTime.findUnique({
    where: { id: teeTimeId },
    include: { course: true, host: true },
  });

  if (!teeTime) return;

  const changeDescriptions: string[] = [];
  if (changes.dateTime) changeDescriptions.push('time changed');
  if (changes.courseId) changeDescriptions.push('course changed');
  if (changes.pricePerPerson !== undefined) changeDescriptions.push('price updated');

  await createInAppNotification({
    userId: recipientId,
    type: 'TEE_TIME_UPDATED',
    title: 'Tee Time Updated',
    body: `${teeTime.host.firstName} updated the tee time: ${changeDescriptions.join(', ')}`,
    data: { teeTimeId, changes },
  });
}

async function handleMessageNotification(data: any): Promise<void> {
  const { recipientId, senderId, senderName, teeTimeId, messagePreview } = data;

  await sendPushNotification(recipientId, {
    title: `Message from ${senderName}`,
    body: messagePreview,
    icon: '/icons/message.png',
    tag: `message-${teeTimeId}`,
    data: {
      type: 'MESSAGE_RECEIVED',
      teeTimeId,
      senderId,
      url: `/tee-times/${teeTimeId}/chat`,
    },
  });
}

async function handleWelcomeNotification(data: any): Promise<void> {
  const { userId } = data;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const notificationData = {
    userId: user.id,
    userEmail: user.email,
    userName: user.firstName,
    industry: user.industry,
  };

  await Promise.all([
    sendPushNotification(userId, welcomePushNotification(notificationData)),
    sendEmail(welcomeEmail(notificationData)),
    createInAppNotification(welcomeInAppNotification(notificationData)),
  ]);
}

let worker: Worker | null = null;

export function startNotificationWorker(): Worker {
  worker = new Worker('notifications', processNotificationJob, {
    connection,
    concurrency: 5,
  });

  worker.on('completed', (job) => {
    logger.debug({ jobId: job.id }, 'Notification job completed');
  });

  worker.on('failed', (job, error) => {
    logger.error({ jobId: job?.id, error: error.message }, 'Notification job failed');
  });

  logger.info('Notification worker started');

  return worker;
}

export async function stopNotificationWorker(): Promise<void> {
  if (worker) {
    await worker.close();
    worker = null;
    logger.info('Notification worker stopped');
  }
}
