import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { REALTOR_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import DealsClient from './DealsClient';

export default async function RealtorDealsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await getCurrentUserWithProfile();

  if (!user || user.role !== 'realtor') {
    redirect('/dashboard');
  }

  const agreements = await prisma.agreement.findMany({
    where: { type: 'sale' },
    include: {
      listing: { select: { id: true, title: true, price: true } },
      tenant: { select: { id: true, fullName: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const deals = agreements.map((a) => ({
    id: a.id,
    title: `${a.tenant?.fullName || 'Client'} - ${a.listing?.title || 'Property'}`,
    property: a.listing?.title || '—',
    value: Number(a.listing?.price || 0),
    client: a.tenant?.fullName || '—',
    status: a.status,
  }));

  return (
    <DashboardShell
      navigation={REALTOR_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <DealsClient initialDeals={deals} />
    </DashboardShell>
  );
}
