import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { onboardingLandlordSettlementSchema } from '@/lib/validators';
import { encryptSensitiveValue } from '@/lib/encryption';
import { advanceOnboarding } from '@/lib/onboarding/profiles';
import { verifySettlementAccount } from '@/lib/settlement';

/**
 * POST /api/onboarding/landlord/settlement
 *
 * Rent payout account and listing defaults. The account number and BVN are
 * encrypted at rest, matching how identity numbers are handled.
 *
 * The account is resolved against the bank and name-matched to the identity
 * Dojah verified before it is written. A failed check does not reject the step
 * — the account is stored as pending and payouts stay on hold until it clears.
 */
export async function POST(request: NextRequest) {
  const authResult = await withAuth(request, ['landlord']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const parsed = onboardingLandlordSettlementSchema.parse(body);

    const settlement = await verifySettlementAccount(user.id, {
      accountNumber: parsed.accountNumber,
      bankCode: parsed.bankCode,
      bankName: parsed.bankName,
      submittedName: parsed.accountName,
      requireNameMatch: true,
      createSubaccount: true,
    });

    const data = {
      accountName: settlement.storedName,
      bankName: settlement.bankName,
      accountNumberEnc: encryptSensitiveValue(parsed.accountNumber),
      targetMonthlyRent:
        parsed.targetMonthlyRent != null ? BigInt(Math.round(parsed.targetMonthlyRent)) : null,
      targetAnnualRent:
        parsed.targetAnnualRent != null ? BigInt(Math.round(parsed.targetAnnualRent)) : null,
      securityDeposit:
        parsed.securityDeposit != null ? BigInt(Math.round(parsed.securityDeposit)) : null,
      preferredLeaseDuration: parsed.preferredLeaseDuration ?? null,
      commissionConsent: parsed.commissionConsent,
    };

    const profile = await prisma.landlordProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        ...data,
        ...(parsed.bvn ? { bvnEnc: encryptSensitiveValue(parsed.bvn) } : {}),
      },
      update: {
        ...data,
        ...(parsed.bvn ? { bvnEnc: encryptSensitiveValue(parsed.bvn) } : {}),
      },
    });

    const nextStep = await advanceOnboarding(user.id, user.role, 'landlordSettlement');

    return NextResponse.json({
      success: true,
      data: {
        id: profile.id,
        nextStep,
        settlement,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Onboarding landlord settlement error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
