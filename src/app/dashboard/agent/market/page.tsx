import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import AgentMarketClient from './AgentMarketClient';

export default async function Page() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'agent') redirect('/dashboard');

  const listings = await prisma.listing.findMany({
    where: { status: 'active' },
    select: {
      id: true,
      title: true,
      listingType: true,
      status: true,
      price: true,
      address: true,
      owner: { select: { fullName: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  const toNumber = (v: unknown) => (typeof v === 'number' ? v : typeof v === 'string' ? Number(v) || 0 : 0);

  const initialListings = listings.map((l) => ({
    id: l.id,
    title: l.title,
    address: l.address,
    price: toNumber(l.price),
    type: l.listingType,
    status: l.status,
    landlord: l.owner?.fullName || '—',
    createdAt: l.createdAt.toISOString(),
  }));

  return (
    <DashboardShell
      navigation={AGENT_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >

      <ErrorBoundary>

      <AgentMarketClient initialListings={initialListings} />
    
      </ErrorBoundary>
</DashboardShell>
  );
}
