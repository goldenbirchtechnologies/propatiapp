import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import PropertiesClient from './PropertiesClient';
import { getPropertyMetrics } from '@/lib/property-metrics';

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
  try {
    listings = await prisma.listing.findMany({
      where: {
        ownerId: user.id,
        propertyType: { not: null },
        // Unit-level marketplace records are not portfolio properties.
        unitId: null,
        spaceId: null,
      },
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
            listings: {
              select: { id: true, status: true, listingType: true, price: true, pricePeriod: true },
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Every property the landlord owns is listed here, including freshly added
    // ones that have no units yet. Filtering unit-less buildings out made a
    // successful save look like a failed one: the property existed but vanished
    // from the portfolio until its first unit was created.
    normalized = listings.map((listing) => {
      const metrics = getPropertyMetrics(listing.units);
      const assignedAgent =
        listing.agent ?? listing.assignments?.[0]?.agent ?? null;
      return {
        ...listing,
        price: Number(listing.price),
        unitCount: metrics.totalUnits,
        vacantUnitCount: metrics.unlistedUnits,
        listedUnitCount: metrics.activeListings,
        occupiedUnitCount: metrics.occupiedUnits,
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
          listings: unit.listings.map((child) => ({
            id: child.id,
            status: child.status,
            listingType: child.listingType,
            price: Number(child.price),
            pricePeriod: child.pricePeriod,
          })),
          bedrooms: unit.bedrooms,
          bathrooms: unit.bathrooms,
        })),
      };
    });

    const registeredProperties = await prisma.property.findMany({
      where: { ownerId: user.id },
      include: {
        spaces: { select: { id: true, identifier: true, name: true, operationalStatus: true, category: { select: { spaceType: true } }, listings: { select: { id: true, status: true, listingType: true, price: true, pricePeriod: true } } } },
        spaceCategories: { select: { id: true, categoryName: true, spaceType: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    normalized = [
      ...normalized,
      ...registeredProperties.map((property) => {
        const listed = property.spaces.filter((space) => space.listings.some((listing) => listing.status === 'active')).length;
        const occupied = property.spaces.filter((space) => space.operationalStatus === 'occupied').length;
        return {
          id: property.id,
          title: property.name,
          area: property.city,
          state: property.state,
          listingType: 'asset',
          propertyType: property.category,
          status: property.onboardingStatus,
          price: 0,
          pricePeriod: null,
          viewsCount: 0,
          allowShortlet: false,
          images: [],
          verification: null,
          unitCount: property.spaces.length,
          vacantUnitCount: property.spaces.length - occupied,
          listedUnitCount: listed,
          occupiedUnitCount: occupied,
          assignedAgent: null,
          registryOnly: true,
          registryHref: `/dashboard/landlord/properties/registry/${property.id}`,
          units: property.spaces.map((space) => ({
            id: space.id,
            unitNumber: space.identifier,
            buildingName: property.name,
            type: space.category.spaceType,
            listingType: space.listings[0]?.listingType ?? 'rent',
            pricePeriod: space.listings[0]?.pricePeriod ?? null,
            rent: space.listings[0]?.price ? Number(space.listings[0].price) : 0,
            status: space.operationalStatus,
            occupancy: space.operationalStatus === 'occupied' ? 'OCCUPIED' : 'VACANT',
            isListed: space.listings.some((listing) => listing.status === 'active'),
            listings: space.listings.map((listing) => ({ id: listing.id, status: listing.status, listingType: listing.listingType, price: Number(listing.price), pricePeriod: listing.pricePeriod })),
            bedrooms: 0,
            bathrooms: 0,
          })),
        };
      }),
    ];

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
          <p className="text-error font-medium mb-1">Unable to load properties</p>
          <p className="text-sm text-on-surface-variant dark:text-surface-variant">Something went wrong while fetching your properties. Please try again later.</p>
          {process.env.NODE_ENV !== 'production' && (
            <pre className="mt-4 text-left text-xs text-error bg-red-500/10 p-3 rounded overflow-auto">
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
