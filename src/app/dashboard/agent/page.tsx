import { getCurrentUserWithProfile, getRoleRedirectPath } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { prisma } from '@/lib/prisma';
import AgentDashboardClient, {
  type AgentDealRow,
  type AgentPipelineSegment,
  type AgentScheduleItem,
} from './AgentDashboardClient';

const toNumber = (v: unknown): number =>
  typeof v === 'number' ? v : typeof v === 'string' ? Number(v) || 0 : 0;

const ACTIVE_AGREEMENT_STATUSES = [
  'pending_landlord',
  'pending_tenant',
  'tenant_signed',
  'landlord_signed',
  'fully_signed',
] as const;

export default async function AgentDashboardPage() {
  const user = await getCurrentUserWithProfile();
  if (!user) {
    redirect('/sign-in');
  }
  if (user.role !== 'agent') {
    redirect(getRoleRedirectPath(user.role));
  }

  const displayName = user.fullName || 'User';

  const agentListingFilter = {
    OR: [
      { agentId: user.id },
      { assignments: { some: { agentId: user.id, status: 'active' } } },
    ],
  };

  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const prevMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

  const [
    managedProperties,
    totalUnits,
    occupiedUnits,
    vacantUnits,
    activeDeals,
    totalAgreements,
    pendingInvites,
    enquiries,
    clientCount,
    agreements,
    transactions,
    verifications,
    agentAreasRaw,
  ] = await Promise.all([
    prisma.listing.count({ where: agentListingFilter }),
    prisma.unit.count({ where: { listing: agentListingFilter } }),
    prisma.unit.count({ where: { listing: agentListingFilter, occupancy: 'OCCUPIED' } }),
    prisma.unit.count({ where: { listing: agentListingFilter, occupancy: 'VACANT' } }),
    prisma.agreement.count({
      where: { agentId: user.id, status: { in: [...ACTIVE_AGREEMENT_STATUSES] } },
    }),
    prisma.agreement.count({ where: { agentId: user.id } }),
    prisma.agentInvite.count({ where: { email: user.email, status: 'pending' } }),
    prisma.conversation.count({ where: { agentId: user.id } }),
    prisma.agreement.count({
      where: { agentId: user.id, status: { not: 'draft' } },
    }),
    prisma.agreement.findMany({
      where: { agentId: user.id },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            address: true,
            area: true,
            state: true,
            listingType: true,
            propertyType: true,
            price: true,
            pricePeriod: true,
            images: { where: { isCover: true }, take: 1, select: { url: true } },
          },
        },
        tenant: { select: { id: true, fullName: true } },
        landlord: { select: { id: true, fullName: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 100,
    }),
    prisma.transaction.findMany({
      where: { agentId: user.id },
      select: {
        id: true,
        agentCommission: true,
        agentCommissionStatus: true,
        agentCommissionReleasedAt: true,
        createdAt: true,
      },
    }),
    prisma.verification.findMany({
      where: { l4AgentId: user.id },
      select: {
        id: true,
        l4Status: true,
        l4ScheduledAt: true,
        updatedAt: true,
        listing: { select: { id: true, title: true, address: true, area: true, state: true } },
      },
      orderBy: { l4ScheduledAt: 'asc' },
      take: 20,
    }),
    Promise.resolve(user.agentAreas),
  ]);

  const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

  // ---- Commission / escrow figures -------------------------------------
  const pendingTransactions = transactions.filter(
    (t) => t.agentCommissionStatus === 'pending' || t.agentCommissionStatus === 'held'
  );
  const pendingCommissionAmount = pendingTransactions.reduce(
    (sum, t) => sum + toNumber(t.agentCommission),
    0
  );
  const pendingCommissionCount = pendingTransactions.length;

  const releasedThisMonth = transactions.filter((t) => {
    if (t.agentCommissionStatus !== 'released' || !t.agentCommissionReleasedAt) return false;
    const at = t.agentCommissionReleasedAt.getTime();
    return at >= monthStart.getTime() && at < monthEnd.getTime();
  });
  const monthEarnings = releasedThisMonth.reduce((sum, t) => sum + toNumber(t.agentCommission), 0);

  const releasedPrevMonth = transactions.filter((t) => {
    if (t.agentCommissionStatus !== 'released' || !t.agentCommissionReleasedAt) return false;
    const at = t.agentCommissionReleasedAt.getTime();
    return at >= prevMonthStart.getTime() && at < monthStart.getTime();
  });
  const previousMonthEarnings = releasedPrevMonth.reduce(
    (sum, t) => sum + toNumber(t.agentCommission),
    0
  );

  // ---- Active deal value ------------------------------------------------
  const activeAgreements = agreements.filter((a) =>
    (ACTIVE_AGREEMENT_STATUSES as readonly string[]).includes(a.status)
  );
  const activeDealsValue = activeAgreements.reduce(
    (sum, a) => sum + toNumber(a.rentAmount) || toNumber(a.listing?.price),
    0
  );

  // ---- Pipeline composition by asset class -------------------------------
  const SEGMENT_DEFS: Array<{
    key: string;
    label: string;
    match: (listingType: string | null, propertyType: string | null) => boolean;
    colorClass: string;
    barClass: string;
  }> = [
    {
      key: 'lease',
      label: 'Lease',
      match: (lt) => lt === 'rent' || lt === 'short_let' || lt === 'share',
      colorClass: 'bg-[var(--sovereign-hover)] dark:bg-primary',
      barClass: 'bg-[var(--sovereign-hover)] dark:bg-primary',
    },
    {
      key: 'sale',
      label: 'Sale',
      match: (lt) => lt === 'sale',
      colorClass: 'bg-primary dark:bg-[#4edea3]',
      barClass: 'bg-primary dark:bg-[#4edea3]',
    },
    {
      key: 'commercial',
      label: 'Commercial',
      match: (lt, pt) => lt === 'commercial' || pt === 'office' || pt === 'shop' || pt === 'warehouse',
      colorClass: 'bg-zinc-400 dark:bg-zinc-500',
      barClass: 'bg-zinc-400 dark:bg-zinc-500',
    },
  ];

  const pipelineSegments: AgentPipelineSegment[] = SEGMENT_DEFS.map((def) => {
    const matched = activeAgreements.filter((a) =>
      def.match(a.listing?.listingType ?? null, a.listing?.propertyType ?? null)
    );
    const value = matched.reduce(
      (sum, a) => sum + toNumber(a.rentAmount) || toNumber(a.listing?.price),
      0
    );
    return {
      key: def.key,
      label: def.label,
      detail: `${matched.length} Active ${matched.length === 1 ? 'Record' : 'Records'}`,
      value,
      count: matched.length,
      colorClass: def.colorClass,
      barClass: def.barClass,
    };
  }).filter((s) => s.count > 0);

  const pipelineTotalValue = pipelineSegments.reduce((sum, s) => sum + s.value, 0);

  // ---- Recent deals table ------------------------------------------------
  const recentDeals: AgentDealRow[] = agreements.slice(0, 5).map((a) => ({
    id: a.id,
    listingId: a.listingId,
    propertyTitle: a.listing?.title ?? 'Unknown Property',
    propertyAddress:
      a.listing?.address ??
      [a.listing?.area, a.listing?.state].filter(Boolean).join(', ') ??
      '—',
    coverImage: a.listing?.images?.[0]?.url ?? null,
    clientName: a.tenant?.fullName ?? a.landlord?.fullName ?? '—',
    clientType: a.tenant?.fullName ? 'Tenant' : 'Landlord',
    status: a.status,
    type: a.listing?.listingType ?? a.type,
    dealValue: toNumber(a.rentAmount) || toNumber(a.listing?.price),
    rentPeriod: a.rentPeriod ?? a.listing?.pricePeriod ?? null,
    activityAt: (a.updatedAt ?? a.createdAt).toISOString(),
  }));

  // ---- Field schedule (L4 inspections) ----------------------------------
  const schedule: AgentScheduleItem[] = verifications.map((v) => ({
    id: v.id,
    kind: 'Physical Site Inspection',
    listingTitle: v.listing?.title ?? 'Unassigned listing',
    location:
      v.listing?.address ??
      [v.listing?.area, v.listing?.state].filter(Boolean).join(', ') ??
      '—',
    scheduledAt: (v.l4ScheduledAt ?? v.updatedAt).toISOString(),
    status: v.l4Status,
    reference: v.listing?.id ?? null,
  }));

  const agentAreas: string[] = Array.isArray(agentAreasRaw)
    ? (agentAreasRaw as unknown[]).filter((a): a is string => typeof a === 'string')
    : [];

  const lastSyncedAt = new Date().toISOString();

  return (
    <DashboardShell
      navigation={AGENT_NAVIGATION}
      userRole="agent"
      userName={displayName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <AgentDashboardClient
          userName={displayName}
          agentTier={user.agentTier}
          agentApproved={user.agentApproved}
          agentAreas={agentAreas}
          verificationTier={
            verifications.some((v) => v.l4Status === 'approved') ? 'certified' : 'verified'
          }
          managedProperties={managedProperties}
          totalUnits={totalUnits}
          occupiedUnits={occupiedUnits}
          vacantUnits={vacantUnits}
          occupancyRate={occupancyRate}
          activeDeals={activeDeals}
          activeDealsValue={activeDealsValue}
          pendingCommissionAmount={pendingCommissionAmount}
          pendingCommissionCount={pendingCommissionCount}
          monthEarnings={monthEarnings}
          previousMonthEarnings={previousMonthEarnings}
          pipelineSegments={pipelineSegments}
          pipelineTotalValue={pipelineTotalValue}
          recentDeals={recentDeals}
          totalDeals={totalAgreements}
          schedule={schedule}
          totalScheduled={verifications.length}
          enquiryCount={enquiries}
          clientCount={clientCount}
          pendingInvites={pendingInvites}
          lastSyncedAt={lastSyncedAt}
        />
      </ErrorBoundary>
    </DashboardShell>
  );
}
