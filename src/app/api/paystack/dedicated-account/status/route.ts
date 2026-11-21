import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

/**
 * GET /api/paystack/dedicated-account/status
 *
 * Returns only the fields a signed-in user needs to fund their PropatiBox
 * account. Provider customer codes and any identity numbers never leave the
 * server through this endpoint.
 */
export async function GET(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const account = await prisma.userPaystackAccount.findUnique({
    where: { userId: authResult.user.id },
    select: {
      status: true,
      bankName: true,
      accountNumber: true,
      accountName: true,
      currency: true,
      dedicatedAccountId: true,
    },
  });

  return NextResponse.json({
    success: true,
    data: account
      ? {
          status: account.status,
          bankName: account.bankName,
          accountNumber: account.accountNumber,
          accountName: account.accountName,
          currency: account.currency,
          dedicatedAccountId: account.dedicatedAccountId,
        }
      : null,
  });
}
