import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
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
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

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
            <h1 className="text-3xl font-bold text-foreground">Maintenance Requests</h1>
            <p className="text-muted-foreground mt-1">Track and manage maintenance requests across your properties.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Open Requests" value={String(openCount + inProgressCount)} icon="open" trend={`${openCount} urgent`} trendPositive={false} />
          <StatCard label="In Progress" value={String(inProgressCount)} icon="progress" trend="Assignees active" trendPositive />
          <StatCard label="Completed" value={String(completedCount)} icon="done" trend="+ this month" trendPositive />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            {tickets.length === 0 ? (
              <div className="rounded-lg border border-dashed border-outline-variant bg-muted/40 p-8 text-center">
                <Wrench className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                <p className="font-medium text-primary mb-1">No maintenance requests yet</p>
                <p className="text-sm text-muted-foreground mb-4">Requests from tenants and on-site managers will appear here.</p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Button asChild variant="outline" size="sm" className="gap-2">
                    <Link href="/dashboard/landlord/properties">View properties</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-muted-foreground border-b">
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
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(ticket.createdAt).toLocaleDateString('en-NG')}
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

function StatCard({ label, value, icon, trend, trendPositive = true }: { label: string; value: string; icon: string; trend: string; trendPositive?: boolean }) {
  return (
    <div className="rounded-xl border border-outline-variant p-5 shadow-sm">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
      <div className="mt-2 flex items-center gap-1">
        <span className={`text-xs font-medium ${trendPositive ? 'text-success' : 'text-destructive'}`}>
          {trendPositive ? '↑' : '↓'}
        </span>
        <span className={`text-xs ${trendPositive ? 'text-success' : 'text-destructive'}`}>{trend}</span>
      </div>
    </div>
  );
}
