import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import AgentDealDetailClient from './AgentDealDetailClient';

export default async function DealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUserWithProfile();

  if (!user || user.role !== 'agent') {
    redirect('/dashboard');
  }

  const { id } = await params;

  const deal = await prisma.transaction.findUnique({
    where: { id },
    include: {
      listing: { select: { id: true, title: true, area: true } },
      payer: { select: { fullName: true, email: true } },
    },
  });

  if (!deal || deal.agentId !== user.id) {
    redirect('/dashboard/agent/deals');
  }

  const serialized = {
    ...deal,
    property: deal.listing?.title || 'Unknown',
    client: deal.payer?.fullName || 'Unknown',
    agent: '',
    value: Number(deal.amount) / 100,
    type: deal.type === 'sale' ? 'buy' : deal.type,
    createdAt: deal.createdAt.toISOString(),
    lastContact: deal.updatedAt.toISOString(),
    documents: [],
    timeline: [],
  };

  return (
    <DashboardShell
      navigation={AGENT_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >

      <ErrorBoundary>

      <AgentDealDetailClient deal={serialized} />
    
      </ErrorBoundary>
</DashboardShell>
  );
}
