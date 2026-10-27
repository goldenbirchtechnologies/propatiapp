import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { getOnboardingSnapshot } from '@/lib/onboarding/status';

/**
 * POST /api/onboarding/rental-application/submit
 * Marks the tenant's rental application as submitted.
 */
export async function POST(request: NextRequest) {
  const authResult = await withAuth(request, ['tenant']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const dossier = await prisma.rentalApplicationDossier.findUnique({
      where: { userId: user.id },
    });

    if (!dossier) {
      return NextResponse.json(
        { success: false, error: 'Complete the application first.' },
        { status: 400 }
      );
    }

    await prisma.rentalApplicationDossier.update({
      where: { userId: user.id },
      data: { status: 'submitted', submittedAt: new Date() },
    });

    const snapshot = await getOnboardingSnapshot(user.id);

    return NextResponse.json({
      success: true,
      data: {
        submitted: true,
        canComplete: snapshot?.canComplete ?? false,
        status: snapshot?.status,
      },
    });
  } catch (error) {
    console.error('Onboarding rental application submit error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
