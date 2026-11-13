import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { verifyTotp, decryptMfaSecret, generateRecoveryCodes } from '@/lib/mfa/totp';

/**
 * POST /api/users/mfa/recovery-codes
 *
 * Reissues the recovery codes, replacing every previous one. Requires the
 * account password... which this app no longer stores (Clerk owns auth), so it
 * requires a current TOTP code instead: proving you still hold the second
 * factor is the strongest check available without the authenticator itself.
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
      select: { secretEnc: true, totpVerified: true },
    });

    if (!mfa?.totpVerified) {
      return NextResponse.json(
        { success: false, error: 'MFA is not enabled' },
        { status: 400 }
      );
    }

    if (verifyTotp(decryptMfaSecret(mfa.secretEnc), code) === null) {
      return NextResponse.json(
        { success: false, error: 'That code is not valid' },
        { status: 400 }
      );
    }

    const { plaintext, hashes } = await generateRecoveryCodes();

    await prisma.userMfa.update({
      where: { userId: user.id },
      data: { recoveryCodeHashes: hashes },
    });

    return NextResponse.json({ success: true, data: { recoveryCodes: plaintext } });
  } catch (error) {
    console.error('MFA recovery-codes error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to regenerate recovery codes' },
      { status: 500 }
    );
  }
}
