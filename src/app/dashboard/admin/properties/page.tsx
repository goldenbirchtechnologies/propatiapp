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
            <h1 className="text-3xl font-bold text-white">Properties</h1>
            <p className="text-zinc-500 mt-1">Manage and approve property listings.</p>
          </div>
          <button className="px-4 py-2 bg-green-600 text-on-success rounded-lg hover:bg-green-700">
            Add Property
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-lg border border-white/[0.08] bg-zinc-950 p-6 ">
            <p className="text-zinc-500 text-sm">Total Listings</p>
            <p className="text-2xl font-bold text-white mt-2">{totalListings.toLocaleString()}</p>
          </div>
          <div className="rounded-lg border border-white/[0.08] bg-zinc-950 p-6 ">
            <p className="text-zinc-500 text-sm">Active</p>
            <p className="text-2xl font-bold text-green-600 mt-2">{activeCount.toLocaleString()}</p>
          </div>
          <div className="rounded-lg border border-white/[0.08] bg-zinc-950 p-6 ">
            <p className="text-zinc-500 text-sm">Draft</p>
            <p className="text-2xl font-bold text-amber-600 mt-2">{draftCount.toLocaleString()}</p>
          </div>
          <div className="rounded-lg border border-white/[0.08] bg-zinc-950 p-6 ">
            <p className="text-zinc-500 text-sm">Open Flags</p>
            <p className="text-2xl font-bold text-red-600 mt-2">{flaggedCount.toLocaleString()}</p>
          </div>
        </div>

        <div className="rounded-lg border border-white/[0.08] bg-zinc-950  overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.08]">
            <h2 className="text-lg font-semibold text-white">Recent Listings</h2>
          </div>
          {recentListings.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-zinc-500">No properties listed.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.08] text-left text-zinc-500">
                    <th className="p-3 font-medium">Title</th>
                    <th className="p-3 font-medium">Type</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {recentListings.map((listing) => (
                    <tr key={listing.id} className="border-b border-white/[0.08] last:border-0 hover:bg-zinc-900/50">
                      <td className="p-3 text-white">{listing.title}</td>
                      <td className="p-3 text-white capitalize">{listing.listingType.replace(/_/g, ' ')}</td>
                      <td className="p-3">
                        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-zinc-900 text-white capitalize">
                          {listing.status}
                        </span>
                      </td>
                      <td className="p-3 text-white">{new Date(listing.createdAt).toLocaleDateString('en-NG')}</td>
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
