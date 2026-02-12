import { format } from 'date-fns';
import { PushNotificationPayload } from '../push.js';
import { EmailOptions } from '../email.js';
import { InAppNotificationData } from '../inApp.js';

interface SlotFilledData {
  userId: string;
  userEmail: string;
  userName: string;
  teeTime: {
    id: string;
    dateTime: Date;
    courseName: string;
    totalSlots: number;
  };
  participants: Array<{
    name: string;
    company?: string;
    industry: string;
  }>;
  isHost: boolean;
}

export function slotFilledPushNotification(data: SlotFilledData): PushNotificationPayload {
  const { teeTime, isHost } = data;
  const dateStr = format(teeTime.dateTime, 'MMM d');
  const timeStr = format(teeTime.dateTime, 'h:mm a');

  const title = isHost
    ? 'Your Tee Time is Full!'
    : 'Group Complete!';

  return {
    title,
    body: `${teeTime.courseName} on ${dateStr} at ${timeStr} - All ${teeTime.totalSlots} spots filled`,
    icon: '/icons/golf-flag.png',
    badge: '/icons/badge.png',
    tag: `filled-${teeTime.id}`,
    data: {
      type: 'SLOT_FILLED',
      teeTimeId: teeTime.id,
      url: `/tee-times/${teeTime.id}`,
    },
  };
}

export function slotFilledEmail(data: SlotFilledData): EmailOptions {
  const { userEmail, userName, teeTime, participants, isHost } = data;
  const dateStr = format(teeTime.dateTime, 'EEEE, MMMM d, yyyy');
  const timeStr = format(teeTime.dateTime, 'h:mm a');

  const participantsList = participants
    .map((p) => `• ${p.name}${p.company ? ` (${p.company})` : ''} - ${p.industry}`)
    .join('\n');

  const subject = isHost
    ? `Your Tee Time is Full: ${teeTime.courseName}`
    : `Group Complete: ${teeTime.courseName}`;

  const text = `Hi ${userName},

Great news! Your group for ${teeTime.courseName} is now complete.

Date: ${dateStr}
Time: ${timeStr}

Your group (${teeTime.totalSlots} players):
${participantsList}

Use the group chat to introduce yourself and coordinate:
https://linkupgolf.com/tee-times/${teeTime.id}/chat

See you on the course!
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
    .info-card { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .participant { padding: 10px 0; border-bottom: 1px solid #eee; }
    .participant:last-child { border-bottom: none; }
    .cta-button { display: inline-block; background: #2e7d32; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; }
    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Group Complete!</h1>
    </div>
    <div class="content">
      <p>Hi ${userName},</p>
      <p>Great news! Your group for <strong>${teeTime.courseName}</strong> is now complete.</p>

      <div class="info-card">
        <p><strong>Date:</strong> ${dateStr}</p>
        <p><strong>Time:</strong> ${timeStr}</p>
      </div>

      <div class="info-card">
        <h3 style="margin-top: 0;">Your Group (${teeTime.totalSlots} players)</h3>
        ${participants.map((p) => `
          <div class="participant">
            <strong>${p.name}</strong>
            ${p.company ? `<br><span style="color: #666;">${p.company}</span>` : ''}
            <br><span style="color: #888; font-size: 12px;">${p.industry}</span>
          </div>
        `).join('')}
      </div>

      <p style="text-align: center;">
        <a href="https://linkupgolf.com/tee-times/${teeTime.id}/chat" class="cta-button">Open Group Chat</a>
      </p>
    </div>
    <div class="footer">
      <p>See you on the course!<br>The LinkUp Golf Team</p>
    </div>
  </div>
</body>
</html>`;

  return {
    to: userEmail,
    subject,
    text,
    html,
  };
}

export function slotFilledInAppNotification(data: SlotFilledData): InAppNotificationData {
  const { userId, teeTime, participants, isHost } = data;
  const dateStr = format(teeTime.dateTime, 'MMM d');

  const title = isHost ? 'Your Tee Time is Full!' : 'Group Complete!';

  return {
    userId,
    type: 'SLOT_JOINED', // Reusing type for full notification
    title,
    body: `${teeTime.courseName} on ${dateStr} - All ${teeTime.totalSlots} spots filled`,
    data: {
      teeTimeId: teeTime.id,
      courseName: teeTime.courseName,
      dateTime: teeTime.dateTime.toISOString(),
      participants: participants.map((p) => p.name),
    },
  };
}
