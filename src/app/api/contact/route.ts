import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { emailSchema, phoneSchema } from '@/lib/validators';
import { withRateLimit, apiRateLimiter } from '@/lib/rate-limit';
import { sendEmail } from '@/lib/email/email-service';

const contactSchema = z.object({
  name: z.string().min(2, 'Name is too short'),
  email: emailSchema,
  phone: phoneSchema.optional().or(z.literal('')),
  subject: z.string().optional(),
  message: z.string().min(10, 'Message is too short'),
});

const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || process.env.SMTP_USER || 'support@propati.ng';

export async function POST(req: NextRequest) {
  const rate = await withRateLimit(req, apiRateLimiter);
  if (rate.limited) {
    return NextResponse.json({ success: false, error: 'Too many requests. Please try again shortly.' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input.' }, { status: 400 });
  }

  const { name, email, phone, subject, message } = parsed.data;
  const safeSubject = subject?.trim() ? subject.trim() : 'New contact form submission';

  const html = `
    <div style="font-family:Inter,system-ui,sans-serif;max-width:600px;margin:0 auto;color:#161c27">
      <h2 style="color:#000f22;margin:0 0 8px">New contact form submission — PROPATI</h2>
      <p style="color:#43474d;font-size:14px;margin:0 0 16px">Received via propati.ng/contact-us</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr><td style="padding:6px 8px;font-weight:600;width:120px;background:#f1f3ff">Name</td><td style="padding:6px 8px">${name}</td></tr>
        <tr><td style="padding:6px 8px;font-weight:600;background:#f1f3ff">Email</td><td style="padding:6px 8px"><a href="mailto:${email}">${email}</a></td></tr>
        ${phone ? `<tr><td style="padding:6px 8px;font-weight:600;background:#f1f3ff">Phone</td><td style="padding:6px 8px">${phone}</td></tr>` : ''}
        <tr><td style="padding:6px 8px;font-weight:600;background:#f1f3ff">Subject</td><td style="padding:6px 8px">${safeSubject}</td></tr>
      </table>
      <div style="margin-top:16px;padding:12px;border:1px solid #dde2f3;border-radius:8px;white-space:pre-wrap;font-size:14px;line-height:1.6">${message}</div>
      <p style="color:#74777e;font-size:12px;margin-top:16px">Reply directly to ${email} to respond.</p>
    </div>
  `;

  try {
    await sendEmail({ to: SUPPORT_EMAIL, subject: `[PROPATI Contact] ${safeSubject} — ${name}`, html });
  } catch (e) {
    console.error('[contact] sendEmail failed:', e);
    return NextResponse.json({ success: false, error: 'Could not send message. Please try again.' }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: 'Message sent. Our team will respond within one business day.' });
}
