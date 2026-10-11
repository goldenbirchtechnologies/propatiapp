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
import { Wrench, Plus, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';

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
    const classes: Record<string, string> = {
      urgent: 'bg-red-500/15 text-red-400 border-red-500/20',
      high: 'bg-red-500/10 text-red-400 border-red-500/20',
      medium: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
      low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    };
    return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${classes[p] || 'bg-zinc-800 text-zinc-600 dark:text-zinc-400 dark:text-zinc-400 border-zinc-200 dark:border-[#27272a]'}`}>{p}</span>;
  };

  const statusBadge = (s: string) => {
    const classes: Record<string, string> = {
      open: 'bg-red-500/10 text-red-400 border-red-500/20',
      in_progress: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
      resolved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
      closed: 'bg-zinc-800 text-zinc-600 dark:text-zinc-400 dark:text-zinc-400 border-zinc-200 dark:border-[#27272a]',
    };
    return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${classes[s] || 'bg-zinc-800 text-zinc-600 dark:text-zinc-400 dark:text-zinc-400 border-zinc-200 dark:border-[#27272a]'}`}>{s.replace('_', ' ')}</span>;
  };

  return (
    <DashboardShell navigation={LANDLORD_NAVIGATION} userRole="landlord" userName={user.fullName} userAvatar={user.avatarUrl || undefined}>

      <ErrorBoundary>

      <div className="space-y-6 bg-[#F8FAFC] dark:bg-[#F8FAFC] dark:bg-black">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Maintenance Requests</h1>
            <p className="text-zinc-600 dark:text-zinc-400 dark:text-zinc-400 text-sm mt-1">Track and manage maintenance requests across your properties.</p>
          </div>
          <Button className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-zinc-900 dark:text-white shadow-lg shadow-emerald-600/20 shrink-0" onClick={() => (window.location.href = '/dashboard/landlord/maintenance/new')}>
            <Plus className="w-4 h-4" /> New Maintenance Request
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Open Requests" value={String(openCount + inProgressCount)} trend={`${openCount} urgent`} icon={AlertTriangle} accentColor="#f59e0b" />
          <StatCard label="In Progress" value={String(inProgressCount)} trend="Assignees active" icon={Clock} accentColor="#3b82f6" />
          <StatCard label="Completed" value={String(completedCount)} trend="+ this month" icon={CheckCircle2} accentColor="#10b981" />
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#F8FAFC] dark:bg-black">
          <div className="px-6 py-4 border-b border-zinc-200 dark:border-[#27272a]">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Recent Tickets</h3>
          </div>
          <div className="p-6">
            {tickets.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-200 dark:border-[#27272a] bg-zinc-50 dark:bg-[#18181b] p-8 text-center">
                <div className="w-12 h-12 rounded-xl bg-[#27272a] border border-zinc-200 dark:border-zinc-200 dark:border-white/[0.06] flex items-center justify-center mx-auto mb-3">
                  <Wrench className="w-6 h-6 text-zinc-600 dark:text-zinc-400 dark:text-zinc-400" />
                </div>
                <p className="font-medium text-zinc-900 dark:text-white mb-1">No maintenance requests yet</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 dark:text-zinc-400 mb-4">Requests from tenants and on-site managers will appear here.</p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Button className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-zinc-900 dark:text-white" onClick={() => (window.location.href = '/dashboard/landlord/maintenance/new')}>
                    <Plus className="w-4 h-4" /> New Maintenance Request
                  </Button>
                  <Button asChild variant="outline" size="sm" className="gap-2 border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#F8FAFC] dark:bg-black text-zinc-600 dark:text-zinc-400">
                    <Link href="/dashboard/landlord/properties">View properties</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-zinc-600 dark:text-zinc-400 dark:text-zinc-400 border-b border-zinc-200 dark:border-[#27272a]">
                    <tr>
                      <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider">Property</th>
                      <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider">Issue</th>
                      <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider">Priority</th>
                      <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 font-medium text-xs uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#27272a]">
                    {tickets.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-zinc-50 dark:bg-[#18181b]/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-zinc-900 dark:text-white">{ticket.listing?.title || '—'}</td>
                        <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{ticket.title}</td>
                        <td className="px-4 py-3">{priorityBadge(ticket.priority)}</td>
                        <td className="px-4 py-3">{statusBadge(ticket.status)}</td>
                        <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400 dark:text-zinc-400 text-xs">
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
