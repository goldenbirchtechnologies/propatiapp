import { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import PropertiesClient from './PropertiesClient';

export const metadata: Metadata = {
  title: 'My Properties | PROPTI',
  description: 'Manage your property listings',
};

export default async function LandlordPropertiesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await getCurrentUserWithProfile();

  if (!user || user.role !== 'landlord') {
    redirect('/dashboard');
  }

  const listings = await prisma.listing.findMany({
    where: { ownerId: user.id },
    include: {
      images: { where: { isCover: true }, take: 1 },
      verification: true,
      units: {
        select: {
          id: true,
          unitNumber: true,
          buildingName: true,
          type: true,
          bedrooms: true,
          bathrooms: true,
          rent: true,
          status: true,
          occupancy: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const normalized = listings.map((listing) => {
    const totalUnits = listing.units.length;
    const vacantUnits = listing.units.filter((u) => u.occupancy === 'VACANT').length;
    return {
      ...listing,
      price: Number(listing.price),
      unitCount: totalUnits,
      vacantUnitCount: vacantUnits,
      units: listing.units.map((unit) => ({
        id: unit.id,
        unitNumber: unit.unitNumber,
        buildingName: unit.buildingName,
        type: unit.type,
        bedrooms: unit.bedrooms,
        bathrooms: unit.bathrooms,
        rent: Number(unit.rent),
        status: unit.status,
        occupancy: unit.occupancy,
      })),
    };
  });

  return (
    <DashboardShell
      navigation={LANDLORD_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <PropertiesClient listings={normalized as any[]} />
      </ErrorBoundary>
    </DashboardShell>
  );
}
