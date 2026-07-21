import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import { parseKoboToNaira } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = {
  title: 'Revenue Forecast Reports – Landlord',
  description: 'Signed and archived financial projections.',
};

export default async function LandlordRevenueForecastReportPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'landlord') redirect('/dashboard');

  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const yearEnd = new Date(now.getFullYear(), 11, 31);

  const monthlyData = await prisma.$queryRaw<{ month: string; revenue: bigint; count: bigint }[]>`
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
  `;

  const totalRevenue = monthlyData.reduce((sum, m) => sum + Number(m.revenue), 0);
  const totalCount = monthlyData.reduce((sum, m) => sum + Number(m.count), 0);

  return (
    <DashboardShell navigation={LANDLORD_NAVIGATION} userRole="landlord" userName={user.fullName} userAvatar={user.avatarUrl || undefined}>

      <ErrorBoundary>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Revenue Forecast Reports</h1>
            <p className="text-muted-foreground mt-1">Archived financial projections derived from transaction history.</p>
          </div>
          <div className="flex gap-3">
            <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-surface-container-lowest text-sm font-medium">
              Total: ₦{parseKoboToNaira(totalRevenue).toLocaleString()}
            </span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Forecast Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyData.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No revenue reports available yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-muted-foreground border-b">
                    <tr>
                      <th className="py-3 font-medium">Month</th>
                      <th className="py-3 font-medium">Transactions</th>
                      <th className="py-3 text-right font-medium">Revenue (₦)</th>
                      <th className="py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyData.map((row) => (
                      <tr key={row.month} className="border-b last:border-0">
                        <td className="py-3 font-medium">{row.month}</td>
                        <td className="py-3">{Number(row.count)}</td>
                        <td className="py-3 text-right font-mono">₦{parseKoboToNaira(Number(row.revenue)).toLocaleString()}</td>
                        <td className="py-3">
                          <span className="px-2 py-1 rounded-full text-xs font-bold bg-success/10 text-success border-success/20">
                            Closed
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    
      </ErrorBoundary>
</DashboardShell>
  );
}
