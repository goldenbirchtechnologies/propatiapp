import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ACCOUNTANT_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';

export default async function AccountantWithdrawalsPage() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'accountant') redirect('/dashboard');

  const withdrawals = await prisma.transaction.findMany({
    where: { type: { in: ['withdrawal', 'payout'] } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const total = withdrawals.reduce((sum, tx) => sum + Number(tx.amount), 0);

  return (
    <DashboardShell navigation={ACCOUNTANT_NAVIGATION} userRole="accountant" userName={user.fullName} userAvatar={user.avatarUrl || undefined}>
      <ErrorBoundary>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Withdrawals</h1>
            <p className="text-muted-foreground mt-1">Platform payout and withdrawal records.</p>
          </div>

          <div className="rounded-lg border border-[#262626] p-4">
            <p className="text-xs text-muted-foreground">Total Withdrawn</p>
            <p className="text-2xl font-bold text-white">₦{total.toLocaleString()}</p>
          </div>

          <div className="rounded-lg border border-[#262626]">
            <div className="p-4 border-b border-[#262626]">
              <h2 className="text-lg font-semibold text-white">Payouts</h2>
            </div>
            <div className="divide-y divide-border">
              {withdrawals.length === 0 && <p className="p-4 text-sm text-muted-foreground">No withdrawals yet.</p>}
              {withdrawals.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-medium text-white">{tx.description || 'Payout'}</p>
                    <p className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleString()}</p>
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
