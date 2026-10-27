import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { onboardingPhoneVerifySchema } from '@/lib/validators';
import { hashOtp, safeCompare } from '@/lib/encryption';
import { markStepDone } from '@/lib/onboarding/dossier';

/**
 * POST /api/onboarding/phone/verify
 * Confirms the one-time code sent to the user's phone number.
 */
export async function POST(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const parsed = onboardingPhoneVerifySchema.parse(body);

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
        data: { phoneVerified: true, onboardingStatus: 'in_progress' },
      }),
    ]);

    await markStepDone(user.id, user.role, 'contact', 'identity');

    return NextResponse.json({ success: true, data: { phoneVerified: true } });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Onboarding phone verify error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
