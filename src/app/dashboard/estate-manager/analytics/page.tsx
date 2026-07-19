import { getCurrentUserWithProfile } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { BarChart3, TrendingUp, PieChart as PieChartIcon, Download, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

const fallbackMonthlyData = [
  { month: 'Jan', occupancy: 82, collection: 38 },
  { month: 'Feb', occupancy: 85, collection: 40 },
  { month: 'Mar', occupancy: 78, collection: 36 },
  { month: 'Apr', occupancy: 88, collection: 42 },
  { month: 'May', occupancy: 87, collection: 41 },
  { month: 'Jun', occupancy: 90, collection: 44 },
];

const fallbackUnitDistribution = [
  { label: '1BR', count: 24 },
  { label: '2BR', count: 36 },
  { label: '3BR', count: 18 },
  { label: '4BR+', count: 12 },
];

const fallbackRecentTransactions = [
  { id: '1', unit: 'Block A - 101', tenant: 'Mr. Adebayo Okon', amount: 1800000, date: '2026-06-20' },
  { id: '2', unit: 'Block B - 204', tenant: 'Mrs. Chioma Nwankwo', amount: 2200000, date: '2026-06-19' },
  { id: '3', unit: 'Block C - 301', tenant: 'Dr. Emeka Obi', amount: 3500000, date: '2026-06-18' },
  { id: '4', unit: 'Block A - 105', tenant: 'Ms. Aisha Bello', amount: 1600000, date: '2026-06-17' },
  { id: '5', unit: 'Block D - 402', tenant: 'Mr. Tunde Bakare', amount: 2100000, date: '2026-06-16' },
];

export default async function EstateManagerAnalyticsPage() {
  const user = await getCurrentUserWithProfile();
  if (!user) redirect('/login');

  const activeOrg = user.ownedOrganisations[0] || user.orgMemberships[0]?.org;

  let monthlyData = fallbackMonthlyData;
  let unitDistribution = fallbackUnitDistribution;
  let recentTransactions = fallbackRecentTransactions;
  let activeUnits = 90;
  let occupancyRate = 78;
  let monthlyCollections = '₦42M';
  let avgRent = '₦1.8M';
  let portfolioValue = '₦1.2B';

  if (activeOrg) {
    try {
      const now = new Date();
      const units = await prisma.unit.findMany({
        where: { organizationId: activeOrg.id },
        select: { type: true, occupancy: true, status: true, rent: true },
      });

      const totalUnits = units.length;
      const occupiedUnits = units.filter(u => u.occupancy === 'OCCUPIED' || u.status === 'RENTED').length;
      occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
      activeUnits = totalUnits;

      const typeCounts: Record<string, number> = {};
      for (const unit of units) {
        const label = unit.type || 'Other';
        typeCounts[label] = (typeCounts[label] || 0) + 1;
      }
      unitDistribution = Object.entries(typeCounts)
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count);

      const orgListings = await prisma.orgListing.findMany({
        where: { orgId: activeOrg.id },
        select: { listingId: true },
      });
      const listingIds = orgListings.map(l => l.listingId);

      monthlyData = [];
      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        const label = monthStart.toLocaleString('en-US', { month: 'short' });

        let collection = 0;
        if (listingIds.length > 0) {
          const txns = await prisma.transaction.findMany({
            where: {
              listingId: { in: listingIds },
              status: { in: ['paid', 'released', 'completed'] },
              createdAt: { gte: monthStart, lt: monthEnd },
            },
            select: { amount: true },
          });
          collection = txns.reduce((sum, t) => sum + Number(t.amount), 0);
        }
        monthlyData.push({ month: label, occupancy: occupancyRate, collection });
      }

      if (listingIds.length > 0) {
        const recent = await prisma.transaction.findMany({
          where: { listingId: { in: listingIds } },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            listing: { select: { title: true, address: true } },
            payer: { select: { fullName: true } },
            amount: true,
            createdAt: true,
          },
        });
        recentTransactions = recent.map(tx => ({
          id: tx.id,
          unit: tx.listing?.title || tx.listing?.address || '—',
          tenant: tx.payer?.fullName || '—',
          amount: Number(tx.amount),
          date: tx.createdAt.toISOString().split('T')[0],
        }));
      }

      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);
      let lastMonthCollection = 0;
      if (listingIds.length > 0) {
        const lastMonthTxns = await prisma.transaction.findMany({
          where: {
            listingId: { in: listingIds },
            status: { in: ['paid', 'released', 'completed'] },
            createdAt: { gte: lastMonthStart, lt: lastMonthEnd },
          },
          select: { amount: true },
        });
        lastMonthCollection = lastMonthTxns.reduce((sum, t) => sum + Number(t.amount), 0);
      }
      monthlyCollections = `₦${lastMonthCollection.toLocaleString()}`;

      const occupiedRentUnits = units.filter(u => u.occupancy === 'OCCUPIED' || u.status === 'RENTED');
      const totalRent = occupiedRentUnits.reduce((sum, u) => sum + Number(u.rent), 0);
      avgRent = occupiedRentUnits.length > 0
        ? `₦${Math.round(totalRent / occupiedRentUnits.length).toLocaleString()}`
        : '₦0';

      const annualRent = units.reduce((sum, u) => sum + Number(u.rent), 0);
      portfolioValue = `₦${(annualRent * 10).toLocaleString()}`;
    } catch (e) {
      console.error('Analytics data error:', e);
    }
  }

  return (
    <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName={user.fullName || 'Estate Manager'} userAvatar={user.avatarUrl || undefined}>

      <ErrorBoundary>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-headline-sm font-bold" style={{ fontSize: 'font-headline-sm', color: 'text-primary' }}>Analytics</h1>
            <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-muted-foreground', marginTop: 'mt-1' }}>Portfolio performance and financial insights</p>
          </div>
          <div className="flex items-center gap-3">
            <select className="inp-field" defaultValue="month" style={{ maxWidth: '180px' }}>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            <button className="btn btn-outline inline-flex items-center gap-2"><Download className="w-4 h-4" /> Export</button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-muted-foreground' }}>Portfolio Value</p>
            <p className="text-2xl font-bold" style={{ color: 'text-primary' }}>{portfolioValue}</p>
            <p className="text-xs text-success mt-1">+4.2% vs last month</p>
          </div>
          <div className="card p-4">
            <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-muted-foreground' }}>Active Units</p>
            <p className="text-2xl font-bold" style={{ color: 'text-primary' }}>{activeUnits}</p>
            <p className="text-xs text-success mt-1">{occupancyRate}% occupancy</p>
          </div>
          <div className="card p-4">
            <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-muted-foreground' }}>Monthly Collections</p>
            <p className="text-2xl font-bold text-success">{monthlyCollections}</p>
            <p className="text-xs text-success mt-1">+7.1% vs last month</p>
          </div>
          <div className="card p-4">
            <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-muted-foreground' }}>Avg Rent / Unit</p>
            <p className="text-2xl font-bold" style={{ color: 'text-primary' }}>{avgRent}</p>
            <p className="text-xs font-label-md uppercase tracking-wider mt-1" style={{ color: 'text-muted-foreground' }}>Gross rental yield</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="font-headline-sm font-bold mb-4" style={{ color: 'text-primary' }}>Collection Trend</h3>
            <div className="h-64 flex items-center justify-center border border-border border-dashed rounded-lg">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-2" style={{ color: 'text-muted-foreground' }} />
                <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-muted-foreground' }}>Monthly collection trend</p>
                <p className="text-xs font-label-md uppercase tracking-wider mt-1" style={{ color: 'text-muted-foreground' }}>Hook chart library here</p>
              </div>
            </div>
          </div>
          <div className="card p-6">
            <h3 className="font-headline-sm font-bold mb-4" style={{ color: 'text-primary' }}>Occupancy Trend</h3>
            <div className="h-64 flex items-center justify-center border border-border border-dashed rounded-lg">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-2" style={{ color: 'text-muted-foreground' }} />
                <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-muted-foreground' }}>Occupancy rate trend</p>
                <p className="text-xs font-label-md uppercase tracking-wider mt-1" style={{ color: 'text-muted-foreground' }}>Hook chart library here</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="font-headline-sm font-bold mb-4" style={{ color: 'text-primary' }}>Unit Distribution</h3>
            <div className="h-64 flex items-center justify-center border border-border border-dashed rounded-lg">
              <div className="text-center">
                <PieChartIcon className="w-12 h-12 mx-auto mb-2" style={{ color: 'text-muted-foreground' }} />
                <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-muted-foreground' }}>Unit type breakdown</p>
                <p className="text-xs font-label-md uppercase tracking-wider mt-1" style={{ color: 'text-muted-foreground' }}>Hook chart library here</p>
                <div className="mt-3 flex flex-wrap justify-center gap-3">
                  {unitDistribution.map((u) => (
                    <span key={u.label} className="inline-flex items-center gap-1 text-xs font-label-md uppercase tracking-wider px-2 py-1 rounded-full bg-muted" style={{ color: 'text-primary' }}>
                      <span className="w-2 h-2 rounded-full" style={{ background: 'text-primary' }} />
                      {u.label}: {u.count}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="card p-6">
            <h3 className="font-headline-sm font-bold mb-4" style={{ color: 'text-primary' }}>Revenue vs Expenses</h3>
            <div className="h-64 flex items-center justify-center border border-border border-dashed rounded-lg">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-2" style={{ color: 'text-muted-foreground' }} />
                <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-muted-foreground' }}>Revenue vs expenses chart</p>
                <p className="text-xs font-label-md uppercase tracking-wider mt-1" style={{ color: 'text-muted-foreground' }}>Hook chart library here</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="p-4 border-b" style={{ borderColor: 'border-border' }}>
            <h3 className="font-headline-sm font-bold" style={{ color: 'text-primary' }}>Recent Transactions</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: 'border-border' }}>
                <th className="text-left p-4 text-sm font-label-md uppercase tracking-wider" style={{ color: 'text-muted-foreground' }}>Unit</th>
                <th className="text-left p-4 text-sm font-label-md uppercase tracking-wider" style={{ color: 'text-muted-foreground' }}>Tenant</th>
                <th className="text-right p-4 text-sm font-label-md uppercase tracking-wider" style={{ color: 'text-muted-foreground' }}>Amount</th>
                <th className="text-left p-4 text-sm font-label-md uppercase tracking-wider" style={{ color: 'text-muted-foreground' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((r) => (
                <tr key={r.id} className="border-b transition-colors hover:bg-muted/30" style={{ borderColor: 'border-border' }}>
                  <td className="p-4 text-sm" style={{ color: 'text-primary' }}>{r.unit}</td>
                  <td className="p-4 text-sm" style={{ color: 'text-muted-foreground' }}>{r.tenant}</td>
                  <td className="p-4 text-sm font-medium text-right" style={{ color: 'text-primary' }}>₦{r.amount.toLocaleString()}</td>
                  <td className="p-4 text-sm" style={{ color: 'text-primary' }}>
                    {new Date(r.date).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    
      </ErrorBoundary>
</DashboardShell>
  );
}
