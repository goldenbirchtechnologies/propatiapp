import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import WizardShell from './WizardShell';

export const metadata = {
  title: 'Institutional Listing Wizard – Landlord',
  description:
    '14-step institutional listing wizard: property structure, privacy, location, capacity, rooms, rules, amenities, media, title, highlights, pricing, discounts, safety.',
};

export default async function LandlordListingWizardPage() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'landlord') {
    redirect('/dashboard');
  }

  return (
    <DashboardShell
      navigation={LANDLORD_NAVIGATION}
      userRole="landlord"
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <div className="w-full min-h-screen bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
          <WizardShell />
        </div>
      </ErrorBoundary>
    </DashboardShell>
  );
}
