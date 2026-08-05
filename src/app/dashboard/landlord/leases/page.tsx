import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export const metadata = {
  title: 'Leases – Landlord',
  description: 'Overview of lease agreements, expiry dates, and tenant details.',
};

export default async function LandlordLeasesPage() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'landlord') redirect('/dashboard');

  const leases = await prisma.agreement.findMany({
    where: { landlordId: user.id },
    include: {
      tenant: { select: { fullName: true } },
      listing: { select: { title: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const now = new Date();
  const stats = {
    total: leases.length,
    active: leases.filter((l) => l.status === 'active').length,
    expiringSoon: leases.filter((l) => {
      if (!l.endDate) return false;
      const daysToExpiry = (new Date(l.endDate).getTime() - now.getTime()) / 86400000;
      return daysToExpiry <= 30 && daysToExpiry >= 0;
    }).length,
    expired: leases.filter((l) => l.endDate ? new Date(l.endDate) < now : false).length,
  };

  const statusBadge = (status: string) => {
    const v = status === 'active' ? 'default' : status === 'draft' ? 'secondary' : status === 'pending_signature' ? 'outline' : 'destructive';
    return <Badge variant={v as any}>{status.replace('_', ' ')}</Badge>;
  };

  return (
    <DashboardShell navigation={LANDLORD_NAVIGATION} userRole="landlord" userName={user.fullName} userAvatar={user.avatarUrl || undefined}>

      <ErrorBoundary>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Leases</h1>
            <p className="text-muted-foreground mt-1">Overview of lease agreements, expiry dates, and tenant details.</p>
          </div>
          <Link
            href="/dashboard/landlord/agreements/new"
            className="px-4 py-2 bg-success text-on-success rounded-lg hover:bg-success/90 text-sm font-medium"
          >
            + New Lease
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard label="Active Leases" value={String(stats.active)} trend="Currently signed" trendPositive />
          <StatCard label="Expiring Soon" value={String(stats.expiringSoon)} trend="Within 30 days" trendPositive={false} />
          <StatCard label="Expired / Terminated" value={String(stats.expired)} trend="Needs attention" trendPositive={false} />
        </div>

        <div className="rounded-lg border border-outline-variant bg-surface-container-lowest shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant">
                  <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Property</th>
                  <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Tenant</th>
                  <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-sm font-medium text-muted-foreground">Start Date</th>
                  <th className="px-4 py-3 text-sm font-medium text-muted-foreground">End Date</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Rent</th>
                </tr>
              </thead>
              <tbody>
                {leases.map((lease) => (
                  <tr key={lease.id} className="border-b border-outline-variant">
                    <td className="px-4 py-3 font-medium">{lease.listing.title}</td>
                    <td className="px-4 py-3">{lease.tenant.fullName}</td>
                    <td className="px-4 py-3">{statusBadge(lease.status)}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {lease.startDate ? new Date(lease.startDate).toLocaleDateString('en-NG') : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {lease.endDate ? new Date(lease.endDate).toLocaleDateString('en-NG') : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {lease.rentAmount ? formatCurrency(Number(lease.rentAmount)) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {leases.length === 0 && (
              <div className="p-12 text-center">
                <p className="text-muted-foreground">No lease agreements yet.</p>
                <Link href="/dashboard/landlord/agreements/new" className="text-sm text-primary mt-2 inline-block hover:underline">
                  Create your first agreement
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    
      </ErrorBoundary>
</DashboardShell>
  );
}

function StatCard({ label, value, icon, trend, trendPositive = true }: { label: string; value: string; trend: string; trendPositive?: boolean }) {
  return (
    <div className="rounded-xl border border-outline-variant p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1">
        <span className={`text-xs font-medium ${trendPositive ? 'text-success' : 'text-destructive'}`}>
          {trendPositive ? '↑' : '↓'}
        </span>
        <span className={`text-xs ${trendPositive ? 'text-success' : 'text-destructive'}`}>{trend}</span>
      </div>
    </div>
  );
}
