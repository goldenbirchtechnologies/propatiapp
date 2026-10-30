'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, MapPin, Clock, Plus, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

type ScheduleItem = {
  id: string;
  title: string;
  listing: string;
  date: string;
  time: string;
  type: 'inspection' | 'meeting';
  status: 'upcoming' | 'completed' | 'cancelled';
  address: string;
};



const statusConfig: Record<string, { class: string; label: string }> = {
  upcoming: { class: 'bg-[#006c49]/10 text-[#006c49] border border-zinc-200 dark:border-white/[0.08]', label: 'Upcoming' },
  completed: { class: 'bg-[#006c49]/10 text-[#006c49] border border-zinc-200 dark:border-white/[0.08]', label: 'Completed' },
  cancelled: { class: 'bg-red-500/10 text-red-500 border border-zinc-200 dark:border-white/[0.08]', label: 'Cancelled' },
};

function StatCardSkeleton() {
  return (
    <div className="glass-card p-4" style={{ animation: 'skel-pulse 1.6s ease-in-out infinite' }}>
      <div className="space-y-2">
        <div className="rounded" style={{ height: 11, width: '55%', background: 'border-zinc-200 dark:border-white/[0.08]' }} />
        <div className="rounded" style={{ height: 28, width: '40%', background: 'border-zinc-200 dark:border-white/[0.08]' }} />
      </div>
    </div>
  );
}

function ScheduleRowSkeleton() {
  return (
    <tr className="border-b border-zinc-200 dark:border-white/[0.08]" style={{ animation: 'skel-pulse 1.6s ease-in-out infinite' }}>
      <td className="p-4"><div className="rounded" style={{ height: 14, width: '60%', background: 'border-zinc-200 dark:border-white/[0.08]' }} /></td>
      <td className="p-4"><div className="rounded" style={{ height: 14, width: '40%', background: 'border-zinc-200 dark:border-white/[0.08]' }} /></td>
      <td className="p-4"><div className="rounded" style={{ height: 14, width: '30%', background: 'border-zinc-200 dark:border-white/[0.08]' }} /></td>
      <td className="p-4"><div className="rounded" style={{ height: 14, width: '30%', background: 'border-zinc-200 dark:border-white/[0.08]' }} /></td>
      <td className="p-4"><div className="rounded" style={{ height: 22, width: 60, background: 'border-zinc-200 dark:border-white/[0.08]', borderRadius: 999 }} /></td>
    </tr>
  );
}

export default function AgentScheduleClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filter, setFilter] = useState<'all' | 'inspection' | 'meeting'>('all');
  const [items, setItems] = useState<ScheduleItem[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/dashboard/agent/schedule', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to load schedule');
      setItems(Array.isArray(json.data) ? json.data : []);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to load schedule'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const schedule = useMemo(() => {
    if (filter === 'all') return items;
    return items.filter((s) => s.type === filter);
  }, [items, filter]);

  const upcomingCount = schedule.filter((s) => s.status === 'upcoming').length;
  const completedCount = schedule.filter((s) => s.status === 'completed').length;
  const cancelledCount = schedule.filter((s) => s.status === 'cancelled').length;

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-headline-sm font-bold" style={{ fontSize: 'font-headline-sm', color: '#ffffff' }}>Schedule</h1>
            <p className="text-xs font-label-sm uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mt-1">Inspection and meeting calendar</p>
          </div>
        </div>
        <div className="rounded-xl border border-red-500/30 bg-destructive/5 p-6 text-center" role="alert">
          <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-red-500" />
          <p className="text-red-500 font-medium mb-1">Unable to load schedule</p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">{error.message}</p>
          <button onClick={load} className="btn btn-secondary text-sm" style={{ padding: '1.5rem' }}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-headline-sm font-bold" style={{ fontSize: 'font-headline-sm', color: '#ffffff' }}>Schedule</h1>
            <p className="text-xs font-label-sm uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mt-1">Inspection and meeting calendar</p>
          </div>
          <button className="btn btn-primary inline-flex items-center gap-2"><Plus className="w-4 h-4" /> New Event</button>
        </div>

        {loading ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton />
            </div>
            <div className="glass-card overflow-hidden">
              <div className="p-4 border-b border-zinc-200 dark:border-white/[0.08]">
                <div className="flex gap-2">
                  <div className="rounded" style={{ height: 32, width: 80, background: 'border-zinc-200 dark:border-white/[0.08]' }} />
                  <div className="rounded" style={{ height: 32, width: 80, background: 'border-zinc-200 dark:border-white/[0.08]' }} />
                  <div className="rounded" style={{ height: 32, width: 80, background: 'border-zinc-200 dark:border-white/[0.08]' }} />
                </div>
              </div>
              <table className="w-full divide-y divide-[#262626]">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-white/[0.08]">
                    <th className="text-left p-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">Event</th>
                    <th className="text-left p-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">Date</th>
                    <th className="text-left p-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">Time</th>
                    <th className="text-left p-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">Type</th>
                    <th className="text-left p-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">Status</th>
                  </tr>
                </thead>
                <tbody>{[1, 2, 3, 4].map((i) => <ScheduleRowSkeleton key={i} />)}</tbody>
              </table>
            </div>
          </>
        ) : schedule.length === 0 ? (
          <div className="glass-card overflow-hidden">
            <div className="card-body text-center py-16">
              <CalendarDays className="w-16 h-16 mx-auto mb-4 text-zinc-600 dark:text-zinc-400" style={{ opacity: 0.5 }} />
              <h3 className="font-headline-sm font-bold text-lg mb-2 text-zinc-900 dark:text-white">No events scheduled</h3>
              <p className="text-xs font-label-sm uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Schedule inspections or meetings to get started.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-card p-4"><p className="text-xs font-label-sm uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Total Events</p><p className="text-2xl font-bold text-zinc-900 dark:text-white">{schedule.length}</p></div>
              <div className="glass-card p-4"><p className="text-xs font-label-sm uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Upcoming</p><p className="text-2xl font-bold text-zinc-900 dark:text-white">{upcomingCount}</p></div>
              <div className="glass-card p-4"><p className="text-xs font-label-sm uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Completed</p><p className="text-2xl font-bold text-zinc-900 dark:text-white">{completedCount}</p></div>
              <div className="glass-card p-4"><p className="text-xs font-label-sm uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Cancelled</p><p className="text-2xl font-bold text-zinc-900 dark:text-white">{cancelledCount}</p></div>
            </div>
            <div className="glass-card overflow-hidden">
              <div className="p-4 flex flex-wrap gap-2 border-b border-zinc-200 dark:border-white/[0.08]">
                {(['all', 'inspection', 'meeting'] as const).map((f) => (
                  <button key={f} onClick={() => setFilter(f)} className={cn('px-3 py-1.5 rounded-md text-sm font-medium border capitalize transition-colors', filter === f ? 'text-zinc-900 dark:text-white border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-white dark:bg-zinc-950/50' : 'border-transparent hover:bg-[#171717]/50')}>{f}</button>
                ))}
              </div>
              <table className="w-full divide-y divide-[#262626]">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-white/[0.08]">
                    <th className="text-left p-4 text-sm font-label-sm uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Event</th>
                    <th className="text-left p-4 text-sm font-label-sm uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Date</th>
                    <th className="text-left p-4 text-sm font-label-sm uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Time</th>
                    <th className="text-left p-4 text-sm font-label-sm uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Type</th>
                    <th className="text-left p-4 text-sm font-label-sm uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Status</th>
                    <th className="text-left p-4 text-sm font-label-sm uppercase tracking-wider hidden md:table-cell text-zinc-600 dark:text-zinc-400">Location</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((item) => {
                    const sc = statusConfig[item.status] || statusConfig.upcoming;
                    return (
                      <tr key={item.id} className="border-b transition-colors hover:bg-[#171717]/30 border-zinc-200 dark:border-white/[0.08]">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#006c49]/10 text-zinc-900 dark:text-white flex items-center justify-center flex-shrink-0">
                              <CalendarDays className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate text-zinc-900 dark:text-white">{item.title}</p>
                              <p className="text-xs font-label-sm uppercase tracking-wider truncate text-zinc-600 dark:text-zinc-400">{item.listing}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-sm whitespace-nowrap text-zinc-900 dark:text-white">
                          {new Date(item.date).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="p-4 text-sm whitespace-nowrap text-zinc-900 dark:text-white">
                          <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{item.time}</span>
                        </td>
                        <td className="p-4 text-sm capitalize whitespace-nowrap text-zinc-900 dark:text-white">{item.type}</td>
                        <td className="p-4">
                          <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', sc.class)}>{sc.label}</span>
                        </td>
                        <td className="p-4 text-sm hidden md:table-cell text-zinc-600 dark:text-zinc-400">
                          <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{item.address}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
  );
}