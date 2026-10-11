import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import WithdrawalsClient from './withdrawals-client';

export const dynamic = 'force-dynamic';

export default async function AdminWithdrawalsPage() {
  const user = await getCurrentUserWithProfile();
  if (!user) redirect('/sign-in');
  if (user.role !== 'admin') redirect('/dashboard/tenant');

  const [
    totalReleased,
    totalInEscrow,
    totalPlatformFees,
    totalWalletBalance,
    walletCount,
    releasedTxCount,
  ] = await Promise.all([
    prisma.transaction.aggregate({
      _sum: { amount: true, platformFee: true },
      where: { status: 'released' },
    }),
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { status: 'in_escrow' },
    }),
    prisma.transaction.aggregate({
      _sum: { platformFee: true },
      where: { status: { in: ['released', 'in_escrow'] } },
    }),
    prisma.wallet.aggregate({
      _sum: { balance: true },
    }),
    prisma.wallet.count(),
    prisma.transaction.count({ where: { status: 'released' } }),
  ]);

  const recentTransactions = await prisma.transaction.findMany({
    orderBy: { createdAt: 'desc' },
    take: 15,
    select: {
      id: true,
      reference: true,
      status: true,
      type: true,
      amount: true,
      platformFee: true,
      currency: true,
      createdAt: true,
      payer: { select: { fullName: true, email: true } },
      payee: { select: { fullName: true, email: true } },
    },
  });

  const releasedAmount = totalReleased._sum.amount ? Number(totalReleased._sum.amount) : 0;
  const escrowedAmount = totalInEscrow._sum.amount ? Number(totalInEscrow._sum.amount) : 0;
  const feeTotal = totalPlatformFees._sum.platformFee ? Number(totalPlatformFees._sum.platformFee) : 0;
  const totalWallet = totalWalletBalance._sum.balance ? Number(totalWalletBalance._sum.balance) : 0;

  // BigInt doesn't survive the server→client boundary cleanly — convert before passing props
  const clientTransactions = recentTransactions.map((tx) => ({
    ...tx,
    amount: Number(tx.amount),
    platformFee: Number(tx.platformFee),
  }));

  return (
    <DashboardShell
      navigation={ADMIN_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <WithdrawalsClient
          stats={{
            releasedAmount,
            escrowedAmount,
            feeTotal,
            totalWallet,
            walletCount,
            releasedTxCount,
          }}
          transactions={clientTransactions}
        />
      </ErrorBoundary>
    </DashboardShell>
  );
}