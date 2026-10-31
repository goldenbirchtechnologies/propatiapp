import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { onboardingAgentSettlementSchema } from '@/lib/validators';
import { encryptSensitiveValue } from '@/lib/encryption';
import { advanceOnboarding } from '@/lib/onboarding/profiles';

/**
 * POST /api/onboarding/agent/settlement
 * Commission payout account, split, and device setup.
 */
export async function POST(request: NextRequest) {
  const authResult = await withAuth(request, ['agent']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const parsed = onboardingAgentSettlementSchema.parse(body);

    const data = {
      bankName: parsed.bankName,
      accountName: parsed.accountName,
      accountNumberEnc: encryptSensitiveValue(parsed.accountNumber),
      commissionSplitPercent:
        parsed.commissionSplitPercent != null ? Math.round(parsed.commissionSplitPercent) : null,
      subscriptionTier: parsed.subscriptionTier ?? null,
      primaryDeviceOs: parsed.primaryDeviceOs ?? null,
      crmNotes: parsed.crmNotes ?? null,
    };

    const profile = await prisma.agentProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...data },
      update: data,
    });

    const nextStep = await advanceOnboarding(user.id, user.role, 'agentSettlement');

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
    console.error('Onboarding agent settlement error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
