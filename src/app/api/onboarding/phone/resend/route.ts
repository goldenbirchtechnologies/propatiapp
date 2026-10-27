import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { hashOtp } from '@/lib/encryption';
import { sendSMS } from '@/lib/sms/termii';
import { toSmsFormat } from '@/lib/phone';

const OTP_TTL_MINUTES = 5;
const RESEND_WINDOW_MINUTES = 15;
const MAX_SENDS_PER_WINDOW = 3;

/**
 * POST /api/onboarding/phone/resend
 * Issues a fresh code for a phone number that was already saved.
 */
export async function POST(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const account = await prisma.user.findUnique({
      where: { id: user.id },
      select: { phone: true, phoneVerified: true },
    });

    if (!account?.phone) {
      return NextResponse.json(
        { success: false, error: 'Add a phone number first.' },
        { status: 400 }
      );
    }

    if (account.phoneVerified) {
      return NextResponse.json(
        { success: true, data: { alreadyVerified: true } }
      );
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
      console.error('Onboarding OTP resend failed:', smsError);
      return NextResponse.json(
        { success: false, error: 'SMS_SEND_FAILED' },
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
    console.error('Onboarding phone resend error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
