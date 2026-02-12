import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { createLogger } from '../utils/logger.js';
import { metrics } from '../utils/metrics.js';

const logger = createLogger('email-notifications');

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const info = await transporter.sendMail({
      from: env.SMTP_FROM,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      replyTo: options.replyTo,
    });

    metrics.emailSent();
    logger.info(
      { messageId: info.messageId, to: options.to, subject: options.subject },
      'Email sent successfully'
    );

    return true;
  } catch (error) {
    logger.error({ error, to: options.to, subject: options.subject }, 'Failed to send email');
    return false;
  }
}

export async function sendBulkEmail(
  emails: EmailOptions[]
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const email of emails) {
    const result = await sendEmail(email);
    if (result) {
      success++;
    } else {
      failed++;
    }
  }

  return { success, failed };
}

// Verify SMTP connection
export async function verifyEmailConnection(): Promise<boolean> {
  try {
    await transporter.verify();
    logger.info('Email connection verified');
    return true;
  } catch (error) {
    logger.error({ error }, 'Email connection verification failed');
    return false;
  }
}
