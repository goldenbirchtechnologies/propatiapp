import { getCurrentUserWithProfile, getRoleRedirectPath } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

export default async function AdminPropertiesPage() {
  const user = await getCurrentUserWithProfile();
  if (!user) redirect('/sign-in');
  if (user.role !== 'admin') redirect(getRoleRedirectPath(user.role));

  const displayName = user.fullName || 'Admin';

  const [totalListings, activeCount, draftCount, recentListings, flaggedCount] = await Promise.all([
    prisma.listing.count(),
    prisma.listing.count({ where: { status: 'active' } }),
    prisma.listing.count({ where: { status: 'draft' } }),
    prisma.listing.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, status: true, listingType: true, createdAt: true, ownerId: true },
    }),
    prisma.listingFlag.count({ where: { status: 'open' } }),
  ]);

  return (
    <DashboardShell navigation={ADMIN_NAVIGATION} userRole="admin" userName={displayName} userAvatar={user.avatarUrl || undefined}>

      <ErrorBoundary>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Properties</h1>
            <p className="text-muted-foreground mt-1">Manage and approve property listings.</p>
          </div>
          <button className="px-4 py-2 bg-green-600 text-on-success rounded-lg hover:bg-green-700">
            Add Property
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-lg border border-border bg-surface-container-lowest p-6 shadow-card">
            <p className="text-muted-foreground text-sm">Total Listings</p>
            <p className="text-2xl font-bold text-foreground mt-2">{totalListings.toLocaleString()}</p>
          </div>
          <div className="rounded-lg border border-border bg-surface-container-lowest p-6 shadow-card">
            <p className="text-muted-foreground text-sm">Active</p>
            <p className="text-2xl font-bold text-green-600 mt-2">{activeCount.toLocaleString()}</p>
          </div>
          <div className="rounded-lg border border-border bg-surface-container-lowest p-6 shadow-card">
            <p className="text-muted-foreground text-sm">Draft</p>
            <p className="text-2xl font-bold text-amber-600 mt-2">{draftCount.toLocaleString()}</p>
          </div>
          <div className="rounded-lg border border-border bg-surface-container-lowest p-6 shadow-card">
            <p className="text-muted-foreground text-sm">Open Flags</p>
            <p className="text-2xl font-bold text-red-600 mt-2">{flaggedCount.toLocaleString()}</p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface-container-lowest shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Recent Listings</h2>
          </div>
          {recentListings.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-muted-foreground">No properties listed.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="p-3 font-medium">Title</th>
                    <th className="p-3 font-medium">Type</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {recentListings.map((listing) => (
                    <tr key={listing.id} className="border-b border-border last:border-0 hover:bg-surface-container-low/50">
                      <td className="p-3 text-foreground">{listing.title}</td>
                      <td className="p-3 text-foreground capitalize">{listing.listingType.replace(/_/g, ' ')}</td>
                      <td className="p-3">
                        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-muted text-foreground capitalize">
                          {listing.status}
                        </span>
                      </td>
                      <td className="p-3 text-foreground">{new Date(listing.createdAt).toLocaleDateString('en-NG')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    
      </ErrorBoundary>
</DashboardShell>
  );
}
