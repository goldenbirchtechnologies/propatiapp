import { getCurrentUserWithProfile } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import AuditEventDetailClient from './AuditEventDetailClient';

export default async function AuditEventDetailPage() {
  const user = await getCurrentUserWithProfile();
  if (!user) {
    redirect('/login');
  }
  if (user.role !== 'admin') {
    redirect('/dashboard');
  }

  const displayName = user.fullName || 'Admin';

  return (
    <DashboardShell
      navigation={ADMIN_NAVIGATION}
      userRole="admin"
      userName={displayName}
      userAvatar={user.avatarUrl || undefined}
    >
      <AuditEventDetailClient />
    </DashboardShell>
  );
}
