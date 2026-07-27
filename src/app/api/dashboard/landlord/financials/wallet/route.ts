import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { getOrCreateWallet } from '@/lib/wallet-service';

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request, ['landlord', 'admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const wallet = await getOrCreateWallet(user.id);

    const [pendingTxs, recentWalletTxs, paystackAccount] = await Promise.all([
      prisma.walletTransaction.findMany({
        where: { userId: user.id, status: 'pending' },
        select: { amount: true },
      }),
      prisma.walletTransaction.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          id: true,
          type: true,
          status: true,
          amount: true,
          currency: true,
          providerRef: true,
          description: true,
          createdAt: true,
          meta: true,
          openingBalance: true,
          closingBalance: true,
        },
      }),
      prisma.userPaystackAccount.findUnique({
        where: { userId: user.id },
        select: {
          bankName: true,
          accountNumber: true,
          accountName: true,
          recipientCode: true,
          customerCode: true,
          status: true,
        },
      }),
    ]);

    const availableBalance = Number(wallet.balance || 0);
    const pendingClearing = pendingTxs.reduce((sum, t) => sum + Number(t.amount), 0);

    return NextResponse.json({
      success: true,
      data: {
        walletId: wallet.id,
        currency: wallet.currency,
        availableBalance,
        pendingClearing,
        isLocked: wallet.isLocked,
        bankAccount: paystackAccount || null,
        recentTransactions: recentWalletTxs,
      },
    });
  } catch (error) {
    console.error('Landlord wallet financials error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
