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
    redirect('/sign-in');
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
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const initialVerifications = verifications.map((v) => ({
    id: v.id,
    listing: { title: v.listing.title, address: v.listing.address },
    currentLayer: v.currentLayer,
    status: v.l1Status,
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
