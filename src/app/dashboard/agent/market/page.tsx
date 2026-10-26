import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import AgentMarketClient, { type AgentMarketListing } from './AgentMarketClient';

const toNumber = (v: unknown): number =>
  typeof v === 'number' ? v : typeof v === 'string' ? Number(v) || 0 : 0;

const BATCH_SIZE = 20;

export default async function Page() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'agent') redirect('/dashboard');

  const [listings, totalActive] = await Promise.all([
    prisma.listing.findMany({
      where: { status: 'active' },
      select: {
        id: true,
        title: true,
        address: true,
        area: true,
        state: true,
        listingType: true,
        propertyType: true,
        status: true,
        price: true,
        pricePeriod: true,
        sizeSqm: true,
        bedrooms: true,
        viewsCount: true,
        verificationTier: true,
        createdAt: true,
        owner: { select: { fullName: true } },
        images: { where: { isCover: true }, take: 1, select: { url: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: BATCH_SIZE,
    }),
    prisma.listing.count({ where: { status: 'active' } }),
  ]);

  const initialListings: AgentMarketListing[] = listings.map((l) => ({
    id: l.id,
    title: l.title,
    address: l.address,
    area: l.area,
    state: l.state,
    listingType: l.listingType,
    propertyType: l.propertyType,
    status: l.status,
    price: toNumber(l.price),
    pricePeriod: l.pricePeriod,
    sizeSqm: l.sizeSqm ? toNumber(l.sizeSqm) : null,
    bedrooms: l.bedrooms,
    coverImage: l.images?.[0]?.url ?? null,
    ownerName: l.owner?.fullName ?? null,
    verificationTier: l.verificationTier,
    viewsCount: l.viewsCount,
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
        <AgentMarketClient initialListings={initialListings} totalActive={totalActive} />
      </ErrorBoundary>
    </DashboardShell>
  );
}
