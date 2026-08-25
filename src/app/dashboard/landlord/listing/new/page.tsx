import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import AddListingClient from './AddListingClient';

export const metadata = {
  title: 'List to Marketplace – Landlord',
  description: 'Create a marketplace listing from your vacant units.',
};

export default async function LandlordAddListingPage() {
  // Auth check outside try/catch — redirect() throws NEXT_REDIRECT which must
  // not be swallowed by a catch block (see AGENTS.md critical rules).
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'landlord') {
    redirect('/dashboard');
  }

  let listings: any[] = [];
  let vacantUnits: any[] = [];

  try {
    listings = await prisma.listing.findMany({
      where: { ownerId: user.id },
      select: {
        id: true,
        title: true,
        address: true,
        area: true,
        state: true,
        listingType: true,
        propertyType: true,
        units: {
          where: { occupancy: 'VACANT' },
          select: {
            id: true,
            unitNumber: true,
            buildingName: true,
            type: true,
            bedrooms: true,
            bathrooms: true,
            sizeSqm: true,
            rent: true,
            cautionDeposit: true,
            serviceCharge: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    vacantUnits = listings.flatMap((listing) =>
      listing.units.map((unit) => ({
        id: unit.id,
        listingId: listing.id,
        unitNumber: unit.unitNumber,
        buildingName: unit.buildingName,
        type: unit.type,
        bedrooms: unit.bedrooms,
        bathrooms: unit.bathrooms,
        sizeSqm: unit.sizeSqm ? unit.sizeSqm.toString() : null,
        rent: unit.rent.toString(),
        cautionDeposit: unit.cautionDeposit?.toString() ?? null,
        serviceCharge: unit.serviceCharge?.toString() ?? null,
        listingTitle: listing.title,
        listingType: listing.listingType,
        propertyType: listing.propertyType,
        address: listing.address,
        area: listing.area,
        state: listing.state,
      }))
    );
  } catch (error) {
    console.error('LandlordAddListingPage server render failed', error);
    // Fall through with empty arrays — the client component handles the empty state
  }

  return (
    <DashboardShell navigation={LANDLORD_NAVIGATION} userRole="landlord" userName={user.fullName} userAvatar={user.avatarUrl || undefined}>
      <ErrorBoundary>
        <AddListingClient listings={listings} vacantUnits={vacantUnits} />
      </ErrorBoundary>
    </DashboardShell>
  );
}
