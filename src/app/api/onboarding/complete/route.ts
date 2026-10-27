import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { getOnboardingSnapshot } from '@/lib/onboarding/status';

/**
 * POST /api/onboarding/complete
 * Finalises onboarding. The client's claim that it is done is never trusted —
 * every required step is re-checked against the user's own data.
 */
export async function POST(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const snapshot = await getOnboardingSnapshot(user.id);

    if (!snapshot) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    if (!snapshot.required) {
      return NextResponse.json({ success: true, data: { status: 'completed' } });
    }

    if (!snapshot.canComplete) {
      const remaining = snapshot.steps.filter((s) => !s.done).map((s) => s.id);
      return NextResponse.json(
        {
          success: false,
          error: 'INCOMPLETE',
          message: 'Finish every step before completing your profile.',
          remainingSteps: remaining,
        },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          onboardingStatus: 'completed',
          onboardingCompletedAt: new Date(),
          // A tenant's screening profile is complete once onboarding finishes.
          ...(user.role === 'tenant' ? { profileCompleted: true } : {}),
        },
      }),
      prisma.userOnboarding.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          role: user.role,
          status: 'completed',
          currentStep: 'complete',
          completedAt: new Date(),
        },
        update: {
          status: 'completed',
          currentStep: 'complete',
          completedAt: new Date(),
        },
      }),
    ]);

    return NextResponse.json({ success: true, data: { status: 'completed' } });
  } catch (error) {
    console.error('Onboarding complete error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
