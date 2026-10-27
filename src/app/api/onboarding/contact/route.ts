import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { onboardingContactSchema } from '@/lib/validators';
import { normalizePhone } from '@/lib/phone';
import { hashOtp } from '@/lib/encryption';
import { sendSMS } from '@/lib/sms/termii';
import { toSmsFormat } from '@/lib/phone';
import { ensureOnboardingRow } from '@/lib/onboarding/dossier';

const OTP_TTL_MINUTES = 5;
const RESEND_WINDOW_MINUTES = 15;
const MAX_SENDS_PER_WINDOW = 3;

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * POST /api/onboarding/contact
 * Saves the user's phone number and issues a one-time code to prove they can
 * receive messages on it.
 */
export async function POST(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const parsed = onboardingContactSchema.parse(body);

    const phone = normalizePhone(parsed.phone);
    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'Enter a valid phone number' },
        { status: 400 }
      );
    }

    // The phone column is unique. Check before writing so a duplicate returns
    // a clean message instead of a Prisma P2002.
    const existing = await prisma.user.findUnique({
      where: { phone },
      select: { id: true },
    });
    if (existing && existing.id !== user.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'PHONE_IN_USE',
          message: 'That phone number is already registered to another account.',
        },
        { status: 409 }
      );
    }

    // Rate limit resends within the window.
    const windowStart = new Date(Date.now() - RESEND_WINDOW_MINUTES * 60 * 1000);
    const recentSends = await prisma.phoneOtp.count({
      where: { userId: user.id, createdAt: { gte: windowStart } },
    });
    if (recentSends >= MAX_SENDS_PER_WINDOW) {
      return NextResponse.json(
        {
          success: false,
          error: 'TOO_MANY_REQUESTS',
          message: 'Too many codes requested. Try again in a few minutes.',
        },
        { status: 429 }
      );
    }

    const code = generateOtp();

    await prisma.$transaction([
      prisma.phoneOtp.deleteMany({ where: { userId: user.id } }),
      prisma.phoneOtp.create({
        data: {
          userId: user.id,
          otpHash: hashOtp(code, user.id),
          expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000),
        },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { phone, onboardingStatus: 'in_progress' },
      }),
    ]);

    await ensureOnboardingRow(user.id, user.role, 'contact');

    try {
      await sendSMS({
        to: toSmsFormat(phone),
        message: `Your PropatiBox verification code is ${code}. It expires in ${OTP_TTL_MINUTES} minutes.`,
      });
    } catch (smsError) {
      console.error('Onboarding OTP SMS send failed:', smsError);
      return NextResponse.json(
        {
          success: false,
          error: 'SMS_SEND_FAILED',
          message: 'We could not send the code. Please try again.',
        },
        { status: 502 }
      );
    }

    // In development the code is echoed so the flow can be exercised without
    // an SMS provider. Never expose it in production.
    const isProduction = process.env.NODE_ENV === 'production';

    return NextResponse.json({
      success: true,
      data: {
        phone,
        expiresInSeconds: OTP_TTL_MINUTES * 60,
        ...(isProduction ? {} : { devCode: code }),
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Onboarding contact error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
