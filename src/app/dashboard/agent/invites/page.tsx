import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import AcceptInviteClient from './AcceptInviteClient';

export default async function AgentInvitesPage() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'agent') {
    redirect('/dashboard');
  }

  const invites = await prisma.agentInvite.findMany({
    where: { email: user.email, status: 'pending' },
    include: {
      sender: { select: { id: true, fullName: true, email: true } },
      assignments: {
        include: {
          listing: { select: { id: true, title: true, address: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <DashboardShell navigation={AGENT_NAVIGATION} userRole="agent" userName={user.fullName}>
      <ErrorBoundary>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
          <div>
            <h3 className="font-heading text-headline-lg text-white">Invitations</h3>
            <p className="text-zinc-500">Landlords can optionally invite you to manage their listings.</p>
          </div>
          <AcceptInviteClient invites={invites} email={user.email ?? ''} />
        </div>
      </ErrorBoundary>
    </DashboardShell>
  );
}
