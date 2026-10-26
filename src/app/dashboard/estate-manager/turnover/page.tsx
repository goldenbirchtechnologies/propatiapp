import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

export const dynamic = 'force-dynamic';

const CHECKLIST_TOTAL = 8;

function checklistScore(checklist: unknown): number {
  if (!Array.isArray(checklist) || checklist.length === 0) return 0;
  const done = checklist.filter((item) => {
    if (!item || typeof item !== 'object') return false;
    return Boolean((item as { done?: boolean; complete?: boolean; checked?: boolean }).done
      ?? (item as { complete?: boolean }).complete
      ?? (item as { checked?: boolean }).checked);
  }).length;
  return Math.round((done / Math.max(checklist.length, CHECKLIST_TOTAL)) * 100);
}

export default async function EstateManagerTurnoverPage() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'estate_manager') redirect('/dashboard');

  const orgMemberships = await prisma.orgMember.findMany({
    where: { userId: user.id, status: 'active' },
    select: { orgId: true },
  });
  const orgIds = orgMemberships.map((m) => m.orgId);

  const tasks = orgIds.length
    ? await prisma.turnoverTask.findMany({
        where: { listing: { orgListings: { some: { orgId: { in: orgIds } } } } },
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: {
          id: true,
          status: true,
          priority: true,
          notes: true,
          checklist: true,
          scheduledStart: true,
          listing: { select: { title: true } },
          assignedToUser: { select: { fullName: true } },
        },
      })
    : [];

  const openTasks = tasks.filter((t) => t.status !== 'completed');
  const completed = tasks.filter((t) => t.status === 'completed');
  const scores = completed.map((t) => checklistScore(t.checklist)).filter((n) => n > 0);
  const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const highPriority = openTasks.filter((t) => t.priority === 'high' || t.priority === 'urgent').length;

  return (
    <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName={user.fullName} userAvatar={user.avatarUrl || undefined}>
      <ErrorBoundary>
        <div className="space-y-6">
          <div>
            <h1 className="font-bold text-zinc-900 dark:text-white">Turnover</h1>
            <p className="text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mt-1">Vacate / handover checklist and inspection tracking</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card p-4">
              <p className="text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Pending Handovers</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">{openTasks.length}</p>
            </div>
            <div className="glass-card p-4">
              <p className="text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Completed</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">{completed.length}</p>
            </div>
            <div className="glass-card p-4">
              <p className="text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Avg Checklist</p>
              <p className="text-2xl font-bold text-emerald-500">{avgScore}%</p>
            </div>
            <div className="glass-card p-4">
              <p className="text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400">High Priority</p>
              <p className="text-2xl font-bold text-red-500">{highPriority}</p>
            </div>
          </div>

          <div className="glass-card">
            <div className="px-6 py-5 border-b border-zinc-200 dark:border-white/[0.08]">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Turnover Queue</h3>
            </div>
            <div className="p-6">
              {openTasks.length === 0 ? (
                <p className="text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400">No turnover tasks in queue.</p>
              ) : (
                <div className="space-y-3">
                  {openTasks.map((t) => (
                    <div key={t.id} className="glass-card p-4 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-zinc-900 dark:text-white truncate">
                          {t.listing?.title ?? 'Unassigned unit'}
                        </p>
                        <p className="text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                          {t.status.replace(/_/g, ' ')}
                          {t.assignedToUser?.fullName ? ` · ${t.assignedToUser.fullName}` : ''}
                        </p>
                      </div>
                      <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border capitalize', t.priority === 'high' || t.priority === 'urgent' ? 'bg-red-500/10 text-red-500 border-red-500/20' : t.priority === 'medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-white/[0.08]')}>
                        {t.priority}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="glass-card">
            <div className="px-6 py-5 border-b border-zinc-200 dark:border-white/[0.08]">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Recent Handovers</h3>
            </div>
            <div className="p-6">
              {completed.length === 0 ? (
                <p className="text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400">No completed turnovers yet.</p>
              ) : (
                <div className="space-y-3">
                  {completed.slice(0, 10).map((t) => {
                    const score = checklistScore(t.checklist);
                    return (
                      <div key={t.id} className="glass-card p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm text-zinc-900 dark:text-white">{t.listing?.title ?? 'Unit'}</p>
                            <p className="text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                              {t.scheduledStart ? new Date(t.scheduledStart).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' }) : 'No date'}
                            </p>
                          </div>
                          <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border', score >= 80 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20')}>
                            {score >= 80 ? 'Passed' : 'Conditional'}
                          </span>
                        </div>
                        <div className="mt-3">
                          <Progress value={score} className="h-2" />
                          <p className="text-xs uppercase tracking-wider mt-1 text-right text-zinc-600 dark:text-zinc-400">{score}%</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </DashboardShell>
  );
}
