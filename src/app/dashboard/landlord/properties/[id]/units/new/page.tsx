import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import UnitAddClient from './UnitAddClient';

export const metadata: Metadata = {
  title: 'Add Unit | PROPTI',
  description: 'Add a new unit to your property.',
};

export default async function LandlordAddUnitPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'landlord') redirect('/dashboard');

  const { id } = await params;

  const listing = await prisma.listing.findFirst({
    where: { id, ownerId: user.id },
    select: { id: true, title: true, units: { select: { unitNumber: true } } },
  });

  if (!listing) redirect('/dashboard/landlord/properties');

  const orgListing = await prisma.orgListing.findFirst({
    where: { listingId: listing.id },
    select: { orgId: true },
  });

  return (
    <DashboardShell
      navigation={LANDLORD_NAVIGATION}
      userRole="landlord"
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <UnitAddClient
          listingId={listing.id}
          orgId={orgListing?.orgId || null}
          listingTitle={listing.title}
          existingUnits={listing.units.map((u) => u.unitNumber)}
        />
      </ErrorBoundary>
    </DashboardShell>
  );
}
