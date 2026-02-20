import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { createLogger } from '../utils/logger.js';
import { metrics } from '../utils/metrics.js';

const logger = createLogger('email-notifications');

// Check if email is properly configured
const isEmailConfigured = (): boolean => {
  if (!env.EMAIL_ENABLED) {
    return false;
  }

  // Check for Resend API key
  if (env.RESEND_API_KEY) {
    return true;
  }

  // Check for SMTP configuration
  if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
    return true;
  }

  return false;
};

// Create transporter based on configuration
const createTransporter = () => {
  if (!isEmailConfigured()) {
    logger.warn('Email not configured - notifications will be logged only');
    return null;
  }

  // Use Resend if API key is provided
  if (env.RESEND_API_KEY) {
    logger.info('Using Resend for email delivery');
    return nodemailer.createTransport({
      host: 'smtp.resend.com',
      port: 465,
      secure: true,
      auth: {
        user: 'resend',
        pass: env.RESEND_API_KEY,
      },
    });
  }

  // Use SMTP configuration
  logger.info({ host: env.SMTP_HOST, port: env.SMTP_PORT }, 'Using SMTP for email delivery');
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
};

const transporter = createTransporter();

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  // If email is not configured, just log
  if (!transporter) {
    logger.info(
      { to: options.to, subject: options.subject },
      'Email would be sent (not configured)'
    );
    return true;
  }

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

// Verify email connection
export async function verifyEmailConnection(): Promise<boolean> {
  if (!transporter) {
    logger.warn('Email not configured - skipping verification');
    return false;
  }

  try {
    await transporter.verify();
    logger.info('Email connection verified');
    return true;
  } catch (error) {
    logger.error({ error }, 'Email connection verification failed');
    return false;
  }
}

// Export configuration status
export const emailStatus = {
  isConfigured: isEmailConfigured(),
  provider: env.RESEND_API_KEY ? 'resend' : env.SMTP_HOST ? 'smtp' : 'none',
};
