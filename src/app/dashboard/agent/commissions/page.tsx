import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AgentCommissionsClient from './AgentCommissionsClient';

export default async function AgentCommissionsPage() {
  const user = await getCurrentUserWithProfile();

  if (!user || user.role !== 'agent') {
    redirect('/dashboard');
  }

  const agentId = user.id;

  let commissionsError: string | null = null;

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
  } catch (e) {
    commissionsError = 'Failed to load commissions';
  }

  if (commissionsError) {
    return (
      <DashboardShell
        navigation={AGENT_NAVIGATION}
        userRole={user.role}
        userName={user.fullName}
        userAvatar={user.avatarUrl || undefined}
      >
        <Card>
          <CardHeader>
            <CardTitle>Commissions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{commissionsError}</p>
            <button
              type="button"
              className="mt-4 underline"
              onClick={() => {
                window.location.reload();
              }}
            >
              Retry
            </button>
          </CardContent>
        </Card>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      navigation={AGENT_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >

      <ErrorBoundary>

      <AgentCommissionsClient
        initialCommissions={commissions as unknown}
        totalEarned={totalEarned}
        totalPaid={totalPaid}
        totalPending={totalPending}
        onRetry={() => {
          window.location.reload();
        }}
      />
    
      </ErrorBoundary>
</DashboardShell>
  );
}
