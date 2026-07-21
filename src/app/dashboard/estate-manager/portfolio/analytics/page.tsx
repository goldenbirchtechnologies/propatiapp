import { getCurrentUserWithProfile } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import PortfolioAnalyticsClient from './PortfolioAnalyticsClient';

export default async function PortfolioAnalyticsPage() {
  const user = await getCurrentUserWithProfile();
  if (!user) {
    redirect('/sign-in');
  }

  if (user.role !== 'estate_manager') {
    redirect(user.role === 'landlord' ? '/dashboard/landlord'
      : user.role === 'tenant' ? '/dashboard/tenant'
      : user.role === 'agent' ? '/dashboard/agent'
      : user.role === 'admin' ? '/admin'
      : '/dashboard/tenant');
  }

  const displayName = user.fullName || 'Estate Manager';
  const activeOrg = user.ownedOrganisations[0] || user.orgMemberships[0]?.org;

  let avgRent = 0;
  let avgServiceCharge = 0;
  let avgCautionDeposit = 0;
  let expiredLeases = 0;
  let listingCount = 0;

  if (activeOrg) {
    const units = await prisma.unit.findMany({
      where: { organizationId: activeOrg.id },
      select: { status: true, occupancy: true, type: true, rent: true, serviceCharge: true, cautionDeposit: true, leaseEndDate: true },
    });

    totalUnits = units.length;
    const occupiedCount = units.filter(u => u.occupancy === 'OCCUPIED').length;
    occupancyRate = totalUnits > 0 ? (occupiedCount / totalUnits) * 100 : 0;
    expiredLeases = units.filter(u => u.leaseEndDate ? new Date(u.leaseEndDate) < now : false).length;

    unitsByStatus = units.reduce((acc, u) => {
      acc[u.status] = (acc[u.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const occupied = units.filter(u => u.occupancy === 'OCCUPIED');
    avgRent = occupied.length ? occupied.reduce((s, u) => s + Number(u.rent), 0) / occupied.length : 0;
    avgServiceCharge = totalUnits ? units.reduce((s, u) => s + Number(u.serviceCharge || 0), 0) / totalUnits : 0;
    avgCautionDeposit = totalUnits ? units.reduce((s, u) => s + Number(u.cautionDeposit || 0), 0) / totalUnits : 0;

    const serviceCharges = await prisma.serviceCharge.findMany({
      where: { organizationId: activeOrg.id },
      select: { amount: true, status: true },
    });

    billedServiceCharges = serviceCharges.reduce((sum, sc) => sum + Number(sc.amount), 0);
    collectedServiceCharges = serviceCharges
      .filter(sc => sc.status === 'paid')
      .reduce((sum, sc) => sum + Number(sc.amount), 0);

    const orgListings = await prisma.orgListing.findMany({
      where: { orgId: activeOrg.id },
      select: { listingId: true },
    });
    listingCount = orgListings.length;

    const maintenanceTickets = await prisma.maintenanceTicket.findMany({
      where: { orgId: activeOrg.id },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      take: 5,
      select: {
        id: true,
        title: true,
        category: true,
        priority: true,
        status: true,
        createdAt: true,
      },
    });

    topMaintenanceIssues = maintenanceTickets.map(t => ({
      id: t.id,
      title: t.title,
      category: t.category,
      priority: t.priority,
      status: t.status,
      createdAt: t.createdAt.toISOString(),
    }));
  }

  const fallback = {
    unitsByStatus: { AVAILABLE: 12, RENTED: 18, MAINTENANCE: 2, UNAVAILABLE: 1 },
    occupancyRate: 72,
    totalUnits: 33,
    billedServiceCharges: 3600000,
    collectedServiceCharges: 2780000,
    avgRent: 1850000,
    avgServiceCharge: 120000,
    avgCautionDeposit: 450000,
    expiredLeases: 4,
    listingCount: 9,
    topMaintenanceIssues: [
      { id: 'tkt_1', title: 'AC unit blowing warm air', category: 'electrical', priority: 'high', status: 'in_progress', createdAt: new Date(Date.now() - 3600000 * 4).toISOString() },
      { id: 'tkt_2', title: 'Leakage in kitchen sink pipe', category: 'plumbing', priority: 'urgent', status: 'open', createdAt: new Date(Date.now() - 3600000 * 20).toISOString() },
      { id: 'tkt_3', title: 'Front door lock replacement', category: 'security', priority: 'high', status: 'resolved', createdAt: new Date(Date.now() - 3600000 * 48).toISOString() },
    ] as { id: string; title: string; category: string; priority: string; status: string; createdAt: string }[],
  };

  const data = activeOrg
    ? { unitsByStatus, occupancyRate, totalUnits, billedServiceCharges, collectedServiceCharges, avgRent, avgServiceCharge, avgCautionDeposit, expiredLeases, listingCount, topMaintenanceIssues }
    : fallback;

  return (
    <DashboardShell
      navigation={ESTATE_MANAGER_NAVIGATION}
      userRole="estate_manager"
      userName={displayName}
      userAvatar={user.avatarUrl || undefined}
    >

      <ErrorBoundary>

      <PortfolioAnalyticsClient
        {...data}
        hasRealData={!!activeOrg && totalUnits > 0}
        orgName={activeOrg?.name}
      />
    
      </ErrorBoundary>
</DashboardShell>
  );
}
