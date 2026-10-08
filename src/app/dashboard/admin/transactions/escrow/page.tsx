import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import { AlertTriangle } from 'lucide-react';
import EscrowClient from './escrow-client';

export const dynamic = 'force-dynamic';

export default async function AdminEscrowTransactionsPage() {
  const user = await getCurrentUserWithProfile();
  if (!user) redirect('/sign-in');
  if (user.role !== 'admin') redirect('/dashboard/tenant');

  const [escrowedCount, totalEscrowBalance, disputedCount, disputedAmount, recentEscrowed, recentDisputed] =
    await Promise.all([
      prisma.transaction.count({ where: { status: 'in_escrow' } }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { status: 'in_escrow' },
      }),
      prisma.transaction.count({ where: { status: 'failed' } }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { status: 'failed' },
      }),
      prisma.transaction.findMany({
        where: { status: 'in_escrow' },
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          id: true,
          reference: true,
          status: true,
          type: true,
          amount: true,
          currency: true,
          createdAt: true,
          listingId: true,
          payer: { select: { fullName: true } },
          payee: { select: { fullName: true } },
        },
      }),
      prisma.transaction.findMany({
        where: { status: 'failed' },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          reference: true,
          status: true,
          type: true,
          amount: true,
          currency: true,
          createdAt: true,
          listingId: true,
          payer: { select: { fullName: true } },
          payee: { select: { fullName: true } },
        },
      }),
    ]);

  const escrowBalance = totalEscrowBalance._sum.amount ? Number(totalEscrowBalance._sum.amount) : 0;
  const disputeBalance = disputedAmount._sum.amount ? Number(disputedAmount._sum.amount) : 0;

  // BigInt doesn't survive the server→client boundary cleanly — convert before passing props
  const toClientTx = <T extends { amount: bigint }>(rows: T[]) =>
    rows.map(({ amount, ...rest }) => ({ ...rest, amount: Number(amount) }));
  const escrowedTx = toClientTx(recentEscrowed);
  const disputedTx = toClientTx(recentDisputed);

  // Aggregate GTV from released + in_escrow
  const gtvAgg = await prisma.transaction.aggregate({
    _sum: { amount: true },
    where: { status: { in: ['released', 'in_escrow'] } },
  });
  const gtv = gtvAgg._sum.amount ? Number(gtvAgg._sum.amount) : 0;

  return (
    <DashboardShell
      navigation={ADMIN_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <EscrowClient
          stats={{
            gtv,
            escrowCount: escrowedCount,
            escrowBalance,
            disputeCount: disputedCount,
            disputeBalance,
            pendingSettlements: escrowedCount,
          }}
          escrowed={escrowedTx}
          disputed={disputedTx}
        />
      </ErrorBoundary>
    </DashboardShell>
  );
}
