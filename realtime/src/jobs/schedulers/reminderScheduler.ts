import cron from 'node-cron';
import { addHours, isAfter, isBefore } from 'date-fns';
import { prisma } from '../../config/database.js';
import { createLogger } from '../../utils/logger.js';
import { reminderQueue } from '../queue.js';

const logger = createLogger('reminder-scheduler');

let reminderTask: cron.ScheduledTask | null = null;

export function startReminderScheduler(): void {
  // Run every hour at minute 0
  reminderTask = cron.schedule('0 * * * *', async () => {
    logger.info('Running hourly reminder check');

    try {
      await scheduleReminders();
    } catch (error) {
      logger.error({ error }, 'Failed to schedule reminders');
    }
  });

  logger.info('Reminder scheduler started (runs every hour)');
}

export function stopReminderScheduler(): void {
  if (reminderTask) {
    reminderTask.stop();
    reminderTask = null;
    logger.info('Reminder scheduler stopped');
  }
}

async function scheduleReminders(): Promise<void> {
  const now = new Date();

  // Find tee times in the next 24 hours and 2 hours
  const in24Hours = addHours(now, 24);
  const in25Hours = addHours(now, 25); // 1 hour window for 24h reminder
  const in2Hours = addHours(now, 2);
  const in3Hours = addHours(now, 3); // 1 hour window for 2h reminder

  // Find tee times for 24-hour reminder (23-25 hours from now)
  const teeTimes24h = await prisma.teeTime.findMany({
    where: {
      status: { in: ['OPEN', 'FULL'] },
      dateTime: {
        gte: in24Hours,
        lt: in25Hours,
      },
    },
    select: { id: true, dateTime: true },
  });

  // Find tee times for 2-hour reminder (2-3 hours from now)
  const teeTimes2h = await prisma.teeTime.findMany({
    where: {
      status: { in: ['OPEN', 'FULL'] },
      dateTime: {
        gte: in2Hours,
        lt: in3Hours,
      },
    },
    select: { id: true, dateTime: true },
  });

  logger.info({
    reminder24h: teeTimes24h.length,
    reminder2h: teeTimes2h.length,
  }, 'Found tee times needing reminders');

  // Queue 24-hour reminders
  for (const teeTime of teeTimes24h) {
    const jobId = `reminder-24h-${teeTime.id}`;

    // Check if already queued (prevent duplicates)
    const existingJob = await reminderQueue.getJob(jobId);
    if (!existingJob) {
      await reminderQueue.add(
        jobId,
        {
          type: 'TEE_TIME_REMINDER',
          teeTimeId: teeTime.id,
          hoursUntil: 24,
        },
        { jobId }
      );
      logger.debug({ teeTimeId: teeTime.id }, 'Queued 24h reminder');
    }
  }

  // Queue 2-hour reminders
  for (const teeTime of teeTimes2h) {
    const jobId = `reminder-2h-${teeTime.id}`;

    const existingJob = await reminderQueue.getJob(jobId);
    if (!existingJob) {
      await reminderQueue.add(
        jobId,
        {
          type: 'TEE_TIME_REMINDER',
          teeTimeId: teeTime.id,
          hoursUntil: 2,
        },
        { jobId }
      );
      logger.debug({ teeTimeId: teeTime.id }, 'Queued 2h reminder');
    }
  }
}

// Run initial check on startup
export async function runInitialReminderCheck(): Promise<void> {
  logger.info('Running initial reminder check');
  await scheduleReminders();
}
