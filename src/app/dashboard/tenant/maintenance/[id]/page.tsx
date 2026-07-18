import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { TENANT_NAVIGATION } from '@/lib/navigation';
import TenantMaintenanceTrackingClient from './TenantMaintenanceTrackingClient';

export default async function Page(props: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) redirect('/login');

  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'tenant') redirect('/dashboard');

  const { id } = props.params;

  return (
    <DashboardShell
      navigation={TENANT_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <TenantMaintenanceTrackingClient requestId={id} />
    </DashboardShell>
  );
}
