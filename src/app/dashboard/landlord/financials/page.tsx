import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import { formatCurrency, parseKoboToNaira } from '@/lib/utils';
import RentAndPaymentsHub, { type TabItem } from '@/components/financials/RentAndPaymentsHub';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const tabs: TabItem[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'payments', label: 'Payments' },
  { value: 'invoices', label: 'Invoices' },
  { value: 'overdue', label: 'Overdue' },
];

export const metadata = {
  title: 'Financials – Landlord',
  description: 'Overview of income, expenses, and payout history.',
};

export default async function LandlordFinancialsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'landlord') redirect('/dashboard');

  const [transactions, pendingCount, totalIncomeKobo] = await Promise.all([
    prisma.transaction.findMany({
      where: { OR: [{ payeeId: user.id }, { payerId: user.id }] },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { listing: { select: { title: true } } },
    }),
    prisma.transaction.count({
      where: {
        OR: [{ payeeId: user.id }, { payerId: user.id }],
        status: { in: ['pending', 'in_escrow'] },
      },
    }),
    prisma.transaction.aggregate({
      where: { payeeId: user.id, status: 'success' },
      _sum: { amount: true },
    }),
  ]);

  const totalIncome = parseKoboToNaira(Number(totalIncomeKobo._sum.amount || 0));

  const statusBadgeVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    success: 'default',
    released: 'default',
    pending: 'secondary',
    in_escrow: 'secondary',
    disputed: 'destructive',
    failed: 'destructive',
  };

  return (
    <DashboardShell navigation={LANDLORD_NAVIGATION} userRole="landlord" userName={user.fullName} userAvatar={user.avatarUrl || undefined}>
      <ErrorBoundary>
        <RentAndPaymentsHub tabs={tabs}>
          <TabsContent value="overview">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground tracking-tight">Financials</h1>
                  <p className="text-muted-foreground mt-1">Overview of income, expenses, and payout history.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₦{totalIncome.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">From received transactions</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Pending / In Escrow</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{pendingCount}</div>
                    <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Transactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{transactions.length}</div>
                    <p className="text-xs text-muted-foreground">Recent total</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  {transactions.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-6 text-center">No transactions yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="text-muted-foreground border-b">
                          <tr>
                            <th className="py-3 font-medium">Date</th>
                            <th className="py-3 font-medium">Reference</th>
                            <th className="py-3 font-medium">Listing</th>
                            <th className="py-3 font-medium">Type</th>
                            <th className="py-3 text-right font-medium">Amount</th>
                            <th className="py-3 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {transactions.map((tx) => (
                            <tr key={tx.id} className="border-b last:border-0">
                              <td className="py-3 text-muted-foreground">
                                {new Date(tx.createdAt).toLocaleDateString('en-NG')}
                              </td>
                              <td className="py-3 font-mono text-xs">{tx.reference || tx.id}</td>
                              <td className="py-3">{tx.listing?.title || '—'}</td>
                              <td className="py-3 capitalize">{tx.type.replace('_', ' ')}</td>
                              <td className="py-3 text-right font-mono">
                                ₦{formatCurrency(Number(tx.amount))}
                              </td>
                              <td className="py-3">
                                <Badge variant={statusBadgeVariant[tx.status] || 'outline'} className="capitalize">
                                  {tx.status.replace(/_/g, ' ')}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="payments">
            <PlaceholderTab title="Payments" description="Payment history will appear here." />
          </TabsContent>
          <TabsContent value="invoices">
            <PlaceholderTab title="Invoices" description="Invoice statements will appear here." />
          </TabsContent>
          <TabsContent value="overdue">
            <PlaceholderTab title="Overdue" description="Overdue payments will appear here." />
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
