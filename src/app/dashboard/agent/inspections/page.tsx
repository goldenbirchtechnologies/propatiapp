import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import AgentInspectionsClient, { type InspectionRow } from './AgentInspectionsClient';

export default async function AgentInspectionsPage() {
  const user = await getCurrentUserWithProfile();

  if (!user || user.role !== 'agent') {
    redirect('/dashboard');
  }

  const inspections = await prisma.verification.findMany({
    where: { l4AgentId: user.id },
    include: {
      listing: {
        select: {
          id: true,
          title: true,
          address: true,
          area: true,
          state: true,
          listingType: true,
          images: { where: { isCover: true }, take: 1, select: { url: true } },
        },
      },
      owner: { select: { fullName: true } },
    },
    orderBy: { updatedAt: 'desc' },
    take: 100,
  });

  const initialInspections: InspectionRow[] = inspections.map((v, idx) => ({
    id: v.id,
    reference: `INSP-${new Date(v.createdAt).getFullYear()}-${String(idx + 1).padStart(4, '0')}`,
    status: v.l4Status,
    listingId: v.listingId,
    listingTitle: v.listing?.title ?? null,
    listingAddress: v.listing?.address ?? null,
    listingArea: v.listing?.area ?? null,
    listingState: v.listing?.state ?? null,
    listingType: v.listing?.listingType ?? null,
    coverImage: v.listing?.images?.[0]?.url ?? null,
    scheduledAt: v.l4ScheduledAt ? v.l4ScheduledAt.toISOString() : null,
    completedAt: v.l4CompletedAt ? v.l4CompletedAt.toISOString() : null,
    reportUrl: v.l4ReportUrl,
    notes: v.adminNotes,
    currentLayer: v.currentLayer,
    ownerName: v.owner?.fullName ?? null,
  }));

  return (
    <DashboardShell
      navigation={AGENT_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <AgentInspectionsClient initialInspections={initialInspections} />
      </ErrorBoundary>
    </DashboardShell>
  );
}
