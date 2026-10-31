import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { onboardingAgentProfileSchema } from '@/lib/validators';
import { encryptSensitiveValue } from '@/lib/encryption';
import { advanceOnboarding } from '@/lib/onboarding/profiles';

/**
 * POST /api/onboarding/agent/profile
 * Legal identification, professional contacts, and emergency contact.
 */
export async function POST(request: NextRequest) {
  const authResult = await withAuth(request, ['agent']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const parsed = onboardingAgentProfileSchema.parse(body);

    const data = {
      legalName: parsed.legalName,
      dateOfBirth: parsed.dateOfBirth ?? null,
      homeAddress: parsed.homeAddress ?? null,
      businessPhone: parsed.businessPhone,
      corporateEmail: parsed.corporateEmail ?? null,
      emergencyContactName: parsed.emergencyContactName,
      emergencyContactPhone: parsed.emergencyContactPhone,
      emergencyContactRelationship: parsed.emergencyContactRelationship,
    };

    // An identifier is only rewritten when supplied, so re-saving the step
    // without retyping it does not erase the stored value.
    const identPatch = parsed.ninOrBvnOrTin
      ? { ninOrBvnOrTinEnc: encryptSensitiveValue(parsed.ninOrBvnOrTin) }
      : {};

    const profile = await prisma.agentProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...data, ...identPatch },
      update: { ...data, ...identPatch },
    });

    const nextStep = await advanceOnboarding(user.id, user.role, 'agentProfile');

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
    console.error('Onboarding agent profile error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
