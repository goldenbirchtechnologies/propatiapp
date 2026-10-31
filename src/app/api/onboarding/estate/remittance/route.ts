import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { onboardingEstateRemittanceSchema } from '@/lib/validators';
import { encryptSensitiveValue } from '@/lib/encryption';
import { advanceOnboarding } from '@/lib/onboarding/profiles';

/**
 * POST /api/onboarding/estate/remittance
 * Client trust account, remittance cycle, management fee, and WHT instruction.
 */
export async function POST(request: NextRequest) {
  const authResult = await withAuth(request, ['estate_manager']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const parsed = onboardingEstateRemittanceSchema.parse(body);

    const data = {
      trustBankName: parsed.trustBankName,
      trustAccountName: parsed.trustAccountName,
      trustAccountNumberEnc: encryptSensitiveValue(parsed.trustAccountNumber),
      remittanceCycle: parsed.remittanceCycle,
      managementFeeType: parsed.managementFeeType ?? null,
      managementFeeValue:
        parsed.managementFeeValue != null ? Math.round(parsed.managementFeeValue) : null,
      whtInstructionAcknowledged: parsed.whtInstructionAcknowledged ?? false,
    };

    const profile = await prisma.estateManagerProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...data },
      update: data,
    });

    const nextStep = await advanceOnboarding(user.id, user.role, 'estateRemittance');

    return NextResponse.json({
      success: true,
      data: { id: profile.id, nextStep },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Onboarding estate remittance error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
