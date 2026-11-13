import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import {
  generateTotpSecret,
  generateRecoveryCodes,
  buildOtpAuthUri,
  encryptMfaSecret,
} from '@/lib/mfa/totp';

/**
 * POST /api/users/mfa/setup
 *
 * Starts enrolment: issues a secret, returns the QR to scan and the recovery
 * codes to write down. Nothing is active yet — `verify` is what flips the
 * factor on, so a secret that never gets a valid code is harmless.
 *
 * Calling this again replaces any unverified secret, which is how a user who
 * closed the tab recovers.
 */
export async function POST(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const existing = await prisma.userMfa.findUnique({
      where: { userId: user.id },
      select: { totpVerified: true },
    });

    if (existing?.totpVerified) {
      return NextResponse.json(
        { success: false, error: 'MFA is already enabled. Disable it first.' },
        { status: 409 }
      );
    }

    const secret = generateTotpSecret();
    const uri = buildOtpAuthUri(secret, user.email, 'PropatiBox');
    const qrDataUrl = await QRCode.toDataURL(uri);
    const { plaintext, hashes } = await generateRecoveryCodes();

    await prisma.userMfa.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        status: 'pending',
        secretEnc: encryptMfaSecret(secret),
        totpVerified: false,
        recoveryCodeHashes: hashes,
      },
      update: {
        status: 'pending',
        secretEnc: encryptMfaSecret(secret),
        totpVerified: false,
        enabledAt: null,
        recoveryCodeHashes: hashes,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        qrCode: qrDataUrl,
        // Shown under the QR so the code can be typed in by hand.
        manualEntryKey: secret,
        recoveryCodes: plaintext,
      },
    });
  } catch (error) {
    console.error('MFA setup error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to start MFA enrolment' },
      { status: 500 }
    );
  }
}
