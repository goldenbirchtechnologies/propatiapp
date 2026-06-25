import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import AgentClientsClient from './AgentClientsClient';

export default async function AgentClientsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await getCurrentUserWithProfile();

  if (!user || user.role !== 'agent') {
    redirect('/dashboard');
  }

  const agreements = await prisma.agreement.findMany({
    where: { agentId: { not: null }, status: { not: 'draft' } },
    include: {
      tenant: { select: { id: true, fullName: true, phone: true } },
      listing: { select: { id: true, title: true, type: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const clients = agreements
    .filter((a) => a.tenant)
    .map((a) => ({
      id: a.id,
      name: a.tenant.fullName,
      phone: a.tenant.phone || '—',
      type: a.listing?.type === 'sale' ? 'Buyer' : 'Renter',
      minBudget: Number(a.rentAmount || 0),
      maxBudget: Number(a.rentAmount || 0) * 1.5,
      lastContact: a.createdAt,
    }));

  return (
    <DashboardShell
      navigation={AGENT_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <AgentClientsClient initialClients={clients} />
    </DashboardShell>
  );
}
