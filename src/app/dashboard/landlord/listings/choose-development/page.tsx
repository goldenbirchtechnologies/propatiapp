import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import ChooseDevelopmentClient from './ChooseDevelopmentClient';

export const metadata = {
  title: 'Create Public Listing - Propati',
  description: 'Choose a registered development and vacant units to list on the marketplace.',
};

interface Development {
  id: string;
  name: string;
  address: string;
  unitCount: number;
  image: string;
  units: Array<{
    id: string;
    title: string;
    beds: number;
    baths: number;
    size: string;
    floor: string;
    price: number;
    pricePeriod: string;
    available: boolean;
  }>;
}

async function getDevelopments(): Promise<Development[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/api/dashboard/landlord/developments`, {
    cache: 'no-store',
  }).catch(() => null);
  if (!res || !res.ok) return [];
  const data = await res.json().catch(() => []);
  return data?.developments || [];
}

export default async function ChooseDevelopmentPage() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'landlord') {
    redirect('/dashboard');
  }
  const developments = await getDevelopments();

  return (
    <DashboardShell
      navigation={LANDLORD_NAVIGATION}
      userRole="landlord"
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <Suspense fallback={null}>
          <ChooseDevelopmentClient initialDevelopments={developments} />
        </Suspense>
      </ErrorBoundary>
    </DashboardShell>
  );
}
