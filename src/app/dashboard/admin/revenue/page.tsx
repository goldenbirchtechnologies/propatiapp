import { getCurrentUserWithProfile, getRoleRedirectPath } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

export default async function AdminRevenuePage() {
  const user = await getCurrentUserWithProfile();
  if (!user) redirect('/sign-in');
  if (user.role !== 'admin') redirect(getRoleRedirectPath(user.role));

  const displayName = user.fullName || 'Admin';

  const transactions = await prisma.transaction.findMany({
    where: { status: 'released' },
    select: { id: true, type: true, amount: true, platformFee: true, agentCommission: true, payeeAmount: true, paidAt: true },
  });

  const totalReleased = transactions.reduce((sum, t) => sum + (t.payeeAmount || t.amount), 0);
  const totalPlatformFees = transactions.reduce((sum, t) => sum + t.platformFee, 0);
  const totalAgentCommissions = transactions.reduce((sum, t) => sum + t.agentCommission, 0);
  const totalVolume = transactions.reduce((sum, t) => sum + t.amount, 0);

  const revenueByType = transactions.reduce<Record<string, number>>((acc, t) => {
    acc[t.type] = (acc[t.type] || 0) + (t.payeeAmount || t.amount);
    return acc;
  }, {});

  const recentRevenue = transactions
    .filter((t) => t.paidAt)
    .sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime())
    .slice(0, 10);

  return (
    <DashboardShell navigation={ADMIN_NAVIGATION} userRole="admin" userName={displayName} userAvatar={user.avatarUrl || undefined}>

      <ErrorBoundary>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Revenue</h1>
            <p className="text-muted-foreground mt-1">Track and analyze platform revenue and fees.</p>
          </div>
          <button className="px-4 py-2 bg-green-600 text-on-success rounded-lg hover:bg-green-700">
            Export Data
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-lg border border-[#262626] bg-obsidian-800/30 p-6 shadow-card">
            <p className="text-muted-foreground text-sm">Total Revenue</p>
            <p className="text-2xl font-bold text-white mt-2">{formatCurrency(totalReleased)}</p>
          </div>
          <div className="rounded-lg border border-[#262626] bg-obsidian-800/30 p-6 shadow-card">
            <p className="text-muted-foreground text-sm">Platform Fees</p>
            <p className="text-2xl font-bold text-white mt-2">{formatCurrency(totalPlatformFees)}</p>
          </div>
          <div className="rounded-lg border border-[#262626] bg-obsidian-800/30 p-6 shadow-card">
            <p className="text-muted-foreground text-sm">Agent Commissions</p>
            <p className="text-2xl font-bold text-white mt-2">{formatCurrency(totalAgentCommissions)}</p>
          </div>
          <div className="rounded-lg border border-[#262626] bg-obsidian-800/30 p-6 shadow-card">
            <p className="text-muted-foreground text-sm">Volume</p>
            <p className="text-2xl font-bold text-white mt-2">{formatCurrency(totalVolume)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-lg border border-[#262626] bg-obsidian-800/30 shadow-card overflow-hidden">
            <div className="px-6 py-4 border-b border-[#262626]">
              <h2 className="text-lg font-semibold text-white">Revenue by Type</h2>
            </div>
            <div className="p-6 space-y-3">
              {Object.entries(revenueByType).length === 0 ? (
                <p className="text-muted-foreground">No revenue data yet.</p>
              ) : (
                Object.entries(revenueByType).map(([type, amount]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-white capitalize">{type.replace(/_/g, ' ')}</span>
                    <span className="font-semibold text-white">{formatCurrency(amount)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-lg border border-[#262626] bg-obsidian-800/30 shadow-card overflow-hidden">
            <div className="px-6 py-4 border-b border-[#262626]">
              <h2 className="text-lg font-semibold text-white">Recent Released Payments</h2>
            </div>
            {recentRevenue.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-muted-foreground">No revenue data yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#262626] text-left text-muted-foreground">
                      <th className="p-3 font-medium">Type</th>
                      <th className="p-3 font-medium">Amount</th>
                      <th className="p-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentRevenue.map((tx) => (
                      <tr key={tx.id} className="border-b border-[#262626] last:border-0 hover:bg-obsidian-800-lowest/50">
                        <td className="p-3 text-white capitalize">{tx.type.replace(/_/g, ' ')}</td>
                        <td className="p-3 text-white">{formatCurrency(tx.payeeAmount || tx.amount)}</td>
                        <td className="p-3 text-white">{tx.paidAt ? new Date(tx.paidAt).toLocaleDateString('en-NG') : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    
      </ErrorBoundary>
</DashboardShell>
  );
}
