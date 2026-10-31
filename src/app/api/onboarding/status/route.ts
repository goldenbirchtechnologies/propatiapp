import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { getOnboardingSnapshot } from '@/lib/onboarding/status';

/**
 * GET /api/onboarding/status
 * Returns the onboarding snapshot used by the dashboard gate.
 *
 * The response is deliberately redacted: it never includes encrypted
 * identifiers, ID numbers, income figures or any other sensitive field.
 */
export async function GET(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const snapshot = await getOnboardingSnapshot(user.id);

    if (!snapshot) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        role: snapshot.role,
        status: snapshot.status,
        required: snapshot.required,
        currentStep: snapshot.currentStep,
        canComplete: snapshot.canComplete,
        blocked: snapshot.blocked,
        steps: snapshot.steps.map((step) => ({
          id: step.id,
          title: step.title,
          description: step.description,
          done: step.done,
          skippable: step.skippable,
          skipped: step.skipped,
        })),
      },
    });
  } catch (error) {
    console.error('Onboarding status error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
