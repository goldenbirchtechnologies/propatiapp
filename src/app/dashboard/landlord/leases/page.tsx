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
            <h1 className="text-3xl font-bold text-white">Leases</h1>
            <p className="text-zinc-500 mt-1">Overview of lease agreements, expiry dates, and tenant details.</p>
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

        <div className="rounded-lg border border-white/[0.08] bg-zinc-950/50 shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.08]">
                  <th className="px-4 py-3 text-sm font-medium text-zinc-500">Property</th>
                  <th className="px-4 py-3 text-sm font-medium text-zinc-500">Tenant</th>
                  <th className="px-4 py-3 text-sm font-medium text-zinc-500">Status</th>
                  <th className="px-4 py-3 text-sm font-medium text-zinc-500">Start Date</th>
                  <th className="px-4 py-3 text-sm font-medium text-zinc-500">End Date</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-zinc-500">Rent</th>
                </tr>
              </thead>
              <tbody>
                {leases.map((lease) => (
                  <tr key={lease.id} className="border-b border-white/[0.08]">
                    <td className="px-4 py-3 font-medium">{lease.listing.title}</td>
                    <td className="px-4 py-3">{lease.tenant.fullName}</td>
                    <td className="px-4 py-3">{statusBadge(lease.status)}</td>
                    <td className="px-4 py-3 text-sm text-zinc-500">
                      {lease.startDate ? new Date(lease.startDate).toLocaleDateString('en-NG') : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-500">
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
                <p className="text-zinc-500">No lease agreements yet.</p>
                <Link href="/dashboard/landlord/agreements/new" className="text-sm text-white mt-2 inline-block hover:underline">
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
    <div className="rounded-xl border border-white/[0.08] p-6 shadow-none">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1">
        <span className={`text-xs font-medium ${trendPositive ? 'text-[#00ff66]' : 'text-red-500'}`}>
          {trendPositive ? '↑' : '↓'}
        </span>
        <span className={`text-xs ${trendPositive ? 'text-[#00ff66]' : 'text-red-500'}`}>{trend}</span>
      </div>
    </div>
  );
}
