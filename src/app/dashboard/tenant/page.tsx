import { getCurrentUserWithProfile, getRoleRedirectPath } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { TENANT_NAVIGATION } from '@/lib/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Receipt } from 'lucide-react';
import Link from 'next/link';

export default async function TenantDashboardPage() {
  const user = await getCurrentUserWithProfile();
  if (!user) {
    redirect('/sign-in');
  }
  if (user.role !== 'tenant') {
    redirect(getRoleRedirectPath(user.role));
  }

  const displayName = user.fullName || 'Tenant';

  let savedCount = 0;
  let activeAgreementCount = 0;
  let openMaintenanceCount = 0;
  let recentAgreements: any[] = [];
  let recentTransactions: any[] = [];

  try {
    const [sCount, aAgreementCount, oMaintenanceCount, rAgreements, rTransactions] = await Promise.all([
      prisma.savedListing.count({ where: { userId: user.id } }),
      prisma.agreement.count({
        where: {
          tenantId: user.id,
          status: { in: ['tenant_signed', 'fully_signed'] },
        },
      }),
      prisma.maintenanceTicket.count({
        where: {
          tenantId: user.id,
          status: { in: ['open', 'in_progress'] },
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

    savedCount = sCount;
    activeAgreementCount = aAgreementCount;
    openMaintenanceCount = oMaintenanceCount;
    recentAgreements = rAgreements;
    recentTransactions = rTransactions;
  } catch (error) {
    console.error('Error loading Tenant dashboard data:', error);
  }

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
            <header className="flex flex-col gap-3">
              <h1 className="text-4xl font-extrabold tracking-tight">
                Welcome back, <span className="text-white">{displayName}</span>
              </h1>
              <p className="text-zinc-400 text-base">Here is what's happening with your tenancy today.</p>
            </header>

            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-5">
                  <p className="text-xs text-zinc-400 font-medium mb-2">Next Payment Due</p>
                  <p className="text-2xl font-extrabold font-mono">₦ 0.00</p>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs text-[#10b981] font-medium">
                    🟢 Up to date
                  </span>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <p className="text-xs text-zinc-400 font-medium mb-2">Active Agreements</p>
                  <p className="text-2xl font-extrabold font-mono">{activeAgreementCount}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <p className="text-xs text-zinc-400 font-medium mb-2">Pending Maintenance</p>
                  <p className="text-2xl font-extrabold font-mono">{openMaintenanceCount}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <p className="text-xs text-zinc-400 font-medium mb-2">Saved Properties</p>
                  <p className="text-2xl font-extrabold font-mono">{savedCount}</p>
                </CardContent>
              </Card>
            </section>

            <section className="flex flex-col sm:flex-row gap-3">
              <Link href="/dashboard/tenant/search" className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:border-white">
                Find a Property
              </Link>
              <Link href="/dashboard/tenant/payments" className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:border-white">
                Pay Rent
              </Link>
              <Link href="/dashboard/tenant/maintenance" className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:border-white">
                Report Maintenance Issue
              </Link>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Recent Agreements</CardTitle>
                </CardHeader>
                <CardContent>
                  {recentAgreements.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
                      <FileText className="h-8 w-8 text-zinc-400" />
                      <p className="text-sm text-zinc-400">No agreements yet. Start applying for properties to see active leases here.</p>
                      <Link href="/dashboard/tenant/search" className="inline-flex items-center rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-white">
                        Browse Properties
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentAgreements.map((agreement) => (
                        <Link
                          key={agreement.id}
                          href={`/dashboard/tenant/agreements/${agreement.id}`}
                          className="flex items-center justify-between rounded-xl border border-zinc-800 p-4 transition hover:border-white"
                        >
                          <div>
                            <p className="text-sm font-semibold">{agreement.listing?.title || 'Unknown listing'}</p>
                            <p className="text-xs text-zinc-400">{agreement.listing?.address || ''}</p>
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
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">Recent Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  {recentTransactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
                      <Receipt className="h-8 w-8 text-zinc-400" />
                      <p className="text-sm text-zinc-400">No transactions yet. Your completed payment history will appear here.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentTransactions.map((tx) => (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between rounded-xl border border-zinc-800 p-4"
                        >
                          <div>
                            <p className="text-sm font-semibold capitalize">{tx.type.replace('_', ' ')}</p>
                            <p className="text-xs text-zinc-400 capitalize">{tx.status.replace('_', ' ')}</p>
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
