import { getCurrentUserWithProfile, getRoleRedirectPath } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import Link from 'next/link';

export default async function AdminAgreementsPage() {
  const user = await getCurrentUserWithProfile();
  if (!user) redirect('/sign-in');
  if (user.role !== 'admin') redirect(getRoleRedirectPath(user.role));

  const displayName = user.fullName || 'Admin';

  const [totalAgreements, recentAgreements, signedCount, draftCount] = await Promise.all([
    prisma.agreement.count(),
    prisma.agreement.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        landlord: { select: { fullName: true } },
        tenant: { select: { fullName: true } },
        listing: { select: { title: true } },
      },
    }),
    prisma.agreement.count({ where: { status: 'fully_signed' } }),
    prisma.agreement.count({ where: { status: 'draft' } }),
  ]);

  return (
    <DashboardShell navigation={ADMIN_NAVIGATION} userRole="admin" userName={displayName} userAvatar={user.avatarUrl || undefined}>

      <ErrorBoundary>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Agreements</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">Manage platform agreements, terms, and contracts.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-lg border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-white dark:bg-zinc-950 p-6 ">
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">Total Agreements</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-2">{totalAgreements.toLocaleString()}</p>
          </div>
          <div className="rounded-lg border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-white dark:bg-zinc-950 p-6 ">
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">Fully Signed</p>
            <p className="text-2xl font-bold text-emerald-500 mt-2">{signedCount.toLocaleString()}</p>
          </div>
          <div className="rounded-lg border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-white dark:bg-zinc-950 p-6 ">
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">Draft</p>
            <p className="text-2xl font-bold text-amber-600 mt-2">{draftCount.toLocaleString()}</p>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-white dark:bg-zinc-950  overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-200 dark:border-white/[0.08]">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Recent Agreements</h2>
          </div>
          {recentAgreements.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-zinc-600 dark:text-zinc-400">No agreements found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-white/[0.08] text-left text-zinc-600 dark:text-zinc-400">
                    <th className="p-3 font-medium">Listing</th>
                    <th className="p-3 font-medium">Landlord</th>
                    <th className="p-3 font-medium">Tenant</th>
                    <th className="p-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAgreements.map((agr) => (
                    <tr key={agr.id} className="border-b border-zinc-200 dark:border-white/[0.08] last:border-0 hover:bg-zinc-100 dark:hover:bg-white dark:bg-zinc-900/50">
                      <td className="p-3 text-zinc-900 dark:text-white">{agr.listing?.title ?? '—'}</td>
                      <td className="p-3 text-zinc-900 dark:text-white">{agr.landlord?.fullName ?? '—'}</td>
                      <td className="p-3 text-zinc-900 dark:text-white">{agr.tenant?.fullName ?? '—'}</td>
                      <td className="p-3">
                        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white">
                          {agr.status.replace(/_/g, ' ')}
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