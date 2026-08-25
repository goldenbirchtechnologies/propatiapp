import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminWithdrawalsPage() {
  const user = await getCurrentUserWithProfile();
  if (!user) redirect('/sign-in');
  if (user.role !== 'admin') redirect('/dashboard/tenant');

  // Aggregate financial stats from platform transactions
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

  // Recent transaction feed
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
        transactions={recentTransactions}
      />
    
      </ErrorBoundary>
</DashboardShell>
  );
}

function WithdrawalsClient({
  stats,
  transactions,
}: {
  stats: {
    releasedAmount: number;
    escrowedAmount: number;
    feeTotal: number;
    totalWallet: number;
    walletCount: number;
    releasedTxCount: number;
  };
  transactions: {
    id: string;
    reference: string | null;
    status: string;
    type: string;
    amount: number;
    platformFee: number;
    currency: string;
    createdAt: Date;
    payer: { fullName: string; email: string } | null;
    payee: { fullName: string; email: string } | null;
  }[];
}) {
  'use client';

  const formatKobo = (val: number) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(val / 100);

  const initials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

  const statusClass = (s: string) => {
    switch (s) {
      case 'released':
        return 'bg-emerald-600 text-on-success';
      case 'in_escrow':
        return 'bg-secondary-container text-on-secondary-container';
      case 'pending':
        return 'bg-outline-variant text-white';
      case 'failed':
        return 'bg-error/10 text-error';
      default:
        return 'bg-outline-variant/30 text-zinc-400';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-white tracking-tight">
          Withdrawals &amp; Financials
        </h1>
        <p className="text-zinc-400 font-body-md mt-1">
          Platform payouts, escrow balances, and wallet overview.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Withdrawn / Released',
            value: formatKobo(stats.releasedAmount),
            sub: `${stats.releasedTxCount.toLocaleString()} transactions`,
          },
          {
            label: 'In Escrow Balance',
            value: formatKobo(stats.escrowedAmount),
            sub: 'Held in escrow',
          },
          {
            label: 'Platform Fee Revenue',
            value: formatKobo(stats.feeTotal),
            sub: 'Net collected',
          },
          {
            label: 'Total Wallet Holdings',
            value: formatKobo(stats.totalWallet),
            sub: `${stats.walletCount.toLocaleString()} wallets registered`,
          },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-white/[0.08] bg-surface p-lg shadow-sm"
          >
            <div className="text-sm text-zinc-400 font-medium mb-2">{card.label}</div>
            <div className="font-headline-md text-headline-md text-white leading-tight">{card.value}</div>
            <p className="text-xs text-zinc-400 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Transaction Feed */}
      <div className="rounded-xl border border-white/[0.08] bg-surface shadow-sm overflow-hidden">
        <div className="p-md border-b border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-md bg-zinc-950">
          <h3 className="text-white text-white">Recent Transactions</h3>
          <span className="text-xs text-zinc-400">
            Showing {transactions.length} most recent
          </span>
        </div>
        {transactions.length === 0 ? (
          <p className="p-lg text-sm text-zinc-400 text-center">No transactions found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-900 border-b border-white/[0.08]">
                  {['ID', 'Type', 'Amount', 'Fee', 'Payer', 'Payee', 'Status', 'Date'].map((h) => (
                    <th
                      key={h}
                      className="px-md py-3 text-xs text-label-sm text-zinc-400 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-zinc-900 transition-colors">
                    <td className="px-md py-4 font-label-sm text-label-sm text-white whitespace-nowrap">
                      {tx.reference || tx.id.slice(0, 12)}
                    </td>
                    <td className="px-md py-4 text-body-sm capitalize">{tx.type.replace(/_/g, ' ')}</td>
                    <td className="px-md py-4 font-bold text-white text-body-sm whitespace-nowrap">
                      {formatKobo(tx.amount)}
                    </td>
                    <td className="px-md py-4 text-xs text-zinc-400 whitespace-nowrap">
                      {tx.platformFee > 0 ? formatKobo(tx.platformFee) : '—'}
                    </td>
                    <td className="px-md py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-secondary-container flex items-center justify-center text-[10px] font-bold text-on-secondary-container shrink-0">
                          {initials(tx.payer?.fullName || '??')}
                        </div>
                        <span className="text-body-sm truncate max-w-[140px]">{tx.payer?.fullName || '—'}</span>
                      </div>
                    </td>
                    <td className="px-md py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-tertiary-container flex items-center justify-center text-[10px] font-bold shrink-0">
                          {initials(tx.payee?.fullName || '??')}
                        </div>
                        <span className="text-body-sm truncate max-w-[140px]">{tx.payee?.fullName || '—'}</span>
                      </div>
                    </td>
                    <td className="px-md py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-label-sm uppercase tracking-wider ${statusClass(tx.status)}`}
                      >
                        {tx.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-md py-4 text-body-sm text-zinc-400 whitespace-nowrap">
                      {tx.createdAt.toLocaleDateString('en-NG', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-6 py-3 border-t border-white/[0.08] flex items-center justify-between">
          <p className="text-xs text-zinc-400">
            {transactions.length} records shown
          </p>
          <span className="text-xs text-zinc-400">Kibo-based aggregation (kobo units)</span>
        </div>
      </div>
    </div>
  );
}
