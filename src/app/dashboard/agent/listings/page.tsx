import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import AgentListingsClient, { type AgentListingRow } from './AgentListingsClient';

const toNumber = (v: unknown): number =>
  typeof v === 'number' ? v : typeof v === 'string' ? Number(v) || 0 : 0;

export default async function Page() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'agent') redirect('/dashboard');

  const [listings, totalCount] = await Promise.all([
    prisma.listing.findMany({
      where: {
        OR: [
          { agentId: user.id },
          { assignments: { some: { agentId: user.id, status: 'active' } } },
        ],
      },
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
        viewsCount: true,
        verificationTier: true,
        createdAt: true,
        agentId: true,
        owner: { select: { fullName: true, email: true } },
        images: { where: { isCover: true }, take: 1, select: { url: true } },
        units: { select: { id: true, occupancy: true } },
        assignments: {
          where: { agentId: user.id, status: 'active' },
          select: { id: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.listing.count({
      where: {
        OR: [
          { agentId: user.id },
          { assignments: { some: { agentId: user.id, status: 'active' } } },
        ],
      },
    }),
  ]);

  const initialListings: AgentListingRow[] = listings.map((l) => ({
    id: l.id,
    title: l.title,
    address: l.address,
    area: l.area,
    state: l.state,
    listingType: l.listingType,
    propertyType: l.propertyType,
    status: l.status,
    verificationTier: l.verificationTier,
    viewsCount: l.viewsCount,
    price: toNumber(l.price),
    pricePeriod: l.pricePeriod,
    coverImage: l.images?.[0]?.url ?? null,
    ownerName: l.owner?.fullName ?? null,
    ownerEmail: l.owner?.email ?? null,
    mandateType: l.agentId === user.id ? 'direct' : 'cobrokered',
    unitCount: l.units.length,
    vacantUnitCount: l.units.filter((u) => u.occupancy === 'VACANT').length,
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
        <AgentListingsClient
          initialListings={initialListings}
          totalCount={totalCount}
          agentName={user.fullName || 'Agent'}
        />
      </ErrorBoundary>
    </DashboardShell>
  );
}
