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

  const [totalRevenueKobo, monthlyData] = await Promise.all([
    prisma.transaction.aggregate({
      where: { payeeId: user.id, status: 'released', createdAt: { gte: yearStart, lte: yearEnd } },
      _sum: { amount: true },
    }),
    prisma.$queryRaw<{ month: string; revenue: bigint; count: bigint }[]>`
      SELECT
        to_char("createdAt", 'YYYY-MM') AS month,
        SUM("amount")::bigint AS revenue,
        COUNT(*)::bigint AS count
      FROM "transactions"
      WHERE "payeeId" = ${user.id}
        AND ("status" = 'released' OR "status" = 'success')
        AND "createdAt" >= ${yearStart}
      GROUP BY to_char("createdAt", 'YYYY-MM')
      ORDER BY month ASC
    `,
  ]);

  const totalRevenue = parseKoboToNaira(Number(totalRevenueKobo._sum?.amount ?? 0));
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
            <p className="text-muted-foreground mt-1">
              Revenue projections and payout forecasting for {now.getFullYear()}.
            </p>
          </div>
          <Link
            href="/dashboard/landlord/revenue-forecast/report"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#262626] hover:bg-obsidian-800-lowest transition-colors text-sm font-medium"
          >
            View Full Forecast →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Projected Annual Revenue</p>
              <p className="text-2xl font-bold mt-2">₦{totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-[#00ff66] mt-1">From collected payments</p>
            </CardContent>
          </div>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">This Month</p>
              <p className="text-2xl font-bold mt-2">₦{currentMonthRevenue.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-1">{currentMonth ? Number(currentMonth.count) : 0} transactions</p>
            </CardContent>
          </div>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Transactions YTD</p>
              <p className="text-2xl font-bold mt-2">
                {monthlyData.reduce((sum, m) => sum + Number(m.count), 0)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{monthlyData.length} active months</p>
            </CardContent>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyData.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No revenue data available yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-muted-foreground border-b">
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
          </CardContent>
        </div>
      </div>
    
      </ErrorBoundary>
</DashboardShell>
  );
}
