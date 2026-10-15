import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import { managedListingWhere } from '@/lib/org-scope';
import AddListingClient from '@/app/dashboard/landlord/listing/new/AddListingClient';

export const metadata = {
  title: 'List to Marketplace – Estate Manager',
  description: 'Create a marketplace listing from your vacant units.',
};

export default async function EstateManagerAddListingPage() {
  const user = await getCurrentUserWithProfile();
  if (!user || (user.role !== 'estate_manager' && user.role !== 'admin')) {
    redirect('/dashboard');
  }

  let listings: any[] = [];
  let vacantUnits: any[] = [];

  try {
    listings = await prisma.listing.findMany({
      where: await managedListingWhere(user.id),
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
      listing.units.map((unit: any) => ({
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
    console.error('EstateManagerAddListingPage server render failed', error);
  }

  return (
    <DashboardShell
      navigation={ESTATE_MANAGER_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <AddListingClient
          listings={listings}
          vacantUnits={vacantUnits}
          basePath="/dashboard/estate-manager"
          newPropertyHref="/dashboard/estate-manager/units/new"
          propertiesHref="/dashboard/estate-manager/portfolio"
          successHref="/dashboard/estate-manager/listings"
        />
      </ErrorBoundary>
    </DashboardShell>
  );
}
