import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { REALTOR_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import BuyPipelineClient from './BuyPipelineClient';

export default async function RealtorBuyPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await getCurrentUserWithProfile();

  if (!user || user.role !== 'realtor') {
    redirect('/dashboard');
  }

  const listings = await prisma.listing.findMany({
    where: ({ ownerId: user.id, type: 'sale' } as any),
    select: { id: true, title: true, price: true, status: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });

  const initialDeals = listings.map((l) => ({
    id: l.id,
    title: l.title,
    property: l.title,
    value: Number(l.price),
    client: '—',
  }));

  return (
    <DashboardShell
      navigation={REALTOR_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <BuyPipelineClient initialDeals={initialDeals} />
    </DashboardShell>
  );
}
