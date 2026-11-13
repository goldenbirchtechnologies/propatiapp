import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { verifyTotp, decryptMfaSecret } from '@/lib/mfa/totp';

/**
 * POST /api/users/mfa/verify
 *
 * Confirms enrolment with the first code from the authenticator app. This is
 * the only place `totpVerified` becomes true — a user who cannot produce a code
 * never ends up locked behind a factor they cannot satisfy.
 */
export async function POST(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const code = typeof body?.code === 'string' ? body.code : '';

    const mfa = await prisma.userMfa.findUnique({
      where: { userId: user.id },
      select: { secretEnc: true, status: true },
    });

    if (!mfa) {
      return NextResponse.json(
        { success: false, error: 'Start enrolment first' },
        { status: 404 }
      );
    }

    const counter = verifyTotp(decryptMfaSecret(mfa.secretEnc), code);
    if (counter === null) {
      return NextResponse.json(
        { success: false, error: 'That code is not valid. Check your authenticator app and try again.' },
        { status: 400 }
      );
    }

    await prisma.userMfa.update({
      where: { userId: user.id },
      data: {
        status: 'active',
        totpVerified: true,
        enabledAt: new Date(),
        lastUsedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, data: { enrolled: true } });
  } catch (error) {
    console.error('MFA verify error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify MFA code' },
      { status: 500 }
    );
  }
}
