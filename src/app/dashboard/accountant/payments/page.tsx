import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ACCOUNTANT_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';

export default async function AccountantPaymentsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'accountant') redirect('/dashboard');

  const [recent, pendingCount, totalVolume] = await Promise.all([
    prisma.transaction.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }),
    prisma.transaction.count({ where: { status: 'pending' } }),
    prisma.transaction.aggregate({ _sum: { amount: true }, where: { status: 'success' } }),
  ]);

  return (
    <DashboardShell navigation={ACCOUNTANT_NAVIGATION} userRole="accountant" userName={user.fullName} userAvatar={user.avatarUrl || undefined}>
      <ErrorBoundary>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Rent & Payments</h1>
            <p className="text-muted-foreground mt-1">Monitor payments, disbursements, and platform financial activity.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs text-muted-foreground">Processed Volume</p>
              <p className="text-2xl font-bold text-foreground">₦{Number(totalVolume._sum.amount || 0).toLocaleString()}</p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs text-muted-foreground">Pending Transactions</p>
              <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs text-muted-foreground">Recent Transactions</p>
              <p className="text-2xl font-bold text-foreground">{recent.length}</p>
            </div>
          </div>

          <div className="rounded-lg border border-border">
            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Recent Transactions</h2>
            </div>
            <div className="divide-y divide-border">
              {recent.length === 0 && <p className="p-4 text-sm text-muted-foreground">No transactions yet.</p>}
              {recent.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">{tx.description || tx.type}</p>
                    <p className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleString()}</p>
                  </div>
                  <p className={`text-sm font-semibold ${tx.status === 'success' ? 'text-green-400' : 'text-yellow-400'}`}>
                    ₦{Number(tx.amount).toLocaleString()} <span className="text-xs">{tx.status}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </DashboardShell>
  );
}
