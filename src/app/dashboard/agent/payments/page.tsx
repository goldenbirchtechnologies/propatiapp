import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import RentAndPaymentsHub, { type TabItem } from '@/components/financials/RentAndPaymentsHub';
import { TabsContent } from '@/components/ui/tabs';

const tabs: TabItem[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'commissions', label: 'Commissions' },
  { value: 'invoices', label: 'Invoices' },
  { value: 'withdrawals', label: 'Withdrawals' },
];

export default async function AgentPaymentsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'agent') redirect('/dashboard');

  const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
  const [recent, deposits, withdrawals] = await Promise.all([
    prisma.walletTransaction.findMany({
      where: { walletId: wallet?.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { wallet: { select: { user: { select: { fullName: true } } } } },
    }),
    prisma.walletTransaction.count({ where: { walletId: wallet?.id, type: 'deposit' } }),
    prisma.walletTransaction.count({ where: { walletId: wallet?.id, type: 'withdrawal' } }),
  ]);

  const balance = Number(wallet?.balance || 0);

  return (
    <DashboardShell navigation={AGENT_NAVIGATION} userRole="agent" userName={user.fullName} userAvatar={user.avatarUrl || undefined}>
      <ErrorBoundary>
        <RentAndPaymentsHub tabs={tabs}>
          <TabsContent value="overview">
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Rent & Payments</h1>
                <p className="text-muted-foreground mt-1">Wallet balance, deposits, withdrawals, and transaction history.</p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-border p-4">
                  <p className="text-xs text-muted-foreground">Wallet Balance</p>
                  <p className="text-2xl font-bold text-foreground">₦{balance.toLocaleString()}</p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <p className="text-xs text-muted-foreground">Total Deposits</p>
                  <p className="text-2xl font-bold text-foreground">{deposits}</p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <p className="text-xs text-muted-foreground">Total Withdrawals</p>
                  <p className="text-2xl font-bold text-foreground">{withdrawals}</p>
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
                      <p className={`text-sm font-semibold ${tx.type === 'withdrawal' ? 'text-red-400' : 'text-green-400'}`}>
                        {tx.type === 'withdrawal' ? '-' : '+'}₦{Number(tx.amount).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="commissions">
            <PlaceholderTab title="Commissions" description="Commission records will appear here." />
          </TabsContent>
          <TabsContent value="invoices">
            <PlaceholderTab title="Invoices" description="Invoice statements will appear here." />
          </TabsContent>
          <TabsContent value="withdrawals">
            <PlaceholderTab title="Withdrawals" description="Withdrawal requests will appear here." />
          </TabsContent>
        </RentAndPaymentsHub>
      </ErrorBoundary>
    </DashboardShell>
  );
}

function PlaceholderTab({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-border p-6 text-center">
      <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{title}</p>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
    </div>
  );
}
