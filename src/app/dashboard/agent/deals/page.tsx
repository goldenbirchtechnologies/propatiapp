import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import AgentDealsClient from './AgentDealsClient';

const ACTIVE_STATUSES = [
  'draft',
  'pending_landlord',
  'pending_tenant',
  'tenant_signed',
  'landlord_signed',
  'fully_signed',
  'active',
];

export default async function Page() {
  const { userId } = await auth();
  if (!userId) redirect('/login');

  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'agent') redirect('/dashboard');

  const agentId = user.id;

  const deals = await prisma.agreement.findMany({
    where: { agentId: agentId, status: { in: ACTIVE_STATUSES } },
    select: {
      id: true,
      type: true,
      status: true,
      rentAmount: true,
      cautionDeposit: true,
      startDate: true,
      endDate: true,
      createdAt: true,
      listing: { select: { title: true, address: true } },
      landlord: { select: { fullName: true } },
      tenant: { select: { fullName: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const toNumber = (v: unknown) => (typeof v === 'number' ? v : typeof v === 'string' ? Number(v) || 0 : 0);

  const initialDeals = deals.map((d) => ({
    id: d.id,
    type: d.type,
    status: d.status,
    rentAmount: toNumber(d.rentAmount),
    cautionDeposit: toNumber(d.cautionDeposit),
    startDate: d.startDate?.toISOString() || null,
    endDate: d.endDate?.toISOString() || null,
    property: d.listing?.address || d.listing?.title || '—',
    tenant: d.tenant?.fullName || '—',
    landlord: d.landlord?.fullName || '—',
    createdAt: d.createdAt.toISOString(),
  }));

  return (
    <DashboardShell
      navigation={AGENT_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >

      <ErrorBoundary>

      <AgentDealsClient initialDeals={initialDeals} />
    
      </ErrorBoundary>
</DashboardShell>
  );
}
