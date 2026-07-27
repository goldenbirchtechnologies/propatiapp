import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import AddListingClient from './AddListingClient';

export const metadata = {
  title: 'List to Marketplace – Landlord',
  description: 'Create a marketplace listing. Verification is optional; unverified listings will show an unverified badge.',
};

export default async function LandlordAddListingPage() {
  try {
    const session = await auth();
    const userId = session?.userId;
    if (!userId) redirect('/sign-in');

    const user = await getCurrentUserWithProfile();
    if (!user || user.role !== 'landlord') redirect('/dashboard');

    return (
      <DashboardShell navigation={LANDLORD_NAVIGATION} userRole="landlord" userName={user.fullName} userAvatar={user.avatarUrl || undefined}>
        <ErrorBoundary>
          <AddListingClient />
        </ErrorBoundary>
      </DashboardShell>
    );
  } catch (error) {
    console.error('LandlordAddListingPage server render failed', error);
    redirect('/dashboard');
  }
}
