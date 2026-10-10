/**
 * Backward-compatibility re-export module.
 * All email logic now lives in src/lib/email.ts using Resend.
 * This file re-exports so that existing imports from '@/lib/email/email-service'
 * continue to work.
 */
export type { EmailOptions, SendPasswordResetEmailParams } from '../email';
export { sendEmail, sendPasswordResetEmail } from '../email';
