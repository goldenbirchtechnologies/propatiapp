import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import AgentMaintenanceClient, {
  type MaintenancePropertyOption,
  type MaintenanceTicketRow,
} from './AgentMaintenanceClient';

export default async function AgentMaintenancePage() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'agent') redirect('/dashboard');

  const [tickets, managedListings] = await Promise.all([
    prisma.maintenanceTicket.findMany({
      where: {
        OR: [
          { raisedBy: user.id },
          { tenantId: user.id },
          { assignedTo: user.id },
          { listing: { agentId: user.id } },
          { listing: { assignments: { some: { agentId: user.id, status: 'active' } } } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: {
        listing: { select: { id: true, title: true, address: true, area: true } },
        raisedByUser: { select: { id: true, fullName: true, email: true, phone: true } },
        assignedToUser: { select: { id: true, fullName: true } },
      },
    }),
    prisma.listing.findMany({
      where: {
        OR: [
          { agentId: user.id },
          { assignments: { some: { agentId: user.id, status: 'active' } } },
        ],
      },
      orderBy: { updatedAt: 'desc' },
      take: 100,
      select: { id: true, title: true, address: true, area: true },
    }),
  ]);

  const initialTickets: MaintenanceTicketRow[] = tickets.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    category: t.category,
    priority: t.priority,
    status: t.status,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    resolvedAt: t.resolvedAt ? t.resolvedAt.toISOString() : null,
    listing: t.listing,
    raisedBy: t.raisedByUser,
    assignedTo: t.assignedToUser,
    photoCount: t.photoUrls?.length ?? 0,
  }));

  const properties: MaintenancePropertyOption[] = managedListings.map((l) => ({
    id: l.id,
    title: l.title,
    address: l.address,
    area: l.area,
  }));

  return (
    <DashboardShell
      navigation={AGENT_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <AgentMaintenanceClient initialTickets={initialTickets} properties={properties} />
      </ErrorBoundary>
    </DashboardShell>
  );
}
