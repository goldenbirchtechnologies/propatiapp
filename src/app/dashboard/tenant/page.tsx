import { getCurrentUserWithProfile } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { TENANT_NAVIGATION } from '@/lib/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default async function TenantDashboardPage() {
  const user = await getCurrentUserWithProfile();
  if (!user) {
    redirect('/sign-in');
  }
  if (user.role !== 'tenant') {
    redirect('/dashboard/tenant');
  }

  const displayName = user.fullName || 'Tenant';

  const [savedCount, activeAgreementCount, recentAgreements, recentTransactions] = await Promise.all([
    prisma.savedListing.count({ where: { userId: user.id } }),
    prisma.agreement.count({
      where: {
        tenantId: user.id,
        status: { in: ['tenant_signed', 'fully_signed'] },
      },
    }),
    prisma.agreement.findMany({
      where: { tenantId: user.id },
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: { listing: { select: { title: true, address: true } } },
    }),
    prisma.transaction.findMany({
      where: { payerId: user.id },
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, type: true, status: true, amount: true, createdAt: true },
    }),
  ]);

  return (
    <DashboardShell
      navigation={TENANT_NAVIGATION}
      userRole="tenant"
      userName={displayName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <div className="dashboard-content-area fade-up">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight">
                Welcome back, <span className="text-primary">{displayName}</span>
              </h1>
              <p className="text-muted-foreground mt-3 text-base">Track your tenancy, payments, and saved properties.</p>
            </div>
          </header>

          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Card>
              <CardContent className="p-6">
                <p className="text-xs text-muted-foreground font-medium mb-2">Saved Properties</p>
                <p className="text-3xl font-extrabold font-mono">{savedCount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-xs text-muted-foreground font-medium mb-2">Active Agreements</p>
                <p className="text-3xl font-extrabold font-mono">{activeAgreementCount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-xs text-muted-foreground font-medium mb-2">Transactions</p>
                <p className="text-3xl font-extrabold font-mono">{recentTransactions.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-xs text-muted-foreground font-medium mb-2">Role</p>
                <p className="text-xl font-bold text-primary capitalize">Tenant</p>
              </CardContent>
            </Card>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Recent Agreements</CardTitle>
              </CardHeader>
              <CardContent>
                {recentAgreements.length === 0 ? (
                  <p className="text-muted-foreground text-sm py-6 text-center">No agreements yet.</p>
                ) : (
                  <div className="space-y-3">
                    {recentAgreements.map((agreement) => (
                      <Link
                        key={agreement.id}
                        href={`/dashboard/tenant/agreements/${agreement.id}`}
                        className="flex items-center justify-between rounded-xl border border-border p-4 transition hover:border-primary"
                      >
                        <div>
                          <p className="text-sm font-semibold">{agreement.listing?.title || 'Unknown listing'}</p>
                          <p className="text-xs text-muted-foreground">{agreement.listing?.address || ''}</p>
                        </div>
                        <Badge variant="secondary" className="text-[11px] capitalize">
                          {agreement.status.replace('_', ' ')}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Payments</CardTitle>
              </CardHeader>
              <CardContent>
                {recentTransactions.length === 0 ? (
                  <p className="text-muted-foreground text-sm py-6 text-center">No payments yet.</p>
                ) : (
                  <div className="space-y-3">
                    {recentTransactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between rounded-xl border border-border p-4"
                      >
                        <div>
                          <p className="text-sm font-semibold capitalize">{tx.type.replace('_', ' ')}</p>
                          <p className="text-xs text-muted-foreground capitalize">{tx.status.replace('_', ' ')}</p>
                        </div>
                        <p className="text-sm font-mono">{formatCurrency(Number(tx.amount))}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
      </ErrorBoundary>
    </DashboardShell>
  );
}
