import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ACCOUNTANT_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import RentAndPaymentsHub, { type TabItem } from '@/components/financials/RentAndPaymentsHub';
import { TabsContent } from '@/components/ui/tabs';

const tabs: TabItem[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'payments', label: 'All Payments' },
  { value: 'invoices', label: 'Invoices' },
];

export default async function AccountantPaymentsPage() {
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
        <RentAndPaymentsHub tabs={tabs}>
          <TabsContent value="overview">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
              <div>
                <h1 className="text-4xl font-bold text-white tracking-tight">Rent & Payments</h1>
                <p className="text-zinc-500 mt-3 text-base">Monitor payments, disbursements, and platform financial activity.</p>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <div className="rounded-xl border border-white/[0.08] p-6">
                  <p className="text-xs text-zinc-500 font-medium">Processed Volume</p>
                  <p className="text-3xl font-bold text-white">₦{Number(totalVolume._sum?.amount ?? 0).toLocaleString()}</p>
                </div>
                <div className="rounded-xl border border-white/[0.08] p-6">
                  <p className="text-xs text-zinc-500 font-medium">Pending Transactions</p>
                  <p className="text-3xl font-bold text-white">{pendingCount}</p>
                </div>
                <div className="rounded-xl border border-white/[0.08] p-6">
                  <p className="text-xs text-zinc-500 font-medium">Recent Transactions</p>
                  <p className="text-3xl font-bold text-white">{recent.length}</p>
                </div>
              </div>

              <div className="rounded-xl border border-white/[0.08]">
                <div className="p-5 border-b border-white/[0.08]">
                  <h2 className="text-xl font-semibold text-white">Recent Transactions</h2>
                </div>
                <div className="divide-y divide-border">
                  {recent.length === 0 && <p className="p-6 text-sm text-zinc-500">No transactions yet.</p>}
                  {recent.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-5">
                      <div>
                        <p className="text-sm font-medium text-white">{tx.description || tx.type}</p>
                        <p className="text-xs text-zinc-500">{new Date(tx.createdAt).toLocaleString()}</p>
                      </div>
                      <p className={`text-sm font-semibold ${tx.status === 'success' ? 'text-[#00ff66]' : 'text-zinc-300'}`}>
                        ₦{Number(tx.amount).toLocaleString()} <span className="text-xs">{tx.status}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="payments">
            <PlaceholderTab title="All Payments" description="A filterable list of all payments will appear here." />
          </TabsContent>
          <TabsContent value="invoices">
            <PlaceholderTab title="Invoices" description="Invoice statements will appear here." />
          </TabsContent>
        </RentAndPaymentsHub>
      </ErrorBoundary>
    </DashboardShell>
  );
}

function PlaceholderTab({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-white/[0.08] p-10 text-center">
      <p className="text-base font-semibold" style={{ color: 'var(--text)' }}>{title}</p>
      <p className="text-base text-zinc-500 mt-2">{description}</p>
    </div>
  );
}
