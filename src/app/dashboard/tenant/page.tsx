import { getCurrentUserWithProfile } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { TENANT_NAVIGATION } from '@/lib/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import TenantDashboardClient from './TenantDashboardClient';

export default async function TenantDashboardPage() {
  const user = await getCurrentUserWithProfile();
  if (!user) {
    redirect('/login');
  }

  const displayName = user.fullName || 'User';

  return (
    <DashboardShell
      navigation={TENANT_NAVIGATION}
      userRole="tenant"
      userName={displayName}
      userAvatar={user.avatarUrl || undefined}
    >
      <div className="dashboard-content-area fade-up">
        <TenantDashboardClient userName={displayName} />
      </div>
    </DashboardShell>
  );
}
