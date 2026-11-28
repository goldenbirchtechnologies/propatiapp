import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import PropertyDetailClient from './PropertyDetailClient';

export default async function LandlordPropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'landlord') redirect('/dashboard');
  const { id } = await params;
  const property = await prisma.property.findFirst({
    where: { id, ownerId: user.id },
    include: {
      photos: { orderBy: [{ isCover: 'desc' }, { sortOrder: 'asc' }] },
      spaces: { orderBy: { identifier: 'asc' }, include: { category: { select: { spaceType: true } }, listings: { select: { id: true, title: true, status: true, listingType: true, price: true, pricePeriod: true }, orderBy: { createdAt: 'desc' } } } },
    },
  });
  if (!property) redirect('/dashboard/landlord/properties');

  const listing = {
    id: property.id,
    title: property.name,
    address: property.address,
    area: property.city,
    state: property.state,
    status: property.onboardingStatus as string,
    listingType: 'asset',
    propertyType: property.category as string,
    price: Number(property.spaces.flatMap((space) => space.listings)[0]?.price || 0),
    pricePeriod: property.spaces.flatMap((space) => space.listings)[0]?.pricePeriod || 'period',
    allowShortlet: false,
    amenities: Array.isArray(property.facilities) ? property.facilities as string[] : [],
    description: property.description || '',
    viewsCount: 0,
    createdAt: property.createdAt.toISOString(),
    verification: null,
    images: property.photos.map((photo) => ({ id: photo.id, url: photo.url, isCover: photo.isCover })),
    mediaEndpoint: `/api/properties/${property.id}/photos/upload`,
    isRegistered: true,
    units: property.spaces.map((space) => ({
      id: space.id,
      unitNumber: space.identifier,
      buildingName: property.name,
      type: space.category.spaceType,
      listingType: space.listings[0]?.listingType || 'rent',
      pricePeriod: space.listings[0]?.pricePeriod || null,
      rent: space.listings[0] ? Number(space.listings[0].price) : 0,
      cautionDeposit: null,
      serviceCharge: null,
      status: space.operationalStatus,
      occupancy: space.operationalStatus === 'occupied' ? 'OCCUPIED' : 'VACANT',
      isListed: space.listings.some((listing) => listing.status === 'active'),
      bedrooms: 0,
      bathrooms: 0,
      sizeSqm: null,
      photoCount: 0,
      listings: space.listings.map((listing) => ({ id: listing.id, title: listing.title, status: listing.status as string, listingType: listing.listingType as string, price: Number(listing.price), pricePeriod: listing.pricePeriod })),
    })),
  };

  return <DashboardShell navigation={LANDLORD_NAVIGATION} userRole={user.role} userName={user.fullName} userAvatar={user.avatarUrl || undefined}><ErrorBoundary><PropertyDetailClient listing={listing as any} /></ErrorBoundary></DashboardShell>;
}
