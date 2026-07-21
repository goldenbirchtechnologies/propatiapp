import { getCurrentUserWithProfile } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import ScenarioBuilderClient from './ScenarioBuilderClient';

export default async function ScenarioBuilderPage() {
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
  const now = new Date();

  if (activeOrg) {
    const units = await prisma.unit.findMany({
      where: { organizationId: activeOrg.id },
      select: { occupancy: true, rent: true, serviceCharge: true, cautionDeposit: true, leaseEndDate: true, status: true },
    });

    totalUnits = units.length;
    occupiedUnits = units.filter(u => u.occupancy === 'OCCUPIED').length;
    vacantUnits = units.filter(u => u.occupancy === 'VACANT').length;
    maintenanceUnits = units.filter(u => u.status === 'MAINTENANCE').length;
    expiredLeases = units.filter(u => u.leaseEndDate ? new Date(u.leaseEndDate) < now : false).length;

    const occupied = units.filter(u => u.occupancy === 'OCCUPIED');
    avgRent = occupied.length ? occupied.reduce((s, u) => s + Number(u.rent), 0) / occupied.length : 0;
    avgServiceCharge = units.reduce((s, u) => s + Number(u.serviceCharge || 0), 0) / (units.length || 1);
    avgCautionDeposit = units.reduce((s, u) => s + Number(u.cautionDeposit || 0), 0) / (units.length || 1);

    const serviceCharges = await prisma.serviceCharge.findMany({
      where: { organizationId: activeOrg.id },
      select: { amount: true, status: true },
    });

    const totalBilled = serviceCharges.reduce((sum, sc) => sum + Number(sc.amount), 0);
    const totalCollected = serviceCharges
      .filter(sc => sc.status === 'paid')
      .reduce((sum, sc) => sum + Number(sc.amount), 0);

    const listingIds = (
      await prisma.orgListing.findMany({
        where: { orgId: activeOrg.id },
        select: { listingId: true },
      })
    ).map(l => l.listingId);

    const transactions = listingIds.length > 0
      ? await prisma.transaction.findMany({
          where: {
            listingId: { in: listingIds },
            type: { in: ['rent', 'subscription'] },
          },
          select: { amount: true, status: true, createdAt: true },
        })
      : [];

    const txCount = transactions.length;
    const avgTx = txCount ? transactions.reduce((s, t) => s + Number(t.amount), 0) / txCount : 0;
    const settledTxs = transactions.filter(t => t.status === 'success' || t.status === 'completed');
    const settledTxAmount = settledTxs.reduce((s, t) => s + Number(t.amount), 0);

    const activeTenancies = occupiedUnits;
    const defaultedLeases = units.filter(u => u.occupancy === 'VACANT' && u.leaseEndDate ? new Date(u.leaseEndDate) < now : false).length;

    const monthlyIncome = activeTenancies * avgRent + totalCollected;
    const monthlyExpenses = totalBilled - totalCollected + maintenanceUnits * 20000 + defaultedLeases * avgRent;

    const baseline = { name: 'Baseline', occupancyRate: totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0, monthlyIncome, monthlyExpenses };
    const optimistic = { name: 'Optimistic', occupancyRate: Math.min(95, (occupiedUnits + vacantUnits) / Math.max(1, totalUnits) * 100), monthlyIncome: monthlyIncome * 1.05 + settledTxAmount * 0.06, monthlyExpenses: monthlyExpenses * 0.92 };
    const pessimistic = { name: 'Pessimistic', occupancyRate: Math.max(0, (occupiedUnits - Math.ceil(vacantUnits * 0.3)) / Math.max(1, totalUnits) * 100), monthlyIncome: monthlyIncome * 0.88, monthlyExpenses: monthlyExpenses * 1.12 };

    monthlyScenarios = [baseline, optimistic, pessimistic];
  }

  const fallbackScenarios = [
    { name: 'Baseline', occupancyRate: 72, monthlyIncome: 18500000, monthlyExpenses: 12200000 },
    { name: 'Optimistic', occupancyRate: 88, monthlyIncome: 22000000, monthlyExpenses: 10800000 },
    { name: 'Pessimistic', occupancyRate: 55, monthlyIncome: 14000000, monthlyExpenses: 14100000 },
  ];

  return (
    <DashboardShell
      navigation={ESTATE_MANAGER_NAVIGATION}
      userRole="estate_manager"
      userName={displayName}
      userAvatar={user.avatarUrl || undefined}
    >

      <ErrorBoundary>

      <ScenarioBuilderClient
        scenarios={monthlyScenarios.length > 0 ? monthlyScenarios : fallbackScenarios}
        hasRealData={!!activeOrg && totalUnits > 0}
        orgName={activeOrg?.name}
      />
    
      </ErrorBoundary>
</DashboardShell>
  );
}
