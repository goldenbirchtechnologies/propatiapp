import { getCurrentUserWithProfile, getRoleRedirectPath } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

export default async function AdminVerificationPage() {
  const user = await getCurrentUserWithProfile();
  if (!user) redirect('/sign-in');
  if (user.role !== 'admin') redirect(getRoleRedirectPath(user.role));

  const displayName = user.fullName || 'Admin';

  const [totalVerifications, byStatus, recentVerifications] = await Promise.all([
    prisma.verification.count(),
    prisma.verification.groupBy({
      by: ['overallStatus'],
      _count: { overallStatus: true },
    }),
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
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-900 dark:text-white">Verification</h1>
            <p className="text-zinc-600 dark:text-zinc-600 dark:text-zinc-400 mt-1">Review and manage property verification requests.</p>
          </div>
          <button className="px-4 py-2 bg-green-600 text-on-success rounded-lg hover:bg-green-700">
            New Request
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-white dark:bg-zinc-950 p-6 ">
            <p className="text-zinc-600 dark:text-zinc-600 dark:text-zinc-400 text-sm">Total</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-900 dark:text-white mt-2">{totalVerifications.toLocaleString()}</p>
          </div>
          {byStatus.map((s) => (
            <div key={s.overallStatus} className="rounded-lg border border-zinc-200 dark:border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-white dark:bg-zinc-950 p-6 ">
              <p className="text-zinc-600 dark:text-zinc-600 dark:text-zinc-400 text-sm capitalize">{s.overallStatus.replace(/_/g, ' ')}</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-900 dark:text-white mt-2">{s._count.overallStatus.toLocaleString()}</p>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-zinc-200 dark:border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-white dark:bg-zinc-950  overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-200 dark:border-white/[0.08]">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-900 dark:text-white">Recent Verification Requests</h2>
          </div>
          {recentVerifications.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-zinc-600 dark:text-zinc-600 dark:text-zinc-400">No verifications yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-200 dark:border-white/[0.08] text-left text-zinc-600 dark:text-zinc-600 dark:text-zinc-400">
                    <th className="p-3 font-medium">Listing</th>
                    <th className="p-3 font-medium">Owner</th>
                    <th className="p-3 font-medium">Layer</th>
                    <th className="p-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentVerifications.map((ver) => (
                    <tr key={ver.id} className="border-b border-zinc-200 dark:border-zinc-200 dark:border-white/[0.08] last:border-0 hover:bg-zinc-100 dark:hover:bg-white dark:bg-zinc-900/50">
                      <td className="p-3 text-zinc-900 dark:text-zinc-900 dark:text-white">{ver.listing?.title ?? '—'}</td>
                      <td className="p-3 text-zinc-900 dark:text-zinc-900 dark:text-white">{ver.owner?.fullName ?? '—'}</td>
                      <td className="p-3 text-zinc-900 dark:text-zinc-900 dark:text-white">{ver.currentLayer}</td>
                      <td className="p-3">
                        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-zinc-50 dark:bg-white dark:bg-white dark:bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-900 dark:text-white capitalize">
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