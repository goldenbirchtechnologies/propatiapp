import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import UnitDetailClient from './UnitDetailClient';

export const metadata = {
  title: 'Unit Details | PROPTI',
  description: 'View unit details, pricing, status, and lease information.',
};

export default async function LandlordUnitDetailPage({
  params,
}: {
  params: Promise<{ id: string; unitId: string }>;
}) {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'landlord') redirect('/dashboard');

  const { id, unitId } = await params;

  const listing = await prisma.listing.findFirst({
    where: { id, ownerId: user.id },
    select: {
      id: true,
      title: true,
      address: true,
      area: true,
      state: true,
      status: true,
      units: {
        select: {
          id: true,
          unitNumber: true,
          type: true,
          listingType: true,
          pricePeriod: true,
          rent: true,
          cautionDeposit: true,
          serviceCharge: true,
          status: true,
          occupancy: true,
          isListed: true,
          bedrooms: true,
          bathrooms: true,
          sizeSqm: true,
          leaseStartDate: true,
          leaseEndDate: true,
          currentTenantId: true,
          currentTenant: { select: { id: true, fullName: true, email: true } },
        },
      },
    },
  });

  if (!listing) redirect('/dashboard/landlord/properties');

  const unit = listing.units.find((u) => u.id === unitId);
  if (!unit) redirect(`/dashboard/landlord/properties/${id}`);

  return (
    <DashboardShell
      navigation={LANDLORD_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <UnitDetailClient listing={{ id: listing.id, title: listing.title, address: listing.address, area: listing.area, state: listing.state, status: listing.status as string }} unit={unit} />
      </ErrorBoundary>
    </DashboardShell>
  );
}
