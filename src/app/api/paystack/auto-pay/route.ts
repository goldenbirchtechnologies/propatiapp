import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { autoPayMandateSchema } from '@/lib/validators';

/**
 * Auto-pay mandates.
 *
 * IMPORTANT: these routes persist the tenant's instruction and nothing more.
 * The Paystack Direct-Debit half (creating the subscription that would actually
 * pull money) is not wired into src/lib/paystack.ts, so every mandate is stored
 * with status `requested`. Clients must not describe a mandate as active.
 */

const MANDATE_SELECT = {
  id: true,
  agreementId: true,
  enabled: true,
  execDay: true,
  amountStrategy: true,
  threshold: true,
  status: true,
  revokedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

/** GET /api/paystack/auto-pay — the caller's mandate, if they have one. */
export async function GET(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const mandate = await prisma.autoPayMandate.findFirst({
      where: { userId: user.id, status: { not: 'cancelled' } },
      orderBy: { createdAt: 'desc' },
      select: MANDATE_SELECT,
    });

    return NextResponse.json({
      success: true,
      data: {
        mandate,
        // Surfaced explicitly so the UI can say "requested, not yet live"
        // without inferring it from the status string.
        liveDebitEnabled: false,
      },
    });
  } catch (error) {
    console.error('Auto-pay GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load auto-pay mandate' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/paystack/auto-pay
 *
 * Records the mandate the tenant asked for. Re-posting replaces the open one
 * rather than stacking duplicates, since a tenant has at most one standing
 * instruction per account.
 */
export async function POST(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const parsed = autoPayMandateSchema.parse(body);

    const mandate = await prisma.$transaction(async (tx) => {
      await tx.autoPayMandate.updateMany({
        where: { userId: user.id, status: 'requested' },
        data: { status: 'cancelled', revokedAt: new Date() },
      });

      return tx.autoPayMandate.create({
        data: {
          userId: user.id,
          agreementId: parsed.agreementId ?? null,
          enabled: parsed.enabled ?? true,
          execDay: parsed.execDay ?? 1,
          amountStrategy: parsed.amountStrategy ?? 'fixed',
          threshold: parsed.threshold === null || parsed.threshold === undefined
            ? null
            : BigInt(parsed.threshold),
          status: 'requested',
        },
        select: MANDATE_SELECT,
      });
    });

    return NextResponse.json(
      { success: true, data: { mandate, liveDebitEnabled: false } },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid mandate', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Auto-pay POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save auto-pay mandate' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/paystack/auto-pay
 *
 * Cancels the caller's open mandate. Nothing was ever live at Paystack, so this
 * is purely a record change.
 */
export async function DELETE(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const { count } = await prisma.autoPayMandate.updateMany({
      where: { userId: user.id, status: 'requested' },
      data: { status: 'cancelled', revokedAt: new Date(), enabled: false },
    });

    if (count === 0) {
      return NextResponse.json(
        { success: false, error: 'No open mandate to cancel' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: { cancelled: count } });
  } catch (error) {
    console.error('Auto-pay DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cancel auto-pay mandate' },
      { status: 500 }
    );
  }
}
