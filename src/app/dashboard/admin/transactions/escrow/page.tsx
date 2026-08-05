import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import { AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminEscrowTransactionsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

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
          type: true,
          amount: true,
          currency: true,
          createdAt: true,
          payer: { select: { fullName: true } },
          payee: { select: { fullName: true } },
        },
      }),
    ]);

  const escrowBalance = totalEscrowBalance._sum.amount ? Number(totalEscrowBalance._sum.amount) : 0;
  const disputeBalance = disputedAmount._sum.amount ? Number(disputedAmount._sum.amount) : 0;

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
        escrowed={recentEscrowed}
        disputed={recentDisputed}
      />
    
      </ErrorBoundary>
</DashboardShell>
  );
}

function EscrowClient({
  stats,
  escrowed,
  disputed,
}: {
  stats: {
    gtv: number;
    escrowCount: number;
    escrowBalance: number;
    disputeCount: number;
    disputeBalance: number;
    pendingSettlements: number;
  };
  escrowed: {
    id: string;
    reference: string | null;
    status: string;
    type: string;
    amount: number;
    currency: string;
    createdAt: Date;
    listingId: string | null;
    payer: { fullName: string } | null;
    payee: { fullName: string } | null;
  }[];
  disputed: {
    id: string;
    reference: string | null;
    type: string;
    amount: number;
    currency: string;
    createdAt: Date;
    payer: { fullName: string } | null;
    payee: { fullName: string } | null;
  }[];
}) {
  'use client';

  const formatKobo = (val: number) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(val / 100);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">
            Escrow Transactions
          </h1>
          <p className="text-muted-foreground font-body-md mt-1">
            Monitor platform GTV, escrow security, and financial integrity.
          </p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Platform GTV',
            value: formatKobo(stats.gtv),
            sub: 'Released + In Escrow',
          },
          {
            label: 'Active Escrow Balance',
            value: formatKobo(stats.escrowBalance),
            sub: `${stats.escrowCount.toLocaleString()} transactions`,
          },
          {
            label: 'Pending Settlements',
            value: `${stats.pendingSettlements.toLocaleString()}`,
            sub: 'Expecting release',
          },
          {
            label: 'Flagged / Disputed',
            value: `${stats.disputeCount.toLocaleString()} (${formatKobo(stats.disputeBalance)})`,
            sub: 'Requires review',
            danger: true,
          },
        ].map((card) => (
          <div
            key={card.label}
            className={`rounded-xl border shadow-sm p-lg ${
              card.danger
                ? 'border-error/20 bg-error/5'
                : 'border-outline-variant bg-surface'
            }`}
          >
            <div
              className={`text-sm font-medium mb-2 ${card.danger ? 'text-error' : 'text-muted-foreground'}`}
            >
              {card.label}
            </div>
            <div
              className={`font-headline-md text-headline-md ${card.danger ? 'text-error' : 'text-primary'}`}
            >
              {card.value}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Escrowed Transactions */}
      <div className="rounded-xl border border-outline-variant bg-surface shadow-sm overflow-hidden">
        <div className="p-md border-b border-outline-variant flex items-center justify-between bg-surface-container-low">
          <h3 className="font-headline-sm text-primary">Active Escrow Transactions</h3>
          <span className="text-xs text-muted-foreground">
            {escrowed.length} records
          </span>
        </div>
        {escrowed.length === 0 ? (
          <p className="p-lg text-sm text-muted-foreground text-center">No transactions currently in escrow.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container border-b border-outline-variant">
                  {['ID', 'Type', 'Amount', 'Payer', 'Payee', 'Status', 'Date'].map((h) => (
                    <th
                      key={h}
                      className="px-md py-3 font-label-md text-label-sm text-muted-foreground uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {escrowed.map((tx) => (
                  <tr key={tx.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-md py-4 font-label-sm text-label-sm text-primary whitespace-nowrap">
                      {tx.reference || tx.id.slice(0, 12)}
                    </td>
                    <td className="px-md py-4 text-body-sm capitalize">{tx.type.replace(/_/g, ' ')}</td>
                    <td className="px-md py-4 font-bold text-primary text-body-sm whitespace-nowrap">{formatKobo(tx.amount)}</td>
                    <td className="px-md py-4 text-body-sm">{tx.payer?.fullName || '—'}</td>
                    <td className="px-md py-4 text-body-sm">{tx.payee?.fullName || '—'}</td>
                    <td className="px-md py-4">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-label-sm uppercase tracking-wider bg-secondary-container text-on-secondary-container">
                        {tx.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-md py-4 text-body-sm text-muted-foreground whitespace-nowrap">
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
      </div>

      {/* Disputed / Flagged */}
      {disputed.length > 0 && (
        <div className="rounded-xl border-2 border-error/20 bg-error/5 shadow-sm overflow-hidden">
          <div className="p-md border-b border-error/20 flex items-center gap-2">
            <AlertTriangle className="text-error" />
            <h3 className="font-headline-sm text-error">Disputed Transactions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-error/10">
                  {['ID', 'Type', 'Amount', 'Payer', 'Payee', 'Date'].map((h) => (
                    <th
                      key={h}
                      className="px-md py-3 font-label-md text-label-sm text-muted-foreground uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-error/10">
                {disputed.map((tx) => (
                  <tr key={tx.id} className="hover:bg-error/5 transition-colors">
                    <td className="px-md py-4 font-label-sm text-label-sm text-error whitespace-nowrap">
                      {tx.reference || tx.id.slice(0, 12)}
                    </td>
                    <td className="px-md py-4 text-body-sm capitalize">{tx.type.replace(/_/g, ' ')}</td>
                    <td className="px-md py-4 font-bold text-error text-body-sm whitespace-nowrap">{formatKobo(tx.amount)}</td>
                    <td className="px-md py-4 text-body-sm">{tx.payer?.fullName || '—'}</td>
                    <td className="px-md py-4 text-body-sm">{tx.payee?.fullName || '—'}</td>
                    <td className="px-md py-4 text-body-sm text-muted-foreground whitespace-nowrap">
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
        </div>
      )}
    </div>
  );
}
