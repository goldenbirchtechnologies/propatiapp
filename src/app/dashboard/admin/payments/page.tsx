import { getCurrentUserWithProfile, getRoleRedirectPath } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { formatCurrency, parseKoboToNaira } from '@/lib/utils';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import Link from 'next/link';

export default async function AdminPaymentsPage() {
  const user = await getCurrentUserWithProfile();
  if (!user) redirect('/sign-in');
  if (user.role !== 'admin') redirect(getRoleRedirectPath(user.role));

  const displayName = user.fullName || 'Admin';

  const [totalTransactions, recentTransactions, pendingTxns] = await Promise.all([
    prisma.transaction.count(),
    prisma.transaction.findMany({
      take: 15,
      orderBy: { createdAt: 'desc' },
      include: {
        listing: { select: { title: true } },
        payer: { select: { fullName: true } },
        payee: { select: { fullName: true } },
      },
    }),
    prisma.transaction.count({ where: { status: 'pending' } }),
  ]);

  return (
    <DashboardShell navigation={ADMIN_NAVIGATION} userRole="admin" userName={displayName} userAvatar={user.avatarUrl || undefined}>

      <ErrorBoundary>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Payments</h1>
          <p className="text-zinc-500 mt-1">Monitor escrow, rent, and agreement payments across the platform.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-lg border border-white/[0.08] bg-zinc-950 p-6 ">
            <p className="text-zinc-500 text-sm">Total Transactions</p>
            <p className="text-2xl font-bold text-white mt-2">{totalTransactions.toLocaleString()}</p>
          </div>
          <div className="rounded-lg border border-white/[0.08] bg-zinc-950 p-6 ">
            <p className="text-zinc-500 text-sm">Pending</p>
            <p className="text-2xl font-bold text-amber-600 mt-2">{pendingTxns.toLocaleString()}</p>
          </div>
          <div className="rounded-lg border border-white/[0.08] bg-zinc-950 p-6 ">
            <p className="text-zinc-500 text-sm">Recent Volume</p>
            <p className="text-2xl font-bold text-white mt-2">
              {formatCurrency(Number(recentTransactions.reduce((sum, t) => sum + Number(t.amount), 0)))}
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-white/[0.08] bg-zinc-950  overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.08]">
            <h2 className="text-lg font-semibold text-white">Recent Transactions</h2>
          </div>
          {recentTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-zinc-500">No payment data yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.08] text-left text-zinc-500">
                    <th className="p-3 font-medium">Reference</th>
                    <th className="p-3 font-medium">Listing</th>
                    <th className="p-3 font-medium">Payer</th>
                    <th className="p-3 font-medium">Payee</th>
                    <th className="p-3 font-medium text-right">Amount</th>
                    <th className="p-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-white/[0.08] last:border-0 hover:bg-zinc-900/50">
                      <td className="p-3 text-white font-mono text-xs">{tx.reference ?? tx.id}</td>
                      <td className="p-3 text-white">{tx.listing?.title ?? '—'}</td>
                      <td className="p-3 text-white">{tx.payer?.fullName ?? '—'}</td>
                      <td className="p-3 text-white">{tx.payee?.fullName ?? '—'}</td>
                      <td className="p-3 text-right">{formatCurrency(Number(tx.amount))}</td>
                      <td className="p-3">
                        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-zinc-900 text-white">
                          {tx.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    
      </ErrorBoundary>
</DashboardShell>
  );
}
