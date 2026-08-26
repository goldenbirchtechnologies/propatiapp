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
            <div className="space-y-10">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-white">Rent &amp; Payments</h1>
                <p className="mt-3 text-base text-zinc-500">Wallet balance, deposits, withdrawals, and transaction history.</p>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <div className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-[rgba(23,23,23,0.4)] backdrop-blur p-6 backdrop-blur">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] to-transparent opacity-50" />
                  <div className="relative z-10">
                    <p className="mb-2 text-sm font-medium text-zinc-500">Wallet Balance</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-semibold tracking-tight text-white">₦{balance.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-[rgba(23,23,23,0.4)] backdrop-blur p-6 backdrop-blur">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] to-transparent opacity-50" />
                  <div className="relative z-10">
                    <p className="mb-2 text-sm font-medium text-zinc-500">Total Deposits</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-semibold tracking-tight text-white">{deposits}</span>
                    </div>
                  </div>
                </div>
                <div className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-[rgba(23,23,23,0.4)] backdrop-blur p-6 backdrop-blur">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] to-transparent opacity-50" />
                  <div className="relative z-10">
                    <p className="mb-2 text-sm font-medium text-zinc-500">Total Withdrawals</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-semibold tracking-tight text-white">{withdrawals}</span>
                    </div>
                  </div>
                </div>
              </div>

              <section className="overflow-hidden rounded-xl border border-white/[0.08] bg-[rgba(23,23,23,0.4)] backdrop-blur backdrop-blur">
                <div className="border-b border-white/[0.08] bg-zinc-900/30 px-6 py-5">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#00ff66]">
                      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
                    </svg>
                    Recent Transactions
                  </h3>
                </div>
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.08] bg-zinc-900">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-500">
                      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                      <path d="m3.3 7 8.7 5 8.7-5" />
                      <path d="M12 22V12" />
                    </svg>
                  </div>
                  <p className="text-sm text-zinc-500">No transactions yet.</p>
                </div>
              </section>
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
    <div className="rounded-xl border border-white/[0.08] bg-[rgba(23,23,23,0.4)] backdrop-blur p-10 text-center backdrop-blur">
      <p className="text-base font-semibold text-white">{title}</p>
      <p className="mt-2 text-base text-zinc-500">{description}</p>
    </div>
  );
}
