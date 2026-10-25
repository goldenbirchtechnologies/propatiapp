import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import LandlordMaintenanceClient from './LandlordMaintenanceClient';

export const metadata = {
  title: 'Maintenance Requests',
  description: 'Track and manage maintenance requests across your properties.',
};

export default async function LandlordMaintenancePage() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'landlord') redirect('/dashboard');

  return (
    <DashboardShell
      navigation={LANDLORD_NAVIGATION}
      userRole="landlord"
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <LandlordMaintenanceClient />
      </ErrorBoundary>
    </DashboardShell>
  );
}
