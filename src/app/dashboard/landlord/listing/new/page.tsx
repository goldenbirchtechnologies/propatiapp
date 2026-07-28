import { auth } from '@clerk/nextjs/server';
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
  try {
    const session = await auth();
    const userId = session?.userId;
    if (!userId) redirect('/sign-in');

    const user = await getCurrentUserWithProfile();
    if (!user || user.role !== 'landlord') redirect('/dashboard');

    const listings = await prisma.listing.findMany({
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

    const vacantUnits = listings.flatMap((listing) =>
      listing.units.map((unit) => ({
        ...unit,
        listingId: listing.id,
        listingTitle: listing.title,
        listingType: listing.listingType,
        propertyType: listing.propertyType,
        address: listing.address,
        area: listing.area,
        state: listing.state,
      }))
    );

    return (
      <DashboardShell navigation={LANDLORD_NAVIGATION} userRole="landlord" userName={user.fullName} userAvatar={user.avatarUrl || undefined}>
        <ErrorBoundary>
          <AddListingClient listings={listings} vacantUnits={vacantUnits} />
        </ErrorBoundary>
      </DashboardShell>
    );
  } catch (error) {
    console.error('LandlordAddListingPage server render failed', error);
    redirect('/dashboard');
  }
}
