import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { REALTOR_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import ListingsClient from './ListingsClient';

export default async function RealtorListingsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await getCurrentUserWithProfile();

  if (!user || user.role !== 'realtor') {
    redirect('/dashboard');
  }

  const listings = await prisma.listing.findMany({
    where: { ownerId: user.id },
    select: {
      id: true,
      title: true,
      address: true,
      price: true,
      status: true,
      type: true,
      viewCount: true,
      images: { where: { isCover: true }, take: 1 },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const initialListings = listings.map((l) => ({
    id: l.id,
    title: l.title,
    location: l.address,
    price: Number(l.price),
    status: l.status,
    type: l.type,
    views: l.viewCount,
  }));

  return (
    <DashboardShell
      navigation={REALTOR_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ListingsClient initialListings={initialListings} />
    </DashboardShell>
  );
}
