import { Resend } from 'resend';

// ===========================================================================
// PROPATI — Email Service (Resend)
// Resend provides API-based email delivery with better deliverability
// than SMTP. Falls back to console logging when RESEND_API_KEY is unset.
// ===========================================================================

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';

// Mock mode: enabled if Resend API key is not configured
const MOCK_MODE = !RESEND_API_KEY;

let resend: Resend | null = null;

if (!MOCK_MODE) {
  resend = new Resend(RESEND_API_KEY);
}

// ===========================================================================
// EMAIL SERVICE
// ===========================================================================

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

const DEFAULT_FROM = process.env.EMAIL_FROM || 'PROPATI <onboarding@resend.dev>';

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (MOCK_MODE || !resend) {
    console.log('\n=== EMAIL (MOCK MODE) ===');
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    console.log('Text:', options.text || 'No plain text');
    console.log('HTML Length:', options.html.length, 'characters');
    console.log('=========================\n');
    return true;
  }

  try {
    const result = await resend.emails.send({
      from: options.from || DEFAULT_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    if (result.error) {
      console.error('Resend error:', result.error);
      return false;
    }

    console.log(`Email sent successfully to ${options.to} (id: ${result.data?.id})`);
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
}

// ===========================================================================
// AGENT INVITE EMAIL
// ===========================================================================

export interface AgentInviteEmailOptions {
  to: string;
  landlordName: string;
  acceptUrl: string;
  listingTitle?: string;
  message?: string;
}

export async function sendAgentInviteEmail({
  to,
  landlordName,
  acceptUrl,
  listingTitle,
  message,
}: AgentInviteEmailOptions): Promise<boolean> {
  const template = emailTemplates.agentInvite('', landlordName, acceptUrl, listingTitle, message);
  return sendEmail({
    to,
    subject: template.subject,
    html: template.html,
  });
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
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://propati.ng';
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

// ===========================================================================
// EMAIL TEMPLATES
// ===========================================================================

export const emailTemplates = {
  welcome: (name: string, loginUrl: string) => ({
    subject: 'Welcome to PROPATI!',
    html: `
      <div style="font-family: Inter, system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1e3a5f;">Welcome to PROPATI, ${name}!</h1>
        <p>Thank you for joining Nigeria's most trusted property marketplace.</p>
        <a href="${loginUrl}" style="display: inline-block; background: #1e3a5f; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">Get Started</a>
      </div>
    `,
  }),

  rentDue: (name: string, propertyTitle: string, amount: number, dueDate: string, payUrl: string) => ({
    subject: `Rent Due: ${propertyTitle} - ${new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount)}`,
    html: `
      <div style="font-family: Inter, system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1e3a5f;">Rent Payment Reminder</h1>
        <p>Hi ${name},</p>
        <p>Your rent of <strong>${new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount)}</strong> for <strong>${propertyTitle}</strong> is due on <strong>${dueDate}</strong>.</p>
        <a href="${payUrl}" style="display: inline-block; background: #1e3a5f; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">Pay Now</a>
      </div>
    `,
  }),

  paymentConfirmed: (name: string, amount: number, propertyTitle: string, receiptUrl: string) => ({
    subject: `Payment Confirmed - ${propertyTitle}`,
    html: `
      <div style="font-family: Inter, system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1e3a5f;">Payment Confirmed</h1>
        <p>Hi ${name},</p>
        <p>Your payment of <strong>${new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount)}</strong> for <strong>${propertyTitle}</strong> has been confirmed.</p>
        <a href="${receiptUrl}" style="display: inline-block; background: #1e3a5f; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">View Receipt</a>
      </div>
    `,
  }),

  agreementReady: (name: string, agreementTitle: string, signUrl: string) => ({
    subject: `Agreement Ready for Signature: ${agreementTitle}`,
    html: `
      <div style="font-family: Inter, system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1e3a5f;">Agreement Ready for Signature</h1>
        <p>Hi ${name},</p>
        <p>An agreement for <strong>${agreementTitle}</strong> is ready for your review and signature.</p>
        <a href="${signUrl}" style="display: inline-block; background: #1e3a5f; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">Review & Sign</a>
      </div>
    `,
  }),

  verificationUpdate: (name: string, listingTitle: string, layer: number, status: string, nextSteps?: string) => ({
    subject: `Verification Update: ${listingTitle} - Layer ${layer} ${status}`,
    html: `
      <div style="font-family: Inter, system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1e3a5f;">Verification Status Update</h1>
        <p>Hi ${name},</p>
        <p>Your verification for <strong>${listingTitle}</strong> - Layer ${layer} has been <strong>${status}</strong>.</p>
        ${nextSteps ? `<p>${nextSteps}</p>` : ''}
      </div>
    `,
  }),

  orgInvite: (inviterName: string, orgName: string, acceptUrl: string) => ({
    subject: `Invitation to join ${orgName} on PROPATI`,
    html: `
      <div style="font-family: Inter, system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1e3a5f;">You're Invited!</h1>
        <p>${inviterName} has invited you to join <strong>${orgName}</strong> on PROPATI.</p>
        <a href="${acceptUrl}" style="display: inline-block; background: #1e3a5f; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">Accept Invitation</a>
      </div>
    `,
  }),

  maintenanceUpdate: (name: string, ticketTitle: string, status: string, details?: string) => ({
    subject: `Maintenance Update: ${ticketTitle}`,
    html: `
      <div style="font-family: Inter, system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1e3a5f;">Maintenance Ticket Update</h1>
        <p>Hi ${name},</p>
        <p>Your maintenance ticket <strong>${ticketTitle}</strong> is now <strong>${status}</strong>.</p>
        ${details ? `<p>${details}</p>` : ''}
      </div>
    `,
  }),

  agentInvite: (agentName: string, landlordName: string, acceptUrl: string, listingTitle?: string, message?: string) => ({
    subject: `You've been invited to join PROPATI as an agent`,
    html: `
      <div style="font-family: Inter, system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1e3a5f;">You're Invited!</h1>
        <p>Hi ${agentName || 'there'},</p>
        <p><strong>${landlordName}</strong> has invited you to act as an agent on PROPATI${listingTitle ? ` for <strong>${listingTitle}</strong>` : ''}.</p>
        ${message ? `<p><em>${message}</em></p>` : ''}
        <a href="${acceptUrl}" style="display: inline-block; background: #1e3a5f; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">Accept Invitation</a>
      </div>
    `,
  }),
};
