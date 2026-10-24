import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { TENANT_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import TenantMaintenanceTrackingClient from './TenantMaintenanceTrackingClient';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'tenant') redirect('/dashboard');

  const { id } = await props.params;

  let ticket: any = null;
  try {
    ticket = await prisma.maintenanceTicket.findUnique({
      where: { id },
      include: {
        listing: { select: { id: true, title: true, address: true, area: true, state: true } },
        tenant: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
        assignedToUser: { select: { id: true, fullName: true, avatarUrl: true } },
        org: { select: { id: true, name: true } },
      },
    });
  } catch (e) {
    console.error('[tenant/maintenance/[id]] load failed', e);
    redirect('/dashboard/tenant/maintenance');
  }

  if (!ticket) redirect('/dashboard/tenant/maintenance');
  const isParticipant = ticket.tenantId === user.id || ticket.raisedBy === user.id || ticket.assignedTo === user.id || user.role === 'admin';
  if (!isParticipant) redirect('/dashboard/tenant/maintenance');

  const serialized = {
    id: ticket.id,
    title: ticket.title,
    description: ticket.description ?? '',
    category: ticket.category as string,
    priority: ticket.priority as string,
    status: ticket.status as string,
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
    resolvedAt: ticket.resolvedAt?.toISOString() ?? null,
    closedAt: ticket.closedAt?.toISOString() ?? null,
    photoUrls: ticket.photoUrls ?? [],
    resolutionNote: ticket.resolutionNote ?? null,
    listing: ticket.listing ? { id: ticket.listing.id, title: ticket.listing.title, address: ticket.listing.address, area: ticket.listing.area, state: ticket.listing.state } : null,
    tenant: ticket.tenant ? { id: ticket.tenant.id, fullName: ticket.tenant.fullName, email: ticket.tenant.email, avatarUrl: ticket.tenant.avatarUrl } : null,
    assignedTo: ticket.assignedToUser ? { id: ticket.assignedToUser.id, fullName: ticket.assignedToUser.fullName, avatarUrl: ticket.assignedToUser.avatarUrl } : null,
    org: ticket.org ? { id: ticket.org.id, name: ticket.org.name } : null,
  };

  return (
    <DashboardShell
      navigation={TENANT_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <TenantMaintenanceTrackingClient ticket={serialized} />
      </ErrorBoundary>
    </DashboardShell>
  );
}
