import { auth } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { REALTOR_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import RealtorDealDetailClient from './RealtorDealDetailClient';

export default async function RealtorDealDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/login');
  }

  const user = await getCurrentUserWithProfile();

  if (!user || user.role !== 'realtor') {
    redirect('/dashboard');
  }

  const agreement = await prisma.agreement.findUnique({
    where: { id: params.id },
    include: {
      listing: { select: { id: true, title: true, price: true, address: true, area: true, state: true, propertyType: true, listingType: true, images: { where: { isCover: true }, take: 1, select: { url: true } } } },
      tenant: { select: { id: true, fullName: true, email: true, phone: true } },
      landlord: { select: { id: true, fullName: true, email: true } },
    },
  });

  if (!agreement) {
    notFound();
  }

  const deal = {
    id: agreement.id,
    title: `${agreement.tenant?.fullName || 'Client'} - ${agreement.listing?.title || 'Property'}`,
    property: agreement.listing?.title || '—',
    address: agreement.listing?.address || '',
    area: agreement.listing?.area || '',
    state: agreement.listing?.state || '',
    value: Number(agreement.listing?.price || 0),
    client: agreement.tenant?.fullName || '—',
    clientEmail: agreement.tenant?.email || '',
    clientPhone: agreement.tenant?.phone || '',
    landlord: agreement.landlord?.fullName || '—',
    status: agreement.status,
    type: agreement.type as 'buy' | 'sell',
    createdAt: agreement.createdAt.toISOString(),
    updatedAt: agreement.updatedAt.toISOString(),
    coverImage: agreement.listing?.images?.[0]?.url || null,
    propertyType: agreement.listing?.propertyType || '',
    listingType: agreement.listing?.listingType || '',
  };

  return (
    <DashboardShell
      navigation={REALTOR_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <RealtorDealDetailClient deal={deal} />
    </DashboardShell>
  );
}
