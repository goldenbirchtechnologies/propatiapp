import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import LandlordVerifyClient from './LandlordVerifyClient';

export default async function LandlordVerifyPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/login');
  }

  const user = await getCurrentUserWithProfile();

  if (!user || user.role !== 'landlord') {
    redirect('/dashboard');
  }

  const verifications = await prisma.verification.findMany({
    where: { ownerId: user.id },
    include: {
      listing: { select: { id: true, title: true, address: true } },
    },
    orderBy: { updatedAt: 'desc' },
    take: 100,
  });

  const initialVerifications = verifications.map((v) => ({
    id: v.id,
    listingId: v.listingId,
    listing: { title: v.listing.title, address: v.listing.address },
    currentLayer: v.currentLayer,
    overallStatus: v.overallStatus,
    l1Status: v.l1Status,
    l2Status: v.l2Status,
    l3Status: v.l3Status,
    l4Status: v.l4Status,
    l5Status: v.l5Status,
  }));

  return (
    <DashboardShell
      navigation={LANDLORD_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <LandlordVerifyClient initialVerifications={initialVerifications} />
    </DashboardShell>
  );
}
