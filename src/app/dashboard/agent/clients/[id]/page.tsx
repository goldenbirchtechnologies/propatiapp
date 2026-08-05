import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import AgentClientDetailClient from './AgentClientDetailClient';

export default async function AgentClientDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUserWithProfile();

  if (!user || user.role !== 'agent') {
    redirect('/dashboard');
  }

  const conversation = await prisma.conversation.findFirst({
    where: {
      OR: [
        { landlordId: user.id, tenantId: params.id },
        { tenantId: user.id, landlordId: params.id },
      ],
    },
  });

  if (!conversation) {
    redirect('/dashboard/agent/clients');
  }

  const client = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      role: true,
      profileBio: true,
      createdAt: true,
    },
  });

  if (!client) {
    redirect('/dashboard/agent/clients');
  }

  const agreements = await prisma.agreement.findMany({
    where: {
      agentId: user.id,
      OR: [{ tenantId: params.id }, { landlordId: params.id }],
    },
    select: {
      id: true,
      status: true,
      createdAt: true,
      listing: { select: { title: true, address: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  const deals = agreements.map((a) => ({
    id: a.id,
    property: a.listing?.title || a.listing?.address || '—',
    status: a.status,
    createdAt: a.createdAt.toISOString(),
  }));

  return (
    <DashboardShell
      navigation={AGENT_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >

      <ErrorBoundary>

      <AgentClientDetailClient client={{ ...client, deals }} />
    
      </ErrorBoundary>
</DashboardShell>
  );
}
