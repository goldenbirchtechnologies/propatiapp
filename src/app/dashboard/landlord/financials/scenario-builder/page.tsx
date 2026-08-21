import { getCurrentUserWithProfile } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sliders } from 'lucide-react';

const fallbackScenarios = [
  { name: 'Baseline', occupancyRate: 72, monthlyIncome: 18500000, vacancy: '5 units' },
  { name: 'Growth Plan', occupancyRate: 88, monthlyIncome: 22000000, vacancy: '2 units' },
  { name: 'Stress Test', occupancyRate: 55, monthlyIncome: 14000000, vacancy: '12 units' },
];

export default async function LandlordScenarioBuilderPage() {
  const user = await getCurrentUserWithProfile();
  if (!user) redirect('/sign-in');
  if (user.role !== 'landlord') redirect('/dashboard');

  const displayName = user.fullName || 'Landlord';
  const activeOrg = user.ownedOrganisations[0];

  let avgRent = 420000;
  let occupancyRate = 95;
  let leaseCycle = 12;
  let vacancyCount = 4;
  const scenarios = fallbackScenarios;

  if (activeOrg) {
    try {
      const [units, serviceCharges] = await Promise.all([
        prisma.unit.findMany({
          where: { organizationId: activeOrg.id },
          select: { occupancy: true, rent: true, status: true, serviceCharge: true, leaseStartDate: true, leaseEndDate: true },
        }),
        prisma.serviceCharge.findMany({
          where: { organizationId: activeOrg.id },
          select: { amount: true, status: true },
        }),
      ]);

      const orgListings = await prisma.orgListing.findMany({
        where: { orgId: activeOrg.id },
        select: { listingId: true },
      });
      const listingIds = orgListings.map(l => l.listingId);

      let transactions = [];
      if (listingIds.length > 0) {
        transactions = await prisma.transaction.findMany({
          where: {
            listingId: { in: listingIds },
            type: { in: ['rent', 'subscription', 'service_charge'] },
          },
          select: { amount: true, status: true, type: true },
        });
      }

      const totalUnits = units.length;
      const occupiedUnits = units.filter(u => u.occupancy === 'OCCUPIED' || u.status === 'RENTED').length;
      const vacantUnits = units.filter(u => u.occupancy === 'VACANT').length;
      vacancyCount = vacantUnits;

      occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

      const occupiedWithRent = units.filter(u => u.occupancy === 'OCCUPIED' || u.status === 'RENTED');
      const totalRent = occupiedWithRent.reduce((s, u) => s + Number(u.rent), 0);
      avgRent = occupiedWithRent.length > 0 ? Math.round(totalRent / occupiedWithRent.length) : 0;

      const monthlyIncome = occupiedUnits * avgRent;

      const leasedUnits = units.filter(u => u.leaseStartDate && u.leaseEndDate);
      if (leasedUnits.length > 0) {
        const totalMonths = leasedUnits.reduce((s, u) => {
          const start = new Date(u.leaseStartDate!);
          const end = new Date(u.leaseEndDate!);
          const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
          return s + Math.max(1, months);
        }, 0);
        leaseCycle = Math.round(totalMonths / leasedUnits.length);
      }

      const totalServiceChargeBilled = serviceCharges.reduce((s, sc) => s + Number(sc.amount), 0);
      const totalServiceChargePaid = serviceCharges.filter(sc => sc.status === 'paid').reduce((s, sc) => s + Number(sc.amount), 0);
      const monthlyExpenses = (totalServiceChargeBilled - totalServiceChargePaid) + (vacantUnits * 50000);

      scenarios[0] = {
        name: 'Baseline',
        occupancyRate,
        monthlyIncome: monthlyIncome || transactions.reduce((s, t) => s + Number(t.amount), 0),
        monthlyExpenses,
        vacancy: `${vacancyCount} units`,
      };
      scenarios[1] = {
        name: 'Growth Plan',
        occupancyRate: Math.min(98, occupancyRate + 3),
        monthlyIncome: monthlyIncome ? Math.round(monthlyIncome * 1.08) : Math.round(transactions.reduce((s, t) => s + Number(t.amount), 0) * 1.08),
        monthlyExpenses: Math.round(monthlyExpenses * 0.95),
        vacancy: `${Math.max(0, vacancyCount - 2)} units`,
      };
      scenarios[2] = {
        name: 'Stress Test',
        occupancyRate: Math.max(0, occupancyRate - 7),
        monthlyIncome: monthlyIncome ? Math.round(monthlyIncome * 0.88) : Math.round(transactions.reduce((s, t) => s + Number(t.amount), 0) * 0.88),
        monthlyExpenses: Math.round(monthlyExpenses * 1.12),
        vacancy: `${Math.round(vacancyCount * 1.5)} units`,
      };
    } catch (e) {
      console.error('Scenario builder data error:', e);
    }
  }

  return (
    <DashboardShell navigation={LANDLORD_NAVIGATION} userRole="landlord" userName={displayName} userAvatar={user.avatarUrl || undefined}>

      <ErrorBoundary>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Advanced Scenario Builder</h1>
          <p className="text-muted-foreground mt-1">
            Model rent, occupancy, and revenue outcomes under different assumptions.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Assumptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Average Rent</p>
                <p className="text-xl font-semibold">₦{avgRent.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Occupancy Target</p>
                <p className="text-xl font-semibold">{occupancyRate}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Lease Cycle</p>
                <p className="text-xl font-semibold">{leaseCycle} Months</p>
              </div>
            </div>
          </CardContent>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Scenarios</CardTitle>
            <Button variant="outline" className="gap-2">
              <Sliders className="h-4 w-4" />
              New Scenario
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {scenarios.map((s) => (
                <Card key={s.name}>
                  <CardContent className="p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-semibold">{s.name}</p>
                      <Badge variant="secondary">{s.occupancyRate}%</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                      <p className="text-2xl font-bold">₦{(s.monthlyIncome || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Vacancy</p>
                      <p className="text-sm">{s.vacancy}</p>
                    </div>
                  </CardContent>
                </div>
              ))}
            </div>
          </CardContent>
        </div>
      </div>
    
      </ErrorBoundary>
</DashboardShell>
  );
}
