import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import ReportClient from './ReportClient';

export const dynamic = 'force-dynamic';

export default async function LandlordRevenueForecastReportPage() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'landlord') redirect('/dashboard');

  const yearStart = new Date(new Date().getFullYear(), 0, 1);

  const transactions = await prisma.transaction.findMany({
    where: { payeeId: user.id, status: { in: ['released', 'success'] }, createdAt: { gte: yearStart } },
    select: {
      amount: true,
      createdAt: true,
      listing: { select: { title: true, area: true, state: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  // Actual collections grouped by calendar month, with the strongest-earning
  // listing that month standing in as the sector label.
  const byMonth = new Map<string, { actual: number; sectors: Map<string, number> }>();
  for (const tx of transactions) {
    const d = new Date(tx.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const sector = tx.listing
      ? [tx.listing.title, tx.listing.area].filter(Boolean).join(' — ')
      : 'Unattributed collections';
    const bucket = byMonth.get(key) ?? { actual: 0, sectors: new Map<string, number>() };
    const naira = Number(tx.amount) / 100;
    bucket.actual += naira;
    bucket.sectors.set(sector, (bucket.sectors.get(sector) ?? 0) + naira);
    byMonth.set(key, bucket);
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const rows = [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, bucket], index, all) => {
      const [year, month] = key.split('-').map(Number);
      const sector = [...bucket.sectors.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';
      // Projection: previous month's actual, or this month's own actual for the first entry.
      const prev = index > 0 ? all[index - 1][1].actual : bucket.actual;
      const projected = Math.round(prev);
      const variance = projected > 0 ? ((bucket.actual - projected) / projected) * 100 : 0;
      return {
        month: `${monthNames[month - 1]} ${year}`,
        sector,
        proj: projected,
        act: Math.round(bucket.actual),
        var: `${variance >= 0 ? '+' : ''}${variance.toFixed(2)}%`,
        status: (variance >= 0 ? 'ON_TRACK' : variance > -5 ? 'AT_RISK' : 'BEHIND') as 'ON_TRACK' | 'AT_RISK' | 'BEHIND',
        conf: Math.min(99, Math.max(50, Math.round(90 + Math.min(variance, 9)))),
      };
    });

  return (
    <DashboardShell navigation={LANDLORD_NAVIGATION} userRole={user.role} userName={user.fullName} userAvatar={user.avatarUrl || undefined}>
      <ErrorBoundary>
        <ReportClient rows={rows} />
      </ErrorBoundary>
    </DashboardShell>
  );
}
