import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import PropertyDetailClient from './PropertyDetailClient';

export default async function LandlordPropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUserWithProfile();

  if (!user || user.role !== 'landlord') {
    redirect('/dashboard');
  }

  const [listing, property] = await Promise.all([
    prisma.listing.findFirst({
    where: { id, ownerId: user.id },
    include: {
      images: true,
      verification: true,
      owner: { select: { id: true, fullName: true, email: true } },
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
          listings: {
            select: {
              id: true,
              title: true,
              status: true,
              listingType: true,
              price: true,
              pricePeriod: true,
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      },
    },
    }),
    prisma.property.findFirst({
      where: { id, ownerId: user.id },
      include: {
        photos: { orderBy: [{ isCover: 'desc' }, { sortOrder: 'asc' }] },
        spaces: {
          orderBy: { identifier: 'asc' },
          include: {
            photos: true,
            category: { select: { spaceType: true } },
            listings: { select: { id: true, title: true, status: true, listingType: true, price: true, pricePeriod: true }, orderBy: { createdAt: 'desc' } },
          },
        },
      },
    }),
  ]);

  if (!listing && !property) {
    redirect('/dashboard/landlord/properties');
  }

  const initialListing = listing ? {
    id: listing.id,
    title: listing.title,
    address: listing.address,
    area: listing.area,
    state: listing.state,
    status: listing.status as string,
    listingType: listing.listingType as string,
    propertyType: listing.propertyType as string,
    price: Number(listing.price),
    pricePeriod: listing.pricePeriod,
    allowShortlet: listing.allowShortlet,
    amenities: (listing.amenities as string[]) || [],
    description: listing.description || '',
    viewsCount: listing.viewsCount,
    createdAt: listing.createdAt.toISOString(),
    verification: listing.verification
      ? {
          id: listing.verification.id,
          overallStatus: listing.verification.overallStatus as string,
          currentLayer: listing.verification.currentLayer,
          l1Status: listing.verification.l1Status as string,
          l2Status: listing.verification.l2Status as string,
          l3Status: listing.verification.l3Status as string,
          l4Status: listing.verification.l4Status as string,
          l5Status: listing.verification.l5Status as string,
        }
      : null,
    images: listing.images.map((img) => ({
      id: img.id,
      url: img.url,
      isCover: img.isCover,
    })),
    units: listing.units.map((unit) => ({
      id: unit.id,
      unitNumber: unit.unitNumber,
      type: unit.type,
      listingType: unit.listingType,
      pricePeriod: unit.pricePeriod,
      rent: Number(unit.rent),
      cautionDeposit: unit.cautionDeposit ? Number(unit.cautionDeposit) : null,
      serviceCharge: unit.serviceCharge ? Number(unit.serviceCharge) : null,
      status: unit.status,
      occupancy: unit.occupancy,
      isListed: unit.isListed,
      bedrooms: unit.bedrooms,
      bathrooms: unit.bathrooms,
      sizeSqm: unit.sizeSqm ? Number(unit.sizeSqm) : null,
      listings: unit.listings.map((child) => ({
        id: child.id,
        title: child.title,
        status: child.status as string,
        listingType: child.listingType as string,
        price: Number(child.price),
        pricePeriod: child.pricePeriod,
      })),
    })),
  } : {
    id: property!.id,
    title: property!.name,
    address: property!.address,
    area: property!.city,
    state: property!.state,
    status: property!.onboardingStatus as string,
    listingType: property!.spaces.flatMap((space) => space.listings)[0]?.listingType as string || 'rent',
    propertyType: property!.category as string,
    price: Number(property!.spaces.flatMap((space) => space.listings).find((child) => child.status === 'active')?.price || 0),
    pricePeriod: property!.spaces.flatMap((space) => space.listings).find((child) => child.status === 'active')?.pricePeriod || 'period',
    allowShortlet: false,
    amenities: Array.isArray(property!.facilities) ? property!.facilities as string[] : [],
    description: property!.description || '',
    viewsCount: 0,
    createdAt: property!.updatedAt.toISOString(),
    verification: null,
    images: property!.photos.map((photo) => ({ id: photo.id, url: photo.url, isCover: photo.isCover })),
    mediaEndpoint: `/api/properties/${property!.id}/photos/upload`,
    isRegistered: true,
    units: property!.spaces.map((space) => ({
      id: space.id,
      unitNumber: space.identifier,
      buildingName: property!.name,
      type: space.category.spaceType,
      listingType: space.listings[0]?.listingType || 'rent',
      pricePeriod: space.listings[0]?.pricePeriod || null,
      rent: Number(space.listings[0]?.price || 0),
      cautionDeposit: null,
      serviceCharge: null,
      status: space.operationalStatus,
      occupancy: space.operationalStatus === 'occupied' ? 'OCCUPIED' : 'VACANT',
      isListed: space.listings.some((child) => child.status === 'active'),
      bedrooms: 0,
      bathrooms: 0,
      sizeSqm: null,
      photoCount: space.photos.length,
      listings: space.listings.map((child) => ({ id: child.id, title: child.title, status: child.status as string, listingType: child.listingType as string, price: Number(child.price), pricePeriod: child.pricePeriod })),
    })),
  };

  return (
    <DashboardShell
      navigation={LANDLORD_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >

      <ErrorBoundary>

      <PropertyDetailClient listing={initialListing as any} />
    
      </ErrorBoundary>
</DashboardShell>
  );
}
