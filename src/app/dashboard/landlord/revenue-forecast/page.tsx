import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import { parseKoboToNaira } from '@/lib/utils';
import Link from 'next/link';

export const metadata = {
  title: 'Revenue Forecast – Landlord',
  description: 'Predictive financial analysis for your portfolio.',
};

export default async function LandlordRevenueForecastPage() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'landlord') redirect('/dashboard');

  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const yearEnd = new Date(now.getFullYear(), 11, 31);

  const [totalRevenueKobo, listingCount, activeListingCount, transactionCountKobo] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        payeeId: user.id,
        status: { in: ['released', 'success'] },
        createdAt: { gte: yearStart, lte: yearEnd },
      },
      _sum: { amount: true },
    }),
    prisma.listing.count({ where: { ownerId: user.id } }),
    prisma.listing.count({ where: { ownerId: user.id, status: 'active' } }),
    prisma.transaction.count({
      where: {
        payeeId: user.id,
        status: { in: ['released', 'success'] },
        createdAt: { gte: yearStart, lte: yearEnd },
      },
    }),
  ]);

  const totalRevenue = parseKoboToNaira(Number(totalRevenueKobo._sum?.amount ?? 0));

  return (
    <DashboardShell navigation={LANDLORD_NAVIGATION} userRole="landlord" userName={user.fullName} userAvatar={user.avatarUrl || undefined}>

      <ErrorBoundary>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Revenue Forecasting</h1>
            <p className="text-zinc-400 mt-1">Predictive financial analysis for {now.getFullYear()}-{String(now.getFullYear() + 1).slice(2)}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/landlord/revenue-forecast/report" className="px-4 py-2 rounded-lg border border-[#262626] bg-obsidian-800/30 hover:bg-obsidian-800-lowest transition-colors text-sm font-medium">
              View Full Forecast →
            </Link>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-5 rounded-xl border border-[#262626] shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-tertiary bg-tertiary-fixed/30 px-2 py-0.5 rounded-full">YTD</span>
            </div>
            <p className="text-sm text-zinc-400 mb-1">Projected Gross Revenue</p>
            <p className="text-2xl font-bold text-white">₦{totalRevenue.toLocaleString()}</p>
          </div>
          <div className="card p-5 rounded-xl border border-[#262626] shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-tertiary bg-tertiary-fixed/30 px-2 py-0.5 rounded-full">Portfolio</span>
            </div>
            <p className="text-sm text-zinc-400 mb-1">Active Listings</p>
            <p className="text-2xl font-bold text-white">{activeListingCount}</p>
          </div>
          <div className="card p-5 rounded-xl border border-[#262626] shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-tertiary bg-tertiary-fixed/30 px-2 py-0.5 rounded-full">Total</span>
            </div>
            <p className="text-sm text-zinc-400 mb-1">Total Listings</p>
            <p className="text-2xl font-bold text-white">{listingCount}</p>
          </div>
          <div className="card p-5 rounded-xl border border-[#262626] shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-tertiary bg-tertiary-fixed/30 px-2 py-0.5 rounded-full">Realized</span>
            </div>
            <p className="text-sm text-zinc-400 mb-1">Transactions YTD</p>
            <p className="text-2xl font-bold text-white">{transactionCountKobo}</p>
          </div>
        </div>

        {/* Asset Class Table */}
        <div className="rounded-xl border border-[#262626] shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[#262626] flex justify-between items-center">
            <h3 className="font-heading font-bold text-white">Portfolio Summary</h3>
            <Link href="/dashboard/landlord/revenue-forecast/report" className="text-sm text-secondary hover:underline font-medium">View Detailed Forecast →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-zinc-800 text-zinc-400 text-xs uppercase">
                <tr>
                  <th className="px-5 py-3">Asset Category</th>
                  <th className="px-5 py-3">Current Revenue</th>
                  <th className="px-5 py-3">Active Listings</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                <tr className="hover:bg-surface-variant/20 transition-colors">
                  <td className="px-5 py-4 flex items-center gap-3">
                    <div className="w-2 h-8 rounded-full bg-tertiary" />
                    <span className="font-medium text-white">Residential Portfolio</span>
                  </td>
                  <td className="px-5 py-4 text-sm text-zinc-400">₦{totalRevenue.toLocaleString()}</td>
                  <td className="px-5 py-4 text-sm text-white">{activeListingCount}</td>
                  <td className="px-5 py-4">
                    <span className="px-2 py-1 rounded-full text-xs font-bold bg-tertiary-fixed text-on-tertiary-fixed">
                      {activeListingCount > 0 ? 'ACTIVE' : 'DORMANT'}
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-surface-variant/20 transition-colors">
                  <td className="px-5 py-4 flex items-center gap-3">
                    <div className="w-2 h-8 rounded-full bg-secondary" />
                    <span className="font-medium text-white">Commercial Portfolio</span>
                  </td>
                  <td className="px-5 py-4 text-sm text-zinc-400">₦0</td>
                  <td className="px-5 py-4 text-sm text-white">0</td>
                  <td className="px-5 py-4">
                    <span className="px-2 py-1 rounded-full text-xs font-bold bg-secondary-fixed text-on-secondary-fixed">
                      EMPTY
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    
      </ErrorBoundary>
</DashboardShell>
  );
}
