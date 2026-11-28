import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import PropertiesClient from './PropertiesClient';

export const metadata: Metadata = { title: 'My Properties | PROPTI', description: 'Manage your registered property assets and spaces' };

export default async function LandlordPropertiesPage() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'landlord') redirect('/dashboard');

  const properties = await prisma.property.findMany({
    where: { ownerId: user.id },
    include: {
      photos: { where: { isCover: true }, take: 1 },
      spaces: { orderBy: { identifier: 'asc' }, include: { category: { select: { spaceType: true } }, listings: { select: { id: true, status: true, listingType: true, price: true, pricePeriod: true }, orderBy: { createdAt: 'desc' } } } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  const normalized = properties.map((property) => {
    const activeListings = property.spaces.flatMap((space) => space.listings.filter((listing) => listing.status === 'active'));
    const occupied = property.spaces.filter((space) => space.operationalStatus === 'occupied').length;
    const firstListing = activeListings[0] ?? property.spaces.flatMap((space) => space.listings)[0];
    return {
      id: property.id,
      title: property.name,
      area: property.city,
      state: property.state,
      listingType: 'asset',
      propertyType: property.category,
      status: property.onboardingStatus,
      verificationStatus: property.verificationStatus,
      listingStatus: activeListings.length ? 'live' : 'not_listed',
      address: property.address,
      price: firstListing ? Number(firstListing.price) : 0,
      pricePeriod: firstListing?.pricePeriod ?? null,
      viewsCount: 0,
      images: property.photos.map((photo) => ({ url: photo.url })),
      verification: null,
      unitCount: property.spaces.length,
      vacantUnitCount: property.spaces.length - occupied,
      listedUnitCount: activeListings.length,
      occupiedUnitCount: occupied,
      registryOnly: true,
      registryHref: `/dashboard/landlord/properties/${property.id}`,
      units: property.spaces.map((space) => ({
        id: space.id,
        unitNumber: space.identifier,
        buildingName: property.name,
        type: space.category.spaceType,
        listingType: space.listings[0]?.listingType ?? 'rent',
        pricePeriod: space.listings[0]?.pricePeriod ?? null,
        rent: space.listings[0] ? Number(space.listings[0].price) : 0,
        status: space.operationalStatus,
        occupancy: space.operationalStatus === 'occupied' ? 'OCCUPIED' : 'VACANT',
        isListed: space.listings.some((listing) => listing.status === 'active'),
        listings: space.listings.map((listing) => ({ id: listing.id, status: listing.status, listingType: listing.listingType, price: Number(listing.price), pricePeriod: listing.pricePeriod })),
        bedrooms: 0,
        bathrooms: 0,
      })),
    };
  });

  return <DashboardShell navigation={LANDLORD_NAVIGATION} userRole={user.role} userName={user.fullName} userAvatar={user.avatarUrl || undefined}><ErrorBoundary><PropertiesClient listings={normalized as any[]} /></ErrorBoundary></DashboardShell>;
}
