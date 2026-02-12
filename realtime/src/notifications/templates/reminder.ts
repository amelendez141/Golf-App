import { format } from 'date-fns';
import { PushNotificationPayload } from '../push.js';
import { EmailOptions } from '../email.js';
import { InAppNotificationData } from '../inApp.js';

interface ReminderData {
  userId: string;
  userEmail: string;
  userName: string;
  teeTime: {
    id: string;
    dateTime: Date;
    courseName: string;
    courseAddress: string;
  };
  participants: Array<{
    name: string;
    company?: string;
  }>;
  hoursUntil: number;
  isHost: boolean;
}

export function reminderPushNotification(data: ReminderData): PushNotificationPayload {
  const { teeTime, hoursUntil } = data;
  const timeStr = format(teeTime.dateTime, 'h:mm a');

  const timeLabel = hoursUntil <= 2
    ? 'in 2 hours'
    : hoursUntil <= 24
      ? 'tomorrow'
      : 'coming up';

  return {
    title: `Tee Time Reminder`,
    body: `${teeTime.courseName} at ${timeStr} - ${timeLabel}`,
    icon: '/icons/golf-clock.png',
    badge: '/icons/badge.png',
    tag: `reminder-${teeTime.id}-${hoursUntil}h`,
    data: {
      type: 'TEE_TIME_REMINDER',
      teeTimeId: teeTime.id,
      url: `/tee-times/${teeTime.id}`,
    },
    actions: [
      { action: 'directions', title: 'Get Directions' },
      { action: 'chat', title: 'Message Group' },
    ],
  };
}

export function reminderEmail(data: ReminderData): EmailOptions {
  const { userEmail, userName, teeTime, participants, hoursUntil, isHost } = data;
  const dateStr = format(teeTime.dateTime, 'EEEE, MMMM d, yyyy');
  const timeStr = format(teeTime.dateTime, 'h:mm a');

  const timeLabel = hoursUntil <= 2
    ? '2 hours'
    : hoursUntil <= 24
      ? '24 hours'
      : `${Math.round(hoursUntil / 24)} days`;

  const participantsList = participants.map((p) => `• ${p.name}${p.company ? ` (${p.company})` : ''}`).join('\n');

  const text = `Hi ${userName},

This is a reminder that your tee time is in ${timeLabel}!

${teeTime.courseName}
${dateStr} at ${timeStr}

Course Address:
${teeTime.courseAddress}

Your Group:
${participantsList}

Get directions: https://maps.google.com/?q=${encodeURIComponent(teeTime.courseAddress)}

Message your group: https://linkupgolf.com/tee-times/${teeTime.id}/chat

Have a great round!
The LinkUp Golf Team`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1a472a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; }
    .countdown { background: #fff3e0; padding: 15px; border-radius: 8px; text-align: center; margin: 15px 0; }
    .countdown-number { font-size: 32px; font-weight: bold; color: #e65100; }
    .info-card { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .cta-button { display: inline-block; background: #2e7d32; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 5px; }
    .cta-secondary { background: #1976d2; }
    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Tee Time Reminder</h1>
    </div>
    <div class="content">
      <p>Hi ${userName},</p>

      <div class="countdown">
        <div class="countdown-number">${timeLabel}</div>
        <div>until tee time</div>
      </div>

      <div class="info-card">
        <h2 style="margin-top: 0;">${teeTime.courseName}</h2>
        <p><strong>Date:</strong> ${dateStr}</p>
        <p><strong>Time:</strong> ${timeStr}</p>
        <p><strong>Address:</strong> ${teeTime.courseAddress}</p>
      </div>

      <div class="info-card">
        <h3 style="margin-top: 0;">Your Group</h3>
        ${participants.map((p) => `<p>• ${p.name}${p.company ? ` <span style="color: #666;">(${p.company})</span>` : ''}</p>`).join('')}
      </div>

      <p style="text-align: center;">
        <a href="https://maps.google.com/?q=${encodeURIComponent(teeTime.courseAddress)}" class="cta-button">Get Directions</a>
        <a href="https://linkupgolf.com/tee-times/${teeTime.id}/chat" class="cta-button cta-secondary">Message Group</a>
      </p>
    </div>
    <div class="footer">
      <p>Have a great round!<br>The LinkUp Golf Team</p>
    </div>
  </div>
</body>
</html>`;

  return {
    to: userEmail,
    subject: `Reminder: ${teeTime.courseName} in ${timeLabel}`,
    text,
    html,
  };
}

export function reminderInAppNotification(data: ReminderData): InAppNotificationData {
  const { userId, teeTime, hoursUntil } = data;
  const timeStr = format(teeTime.dateTime, 'h:mm a');

  const timeLabel = hoursUntil <= 2
    ? 'in 2 hours'
    : hoursUntil <= 24
      ? 'tomorrow'
      : 'coming up soon';

  return {
    userId,
    type: 'TEE_TIME_REMINDER',
    title: 'Tee Time Reminder',
    body: `${teeTime.courseName} at ${timeStr} - ${timeLabel}`,
    data: {
      teeTimeId: teeTime.id,
      courseName: teeTime.courseName,
      dateTime: teeTime.dateTime.toISOString(),
      hoursUntil,
    },
  };
}
