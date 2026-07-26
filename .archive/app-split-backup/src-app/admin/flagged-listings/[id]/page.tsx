import { auth } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import FlaggedListingDetailClient from './FlaggedListingDetailClient';

export default async function FlaggedListingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await getCurrentUserWithProfile();

  if (!user || user.role !== 'admin') {
    const rolePaths: Record<string, string> = {
      landlord: '/dashboard/landlord',
      tenant: '/dashboard/tenant',
      agent: '/dashboard/agent',
      estate_manager: '/dashboard/estate-manager',
    };
    redirect(rolePaths[user!.role] ?? '/dashboard/tenant');
  }

  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: {
      flags: {
        include: {
          flaggedByUser: {
            select: { id: true, fullName: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      owner: {
        select: { id: true, fullName: true, email: true, phone: true },
      },
      images: { where: { isCover: true }, take: 3 },
    },
  });

  if (!listing || listing.flags.length === 0) {
    redirect('/admin/flagged-listings');
  }

  const serialized = {
    id: listing.id,
    title: listing.title,
    address: listing.address,
    area: listing.area,
    state: listing.state,
    price: Number(listing.price),
    status: listing.status,
    listingType: listing.listingType,
    propertyType: listing.propertyType ?? '',
    createdAt: listing.createdAt.toISOString(),
    updatedAt: listing.updatedAt.toISOString(),
    owner: {
      id: listing.owner.id,
      fullName: listing.owner.fullName,
      email: listing.owner.email,
      phone: listing.owner.phone,
    },
    images: listing.images.map((img) => ({ id: img.id, url: img.url, isCover: img.isCover })),
    flags: listing.flags.map((f) => ({
      id: f.id,
      reason: (f as unknown).description || 'No reason specified',
      details: (f as unknown).description || '',
      status: f.status,
      createdAt: f.createdAt.toISOString(),
      flaggedByUser: {
        id: f.flaggedByUser.id,
        fullName: f.flaggedByUser.fullName,
        email: f.flaggedByUser.email,
      },
    })),
  };

  return (
    <DashboardShell
      navigation={ADMIN_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <FlaggedListingDetailClient listing={serialized} />
    </DashboardShell>
  );
}
