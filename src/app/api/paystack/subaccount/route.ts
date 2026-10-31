import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { provisionSubaccount } from '@/lib/verified-identity';

export const runtime = 'nodejs';

const subaccountSchema = z.object({
  bankCode: z.string().trim().min(2),
  accountNumber: z.string().regex(/^\d{10}$/, 'must be a 10-digit account number'),
  businessName: z.string().trim().min(2).optional(),
  percentageCharge: z.number().min(0).max(100).optional(),
});

/**
 * POST /api/paystack/subaccount
 *
 * Registers the settlement account this user's collections split into. The
 * account must belong to the identity Dojah verified — that check lives in
 * `provisionSubaccount`, so it cannot be bypassed by calling this route.
 */
export async function POST(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const parsed = subaccountSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'INVALID_INPUT', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const result = await provisionSubaccount(user.id, parsed.data);

  if (!result.ok) {
    const status =
      result.error === 'KYC_REQUIRED'
        ? 403
        : result.error === 'PAYSTACK_NOT_CONFIGURED'
          ? 503
          : 422;
    return NextResponse.json({ success: false, error: result.error, message: result.message }, { status });
  }

  return NextResponse.json({
    success: true,
    message: 'Settlement account added',
    data: {
      subaccountCode: result.subaccountCode,
      accountName: result.accountName,
      percentageCharge: result.percentageCharge,
      verified: result.verified,
    },
  });
}

/** GET /api/paystack/subaccount — the settlement account currently on file. */
export async function GET(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const account = await prisma.userPaystackAccount.findUnique({
    where: { userId: user.id },
    select: {
      subaccountCode: true,
      percentageCharge: true,
      accountNumber: true,
      accountName: true,
      bankName: true,
      status: true,
    },
  });

  return NextResponse.json({ success: true, data: account });
}
