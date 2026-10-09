import { redirect } from 'next/navigation';
import { StatCard } from '@/components/ui/stat-card';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Wrench } from 'lucide-react';

export const metadata = {
  title: 'Maintenance Requests',
  description: 'Track and manage maintenance requests across your properties.',
};

export default async function LandlordMaintenancePage() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'landlord') redirect('/dashboard');

  const tickets = await prisma.maintenanceTicket.findMany({
    where: {
      OR: [
        { raisedBy: user.id },
        { listing: { ownerId: user.id } },
        { orgId: { not: null } },
      ],
    },
    include: {
      listing: { select: { title: true } },
      raisedByUser: { select: { fullName: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const openCount = tickets.filter((t) => t.status === 'open').length;
  const inProgressCount = tickets.filter((t) => t.status === 'in_progress').length;
  const completedCount = tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length;

  const priorityBadge = (p: string) => {
    const map: Record<string, 'destructive' | 'secondary' | 'outline' | 'default'> = {
      urgent: 'destructive',
      high: 'destructive',
      medium: 'secondary',
      low: 'outline',
    };
    return <Badge variant={map[p] || 'outline'}>{p}</Badge>;
  };

  const statusBadge = (s: string) => {
    const map: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      open: 'destructive',
      in_progress: 'secondary',
      resolved: 'default',
      closed: 'outline',
    };
    return <Badge variant={map[s] || 'outline'}>{s.replace('_', ' ')}</Badge>;
  };

  return (
    <DashboardShell navigation={LANDLORD_NAVIGATION} userRole="landlord" userName={user.fullName} userAvatar={user.avatarUrl || undefined}>

      <ErrorBoundary>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Maintenance Requests</h1>
            <p className="text-zinc-500 mt-1">Track and manage maintenance requests across your properties.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Open Requests" value={String(openCount + inProgressCount)} trend={`${openCount} urgent`} />
          <StatCard label="In Progress" value={String(inProgressCount)} trend="Assignees active" />
          <StatCard label="Completed" value={String(completedCount)} trend="+ this month" />
        </div>

        <div className="glass-card">
          <div className="px-6 py-5 border-b border-white/[0.08]">
            <h3 className="text-lg font-semibold text-white">Recent Tickets</h3>
          </div>
          <div className="p-6">
            {tickets.length === 0 ? (
              <div className="rounded-lg border border-dashed border-white/[0.08] bg-muted/40 p-8 text-center">
                <Wrench className="w-8 h-8 mx-auto mb-3 text-zinc-500" />
                <p className="font-medium text-white mb-1">No maintenance requests yet</p>
                <p className="text-sm text-zinc-500 mb-4">Requests from tenants and on-site managers will appear here.</p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Button asChild variant="outline" size="sm" className="gap-2">
                    <Link href="/dashboard/landlord/properties">View properties</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-zinc-500 border-b">
                    <tr>
                      <th className="px-4 py-3 font-medium">Property</th>
                      <th className="px-4 py-3 font-medium">Issue</th>
                      <th className="px-4 py-3 font-medium">Priority</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((ticket) => (
                      <tr key={ticket.id} className="border-b last:border-0">
                        <td className="px-4 py-3 font-medium">{ticket.listing?.title || '—'}</td>
                        <td className="px-4 py-3">{ticket.title}</td>
                        <td className="px-4 py-3">{priorityBadge(ticket.priority)}</td>
                        <td className="px-4 py-3">{statusBadge(ticket.status)}</td>
                        <td className="px-4 py-3 text-zinc-500">
                          {new Date(ticket.createdAt).toLocaleDateString('en-NG')}
                        </td>
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
</DashboardShell>
  );
}

