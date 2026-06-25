// ===========================================================================
// PROPATI — Email Service (SMTP with Nodemailer)
// Phase H: Email notifications
// ===========================================================================

import nodemailer from 'nodemailer';

// ===========================================================================
// CONFIGURATION
// ===========================================================================

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const EMAIL_FROM = process.env.EMAIL_FROM || 'PROPATI <noreply@propati.ng>';

// Mock mode: enabled if SMTP credentials are not configured
const MOCK_MODE = !SMTP_USER || !SMTP_PASS;

// ===========================================================================
// TRANSPORTER
// ===========================================================================

let transporter: nodemailer.Transporter | null = null;

if (!MOCK_MODE) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: false, // Use TLS
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

// ===========================================================================
// EMAIL SERVICE
// ===========================================================================

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(params: SendEmailParams): Promise<void> {
  const { to, subject, html, text } = params;

  // Mock mode: log to console
  if (MOCK_MODE || !transporter) {
    console.log('\n=== EMAIL (MOCK MODE) ===');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Text:', text || 'No plain text');
    console.log('HTML Length:', html.length, 'characters');
    console.log('=========================\n');
    return;
  }

  // Production mode: send via SMTP
  try {
    await transporter.sendMail({
      from: EMAIL_FROM,
      to,
      subject,
      text,
      html,
    });
    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error('Email send error:', error);
    throw new Error(`Failed to send email: ${error}`);
  }
}

// ===========================================================================
// PASSWORD RESET EMAIL
// ===========================================================================

export interface SendPasswordResetEmailParams {
  to: string;
  userName: string;
  resetToken: string;
}

export async function sendPasswordResetEmail(params: SendPasswordResetEmailParams): Promise<void> {
  const { to, userName, resetToken } = params;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;

  const html = `
    <html>
      <body>
        <p>Hello ${userName},</p>
        <p>An administrator has requested a password reset for your account.</p>
        <p>Click the link below to set a new password:</p>
        <p><a href="${resetUrl}">Reset your password</a></p>
        <p>If you did not anticipate this email, please contact support.</p>
      </body>
    </html>
  `;

  const text = `Hello ${userName},\n\nAn administrator has requested a password reset for your account.\n\nCopy and paste this link into your browser to set a new password:\n${resetUrl}\n\nIf you did not anticipate this email, please contact support.`;

  await sendEmail({
    to,
    subject: 'Password Reset Request',
    html,
    text,
  });
}
