import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { accountSettingsSchema } from '@/lib/validators';
import { getSettlementSummary } from '@/lib/settlement';
import { getOnboardingSnapshot } from '@/lib/onboarding/status';

const SETTINGS_SELECT = {
  paystackInvoicingEnabled: true,
  paymentRemindersEnabled: true,
  stampDutySurchargeEnabled: true,
  escrowSplitPercent: true,
} as const;

/**
 * GET /api/accounts/settings
 *
 * Everything the landlord billing tab renders, read for the caller's own user id
 * — the route takes no id parameter, so one landlord can never ask for another's
 * settlement details.
 *
 * The settlement half comes from `getSettlementSummary`, which masks the NUBAN
 * to its last four digits. The raw account number stays in the database; the
 * billing card only ever needs to confirm which account is linked.
 *
 * No profile row yet is a normal state (a landlord can reach the dashboard
 * before finishing onboarding), so the settings come back as the schema defaults
 * rather than 404.
 */
export async function GET(request: NextRequest) {
  const authResult = await withAuth(request, ['landlord']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const [profile, settlement, snapshot] = await Promise.all([
      prisma.landlordProfile.findUnique({
        where: { userId: user.id },
        select: SETTINGS_SELECT,
      }),
      getSettlementSummary(user.id),
      getOnboardingSnapshot(user.id),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        settings: {
          paystackInvoicingEnabled: profile?.paystackInvoicingEnabled ?? true,
          paymentRemindersEnabled: profile?.paymentRemindersEnabled ?? true,
          stampDutySurchargeEnabled: profile?.stampDutySurchargeEnabled ?? true,
          escrowSplitPercent: profile?.escrowSplitPercent ?? 10,
        },
        settlement,
        onboarding: {
          required: snapshot?.required ?? false,
          completed: snapshot ? snapshot.status === 'completed' : false,
          remaining: snapshot ? snapshot.steps.filter((step) => !step.done).length : 0,
        },
      },
    });
  } catch (error) {
    console.error('Account settings GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load account settings' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/accounts/settings
 *
 * Toggles and the escrow split. The update is an upsert because the row is
 * optional — a landlord who skipped the settlement step still owns a toggle —
 * and it writes only the keys present in the body, so a single switch flip does
 * not overwrite the other three.
 *
 * The response echoes the stored row rather than accepting the request body, so
 * the client renders what the database actually holds.
 */
export async function PATCH(request: NextRequest) {
  const authResult = await withAuth(request, ['landlord']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const parsed = accountSettingsSchema.parse(body);

    const profile = await prisma.landlordProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...parsed },
      update: parsed,
      select: SETTINGS_SELECT,
    });

    return NextResponse.json({ success: true, data: { settings: profile } });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid settings', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Account settings PATCH error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update account settings' },
      { status: 500 }
    );
  }
}
