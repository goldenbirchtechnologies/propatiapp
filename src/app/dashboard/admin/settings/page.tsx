import { getCurrentUserWithProfile, getRoleRedirectPath } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';

export default async function AdminSettingsPage() {
  const user = await getCurrentUserWithProfile();
  if (!user) redirect('/login');
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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Configure platform settings and preferences.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-lg border border-border bg-surface-container-lowest p-6 shadow-card">
            <p className="text-muted-foreground text-sm">Total Users</p>
            <p className="text-2xl font-bold text-foreground mt-2">{userCount.toLocaleString()}</p>
          </div>
          <div className="rounded-lg border border-border bg-surface-container-lowest p-6 shadow-card">
            <p className="text-muted-foreground text-sm">Total Listings</p>
            <p className="text-2xl font-bold text-foreground mt-2">{listingCount.toLocaleString()}</p>
          </div>
          <div className="rounded-lg border border-border bg-surface-container-lowest p-6 shadow-card">
            <p className="text-muted-foreground text-sm">Organisations</p>
            <p className="text-2xl font-bold text-foreground mt-2">{orgCount.toLocaleString()}</p>
          </div>
          <div className="rounded-lg border border-border bg-surface-container-lowest p-6 shadow-card">
            <p className="text-muted-foreground text-sm">Verified Orgs</p>
            <p className="text-2xl font-bold text-foreground mt-2">{activeOrgCount.toLocaleString()}</p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface-container-lowest p-6 shadow-card">
          <p className="text-muted-foreground">Platform settings will appear here.</p>
        </div>
      </div>
    </DashboardShell>
  );
}
