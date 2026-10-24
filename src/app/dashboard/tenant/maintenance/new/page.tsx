import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { TENANT_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import TenantMaintenanceRequestClient from './TenantMaintenanceRequestClient';

export default async function Page() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'tenant') redirect('/dashboard');

  let listings: { id: string; title: string; address: string }[] = [];
  try {
    const agreements = await prisma.agreement.findMany({
      where: { tenantId: user.id, status: 'fully_signed' },
      select: { listing: { select: { id: true, title: true, address: true } } },
      take: 20,
    });
    listings = agreements.map((a) => a.listing).filter(Boolean) as typeof listings;
    if (listings.length === 0) {
      const fallback = await prisma.listing.findMany({
        where: { status: 'active' },
        select: { id: true, title: true, address: true },
        take: 20,
        orderBy: { createdAt: 'desc' },
      });
      listings = fallback;
    }
  } catch {
    listings = [];
  }

  return (
    <DashboardShell
      navigation={TENANT_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <TenantMaintenanceRequestClient listings={listings} />
      </ErrorBoundary>
    </DashboardShell>
  );
}
