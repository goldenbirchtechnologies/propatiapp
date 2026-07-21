import { getCurrentUserWithProfile, getRoleRedirectPath } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

export default async function AdminVerificationPage() {
  const user = await getCurrentUserWithProfile();
  if (!user) redirect('/login');
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
            <h1 className="text-3xl font-bold text-foreground">Verification</h1>
            <p className="text-muted-foreground mt-1">Review and manage property verification requests.</p>
          </div>
          <button className="px-4 py-2 bg-green-600 text-on-success rounded-lg hover:bg-green-700">
            New Request
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="rounded-lg border border-border bg-surface-container-lowest p-6 shadow-card">
            <p className="text-muted-foreground text-sm">Total</p>
            <p className="text-2xl font-bold text-foreground mt-2">{totalVerifications.toLocaleString()}</p>
          </div>
          {byStatus.map((s) => (
            <div key={s.overallStatus} className="rounded-lg border border-border bg-surface-container-lowest p-6 shadow-card">
              <p className="text-muted-foreground text-sm capitalize">{s.overallStatus.replace(/_/g, ' ')}</p>
              <p className="text-2xl font-bold text-foreground mt-2">{s._count.overallStatus.toLocaleString()}</p>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-border bg-surface-container-lowest shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Recent Verification Requests</h2>
          </div>
          {recentVerifications.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-muted-foreground">No verifications yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="p-3 font-medium">Listing</th>
                    <th className="p-3 font-medium">Owner</th>
                    <th className="p-3 font-medium">Layer</th>
                    <th className="p-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentVerifications.map((ver) => (
                    <tr key={ver.id} className="border-b border-border last:border-0 hover:bg-surface-container-low/50">
                      <td className="p-3 text-foreground">{ver.listing?.title ?? '—'}</td>
                      <td className="p-3 text-foreground">{ver.owner?.fullName ?? '—'}</td>
                      <td className="p-3 text-foreground">{ver.currentLayer}</td>
                      <td className="p-3">
                        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-muted text-foreground capitalize">
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
