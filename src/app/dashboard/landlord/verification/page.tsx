


import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import LandlordPropertyVerificationClient from './LandlordPropertyVerificationClient';

export const dynamic = 'force-dynamic';

export default async function LandlordVerificationPage() {
  const user = await getCurrentUserWithProfile();

  if (!user || user.role !== 'landlord') {
    redirect('/dashboard');
  }

  // Keep this query as the source of truth for the dashboard. The client only
  // handles view state (search, sorting and expansion) over this server data.
  const listings = await prisma.listing.findMany({
    where: { ownerId: user.id },
    select: {
      id: true,
      title: true,
      address: true,
      area: true,
      state: true,
      createdAt: true,
      images: {
        select: { url: true, isCover: true, sortOrder: true },
        orderBy: [{ isCover: 'desc' }, { sortOrder: 'asc' }],
        take: 1,
      },
      verification: {
        select: {
          id: true,
          l1Status: true,
          l2Status: true,
          l3Status: true,
          l4Status: true,
          overallStatus: true,
          adminNotes: true,
          frozenReason: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <DashboardShell
      navigation={LANDLORD_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >

      <ErrorBoundary>
        <LandlordPropertyVerificationClient
          listings={listings.map((listing) => ({
            ...listing,
            createdAt: listing.createdAt.toISOString(),
            verification: listing.verification
              ? { ...listing.verification }
              : null,
          }))}
        />
      </ErrorBoundary>
</DashboardShell>
  );
}
