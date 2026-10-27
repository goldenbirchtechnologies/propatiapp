import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { onboardingGuarantorSchema } from '@/lib/validators';
import { upsertDossier, markStepDone } from '@/lib/onboarding/dossier';

/**
 * POST /api/onboarding/guarantor
 * Captures the guarantor for the tenant's rental application.
 */
export async function POST(request: NextRequest) {
  const authResult = await withAuth(request, ['tenant']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const parsed = onboardingGuarantorSchema.parse(body);

    await upsertDossier(user.id, {
      guarantorName: parsed.guarantorName,
      guarantorPhone: parsed.guarantorPhone,
      guarantorRelationship: parsed.guarantorRelationship,
      guarantorAddress: parsed.guarantorAddress ?? null,
      guarantorOccupation: parsed.guarantorOccupation ?? null,
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { onboardingStatus: 'in_progress' },
    });
    await markStepDone(user.id, user.role, 'guarantor', 'complete');

    return NextResponse.json({ success: true, data: { guarantorName: parsed.guarantorName } });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Onboarding guarantor error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
