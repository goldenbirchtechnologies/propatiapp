import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { markStepSkipped } from '@/lib/onboarding/dossier';
import { getStepsForRole } from '@/lib/onboarding/steps';

/**
 * POST /api/onboarding/skip
 * Defers one optional step so the user can reach their dashboard without it.
 *
 * Deferring does not complete onboarding: the account is left `blocked`, the
 * dashboard opens, and agreements, payments and listings stay locked until the
 * step is actually saved. Only a step the role's own pipeline marks `skippable`
 * may be deferred, so the client cannot promote a required step into a skip.
 */
export async function POST(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json().catch(() => null);
    const requested: unknown = body?.step;

    const definition = getStepsForRole(user.role).find((step) => step.id === requested);
    if (!definition) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNKNOWN_STEP',
          message: 'That step is not part of your onboarding.',
        },
        { status: 400 }
      );
    }

    if (!definition.skippable) {
      return NextResponse.json(
        {
          success: false,
          error: 'STEP_REQUIRED',
          message: `${definition.title} must be completed before you can continue.`,
        },
        { status: 400 }
      );
    }

    await markStepSkipped(user.id, user.role, definition.id);

    // The user-level flag is the denormalised copy the dashboards read; the
    // wizard has been interacted with, so it is no longer "not started".
    await prisma.user.update({
      where: { id: user.id },
      data: { onboardingStatus: 'in_progress' },
    });

    return NextResponse.json({
      success: true,
      data: { skipped: definition.id },
    });
  } catch (error) {
    console.error('Onboarding skip error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
