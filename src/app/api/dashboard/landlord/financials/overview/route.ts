import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { getOrCreateWallet } from '@/lib/wallet-service';

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request, ['landlord', 'admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const where: Record<string, unknown> = {
      OR: [{ payeeId: user.id }, { payerId: user.id }],
    };

    if (propertyId) {
      where.listingId = propertyId;
    }

    if (from || to) {
      where.createdAt = {};
      if (from) (where.createdAt as Record<string, string>).gte = from;
      if (to) (where.createdAt as Record<string, string>).lte = to;
    }

    const [transactions, pendingCount, totalIncomeKobo, wallet, pendingWalletClearing, recentWalletTxs, paystackAccount, properties] =
      await Promise.all([
        prisma.transaction.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: { listing: { select: { id: true, title: true } } },
        }),
        prisma.transaction.count({
          where: {
            OR: [{ payeeId: user.id }, { payerId: user.id }],
            status: { in: ['pending', 'in_escrow'] },
          },
        }),
        prisma.transaction.aggregate({
          where: { payeeId: user.id, status: 'released' },
          _sum: { amount: true },
        }),
        getOrCreateWallet(user.id),
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
        prisma.listing.findMany({
          where: { ownerId: user.id },
          select: { id: true, title: true },
          orderBy: { title: 'asc' },
        }),
      ]);

    const totalIncome = Number(totalIncomeKobo._sum.amount || 0) / 100;
    const availableBalance = Number(wallet.balance || 0);
    const pendingClearing = pendingWalletClearing.reduce((sum, t) => sum + Number(t.amount), 0);

    const statusBadgeVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      success: 'default',
      released: 'default',
      completed: 'default',
      paid: 'default',
      pending: 'secondary',
      in_escrow: 'secondary',
      disputed: 'destructive',
      failed: 'destructive',
    };

    const formattedTransactions = transactions.map((tx) => ({
      id: tx.id,
      date: new Date(tx.createdAt).toLocaleDateString('en-NG'),
      reference: tx.reference || tx.id,
      listing: tx.listing?.title || '—',
      listingId: tx.listingId,
      type: tx.type.replace(/_/g, ' '),
      status: tx.status.replace(/_/g, ' '),
      statusBadgeVariant: statusBadgeVariant[tx.status] || 'outline',
      amount: Number(tx.amount) / 100,
      currency: tx.currency || 'NGN',
    }));

    const formattedWalletTxs = recentWalletTxs.map((tx) => ({
      id: tx.id,
      type: tx.type,
      status: tx.status,
      amount: Number(tx.amount),
      currency: tx.currency || 'NGN',
      providerRef: tx.providerRef,
      description: tx.description,
      date: new Date(tx.createdAt).toLocaleDateString('en-NG'),
      meta: tx.meta,
    }));

    return NextResponse.json({
      success: true,
      data: {
        metrics: {
          totalIncome,
          pendingCount,
          transactionCount: transactions.length,
        },
        transactions: formattedTransactions,
        wallet: {
          availableBalance,
          pendingClearing,
          currency: wallet.currency,
          isLocked: wallet.isLocked,
          bankAccount: paystackAccount || null,
          recentTransactions: formattedWalletTxs,
        },
        filters: {
          properties,
        },
      },
    });
  } catch (error) {
    console.error('Landlord financials overview error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
