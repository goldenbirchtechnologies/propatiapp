import { getCurrentUserWithProfile } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import PropertyEditClient from './PropertyEditClient';
import { prisma } from '@/lib/prisma';

export default async function LandlordPropertyEditPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUserWithProfile();
  if (!user) redirect('/sign-in');
  if (user.role !== 'landlord') redirect('/dashboard');

  const listing = await prisma.listing.findFirst({
    where: { id: params.id, ownerId: user.id },
    include: {
      images: true,
      units: { select: { occupancy: true } },
      orgListings: { select: { orgId: true }, take: 1 },
    },
  });

  if (!listing) redirect('/dashboard/landlord/properties');

  const orgId = listing.orgListings[0]?.orgId || null;
  const vacantUnits = listing.units.filter((u) => u.occupancy === 'VACANT').length;

  const serialized = {
    id: listing.id,
    title: listing.title,
    address: listing.address,
    area: listing.area,
    state: listing.state,
    status: listing.status,
    listingType: listing.listingType,
    propertyType: listing.propertyType || '',
    price: Number(listing.price),
    pricePeriod: listing.pricePeriod,
    allowShortlet: listing.allowShortlet,
    amenities: (listing.amenities as string[]) || [],
    description: listing.description || '',
    images: listing.images.map((img: { id: string; url: string; isCover: boolean }) => ({
      id: img.id,
      url: img.url,
      isCover: img.isCover,
    })),
    unitCount: listing.units.length,
    vacantUnitCount: vacantUnits,
    orgId,
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
