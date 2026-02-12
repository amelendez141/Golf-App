import { Worker, Job } from 'bullmq';
import { prisma } from '../../config/database.js';
import { createLogger } from '../../utils/logger.js';
import { metrics } from '../../utils/metrics.js';
import { sendPushNotification } from '../../notifications/push.js';
import { sendEmail } from '../../notifications/email.js';
import { createInAppNotification } from '../../notifications/inApp.js';
import {
  reminderPushNotification,
  reminderEmail,
  reminderInAppNotification,
} from '../../notifications/templates/reminder.js';

const logger = createLogger('reminder-worker');

const connection = {
  host: new URL(process.env.REDIS_URL || 'redis://localhost:6379').hostname,
  port: parseInt(new URL(process.env.REDIS_URL || 'redis://localhost:6379').port || '6379'),
};

async function processReminderJob(job: Job): Promise<void> {
  const { type, ...data } = job.data;

  logger.info({ jobId: job.id, type }, 'Processing reminder job');

  try {
    switch (type) {
      case 'TEE_TIME_REMINDER':
        await handleTeeTimeReminder(data);
        break;

      case 'WEEKLY_DIGEST':
        await handleWeeklyDigest(data);
        break;

      default:
        logger.warn({ type }, 'Unknown reminder job type');
    }

    metrics.jobProcessed();
  } catch (error) {
    logger.error({ error, jobId: job.id, type }, 'Reminder job failed');
    metrics.jobFailed();
    throw error;
  }
}

async function handleTeeTimeReminder(data: any): Promise<void> {
  const { teeTimeId, hoursUntil } = data;

  // Fetch tee time with all participants
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

  if (!teeTime || teeTime.status === 'CANCELLED') {
    logger.debug({ teeTimeId }, 'Skipping reminder for cancelled/missing tee time');
    return;
  }

  const participants = teeTime.slots
    .filter((s) => s.user)
    .map((s) => ({
      id: s.user!.id,
      name: `${s.user!.firstName} ${s.user!.lastName}`,
      email: s.user!.email,
      company: s.user!.company,
    }));

  // Send reminder to each participant
  for (const participant of participants) {
    const reminderData = {
      userId: participant.id,
      userEmail: participant.email,
      userName: participant.name.split(' ')[0] || '',
      teeTime: {
        id: teeTime.id,
        dateTime: teeTime.dateTime,
        courseName: teeTime.course.name,
        courseAddress: `${teeTime.course.address || ''}, ${teeTime.course.city}, ${teeTime.course.state || ''} ${teeTime.course.country}`.trim(),
      },
      participants: participants.filter((p) => p.id !== participant.id).map((p) => ({
        name: p.name,
        company: p.company,
      })),
      hoursUntil,
      isHost: participant.id === teeTime.hostId,
    };

    // For 24h reminder, send email
    // For 2h reminder, send push notification
    const notifications: Promise<any>[] = [
      createInAppNotification(reminderInAppNotification(reminderData)),
      sendPushNotification(participant.id, reminderPushNotification(reminderData)),
    ];

    if (hoursUntil >= 24) {
      notifications.push(sendEmail(reminderEmail(reminderData)));
    }

    await Promise.all(notifications);
  }

  logger.info(
    { teeTimeId, hoursUntil, participantCount: participants.length },
    'Sent tee time reminders'
  );
}

async function handleWeeklyDigest(data: any): Promise<void> {
  const { userId } = data;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  // Get user's upcoming tee times
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const upcomingTeeTimes = await prisma.teeTime.findMany({
    where: {
      slots: {
        some: {
          userId,
          status: 'FILLED',
        },
      },
      dateTime: {
        gte: now,
        lte: nextWeek,
      },
      status: { in: ['OPEN', 'FULL'] },
    },
    include: {
      course: true,
      host: true,
    },
    orderBy: { dateTime: 'asc' },
  });

  // Get recommended tee times
  const recommendations = await prisma.teeTime.findMany({
    where: {
      status: 'OPEN',
      dateTime: { gte: now, lte: nextWeek },
      hostId: { not: userId },
      slots: {
        some: { status: 'OPEN' },
      },
    },
    include: {
      course: true,
      host: true,
    },
    take: 5,
    orderBy: { dateTime: 'asc' },
  });

  if (upcomingTeeTimes.length === 0 && recommendations.length === 0) {
    logger.debug({ userId }, 'Skipping digest - no content');
    return;
  }

  // Create digest notification
  await createInAppNotification({
    userId,
    type: 'NEW_MATCH',
    title: 'Your Weekly Golf Digest',
    body: upcomingTeeTimes.length > 0
      ? `You have ${upcomingTeeTimes.length} tee time${upcomingTeeTimes.length > 1 ? 's' : ''} this week!`
      : `We found ${recommendations.length} tee times that match your preferences`,
    data: {
      upcomingTeeTimes: upcomingTeeTimes.map((t) => ({
        id: t.id,
        courseName: t.course.name,
        dateTime: t.dateTime.toISOString(),
      })),
      recommendations: recommendations.map((t) => ({
        id: t.id,
        courseName: t.course.name,
        dateTime: t.dateTime.toISOString(),
      })),
    },
  });

  logger.info(
    { userId, upcoming: upcomingTeeTimes.length, recommendations: recommendations.length },
    'Sent weekly digest'
  );
}

let worker: Worker | null = null;

export function startReminderWorker(): Worker {
  worker = new Worker('reminders', processReminderJob, {
    connection,
    concurrency: 5,
  });

  worker.on('completed', (job) => {
    logger.debug({ jobId: job.id }, 'Reminder job completed');
  });

  worker.on('failed', (job, error) => {
    logger.error({ jobId: job?.id, error: error.message }, 'Reminder job failed');
  });

  logger.info('Reminder worker started');

  return worker;
}

export async function stopReminderWorker(): Promise<void> {
  if (worker) {
    await worker.close();
    worker = null;
    logger.info('Reminder worker stopped');
  }
}
