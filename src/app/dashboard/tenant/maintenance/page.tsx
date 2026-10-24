import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { TENANT_NAVIGATION } from '@/lib/navigation';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { prisma } from '@/lib/prisma';
import TenantMaintenanceClient from './TenantMaintenanceClient';

export default async function TenantMaintenancePage() {
  const user = await getCurrentUserWithProfile();

  if (!user || user.role !== 'tenant') {
    redirect('/dashboard');
  }

  const tickets = await prisma.maintenanceTicket.findMany({
    where: { tenantId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      listing: { select: { id: true, title: true, address: true, area: true } },
      assignedToUser: { select: { id: true, fullName: true } },
    },
  });

  const mapped = tickets.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description ?? '',
    status: t.status as string,
    priority: t.priority as string,
    category: t.category as string,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    resolvedAt: t.resolvedAt?.toISOString() ?? null,
    photoUrls: t.photoUrls ?? [],
    resolutionNote: t.resolutionNote ?? null,
    assignedTo: t.assignedToUser ? { id: t.assignedToUser.id, fullName: t.assignedToUser.fullName } : null,
    listing: t.listing ? { id: t.listing.id, title: t.listing.title, address: t.listing.address, area: t.listing.area } : null,
  }));

  return (
    <DashboardShell
      navigation={TENANT_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <TenantMaintenanceClient tickets={mapped} />
      </ErrorBoundary>
    </DashboardShell>
  );
}
