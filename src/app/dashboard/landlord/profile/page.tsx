import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { loadLandlordWorkspace } from '@/lib/landlord-profile/data';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import LandlordProfileClient from './LandlordProfileClient';

export const metadata = {
  title: 'Ownership & compliance',
  description: 'Manage your legal ownership record, tax details, documents, and payout mandate.',
};

export default async function LandlordProfilePage() {
  const user = await getCurrentUserWithProfile();

  if (!user || user.role !== 'landlord') {
    redirect('/dashboard');
  }

  const workspace = await loadLandlordWorkspace(user.id);

  return (
    <DashboardShell
      navigation={LANDLORD_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <LandlordProfileClient data={workspace} />
      </ErrorBoundary>
    </DashboardShell>
  );
}
