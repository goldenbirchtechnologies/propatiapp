import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
// Card import removed

export const metadata = {
  title: 'Withdrawals – Landlord',
  description: 'Manage your payouts and fund transfers.',
};

export default async function LandlordWithdrawalsPage() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'landlord') redirect('/dashboard');

  const payouts = await prisma.transaction.findMany({
    where: { payeeId: user.id, type: { in: ['withdrawal', 'payout'] } },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  return (
    <DashboardShell navigation={LANDLORD_NAVIGATION} userRole="landlord" userName={user.fullName} userAvatar={user.avatarUrl || undefined}>

      <ErrorBoundary>

      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-amber-500/15 bg-amber-500/5 p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Landmark className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate">No Organisation Linked</p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">KYC REQUIREMENT: attach a verified legal entity before syndicate listings.</p>
              <div className="mt-2 flex gap-1.5">
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] uppercase tracking-wider">KYC REQUIREMENT</Badge>
                <Badge variant="outline" className="bg-rose-500/5 text-rose-500 border-rose-500/10 text-[10px] uppercase tracking-wider">3 Overdue</Badge>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Banknote className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate">Revenue Sources and Streams</p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">Total stable cash inflow: NGN 11,400,000 paid 30-day cycles.</p>
              <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 mt-1">NGN 11,400,000</p>
            </div>
          </div>
          <div className="rounded-xl border border-amber-500/15 bg-amber-500/5 p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Wallet className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate">Operational Expense Allocations</p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">Quarterly maintenance pool: NGN 28,450,000 on hold.</p>
              <p className="text-xs font-mono text-amber-600 dark:text-amber-400 mt-1">NGN 28,450,000</p>
            </div>
          </div>
          <div className="rounded-xl border border-rose-500/15 bg-rose-500/5 p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
              <Landmark className="w-4 h-4 text-rose-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate">Delinquency and Arrears Recovery Desk</p>
              <p className="text-xs font-bold text-rose-700 dark:text-rose-400 mt-0.5">NGN 11,400,000</p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">Tenant flagged in LASRERA dispute escalation queue.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Withdrawals &amp; Fund Management</h1>
            <p className="text-zinc-600 dark:text-zinc-400 dark:text-zinc-400 mt-1">Manage your payouts and fund transfers.</p>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] shadow-none overflow-hidden">
          <div className="p-5 border-b border-zinc-200 dark:border-white/[0.08]">
            <h3 className="font-heading font-bold">Recent Withdrawals</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-zinc-800 border-b border-zinc-200 dark:border-white/[0.08]">
                <tr>
                  <th className="px-5 py-4 text-sm font-medium text-zinc-600 dark:text-zinc-400 dark:text-zinc-400">Reference</th>
                  <th className="px-5 py-4 text-sm font-medium text-zinc-600 dark:text-zinc-400 dark:text-zinc-400">Date</th>
                  <th className="px-5 py-4 text-sm font-medium text-zinc-600 dark:text-zinc-400 dark:text-zinc-400">Type</th>
                  <th className="px-5 py-4 text-sm font-medium text-zinc-600 dark:text-zinc-400 dark:text-zinc-400">Amount</th>
                  <th className="px-5 py-4 text-sm font-medium text-zinc-600 dark:text-zinc-400 dark:text-zinc-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {payouts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-sm text-zinc-600 dark:text-zinc-400 dark:text-zinc-400">
                      No withdrawals yet.
                    </td>
                  </tr>
                ) : (
                  payouts.map((w) => (
                    <tr key={w.id} className="hover:bg-white dark:bg-zinc-900 transition-colors">
                      <td className="px-5 py-4 text-sm font-mono text-zinc-600 dark:text-zinc-400 dark:text-zinc-400">{w.reference || w.id}</td>
                      <td className="px-5 py-4 text-sm">{new Date(w.createdAt).toLocaleDateString('en-NG')}</td>
                      <td className="px-5 py-4 text-sm"><span className="capitalize">{w.type.replace('_', ' ')}</span></td>
                      <td className="px-5 py-4 text-sm font-medium">₦{new Intl.NumberFormat('en-NG').format(Number(w.amount) / 100)}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${w.status === 'released' ? 'bg-success/10 text-[#10b981] border border-success/20' : w.status === 'pending' ? 'bg-warning/10 text-warning border border-warning/20' : 'bg-white dark:bg-zinc-900/30 text-zinc-600 dark:text-zinc-400 dark:text-zinc-400'}`}>
                          {w.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    
      </ErrorBoundary>
</DashboardShell>
  );
}