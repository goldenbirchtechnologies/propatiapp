import { getCurrentUserWithProfile } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import PropertyDetailClient from './PropertyDetailClient';

export default async function LandlordListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUserWithProfile();
  if (!user) redirect('/sign-in');
  if (user.role !== 'landlord') redirect('/dashboard');

  const { id } = await params;

  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/listings/${id}`, {
    cache: 'no-store',
  });
  if (!res.ok) redirect('/dashboard/landlord/properties');

  const json = await res.json();
  const listing = json.data;
  const isOwner = user.id === listing.ownerId;
  if (!isOwner) redirect('/dashboard/landlord/properties');

  const listingData = {
    id: listing.id,
    title: listing.title,
    description: listing.description || '',
    listingType: listing.listingType,
    propertyType: listing.propertyType,
    address: listing.address,
    area: listing.area,
    state: listing.state,
    price: Number(listing.price),
    pricePeriod: listing.pricePeriod,
    cautionDeposit: listing.cautionDeposit ? Number(listing.cautionDeposit) : null,
    serviceCharge: listing.serviceCharge ? Number(listing.serviceCharge) : null,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    floors: listing.floors,
    parkingSpaces: listing.parkingSpaces,
    amenities: Array.isArray(listing.amenities) ? listing.amenities : [],
    availableFrom: listing.availableFrom,
    status: listing.status,
    allowShortlet: listing.allowShortlet,
    viewsCount: listing.viewsCount,
    images: listing.images || [],
    verification: listing.verification,
  };

  return (
    <DashboardShell
      navigation={LANDLORD_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <PropertyDetailClient listing={listingData} />
    </DashboardShell>
  );
}
