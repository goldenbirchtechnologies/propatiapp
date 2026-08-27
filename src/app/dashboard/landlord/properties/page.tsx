import { Metadata } from 'next';
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
  const user = await getCurrentUserWithProfile();

  if (!user || user.role !== 'landlord') {
    redirect('/dashboard');
  }

  let listings: any[] = [];
  let normalized: any[] = [];
  let listingIds: string[] = [];
  let totalUnits = 0;
  let activeListings = 0;
  let loadError: string | null = null;

  try {
    listings = await prisma.listing.findMany({
      where: { ownerId: user.id },
      include: {
        images: { where: { isCover: true }, take: 1 },
        verification: true,
        agent: { select: { id: true, fullName: true, email: true } },
        assignments: {
          where: { status: 'active' },
          include: { agent: { select: { id: true, fullName: true, email: true } } },
        },
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
            organizationId: true,
            listingType: true,
            pricePeriod: true,
            isListed: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    normalized = listings
      .map((listing) => {
        const totalUnitsForListing = listing.units.length;
        const vacantUnits = listing.units.filter((u) => u.occupancy === 'VACANT').length;
        const listedUnits = listing.units.filter((u) => u.isListed).length;
        const assignedAgent =
          listing.agent ?? listing.assignments?.[0]?.agent ?? null;
        return {
          ...listing,
          price: Number(listing.price),
          unitCount: totalUnitsForListing,
          vacantUnitCount: vacantUnits,
          listedUnitCount: listedUnits,
          assignedAgent,
          units: listing.units.map((unit) => ({
            id: unit.id,
            unitNumber: unit.unitNumber,
            buildingName: unit.buildingName,
            type: unit.type,
            listingType: unit.listingType,
            pricePeriod: unit.pricePeriod,
            rent: Number(unit.rent),
            status: unit.status,
            occupancy: unit.occupancy,
            isListed: unit.isListed,
            bedrooms: unit.bedrooms,
            bathrooms: unit.bathrooms,
          })),
        };
      })
      .filter((l) => l.units.length > 0);

    listingIds = normalized.map((l) => l.id);
    const [
      totalUnitsFromRelation,
      totalUnitsFromDb,
      activeListingsFromDb,
    ] = await Promise.all([
      Promise.resolve(normalized.reduce((sum, l) => sum + l.unitCount, 0)),
      listingIds.length
        ? prisma.unit.count({ where: { listingId: { in: listingIds } } })
        : Promise.resolve(0),
      listingIds.length
        ? prisma.unit.count({ where: { listingId: { in: listingIds }, isListed: true } })
        : Promise.resolve(0),
    ]);

    totalUnits = totalUnitsFromRelation || totalUnitsFromDb;
    activeListings = normalized.reduce((sum, l) => sum + l.listedUnitCount, 0) || activeListingsFromDb;
  } catch (error) {
    console.error('LandlordPropertiesPage server data load error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return (
      <DashboardShell
        navigation={LANDLORD_NAVIGATION}
        userRole={user.role}
        userName={user.fullName}
        userAvatar={user.avatarUrl || undefined}
      >
        <div className="rounded-lg border border-red-500/30 bg-destructive/5 p-6 text-center" role="alert">
          <p className="text-red-500 font-medium mb-1">Unable to load properties</p>
          <p className="text-sm text-zinc-500">Something went wrong while fetching your properties. Please try again later.</p>
          {process.env.NODE_ENV !== 'production' && (
            <pre className="mt-4 text-left text-xs text-red-500 bg-red-500/10 p-3 rounded overflow-auto">
              {message}
            </pre>
          )}
        </div>
      </DashboardShell>
    );
  }

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
