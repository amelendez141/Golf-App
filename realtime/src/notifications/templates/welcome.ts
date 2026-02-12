import { PushNotificationPayload } from '../push.js';
import { EmailOptions } from '../email.js';
import { InAppNotificationData } from '../inApp.js';

interface WelcomeData {
  userId: string;
  userEmail: string;
  userName: string;
  industry: string;
}

export function welcomePushNotification(data: WelcomeData): PushNotificationPayload {
  return {
    title: 'Welcome to LinkUp Golf!',
    body: 'Find tee times with professionals in your industry. Start exploring now!',
    icon: '/icons/golf-welcome.png',
    badge: '/icons/badge.png',
    tag: 'welcome',
    data: {
      type: 'WELCOME',
      url: '/explore',
    },
    actions: [
      { action: 'explore', title: 'Find Tee Times' },
      { action: 'profile', title: 'Complete Profile' },
    ],
  };
}

export function welcomeEmail(data: WelcomeData): EmailOptions {
  const { userEmail, userName, industry } = data;

  const text = `Welcome to LinkUp Golf, ${userName}!

You've just joined the premier platform for professionals to connect on the golf course.

As someone in ${industry}, you'll be matched with other ${industry} professionals who share your passion for golf.

Here's how to get started:

1. Complete Your Profile
   Add your handicap, home course, and availability to get better matches.

2. Explore Tee Times
   Browse open tee times near you, filtered by industry and skill level.

3. Create Your Own
   Hosting a round? Create a tee time and let others join you.

4. Connect & Network
   Use our group chat to coordinate and make valuable connections.

Start exploring: https://linkupgolf.com/explore

Have questions? We're here to help at support@linkupgolf.com

See you on the course!
The LinkUp Golf Team`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1a472a 0%, #2e7d32 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 28px; }
    .header p { margin: 10px 0 0; opacity: 0.9; }
    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
    .step { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: flex; align-items: flex-start; }
    .step-number { background: #2e7d32; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 15px; flex-shrink: 0; }
    .step-content h3 { margin: 0 0 5px; color: #1a472a; }
    .step-content p { margin: 0; color: #666; }
    .cta-button { display: inline-block; background: #2e7d32; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
    .social-links { margin: 20px 0; }
    .social-links a { margin: 0 10px; color: #2e7d32; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to LinkUp Golf!</h1>
      <p>Connect with ${industry} professionals on the course</p>
    </div>
    <div class="content">
      <p>Hi ${userName},</p>
      <p>You've just joined the premier platform for professionals to connect on the golf course. Here's how to get started:</p>

      <div class="step">
        <div class="step-number">1</div>
        <div class="step-content">
          <h3>Complete Your Profile</h3>
          <p>Add your handicap, home course, and availability to get better matches.</p>
        </div>
      </div>

      <div class="step">
        <div class="step-number">2</div>
        <div class="step-content">
          <h3>Explore Tee Times</h3>
          <p>Browse open tee times near you, filtered by industry and skill level.</p>
        </div>
      </div>

      <div class="step">
        <div class="step-number">3</div>
        <div class="step-content">
          <h3>Create Your Own</h3>
          <p>Hosting a round? Create a tee time and let others join you.</p>
        </div>
      </div>

      <div class="step">
        <div class="step-number">4</div>
        <div class="step-content">
          <h3>Connect & Network</h3>
          <p>Use group chat to coordinate and make valuable connections.</p>
        </div>
      </div>

      <p style="text-align: center; margin-top: 30px;">
        <a href="https://linkupgolf.com/explore" class="cta-button">Start Exploring</a>
      </p>
    </div>
    <div class="footer">
      <p>Have questions? Reply to this email or reach out at support@linkupgolf.com</p>
      <div class="social-links">
        <a href="https://twitter.com/linkupgolf">Twitter</a>
        <a href="https://linkedin.com/company/linkupgolf">LinkedIn</a>
        <a href="https://instagram.com/linkupgolf">Instagram</a>
      </div>
      <p>See you on the course!<br>The LinkUp Golf Team</p>
    </div>
  </div>
</body>
</html>`;

  return {
    to: userEmail,
    subject: `Welcome to LinkUp Golf, ${userName}!`,
    text,
    html,
  };
}

export function welcomeInAppNotification(data: WelcomeData): InAppNotificationData {
  const { userId, industry } = data;

  return {
    userId,
    type: 'WELCOME',
    title: 'Welcome to LinkUp Golf!',
    body: `Find tee times with ${industry} professionals. Start exploring now!`,
    data: {
      industry,
    },
  };
}
