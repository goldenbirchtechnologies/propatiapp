import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { onboardingEstateProfileSchema } from '@/lib/validators';
import { advanceOnboarding } from '@/lib/onboarding/profiles';

/**
 * POST /api/onboarding/estate/profile
 * The operator entity, CAC registration, credentials, and office contacts.
 */
export async function POST(request: NextRequest) {
  const authResult = await withAuth(request, ['estate_manager']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const parsed = onboardingEstateProfileSchema.parse(body);

    const data = {
      legalEntityName: parsed.legalEntityName,
      isCorporate: parsed.isCorporate ?? false,
      cacTinNumber: parsed.cacTinNumber ?? null,
      professionalCredentialNumber: parsed.professionalCredentialNumber ?? null,
      professionalCredentialBoard: parsed.professionalCredentialBoard ?? null,
      officeAddress: parsed.officeAddress,
      businessPhone: parsed.businessPhone ?? null,
      emergencyHotline: parsed.emergencyHotline ?? null,
    };

    const profile = await prisma.estateManagerProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...data },
      update: data,
    });

    const nextStep = await advanceOnboarding(user.id, user.role, 'estateProfile');

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
    console.error('Onboarding estate profile error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
