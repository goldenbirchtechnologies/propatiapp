import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import AddPropertyClient from './AddPropertyClient';

export const metadata = {
  title: 'Add Property – Landlord',
  description: 'Create a new building and its units',
};

export default async function AddPropertyPage() {
  try {
    const session = await auth();
    const userId = session?.userId;
    if (!userId) redirect('/sign-in');

    const user = await getCurrentUserWithProfile();
    if (!user || user.role !== 'landlord') redirect('/dashboard');

    const orgId = user.ownedOrganisations?.[0]?.id || null;

    return (
      <DashboardShell
        navigation={LANDLORD_NAVIGATION}
        userRole="landlord"
        userName={user.fullName}
        userAvatar={user.avatarUrl || undefined}
      >
        <ErrorBoundary>
          <AddPropertyClient orgId={orgId} />
        </ErrorBoundary>
      </DashboardShell>
    );
  } catch (error) {
    console.error('AddPropertyPage server render failed', error);
    redirect('/dashboard');
  }
}
