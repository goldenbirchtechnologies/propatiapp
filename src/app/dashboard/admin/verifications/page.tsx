import { getCurrentUserWithProfile, getRoleRedirectPath } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

export default async function AdminVerificationsPage() {
  const user = await getCurrentUserWithProfile();
  if (!user) redirect('/sign-in');
  if (user.role !== 'admin') redirect(getRoleRedirectPath(user.role));

  const displayName = user.fullName || 'Admin';

  const [totalVerifications, pendingCount, inProgressCount, certifiedCount, recentVerifications] = await Promise.all([
    prisma.verification.count(),
    prisma.verification.count({ where: { overallStatus: 'not_started' } }),
    prisma.verification.count({ where: { overallStatus: 'in_progress' } }),
    prisma.verification.count({ where: { overallStatus: 'certified' } }),
    prisma.verification.findMany({
      take: 10,
      orderBy: { updatedAt: 'desc' },
      include: {
        listing: { select: { title: true, address: true } },
        owner: { select: { fullName: true } },
      },
    }),
  ]);

  return (
    <DashboardShell navigation={ADMIN_NAVIGATION} userRole="admin" userName={displayName} userAvatar={user.avatarUrl || undefined}>

      <ErrorBoundary>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Verifications</h1>
            <p className="text-zinc-500 mt-1">Manage platform-wide user verifications.</p>
          </div>
          <button className="px-4 py-2 bg-green-600 text-on-success rounded-lg hover:bg-green-700">
            New Batch
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="rounded-lg border border-white/[0.08] bg-zinc-950 p-6 ">
            <p className="text-zinc-500 text-sm">Total</p>
            <p className="text-2xl font-bold text-white mt-2">{totalVerifications.toLocaleString()}</p>
          </div>
          <div className="rounded-lg border border-white/[0.08] bg-zinc-950 p-6 ">
            <p className="text-zinc-500 text-sm">Not Started</p>
            <p className="text-2xl font-bold text-white mt-2">{pendingCount.toLocaleString()}</p>
          </div>
          <div className="rounded-lg border border-white/[0.08] bg-zinc-950 p-6 ">
            <p className="text-zinc-500 text-sm">In Progress</p>
            <p className="text-2xl font-bold text-amber-600 mt-2">{inProgressCount.toLocaleString()}</p>
          </div>
          <div className="rounded-lg border border-white/[0.08] bg-zinc-950 p-6 ">
            <p className="text-zinc-500 text-sm">Certified</p>
            <p className="text-2xl font-bold text-green-600 mt-2">{certifiedCount.toLocaleString()}</p>
          </div>
        </div>

        <div className="rounded-lg border border-white/[0.08] bg-zinc-950  overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.08]">
            <h2 className="text-lg font-semibold text-white">Recent Verifications</h2>
          </div>
          {recentVerifications.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-zinc-500">No verifications yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.08] text-left text-zinc-500">
                    <th className="p-3 font-medium">Listing</th>
                    <th className="p-3 font-medium">Owner</th>
                    <th className="p-3 font-medium">Layer</th>
                    <th className="p-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentVerifications.map((ver) => (
                    <tr key={ver.id} className="border-b border-white/[0.08] last:border-0 hover:bg-zinc-900/50">
                      <td className="p-3 text-white">{ver.listing?.title ?? '—'}</td>
                      <td className="p-3 text-white">{ver.owner?.fullName ?? '—'}</td>
                      <td className="p-3 text-white">{ver.currentLayer}</td>
                      <td className="p-3">
                        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-zinc-900 text-white">
                          {ver.overallStatus.replace(/_/g, ' ')}
                        </span>
                      </td>
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
