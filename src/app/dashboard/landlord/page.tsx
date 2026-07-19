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

export default async function LandlordDashboardPage() {
  const user = await getCurrentUserWithProfile();
  if (!user) {
    redirect('/login');
  }
  if (user.role !== 'landlord') {
    redirect('/dashboard/tenant');
  }

  const displayName = user.fullName || 'Landlord';

  const [listingCount, activeListingCount, pendingApplicationCount, recentListings, recentApplications] = await Promise.all([
    prisma.listing.count({ where: { ownerId: user.id } }),
    prisma.listing.count({ where: { ownerId: user.id, status: 'active' } }),
    prisma.application.count({ where: { landlordId: user.id, status: 'pending' } }),
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                Welcome back, <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">{displayName}</span>
              </h1>
              <p className="text-zinc-400 text-sm mt-1">Here is what is happening with your portfolio today.</p>
            </div>
          </header>

          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-[#0e1726] border-white/5">
              <CardContent className="p-5">
                <p className="text-xs text-zinc-400 font-medium mb-1">Total Listings</p>
                <p className="text-2xl font-extrabold text-white font-mono">{listingCount}</p>
              </CardContent>
            </Card>
            <Card className="bg-[#0e1726] border-white/5">
              <CardContent className="p-5">
                <p className="text-xs text-zinc-400 font-medium mb-1">Active Listings</p>
                <p className="text-2xl font-extrabold text-white font-mono">{activeListingCount}</p>
              </CardContent>
            </Card>
            <Card className="bg-[#0e1726] border-white/5">
              <CardContent className="p-5">
                <p className="text-xs text-zinc-400 font-medium mb-1">Pending Applications</p>
                <p className="text-2xl font-extrabold text-white font-mono">{pendingApplicationCount}</p>
              </CardContent>
            </Card>
            <Card className="bg-[#0e1726] border-white/5">
              <CardContent className="p-5">
                <p className="text-xs text-zinc-400 font-medium mb-1">Role</p>
                <p className="text-lg font-bold text-blue-400 capitalize">Landlord</p>
              </CardContent>
            </Card>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-[#0e1726] border-white/5">
              <CardHeader>
                <CardTitle className="text-white text-base">Recent Listings</CardTitle>
              </CardHeader>
              <CardContent>
                {recentListings.length === 0 ? (
                  <p className="text-zinc-400 text-sm py-6 text-center">No listings yet.</p>
                ) : (
                  <div className="space-y-3">
                    {recentListings.map((listing) => (
                      <Link
                        key={listing.id}
                        href={`/dashboard/landlord/listing/${listing.id}`}
                        className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4 transition hover:border-blue-500/30"
                      >
                        <div>
                          <p className="text-sm font-semibold text-white">{listing.title}</p>
                          <p className="text-xs text-zinc-400 capitalize">{listing.listingType} • {listing.status}</p>
                        </div>
                        <p className="text-sm font-mono text-zinc-300">{formatCurrency(Number(listing.price))}</p>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-[#0e1726] border-white/5">
              <CardHeader>
                <CardTitle className="text-white text-base">Recent Applications</CardTitle>
              </CardHeader>
              <CardContent>
                {recentApplications.length === 0 ? (
                  <p className="text-zinc-400 text-sm py-6 text-center">No applications yet.</p>
                ) : (
                  <div className="space-y-3">
                    {recentApplications.map((app) => (
                      <div
                        key={app.id}
                        className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4"
                      >
                        <div>
                          <p className="text-sm font-semibold text-white">{app.tenant?.fullName || 'Unknown'}</p>
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
