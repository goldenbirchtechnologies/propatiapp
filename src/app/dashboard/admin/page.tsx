import { getCurrentUserWithProfile, getRoleRedirectPath } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import AdminDashboardClient from './AdminDashboardClient';

export default async function AdminDashboardPage() {
  const user = await getCurrentUserWithProfile();
  if (!user) {
    redirect('/login');
  }
  if (user.role !== 'admin') {
    redirect(getRoleRedirectPath(user.role));
  }

  const displayName = user.fullName || 'Admin';

  return (
    <DashboardShell
      navigation={ADMIN_NAVIGATION}
      userRole="admin"
      userName={displayName}
      userAvatar={user.avatarUrl || undefined}
    >
      <AdminDashboardClient userName={displayName} userAvatar={user.avatarUrl || undefined} />
    </DashboardShell>
  );
}
