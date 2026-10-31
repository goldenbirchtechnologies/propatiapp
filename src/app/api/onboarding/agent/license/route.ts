import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { onboardingAgentLicenseSchema } from '@/lib/validators';
import { advanceOnboarding } from '@/lib/onboarding/profiles';

/**
 * POST /api/onboarding/agent/license
 * Board registration, corporate entity, indemnity cover, and code of conduct.
 *
 * This stays on the agent's onboarding profile rather than creating an
 * AgentLicense record: that model backs the separate listing-verification
 * review flow, which has its own status lifecycle and docket reference.
 */
export async function POST(request: NextRequest) {
  const authResult = await withAuth(request, ['agent']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const parsed = onboardingAgentLicenseSchema.parse(body);

    const data = {
      board: parsed.board,
      licenseNumber: parsed.licenseNumber,
      certificateFileName: parsed.certificateFileName ?? null,
      isAgency: parsed.isAgency ?? false,
      cacDocumentFileName: parsed.cacDocumentFileName ?? null,
      indemnityPolicyNumber: parsed.indemnityPolicyNumber ?? null,
      indemnityExpiryDate: parsed.indemnityExpiryDate ?? null,
      codeOfConductConsent: parsed.codeOfConductConsent,
    };

    const profile = await prisma.agentProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...data },
      update: data,
    });

    const nextStep = await advanceOnboarding(user.id, user.role, 'agentLicense');

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
    console.error('Onboarding agent license error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
