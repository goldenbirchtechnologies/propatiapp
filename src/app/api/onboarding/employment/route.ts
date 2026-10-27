import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { onboardingEmploymentSchema } from '@/lib/validators';
import { upsertDossier, markStepDone, ensureOnboardingRow } from '@/lib/onboarding/dossier';
import { EMPLOYMENT_STATUS_REQUIRES_TYPE } from '@/lib/onboarding/steps';

/**
 * POST /api/onboarding/employment
 * Captures the tenant's employment details for the rental application.
 */
export async function POST(request: NextRequest) {
  const authResult = await withAuth(request, ['tenant']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const parsed = onboardingEmploymentSchema.parse(body);

    // Employment type only applies to people who are working.
    const requiresType = EMPLOYMENT_STATUS_REQUIRES_TYPE.includes(parsed.employmentStatus);
    if (requiresType && !parsed.employmentType) {
      return NextResponse.json(
        { success: false, error: 'Select your employment type' },
        { status: 400 }
      );
    }

    const dossier = await upsertDossier(user.id, {
      employmentStatus: parsed.employmentStatus,
      employmentType: requiresType ? (parsed.employmentType ?? undefined) : undefined,
      employerName: parsed.employerName ?? null,
      jobTitle: parsed.jobTitle ?? null,
      yearlyIncome: parsed.yearlyIncome != null ? BigInt(Math.round(parsed.yearlyIncome)) : null,
      yearsInEmployment: parsed.yearsInEmployment ?? null,
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { onboardingStatus: 'in_progress' },
    });
    await ensureOnboardingRow(user.id, user.role, 'guarantor');
    await markStepDone(user.id, user.role, 'employment', 'guarantor');

    return NextResponse.json({
      success: true,
      data: {
        id: dossier.id,
        employmentStatus: dossier.employmentStatus,
        employmentType: dossier.employmentType,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Onboarding employment error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
