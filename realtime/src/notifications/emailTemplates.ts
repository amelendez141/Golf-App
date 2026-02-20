/**
 * Email Templates for LinkUp Golf Notifications
 */

import { format } from 'date-fns';

const BRAND_COLOR = '#2E7D32'; // Golf green
const ACCENT_COLOR = '#FFB300'; // Gold
const BASE_URL = process.env.FRONTEND_URL || 'https://linkupgolf.com';

// Base email wrapper
const baseTemplate = (content: string, preheader: string = '') => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LinkUp Golf</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: ${BRAND_COLOR}; padding: 24px; text-align: center; }
    .header img { height: 40px; }
    .header h1 { color: #ffffff; margin: 12px 0 0; font-size: 24px; font-weight: 600; }
    .content { padding: 32px 24px; }
    .button { display: inline-block; padding: 14px 28px; background: ${BRAND_COLOR}; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 16px 0; }
    .button:hover { background: #1B5E20; }
    .card { background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 16px 0; }
    .footer { background: #f5f5f5; padding: 24px; text-align: center; color: #666; font-size: 14px; }
    .footer a { color: ${BRAND_COLOR}; text-decoration: none; }
    .preheader { display: none; max-width: 0; max-height: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: #fff; opacity: 0; }
  </style>
</head>
<body>
  <div class="preheader">${preheader}</div>
  <div class="container">
    <div class="header">
      <h1>LinkUp Golf</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>You're receiving this because you have a LinkUp Golf account.</p>
      <p><a href="${BASE_URL}/settings/notifications">Manage notification settings</a></p>
      <p>&copy; ${new Date().getFullYear()} LinkUp Golf. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

// Template: Tee Time Reminder (24 hours before)
export function teeTimeReminderEmail(data: {
  userName: string;
  courseName: string;
  dateTime: Date;
  hostName: string;
  teeTimeId: string;
  participants: string[];
}) {
  const formattedDate = format(data.dateTime, 'EEEE, MMMM d');
  const formattedTime = format(data.dateTime, 'h:mm a');

  const content = `
    <h2 style="color: #333; margin: 0 0 16px;">Tee Time Tomorrow!</h2>
    <p style="color: #666; font-size: 16px; line-height: 1.6;">
      Hi ${data.userName}, just a reminder that you have a tee time coming up tomorrow!
    </p>

    <div class="card">
      <p style="margin: 0 0 8px;"><strong>Course:</strong> ${data.courseName}</p>
      <p style="margin: 0 0 8px;"><strong>Date:</strong> ${formattedDate}</p>
      <p style="margin: 0 0 8px;"><strong>Time:</strong> ${formattedTime}</p>
      <p style="margin: 0 0 8px;"><strong>Host:</strong> ${data.hostName}</p>
      <p style="margin: 0;"><strong>Playing with:</strong> ${data.participants.join(', ')}</p>
    </div>

    <p style="color: #666; font-size: 16px;">
      Don't forget to check the weather and arrive early to warm up!
    </p>

    <a href="${BASE_URL}/tee-times/${data.teeTimeId}" class="button">View Tee Time Details</a>
  `;

  return {
    subject: `Reminder: Tee time at ${data.courseName} tomorrow at ${formattedTime}`,
    html: baseTemplate(content, `Your tee time at ${data.courseName} is tomorrow`),
    text: `Hi ${data.userName}, reminder: You have a tee time at ${data.courseName} tomorrow (${formattedDate}) at ${formattedTime}. Host: ${data.hostName}. Playing with: ${data.participants.join(', ')}. View details: ${BASE_URL}/tee-times/${data.teeTimeId}`,
  };
}

// Template: Tee Time Reminder (2 hours before)
export function teeTimeSoonEmail(data: {
  userName: string;
  courseName: string;
  dateTime: Date;
  teeTimeId: string;
}) {
  const formattedTime = format(data.dateTime, 'h:mm a');

  const content = `
    <h2 style="color: #333; margin: 0 0 16px;">Tee Time in 2 Hours!</h2>
    <p style="color: #666; font-size: 16px; line-height: 1.6;">
      Hi ${data.userName}, your tee time at <strong>${data.courseName}</strong> is coming up at <strong>${formattedTime}</strong>.
    </p>

    <p style="color: #666; font-size: 16px;">
      Time to head to the course! Don't forget your clubs.
    </p>

    <a href="${BASE_URL}/tee-times/${data.teeTimeId}" class="button">View Details</a>
  `;

  return {
    subject: `Starting soon: Tee time at ${data.courseName} in 2 hours`,
    html: baseTemplate(content, `Your tee time is in 2 hours`),
    text: `Hi ${data.userName}, your tee time at ${data.courseName} is at ${formattedTime} - just 2 hours away! View details: ${BASE_URL}/tee-times/${data.teeTimeId}`,
  };
}

// Template: Someone joined your tee time
export function playerJoinedEmail(data: {
  hostName: string;
  playerName: string;
  playerCompany: string;
  playerIndustry: string;
  courseName: string;
  dateTime: Date;
  teeTimeId: string;
  openSlots: number;
}) {
  const formattedDate = format(data.dateTime, 'EEEE, MMMM d');
  const formattedTime = format(data.dateTime, 'h:mm a');

  const content = `
    <h2 style="color: #333; margin: 0 0 16px;">New Player Joined!</h2>
    <p style="color: #666; font-size: 16px; line-height: 1.6;">
      Great news, ${data.hostName}! <strong>${data.playerName}</strong> has joined your tee time.
    </p>

    <div class="card">
      <p style="margin: 0 0 8px;"><strong>${data.playerName}</strong></p>
      <p style="margin: 0 0 8px; color: #666;">${data.playerCompany} &bull; ${data.playerIndustry}</p>
    </div>

    <div class="card">
      <p style="margin: 0 0 8px;"><strong>Tee Time:</strong> ${data.courseName}</p>
      <p style="margin: 0 0 8px;"><strong>When:</strong> ${formattedDate} at ${formattedTime}</p>
      <p style="margin: 0;"><strong>Open spots:</strong> ${data.openSlots} remaining</p>
    </div>

    <a href="${BASE_URL}/tee-times/${data.teeTimeId}" class="button">View Tee Time</a>
  `;

  return {
    subject: `${data.playerName} joined your tee time at ${data.courseName}`,
    html: baseTemplate(content, `${data.playerName} is now playing with you`),
    text: `${data.playerName} from ${data.playerCompany} (${data.playerIndustry}) joined your tee time at ${data.courseName} on ${formattedDate} at ${formattedTime}. ${data.openSlots} spots remaining. View: ${BASE_URL}/tee-times/${data.teeTimeId}`,
  };
}

// Template: Tee time cancelled
export function teeTimeCancelledEmail(data: {
  userName: string;
  courseName: string;
  dateTime: Date;
  hostName: string;
  reason?: string;
}) {
  const formattedDate = format(data.dateTime, 'EEEE, MMMM d');
  const formattedTime = format(data.dateTime, 'h:mm a');

  const content = `
    <h2 style="color: #333; margin: 0 0 16px;">Tee Time Cancelled</h2>
    <p style="color: #666; font-size: 16px; line-height: 1.6;">
      Hi ${data.userName}, unfortunately the tee time at <strong>${data.courseName}</strong> has been cancelled by ${data.hostName}.
    </p>

    <div class="card">
      <p style="margin: 0 0 8px;"><strong>Course:</strong> ${data.courseName}</p>
      <p style="margin: 0 0 8px;"><strong>Was scheduled for:</strong> ${formattedDate} at ${formattedTime}</p>
      ${data.reason ? `<p style="margin: 0;"><strong>Reason:</strong> ${data.reason}</p>` : ''}
    </div>

    <p style="color: #666; font-size: 16px;">
      Don't worry - there are plenty more tee times waiting for you!
    </p>

    <a href="${BASE_URL}/explore" class="button">Find Another Tee Time</a>
  `;

  return {
    subject: `Tee time at ${data.courseName} has been cancelled`,
    html: baseTemplate(content, `Your tee time was cancelled`),
    text: `Hi ${data.userName}, the tee time at ${data.courseName} on ${formattedDate} at ${formattedTime} has been cancelled by ${data.hostName}.${data.reason ? ` Reason: ${data.reason}` : ''} Find another tee time: ${BASE_URL}/explore`,
  };
}

// Template: New message in group chat
export function newMessageEmail(data: {
  userName: string;
  senderName: string;
  courseName: string;
  messagePreview: string;
  teeTimeId: string;
}) {
  const content = `
    <h2 style="color: #333; margin: 0 0 16px;">New Message</h2>
    <p style="color: #666; font-size: 16px; line-height: 1.6;">
      Hi ${data.userName}, <strong>${data.senderName}</strong> sent a message in your ${data.courseName} tee time group:
    </p>

    <div class="card">
      <p style="margin: 0; font-style: italic; color: #333;">"${data.messagePreview}"</p>
    </div>

    <a href="${BASE_URL}/messages/${data.teeTimeId}" class="button">Reply</a>
  `;

  return {
    subject: `${data.senderName} sent a message about ${data.courseName}`,
    html: baseTemplate(content, `New message from ${data.senderName}`),
    text: `${data.senderName} sent a message in your ${data.courseName} tee time group: "${data.messagePreview}". Reply: ${BASE_URL}/messages/${data.teeTimeId}`,
  };
}

// Template: Weekly digest
export function weeklyDigestEmail(data: {
  userName: string;
  upcomingTeeTimes: Array<{ courseName: string; dateTime: Date; id: string }>;
  recommendedTeeTimes: Array<{ courseName: string; dateTime: Date; host: string; id: string }>;
}) {
  const upcomingList = data.upcomingTeeTimes
    .map((tt) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
          <strong>${tt.courseName}</strong><br>
          <span style="color: #666;">${format(tt.dateTime, 'EEEE, MMM d')} at ${format(tt.dateTime, 'h:mm a')}</span>
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right;">
          <a href="${BASE_URL}/tee-times/${tt.id}" style="color: ${BRAND_COLOR};">View</a>
        </td>
      </tr>
    `)
    .join('');

  const recommendedList = data.recommendedTeeTimes
    .map((tt) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
          <strong>${tt.courseName}</strong><br>
          <span style="color: #666;">${format(tt.dateTime, 'EEEE, MMM d')} at ${format(tt.dateTime, 'h:mm a')}</span><br>
          <span style="color: #999; font-size: 13px;">Hosted by ${tt.host}</span>
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right;">
          <a href="${BASE_URL}/tee-times/${tt.id}" style="color: ${BRAND_COLOR};">Join</a>
        </td>
      </tr>
    `)
    .join('');

  const content = `
    <h2 style="color: #333; margin: 0 0 16px;">Your Weekly Golf Update</h2>
    <p style="color: #666; font-size: 16px; line-height: 1.6;">
      Hi ${data.userName}, here's what's happening this week on LinkUp Golf!
    </p>

    ${data.upcomingTeeTimes.length > 0 ? `
      <h3 style="color: #333; margin: 24px 0 12px;">Your Upcoming Tee Times</h3>
      <table style="width: 100%; border-collapse: collapse;">
        ${upcomingList}
      </table>
    ` : ''}

    ${data.recommendedTeeTimes.length > 0 ? `
      <h3 style="color: #333; margin: 24px 0 12px;">Recommended For You</h3>
      <table style="width: 100%; border-collapse: collapse;">
        ${recommendedList}
      </table>
    ` : ''}

    <a href="${BASE_URL}/explore" class="button">Explore More Tee Times</a>
  `;

  return {
    subject: `Your LinkUp Golf Weekly Update`,
    html: baseTemplate(content, `Your weekly golf roundup is here`),
    text: `Hi ${data.userName}, here's your weekly golf update. You have ${data.upcomingTeeTimes.length} upcoming tee times. Check out ${data.recommendedTeeTimes.length} recommended tee times: ${BASE_URL}/explore`,
  };
}

// Template: Welcome email
export function welcomeEmail(data: {
  userName: string;
  industry: string;
}) {
  const content = `
    <h2 style="color: #333; margin: 0 0 16px;">Welcome to LinkUp Golf!</h2>
    <p style="color: #666; font-size: 16px; line-height: 1.6;">
      Hi ${data.userName}, welcome to the professional networking platform for golfers!
    </p>

    <p style="color: #666; font-size: 16px; line-height: 1.6;">
      We're excited to have you join our community of ${data.industry} professionals who love to connect on the course.
    </p>

    <h3 style="color: #333; margin: 24px 0 12px;">Get Started</h3>
    <ol style="color: #666; font-size: 16px; line-height: 1.8;">
      <li><strong>Complete your profile</strong> - Add your golf stats and company info</li>
      <li><strong>Find tee times</strong> - Browse open rounds in your area</li>
      <li><strong>Host your own</strong> - Post a tee time and invite professionals</li>
      <li><strong>Network</strong> - Connect with players before and after rounds</li>
    </ol>

    <a href="${BASE_URL}/explore" class="button">Find Your First Tee Time</a>

    <p style="color: #666; font-size: 14px; margin-top: 32px;">
      Questions? Reply to this email - we're here to help!
    </p>
  `;

  return {
    subject: `Welcome to LinkUp Golf, ${data.userName}!`,
    html: baseTemplate(content, `Let's get you on the course`),
    text: `Welcome to LinkUp Golf, ${data.userName}! We're excited to have you join our community of ${data.industry} professionals. Get started: 1) Complete your profile 2) Find tee times 3) Host your own 4) Network. Find your first tee time: ${BASE_URL}/explore`,
  };
}
