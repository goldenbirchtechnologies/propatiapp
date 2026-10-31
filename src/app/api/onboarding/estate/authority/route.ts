import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { onboardingEstateAuthoritySchema } from '@/lib/validators';
import { advanceOnboarding } from '@/lib/onboarding/profiles';

/**
 * POST /api/onboarding/estate/authority
 * Mandate to manage, eviction authority, and screening parameters.
 *
 * Both authority answers are booleans, so submittedAt is stamped here to tell
 * a deliberate "no, I do not have that mandate" apart from a never-answered
 * section.
 */
export async function POST(request: NextRequest) {
  const authResult = await withAuth(request, ['estate_manager']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const parsed = onboardingEstateAuthoritySchema.parse(body);

    const data = {
      hasManagementAgreement: parsed.hasManagementAgreement,
      agreementFileName: parsed.agreementFileName ?? null,
      evictionAuthority: parsed.evictionAuthority,
      evictionAuthorityNote: parsed.evictionAuthorityNote ?? null,
      minIncomeThreshold:
        parsed.minIncomeThreshold != null
          ? BigInt(Math.round(parsed.minIncomeThreshold))
          : null,
      guarantorRequirementNote: parsed.guarantorRequirementNote ?? null,
      authoritySubmittedAt: new Date(),
    };

    const profile = await prisma.estateManagerProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...data },
      update: data,
    });

    const nextStep = await advanceOnboarding(user.id, user.role, 'estateAuthority');

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
    console.error('Onboarding estate authority error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
