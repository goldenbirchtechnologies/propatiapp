import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import PropertyDetailClient from './PropertyDetailClient';

export default async function LandlordPropertyDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/login');
  }

  const user = await getCurrentUserWithProfile();

  if (!user || user.role !== 'landlord') {
    redirect('/dashboard');
  }

  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: {
      images: true,
      verification: true,
      owner: { select: { id: true, fullName: true, email: true } },
    },
  });

  if (!listing || listing.ownerId !== user.id) {
    redirect('/dashboard/landlord/properties');
  }

  const initialListing = {
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
  } as unknown;

  return (
    <DashboardShell
      navigation={LANDLORD_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <PropertyDetailClient listing={initialListing} {...({ userId: user.id } as unknown)} />
    </DashboardShell>
  );
}
