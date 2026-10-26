import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import AgentClientDetailClient from './AgentClientDetailClient';
import { stageForStatus } from '../../_lib/agent-deal-format';

const toNumber = (v: unknown): number => {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') return Number(v) || 0;
  if (v && typeof v === 'object' && 'toNumber' in (v as object)) {
    return (v as { toNumber: () => number }).toNumber();
  }
  return 0;
};

export default async function AgentClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'agent') redirect('/dashboard');

  const { id } = await params;

  const client = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      avatarUrl: true,
      role: true,
      profileBio: true,
      ninVerified: true,
      bvnEncrypted: true,
      phoneVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!client) redirect('/dashboard/agent/clients');

  // Only agreements this agent is assigned to, and only for this client.
  const agreements = await prisma.agreement.findMany({
    where: {
      agentId: user.id,
      OR: [{ tenantId: id }, { landlordId: id }],
    },
    select: {
      id: true,
      type: true,
      status: true,
      rentAmount: true,
      cautionDeposit: true,
      startDate: true,
      endDate: true,
      createdAt: true,
      updatedAt: true,
      listing: {
        select: {
          id: true,
          title: true,
          address: true,
          area: true,
          city: true,
          state: true,
          price: true,
          listingType: true,
          propertyType: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const isLandlord = agreements.some((a) => a.landlordId === id);
  const hasSale = agreements.some((a) => a.type === 'sale');
  const clientType = isLandlord
    ? hasSale
      ? 'Seller'
      : 'Landlord'
    : hasSale
      ? 'Buyer'
      : 'Renter';

  const dealRows = agreements.map((a) => {
    const consideration =
      a.listing?.listingType === 'sale' ? toNumber(a.listing.price) : toNumber(a.rentAmount);
    return {
      id: a.id,
      reference: a.id.toUpperCase(),
      type: a.type,
      status: a.status,
      stage: stageForStatus(a.status),
      propertyTitle: a.listing?.title ?? 'Untitled listing',
      propertyAddress: a.listing?.address ?? '—',
      propertyArea: a.listing?.area ?? null,
      consideration,
      cautionDeposit: toNumber(a.cautionDeposit),
      startDate: a.startDate?.toISOString() ?? null,
      endDate: a.endDate?.toISOString() ?? null,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    };
  });

  const activeDeals = dealRows.filter(
    (d) => !['fully_signed', 'expired', 'terminated'].includes(d.status)
  );
  const closedDeals = dealRows.filter((d) =>
    ['fully_signed', 'expired', 'terminated'].includes(d.status)
  );
  const transactedValue = dealRows.reduce((s, d) => s + d.consideration, 0);
  const pendingEscrow = activeDeals.reduce((s, d) => s + d.cautionDeposit, 0);

  // Featured assets: the properties behind this client's live mandates.
  const seenListing = new Set<string>();
  const assets = dealRows
    .filter((d) => {
      if (!d.propertyTitle || d.propertyTitle === 'Untitled listing') return false;
      const key = d.propertyTitle;
      if (seenListing.has(key)) return false;
      seenListing.add(key);
      return true;
    })
    .slice(0, 6)
    .map((d) => ({
      id: d.id,
      title: d.propertyTitle,
      address: d.propertyAddress,
      area: d.propertyArea,
      value: d.consideration,
      status: d.status,
      stage: d.stage,
    }));

  return (
    <DashboardShell
      navigation={AGENT_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <AgentClientDetailClient
          client={{
            id: client.id,
            name: client.fullName,
            email: client.email,
            phone: client.phone,
            avatarUrl: client.avatarUrl,
            role: client.role,
            type: clientType,
            bio: client.profileBio,
            ninVerified: client.ninVerified,
            bvnVerified: Boolean(client.bvnEncrypted),
            phoneVerified: client.phoneVerified,
            clientSince: client.createdAt.toISOString(),
            lastContact: client.updatedAt.toISOString(),
          }}
          deals={dealRows}
          assets={assets}
          metrics={{
            totalDeals: dealRows.length,
            activeDeals: activeDeals.length,
            closedDeals: closedDeals.length,
            transactedValue,
            pendingEscrow,
          }}
        />
      </ErrorBoundary>
    </DashboardShell>
  );
}
