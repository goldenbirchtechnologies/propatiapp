import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import AgentInspectionsClient from './AgentInspectionsClient';

export default async function AgentInspectionsPage() {
  const user = await getCurrentUserWithProfile();

  if (!user || user.role !== 'agent') {
    redirect('/dashboard');
  }

  const inspections = await prisma.verification.findMany({
    where: { l4AgentId: user.id },
    include: {
      listing: { select: { id: true, title: true, address: true } },
    },
    orderBy: { updatedAt: 'desc' },
    take: 100,
  });

  const initialInspections = inspections.map((v) => ({
    id: v.id,
    listing: v.listing.title,
    scheduledAt: v.l4ScheduledAt?.toISOString() || v.updatedAt.toISOString(),
    status: v.l4Status,
    reportUrl: v.l4ReportUrl,
  }));

  return (
    <DashboardShell
      navigation={AGENT_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >

      <ErrorBoundary><div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

      <AgentInspectionsClient initialInspections={initialInspections as unknown} />
    
      </div></ErrorBoundary>
</DashboardShell>
  );
}
