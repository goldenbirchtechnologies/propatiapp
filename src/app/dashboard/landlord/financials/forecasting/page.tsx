import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import { formatCurrency, parseKoboToNaira } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export const metadata = {
  title: 'Financial Forecasting – Landlord',
  description: 'Revenue projections and payout forecasting.',
};

export default async function LandlordFinancialForecastingPage() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'landlord') redirect('/dashboard');

  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const yearEnd = new Date(now.getFullYear(), 11, 31);

  let totalRevenue = 0;
  let monthlyData: { month: string; revenue: bigint; count: bigint }[] = [];
  let loadError: string | null = null;

  try {
    const [totalRevenueKobo, monthlyDataRaw] = await Promise.all([
      prisma.transaction.aggregate({
        where: { payeeId: user.id, status: 'released', createdAt: { gte: yearStart, lte: yearEnd } },
        _sum: { amount: true },
      }),
      prisma.$queryRaw<{ month: string; revenue: bigint; count: bigint }[]>`
        SELECT
          to_char("created_at", 'YYYY-MM') AS month,
          SUM("amount")::bigint AS revenue,
          COUNT(*)::bigint AS count
        FROM "transactions"
        WHERE "payee_id" = ${user.id}
          AND ("status" = 'released' OR "status" = 'success')
          AND "created_at" >= ${yearStart}
        GROUP BY to_char("created_at", 'YYYY-MM')
        ORDER BY month ASC
      `,
    ]);

    totalRevenue = parseKoboToNaira(Number(totalRevenueKobo._sum?.amount ?? 0));
    monthlyData = monthlyDataRaw;
  } catch (error) {
    console.error('LandlordFinancialForecastingPage server data load error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    loadError = message;
  }

  const nowMonth = now.toISOString().slice(0, 7);
  const currentMonth = monthlyData.find((m) => m.month === nowMonth);
  const currentMonthRevenue = currentMonth ? parseKoboToNaira(Number(currentMonth.revenue)) : 0;

  return (
    <DashboardShell navigation={LANDLORD_NAVIGATION} userRole="landlord" userName={user.fullName} userAvatar={user.avatarUrl || undefined}>

      <ErrorBoundary>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Financial Forecast</h1>
            <p className="text-zinc-500 mt-1">
              Revenue projections and payout forecasting for {now.getFullYear()}.
            </p>
          </div>
          <Link
            href="/dashboard/landlord/revenue-forecast/report"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/[0.08] hover:bg-zinc-900 transition-colors text-sm font-medium"
          >
            View Full Forecast →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="glass-card">
            <div className="p-6 p-6">
              <p className="text-sm text-zinc-500">Projected Annual Revenue</p>
              <p className="text-2xl font-bold mt-2">₦{totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-[#00ff66] mt-1">From collected payments</p>
            </div>
          </div>
          <div className="glass-card">
            <div className="p-6 p-6">
              <p className="text-sm text-zinc-500">This Month</p>
              <p className="text-2xl font-bold mt-2">₦{currentMonthRevenue.toLocaleString()}</p>
              <p className="text-sm text-zinc-500 mt-1">{currentMonth ? Number(currentMonth.count) : 0} transactions</p>
            </div>
          </div>
          <div className="glass-card">
            <div className="p-6 p-6">
              <p className="text-sm text-zinc-500">Transactions YTD</p>
              <p className="text-2xl font-bold mt-2">
                {monthlyData.reduce((sum, m) => sum + Number(m.count), 0)}
              </p>
              <p className="text-sm text-zinc-500 mt-1">{monthlyData.length} active months</p>
            </div>
          </div>
        </div>

        <div className="glass-card">
          <div className="px-6 py-5 border-b border-white/[0.08]">
            <h3 className="text-lg font-semibold text-white">Monthly Revenue Breakdown</h3>
          </div>
          <div className="p-6">
            {monthlyData.length === 0 ? (
              <p className="text-sm text-zinc-500 py-6 text-center">No revenue data available yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-zinc-500 border-b">
                    <tr>
                      <th className="py-3 font-medium">Month</th>
                      <th className="py-3 font-medium">Transactions</th>
                      <th className="py-3 text-right font-medium">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyData.map((row) => (
                      <tr key={row.month} className="border-b last:border-0">
                        <td className="py-3 font-medium">{row.month}</td>
                        <td className="py-3">{Number(row.count)}</td>
                        <td className="py-3 text-right font-mono">₦{parseKoboToNaira(Number(row.revenue)).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    
      </ErrorBoundary>
      {loadError && (
        <div className="rounded-lg border border-red-500/30 bg-destructive/5 p-6 text-center" role="alert">
          <p className="text-red-500 font-medium mb-1">Unable to load forecast</p>
          <p className="text-sm text-zinc-500">Something went wrong while fetching revenue data. Please try again later.</p>
          {process.env.NODE_ENV !== 'production' && (
            <pre className="mt-4 text-left text-xs text-red-500 bg-red-500/10 p-3 rounded overflow-auto">
              {loadError}
            </pre>
          )}
        </div>
      )}
    </DashboardShell>
  );
}
