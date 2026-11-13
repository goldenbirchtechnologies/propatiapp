import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/users/mfa
 *
 * The caller's second-factor state. Never returns the secret: the enrollment
 * screen only needs to know whether to offer "enable" or "disable".
 */
export async function GET(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const mfa = await prisma.userMfa.findUnique({
      where: { userId: user.id },
      select: {
        status: true,
        totpVerified: true,
        enabledAt: true,
        lastUsedAt: true,
        recoveryCodeHashes: true,
      },
    });

    const recoveryCodesRemaining = Array.isArray(mfa?.recoveryCodeHashes)
      ? mfa.recoveryCodeHashes.length
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        enrolled: Boolean(mfa?.totpVerified),
        pendingEnrolment: mfa?.status === 'pending',
        enabledAt: mfa?.enabledAt ?? null,
        lastUsedAt: mfa?.lastUsedAt ?? null,
        recoveryCodesRemaining,
      },
    });
  } catch (error) {
    console.error('MFA GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load MFA status' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/users/mfa
 *
 * Turns the second factor off and forgets the secret, so re-enabling starts a
 * fresh enrolment rather than resurrecting the old one.
 */
export async function DELETE(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    await prisma.userMfa.deleteMany({ where: { userId: user.id } });
    return NextResponse.json({ success: true, data: { enrolled: false } });
  } catch (error) {
    console.error('MFA DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to disable MFA' },
      { status: 500 }
    );
  }
}
