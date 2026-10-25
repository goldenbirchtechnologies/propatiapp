import { getCurrentUserWithProfile } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import PublishClient from './PublishClient';

export default async function LandlordPropertyPublishPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUserWithProfile();
  if (!user) redirect('/sign-in');
  if (user.role !== 'landlord') redirect('/dashboard');

  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/listings/${id}`, {
    cache: 'no-store',
  });
  if (!res.ok) redirect('/dashboard/landlord/properties');
  const json = await res.json();
  const listing = json.data;

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
    images: listing.images || [],
  };

  return (
    <DashboardShell
      navigation={LANDLORD_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <PublishClient listing={listingData} />
    </DashboardShell>
  );
}