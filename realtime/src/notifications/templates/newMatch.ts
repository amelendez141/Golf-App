import { format } from 'date-fns';
import { PushNotificationPayload } from '../push.js';
import { EmailOptions } from '../email.js';
import { InAppNotificationData } from '../inApp.js';

interface NewMatchData {
  userId: string;
  userEmail: string;
  userName: string;
  teeTime: {
    id: string;
    dateTime: Date;
    courseName: string;
    hostName: string;
    openSlots: number;
    matchScore: number;
    matchReasons: string[];
  };
}

export function newMatchPushNotification(data: NewMatchData): PushNotificationPayload {
  const { teeTime } = data;
  const dateStr = format(teeTime.dateTime, 'MMM d');
  const timeStr = format(teeTime.dateTime, 'h:mm a');

  return {
    title: 'New Tee Time Match!',
    body: `${teeTime.courseName} on ${dateStr} at ${timeStr} - ${teeTime.matchReasons[0] || 'Great match for you'}`,
    icon: '/icons/golf-ball.png',
    badge: '/icons/badge.png',
    tag: `match-${teeTime.id}`,
    data: {
      type: 'NEW_MATCH',
      teeTimeId: teeTime.id,
      url: `/tee-times/${teeTime.id}`,
    },
    actions: [
      { action: 'view', title: 'View Details' },
      { action: 'join', title: 'Join Now' },
    ],
  };
}

export function newMatchEmail(data: NewMatchData): EmailOptions {
  const { userEmail, userName, teeTime } = data;
  const dateStr = format(teeTime.dateTime, 'EEEE, MMMM d, yyyy');
  const timeStr = format(teeTime.dateTime, 'h:mm a');

  const reasonsList = teeTime.matchReasons.map((r) => `• ${r}`).join('\n');

  const text = `Hi ${userName},

We found a great tee time match for you!

${teeTime.courseName}
${dateStr} at ${timeStr}
Hosted by ${teeTime.hostName}
${teeTime.openSlots} spot${teeTime.openSlots > 1 ? 's' : ''} available

Why this is a great match:
${reasonsList}

View and join this tee time:
https://linkupgolf.com/tee-times/${teeTime.id}

Happy golfing!
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
    .tee-time-card { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .match-reasons { background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .cta-button { display: inline-block; background: #2e7d32; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; }
    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Tee Time Match!</h1>
    </div>
    <div class="content">
      <p>Hi ${userName},</p>
      <p>We found a great tee time that matches your preferences!</p>

      <div class="tee-time-card">
        <h2 style="margin-top: 0;">${teeTime.courseName}</h2>
        <p><strong>Date:</strong> ${dateStr}</p>
        <p><strong>Time:</strong> ${timeStr}</p>
        <p><strong>Host:</strong> ${teeTime.hostName}</p>
        <p><strong>Available:</strong> ${teeTime.openSlots} spot${teeTime.openSlots > 1 ? 's' : ''}</p>
      </div>

      <div class="match-reasons">
        <strong>Why this is a great match:</strong>
        <ul>
          ${teeTime.matchReasons.map((r) => `<li>${r}</li>`).join('')}
        </ul>
      </div>

      <p style="text-align: center;">
        <a href="https://linkupgolf.com/tee-times/${teeTime.id}" class="cta-button">View & Join</a>
      </p>
    </div>
    <div class="footer">
      <p>Happy golfing!<br>The LinkUp Golf Team</p>
      <p><a href="https://linkupgolf.com/settings/notifications">Manage notification preferences</a></p>
    </div>
  </div>
</body>
</html>`;

  return {
    to: userEmail,
    subject: `New Match: ${teeTime.courseName} on ${format(teeTime.dateTime, 'MMM d')}`,
    text,
    html,
  };
}

export function newMatchInAppNotification(data: NewMatchData): InAppNotificationData {
  const { userId, teeTime } = data;
  const dateStr = format(teeTime.dateTime, 'MMM d');
  const timeStr = format(teeTime.dateTime, 'h:mm a');

  return {
    userId,
    type: 'NEW_MATCH',
    title: 'New Tee Time Match',
    body: `${teeTime.courseName} on ${dateStr} at ${timeStr} - ${teeTime.matchReasons[0] || 'Great match!'}`,
    data: {
      teeTimeId: teeTime.id,
      courseName: teeTime.courseName,
      dateTime: teeTime.dateTime.toISOString(),
      hostName: teeTime.hostName,
      matchScore: teeTime.matchScore,
      matchReasons: teeTime.matchReasons,
    },
  };
}
