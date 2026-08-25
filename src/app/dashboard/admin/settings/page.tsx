import { getCurrentUserWithProfile, getRoleRedirectPath } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

export default async function AdminSettingsPage() {
  const user = await getCurrentUserWithProfile();
  if (!user) redirect('/sign-in');
  if (user.role !== 'admin') redirect(getRoleRedirectPath(user.role));

  const displayName = user.fullName || 'Admin';

  const [userCount, listingCount, orgCount, activeOrgCount] = await Promise.all([
    prisma.user.count(),
    prisma.listing.count(),
    prisma.organisation.count(),
    prisma.organisation.count({ where: { verified: true } }),
  ]);

  return (
    <DashboardShell navigation={ADMIN_NAVIGATION} userRole="admin" userName={displayName} userAvatar={user.avatarUrl || undefined}>

      <ErrorBoundary>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-zinc-500 mt-1">Configure platform settings and preferences.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-lg border border-white/[0.08] bg-zinc-950 p-6 ">
            <p className="text-zinc-500 text-sm">Total Users</p>
            <p className="text-2xl font-bold text-white mt-2">{userCount.toLocaleString()}</p>
          </div>
          <div className="rounded-lg border border-white/[0.08] bg-zinc-950 p-6 ">
            <p className="text-zinc-500 text-sm">Total Listings</p>
            <p className="text-2xl font-bold text-white mt-2">{listingCount.toLocaleString()}</p>
          </div>
          <div className="rounded-lg border border-white/[0.08] bg-zinc-950 p-6 ">
            <p className="text-zinc-500 text-sm">Organisations</p>
            <p className="text-2xl font-bold text-white mt-2">{orgCount.toLocaleString()}</p>
          </div>
          <div className="rounded-lg border border-white/[0.08] bg-zinc-950 p-6 ">
            <p className="text-zinc-500 text-sm">Verified Orgs</p>
            <p className="text-2xl font-bold text-white mt-2">{activeOrgCount.toLocaleString()}</p>
          </div>
        </div>

        <div className="rounded-lg border border-white/[0.08] bg-zinc-950 p-6 ">
          <p className="text-zinc-500">Platform settings will appear here.</p>
        </div>
      </div>
    
      </ErrorBoundary>
</DashboardShell>
  );
}
