import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';

export default async function AgentWithdrawalsPage() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'agent') redirect('/dashboard');

  const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
  const withdrawals = await prisma.walletTransaction.findMany({
    where: { walletId: wallet?.id, type: 'withdrawal' },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const totalWithdrawn = withdrawals.reduce((sum, tx) => sum + Number(tx.amount), 0);

  return (
    <DashboardShell navigation={AGENT_NAVIGATION} userRole="agent" userName={user.fullName} userAvatar={user.avatarUrl || undefined}>
      <ErrorBoundary>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Withdrawals</h1>
            <p className="text-zinc-500 mt-1">Payout history and fund transfers.</p>
          </div>

          <div className="rounded-xl border border-white/[0.08] p-4">
            <p className="text-xs text-zinc-500">Total Withdrawn</p>
            <p className="text-2xl font-bold text-white">₦{totalWithdrawn.toLocaleString()}</p>
          </div>

          <div className="rounded-xl border border-white/[0.08]">
            <div className="p-4 border-b border-white/[0.08]">
              <h2 className="text-lg font-semibold text-white">Payouts</h2>
            </div>
            <div className="divide-y divide-border">
              {withdrawals.length === 0 && <p className="p-4 text-sm text-zinc-500">No withdrawals yet.</p>}
              {withdrawals.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-medium text-white">{tx.description || 'Payout'}</p>
                    <p className="text-xs text-zinc-500">{new Date(tx.createdAt).toLocaleString()}</p>
                  </div>
                  <p className="text-sm font-semibold text-red-500">-₦{Number(tx.amount).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </DashboardShell>
  );
}
