import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import AgentCommissionsClient from './AgentCommissionsClient';

export default async function AgentCommissionsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/login');
  }

  const user = await getCurrentUserWithProfile();

  if (!user || user.role !== 'agent') {
    redirect('/dashboard');
  }

  const agentId = user.id;

  let commissions: {
    id: string;
    deal: string;
    amount: number;
    rate: string;
    date: string;
    status: string;
    client: string;
  }[] = [];
  let totalEarned = 0;
  let totalPaid = 0;
  let totalPending = 0;

  try {
    const agreements = await prisma.agreement.findMany({
      where: { agentId: { not: null } },
      include: {
        listing: { select: { id: true, title: true, address: true } },
        tenant: { select: { id: true, fullName: true } },
        transactions: {
          where: { status: 'released' },
          select: { amount: true, paidAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    commissions = agreements
      .filter((a) => a.agentId === agentId)
      .map((a) => {
        const totalPaidAmt = a.transactions.reduce((sum, t) => sum + Number(t.amount), 0);
        const commissionRate = 0.05;
        const amount = totalPaidAmt * commissionRate;
        return {
          id: a.id,
          deal: `${a.type} – ${a.listing?.title || 'Unknown'}`,
          amount,
          rate: '5%',
          date: a.createdAt.toISOString(),
          status: amount > 0 ? 'paid' : 'pending',
          client: a.tenant?.fullName || '—',
        };
      });

    totalEarned = commissions.reduce((s, c) => s + c.amount, 0);
    totalPaid = commissions
      .filter((c) => c.status === 'paid')
      .reduce((s, c) => s + c.amount, 0);
    totalPending = commissions
      .filter((c) => c.status === 'pending')
      .reduce((s, c) => s + c.amount, 0);
  } catch {
    // leave as empty on error
  }

  return (
    <DashboardShell
      navigation={AGENT_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <AgentCommissionsClient
        initialCommissions={commissions as any}
        totalEarned={totalEarned}
        totalPaid={totalPaid}
        totalPending={totalPending}
        onRetry={() => {
          window.location.reload();
        }}
      />
    </DashboardShell>
  );
}
