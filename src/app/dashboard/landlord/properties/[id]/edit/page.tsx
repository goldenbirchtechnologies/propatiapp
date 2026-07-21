import { getCurrentUserWithProfile } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import PropertyEditClient from './PropertyEditClient';

export default async function LandlordPropertyEditPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUserWithProfile();
  if (!user) redirect('/sign-in');
  if (user.role !== 'landlord') redirect('/dashboard');

  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3071'}/api/listings/${params.id}`, {
    cache: 'no-store',
  });
  if (!res.ok) redirect('/dashboard/landlord/properties');

  const json = await res.json();
  const listing = json.data;
  const isOwner = user.id === listing.ownerId;
  if (!isOwner) redirect('/dashboard/landlord/properties');

  const serialized = {
    id: listing.id,
    title: listing.title,
    address: listing.address,
    area: listing.area,
    state: listing.state,
    status: listing.status,
    listingType: listing.listingType,
    propertyType: listing.propertyType,
    price: Number(listing.price),
    pricePeriod: listing.pricePeriod,
    allowShortlet: listing.allowShortlet,
    amenities: (listing.amenities as string[]) || [],
    description: listing.description || '',
    images: (listing.images || []).map((img: { id: string; url: string; isCover: boolean }) => ({
      id: img.id,
      url: img.url,
      isCover: img.isCover,
    })),
  };

  return (
    <DashboardShell
      navigation={LANDLORD_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <PropertyEditClient listing={serialized} />
    </DashboardShell>
  );
}
