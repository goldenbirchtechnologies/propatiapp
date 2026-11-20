import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { hashOtp, safeCompare } from '@/lib/encryption';
import { sendSMS } from '@/lib/sms/termii';
import { toSmsFormat } from '@/lib/phone';
import { landlordPhoneVerifySchema } from '@/lib/landlord-profile/schemas';

const OTP_TTL_MINUTES = 5;
const RESEND_WINDOW_MINUTES = 15;
const MAX_SENDS_PER_WINDOW = 3;

/**
 * POST /api/landlord/phone
 * Sends a fresh code to the phone already stored on the account. Unlike the
 * onboarding contact route this does not touch onboarding progress — the owner
 * workspace verifies the number without moving the wizard.
 */
export async function POST(request: NextRequest) {
  const authResult = await withAuth(request, ['landlord']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const account = await prisma.user.findUnique({
      where: { id: user.id },
      select: { phone: true, phoneVerified: true },
    });

    if (!account?.phone) {
      return NextResponse.json(
        { success: false, error: 'Save a phone number first.' },
        { status: 400 }
      );
    }

    if (account.phoneVerified) {
      return NextResponse.json({
        success: true,
        data: { alreadyVerified: true, phoneVerified: true },
      });
    }

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

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.$transaction([
      prisma.phoneOtp.deleteMany({ where: { userId: user.id } }),
      prisma.phoneOtp.create({
        data: {
          userId: user.id,
          otpHash: hashOtp(code, user.id),
          expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000),
        },
      }),
    ]);

    try {
      await sendSMS({
        to: toSmsFormat(account.phone),
        message: `Your PropatiBox verification code is ${code}. It expires in ${OTP_TTL_MINUTES} minutes.`,
      });
    } catch (smsError) {
      console.error('Landlord phone OTP send failed:', smsError);
      return NextResponse.json(
        { success: false, error: 'SMS_SEND_FAILED', message: 'We could not send the code.' },
        { status: 502 }
      );
    }

    const isProduction = process.env.NODE_ENV === 'production';

    return NextResponse.json({
      success: true,
      data: {
        expiresInSeconds: OTP_TTL_MINUTES * 60,
        ...(isProduction ? {} : { devCode: code }),
      },
    });
  } catch (error) {
    console.error('Landlord phone OTP request error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/landlord/phone
 * Confirms the code issued by POST and marks the account phone verified.
 */
export async function PATCH(request: NextRequest) {
  const authResult = await withAuth(request, ['landlord']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const parsed = landlordPhoneVerifySchema.parse(body);

    const otp = await prisma.phoneOtp.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp) {
      return NextResponse.json(
        { success: false, error: 'No code found. Request a new one.' },
        { status: 400 }
      );
    }

    if (otp.expiresAt < new Date()) {
      await prisma.phoneOtp.deleteMany({ where: { userId: user.id } });
      return NextResponse.json(
        { success: false, error: 'That code has expired. Request a new one.' },
        { status: 400 }
      );
    }

    if (!safeCompare(otp.otpHash, hashOtp(parsed.code, user.id))) {
      return NextResponse.json(
        { success: false, error: 'That code is not correct.' },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.phoneOtp.deleteMany({ where: { userId: user.id } }),
      prisma.user.update({
        where: { id: user.id },
        data: { phoneVerified: true },
      }),
    ]);

    return NextResponse.json({ success: true, data: { phoneVerified: true } });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Landlord phone OTP verify error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
