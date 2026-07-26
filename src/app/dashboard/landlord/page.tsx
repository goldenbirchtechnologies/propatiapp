import { getCurrentUserWithProfile } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  DollarSign,
  Building2,
  Users,
  Wrench,
  Plus,
  FileText,
  ShieldCheck,
} from 'lucide-react';

export default async function LandlordDashboardPage() {
  const user = await getCurrentUserWithProfile();
  if (!user) {
    redirect('/sign-in');
  }
  if (user.role !== 'landlord') {
    redirect('/dashboard/tenant');
  }

  const displayName = user.fullName || 'Landlord';

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    listingCount,
    activeListingCount,
    pendingApplicationCount,
    openMaintenanceCount,
    revenueAgg,
    recentListings,
    recentApplications,
  ] = await Promise.all([
    prisma.listing.count({ where: { ownerId: user.id } }),
    prisma.listing.count({ where: { ownerId: user.id, status: 'active' } }),
    prisma.application.count({ where: { landlordId: user.id, status: 'pending' } }),
    prisma.maintenanceTicket.count({
      where: {
        listing: { ownerId: user.id },
        status: { in: ['open', 'assigned', 'in_progress'] },
      },
    }),
    prisma.transaction.aggregate({
      where: {
        payeeId: user.id,
        status: 'released',
        createdAt: { gte: startOfMonth },
      },
      _sum: { amount: true },
    }),
    prisma.listing.findMany({
      where: { ownerId: user.id },
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, listingType: true, status: true, price: true, createdAt: true },
    }),
    prisma.application.findMany({
      where: { landlordId: user.id },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { tenant: { select: { fullName: true } }, listing: { select: { title: true } } },
    }),
  ]);

  const totalRevenue = Number(revenueAgg._sum.amount ?? 0);

  const statusBadgeVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    active: 'default',
    draft: 'secondary',
    pending: 'outline',
    accepted: 'default',
    rejected: 'destructive',
  };

  return (
    <DashboardShell navigation={LANDLORD_NAVIGATION} userRole="landlord" userName={displayName} userAvatar={user.avatarUrl || undefined}>
      <ErrorBoundary>
        <div className="dashboard-content-area fade-up">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-4xl font-extrabold text-foreground tracking-tight">
                  Welcome back, <span className="text-primary">{displayName}</span>
                </h1>
                <p className="text-zinc-400 mt-3 text-base">
                  Here is an overview of your property portfolio today.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/dashboard/landlord/properties/new"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:shadow-lg transition-all"
                  >
                  <Plus className="h-4 w-4" />
                  Add Listing
                </Link>
                <Link
                  href="/dashboard/landlord/leases"
                  className="inline-flex items-center gap-2 rounded-xl border border-outline-variant bg-card px-5 py-2.5 text-sm font-bold hover:bg-muted transition-all"
                >
                  <FileText className="h-4 w-4" />
                  Create Lease
                </Link>
                <Link
                  href="/dashboard/verification?type=property"
                  className="inline-flex items-center gap-2 rounded-xl border border-outline-variant bg-card px-5 py-2.5 text-sm font-bold hover:bg-muted transition-all"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Verify Property
                </Link>
              </div>
            </header>

            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <Card className="bg-surface-container border border-outline-variant">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <DollarSign className="h-4 w-4" />
                    </div>
                    <p className="text-xs text-zinc-400 font-medium">Monthly Revenue</p>
                  </div>
                  <p className="text-3xl font-extrabold font-mono">{formatCurrency(totalRevenue)}</p>
                  <p className="text-xs text-zinc-500 mt-1">This month</p>
                </CardContent>
              </Card>

              <Card className="bg-surface-container border border-outline-variant">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <p className="text-xs text-zinc-400 font-medium">Portfolio Units</p>
                  </div>
                  <p className="text-3xl font-extrabold font-mono">
                    {activeListingCount} <span className="text-lg text-zinc-500">/ {listingCount}</span>
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">Active / Total</p>
                </CardContent>
              </Card>

              <Card className="bg-surface-container border border-outline-variant">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Users className="h-4 w-4" />
                    </div>
                    <p className="text-xs text-zinc-400 font-medium">Pending Applications</p>
                  </div>
                  <p className="text-3xl font-extrabold font-mono">{pendingApplicationCount}</p>
                  <p className="text-xs text-zinc-500 mt-1">Awaiting review</p>
                </CardContent>
              </Card>

              <Card className="bg-surface-container border border-outline-variant">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Wrench className="h-4 w-4" />
                    </div>
                    <p className="text-xs text-zinc-400 font-medium">Open Maintenance</p>
                  </div>
                  <p className="text-3xl font-extrabold font-mono">{openMaintenanceCount}</p>
                  <p className="text-xs text-zinc-500 mt-1">Needs attention</p>
                </CardContent>
              </Card>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-surface-container border border-outline-variant">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Recent Listings</CardTitle>
                </CardHeader>
                <CardContent>
                  {recentListings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="p-3 rounded-full bg-primary/10 mb-4">
                        <Building2 className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">No listings yet</h3>
                      <p className="text-sm text-muted-foreground max-w-sm mb-5">
                        You haven&apos;t listed any properties yet. Add a property to start receiving tenant applications.
                      </p>
                      <Link
                        href="/dashboard/landlord/properties/new"
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:shadow-lg transition-all"
                      >
                        <Plus className="h-4 w-4" />
                        Add Your First Property
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentListings.map((listing) => (
                        <Link
                          key={listing.id}
                          href={`/dashboard/landlord/listing/${listing.id}`}
                          className="flex items-center justify-between rounded-xl border border-outline-variant bg-background/40 p-4 transition hover:border-primary/30"
                        >
                          <div>
                            <p className="text-sm font-semibold text-foreground">{listing.title}</p>
                            <p className="text-xs text-zinc-400 capitalize">
                              {listing.listingType} • {listing.status}
                            </p>
                          </div>
                          <p className="text-sm font-mono text-zinc-300">
                            {formatCurrency(Number(listing.price))}
                          </p>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-surface-container border border-outline-variant">
                <CardHeader>
                  <CardTitle className="text-base">Recent Applications</CardTitle>
                </CardHeader>
                <CardContent>
                  {recentApplications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="p-3 rounded-full bg-primary/10 mb-4">
                        <Users className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">No applications yet</h3>
                      <p className="text-sm text-muted-foreground">
                        Applications from tenants will appear here once they apply to your listings.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentApplications.map((app) => (
                        <div
                          key={app.id}
                          className="flex items-center justify-between rounded-xl border border-outline-variant bg-background/40 p-4"
                        >
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {app.tenant?.fullName || 'Unknown'}
                            </p>
                            <p className="text-xs text-zinc-400">{app.listing?.title || 'Unknown listing'}</p>
                          </div>
                          <Badge variant={statusBadgeVariant[app.status] || 'secondary'} className="text-[11px] capitalize">
                            {app.status.replace('_', ' ')}
                          </Badge>
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
