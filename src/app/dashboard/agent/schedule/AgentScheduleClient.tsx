'use client';

import { useState, useMemo } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { AGENT_NAVIGATION } from '@/lib/navigation';
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

const mockSchedule: ScheduleItem[] = [
  { id: '1', title: 'Property Inspection — 4BR Duplex', listing: '4BR Duplex - Lekki Phase 1', date: '2026-06-28', time: '10:00 AM', type: 'inspection', status: 'upcoming', address: 'Lekki Phase 1, Lagos' },
  { id: '2', title: 'Client Meeting — Mr. Adebayo', listing: '3BR Apartment - Victoria Island', date: '2026-06-29', time: '02:00 PM', type: 'meeting', status: 'upcoming', address: 'Victoria Island, Lagos' },
  { id: '3', title: 'Property Inspection — 5BR Estate Home', listing: '5BR Estate Home - Ikoyi', date: '2026-06-30', time: '11:00 AM', type: 'inspection', status: 'upcoming', address: 'Ikoyi, Lagos' },
  { id: '4', title: 'Property Inspection — Commercial Plot', listing: 'Commercial Plot - Abuja CBD', date: '2026-07-01', time: '09:30 AM', type: 'inspection', status: 'upcoming', address: 'Abuja CBD, Abuja' },
];

const statusConfig: Record<string, { class: string; label: string }> = {
  upcoming: { class: 'bg-[#00ff66]/10 text-[#00ff66] border border-[#262626]', label: 'Upcoming' },
  completed: { class: 'bg-[#00ff66]/10 text-[#00ff66] border border-[#262626]', label: 'Completed' },
  cancelled: { class: 'bg-red-500/10 text-red-500 border border-[#262626]', label: 'Cancelled' },
};

function StatCardSkeleton() {
  return (
    <div className="card p-4" style={{ animation: 'skel-pulse 1.6s ease-in-out infinite' }}>
      <div className="space-y-2">
        <div className="rounded" style={{ height: 11, width: '55%', background: 'border-[#262626]' }} />
        <div className="rounded" style={{ height: 28, width: '40%', background: 'border-[#262626]' }} />
      </div>
    </div>
  );
}

function ScheduleRowSkeleton() {
  return (
    <tr className="border-b" style={{ borderColor: 'border-[#262626]', animation: 'skel-pulse 1.6s ease-in-out infinite' }}>
      <td className="p-4"><div className="rounded" style={{ height: 14, width: '60%', background: 'border-[#262626]' }} /></td>
      <td className="p-4"><div className="rounded" style={{ height: 14, width: '40%', background: 'border-[#262626]' }} /></td>
      <td className="p-4"><div className="rounded" style={{ height: 14, width: '30%', background: 'border-[#262626]' }} /></td>
      <td className="p-4"><div className="rounded" style={{ height: 14, width: '30%', background: 'border-[#262626]' }} /></td>
      <td className="p-4"><div className="rounded" style={{ height: 22, width: 60, background: 'border-[#262626]', borderRadius: 999 }} /></td>
    </tr>
  );
}

export default function AgentScheduleClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filter, setFilter] = useState<'all' | 'inspection' | 'meeting'>('all');

  const load = () => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      setError(null);
      setLoading(false);
    }, 700);
  };

  useState(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  });

  const schedule = useMemo(() => {
    if (filter === 'all') return mockSchedule;
    return mockSchedule.filter((s) => s.type === filter);
  }, [filter]);

  const upcomingCount = mockSchedule.filter((s) => s.status === 'upcoming').length;
  const completedCount = mockSchedule.filter((s) => s.status === 'completed').length;
  const cancelledCount = mockSchedule.filter((s) => s.status === 'cancelled').length;

  if (error) {
    return (
      <DashboardShell navigation={AGENT_NAVIGATION} userRole="agent" userName="Agent" userAvatar={undefined}>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-headline-sm font-bold" style={{ fontSize: 'font-headline-sm', color: 'text-white' }}>Schedule</h1>
              <p className="text-xs font-label-md uppercase tracking-wider text-neutral-400 mt-1">Inspection and meeting calendar</p>
            </div>
          </div>
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center" role="alert">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-red-500" />
            <p className="text-red-500 font-medium mb-1">Unable to load schedule</p>
            <p className="text-sm text-neutral-400 mb-3">{error.message}</p>
            <button onClick={load} className="btn btn-secondary text-sm" style={{ padding: 'p-4 p-6' }}>Retry</button>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell navigation={AGENT_NAVIGATION} userRole="agent" userName="Agent" userAvatar={undefined}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-headline-sm font-bold" style={{ fontSize: 'font-headline-sm', color: 'text-white' }}>Schedule</h1>
            <p className="text-xs font-label-md uppercase tracking-wider text-neutral-400 mt-1">Inspection and meeting calendar</p>
          </div>
          <button className="btn btn-primary inline-flex items-center gap-2"><Plus className="w-4 h-4" /> New Event</button>
        </div>

        {loading ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton />
            </div>
            <div className="card overflow-hidden">
              <div className="p-4 border-b" style={{ borderColor: 'border-[#262626]' }}>
                <div className="flex gap-2">
                  <div className="rounded" style={{ height: 32, width: 80, background: 'border-[#262626]' }} />
                  <div className="rounded" style={{ height: 32, width: 80, background: 'border-[#262626]' }} />
                  <div className="rounded" style={{ height: 32, width: 80, background: 'border-[#262626]' }} />
                </div>
              </div>
              <table className="w-full divide-y divide-[#262626]">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'border-[#262626]' }}>
                    <th className="text-left p-4 text-sm font-medium text-neutral-400">Event</th>
                    <th className="text-left p-4 text-sm font-medium text-neutral-400">Date</th>
                    <th className="text-left p-4 text-sm font-medium text-neutral-400">Time</th>
                    <th className="text-left p-4 text-sm font-medium text-neutral-400">Type</th>
                    <th className="text-left p-4 text-sm font-medium text-neutral-400">Status</th>
                  </tr>
                </thead>
                <tbody>{[1, 2, 3, 4].map((i) => <ScheduleRowSkeleton key={i} />)}</tbody>
              </table>
            </div>
          </>
        ) : schedule.length === 0 ? (
          <div className="card overflow-hidden">
            <div className="card-body text-center py-16">
              <CalendarDays className="w-16 h-16 mx-auto mb-4 text-neutral-400" style={{ opacity: 0.5 }} />
              <h3 className="font-headline-sm font-bold text-lg mb-2 text-white">No events scheduled</h3>
              <p className="text-xs font-label-md uppercase tracking-wider text-neutral-400">Schedule inspections or meetings to get started.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="card p-4"><p className="text-xs font-label-md uppercase tracking-wider text-neutral-400">Total Events</p><p className="text-2xl font-bold text-white">{mockSchedule.length}</p></div>
              <div className="card p-4"><p className="text-xs font-label-md uppercase tracking-wider text-neutral-400">Upcoming</p><p className="text-2xl font-bold text-white">{upcomingCount}</p></div>
              <div className="card p-4"><p className="text-xs font-label-md uppercase tracking-wider text-neutral-400">Completed</p><p className="text-2xl font-bold text-white">{completedCount}</p></div>
              <div className="card p-4"><p className="text-xs font-label-md uppercase tracking-wider text-neutral-400">Cancelled</p><p className="text-2xl font-bold text-white">{cancelledCount}</p></div>
            </div>
            <div className="card overflow-hidden">
              <div className="p-4 flex flex-wrap gap-2 border-b" style={{ borderColor: 'border-[#262626]' }}>
                {(['all', 'inspection', 'meeting'] as const).map((f) => (
                  <button key={f} onClick={() => setFilter(f)} className={cn('px-3 py-1.5 rounded-md text-sm font-medium border capitalize transition-colors', filter === f ? 'text-white border-[#262626] bg-surface-container-low' : 'border-transparent hover:bg-[#171717]/50')}>{f}</button>
                ))}
              </div>
              <table className="w-full divide-y divide-[#262626]">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'border-[#262626]' }}>
                    <th className="text-left p-4 text-sm font-label-md uppercase tracking-wider text-neutral-400">Event</th>
                    <th className="text-left p-4 text-sm font-label-md uppercase tracking-wider text-neutral-400">Date</th>
                    <th className="text-left p-4 text-sm font-label-md uppercase tracking-wider text-neutral-400">Time</th>
                    <th className="text-left p-4 text-sm font-label-md uppercase tracking-wider text-neutral-400">Type</th>
                    <th className="text-left p-4 text-sm font-label-md uppercase tracking-wider text-neutral-400">Status</th>
                    <th className="text-left p-4 text-sm font-label-md uppercase tracking-wider hidden md:table-cell text-neutral-400">Location</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((item) => {
                    const sc = statusConfig[item.status] || statusConfig.upcoming;
                    return (
                      <tr key={item.id} className="border-b transition-colors hover:bg-[#171717]/30" style={{ borderColor: 'border-[#262626]' }}>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#00ff66]/10 text-white flex items-center justify-center flex-shrink-0">
                              <CalendarDays className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate text-white">{item.title}</p>
                              <p className="text-xs font-label-md uppercase tracking-wider truncate text-neutral-400">{item.listing}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-sm whitespace-nowrap text-white">
                          {new Date(item.date).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="p-4 text-sm whitespace-nowrap text-white">
                          <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{item.time}</span>
                        </td>
                        <td className="p-4 text-sm capitalize whitespace-nowrap text-white">{item.type}</td>
                        <td className="p-4">
                          <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', sc.class)}>{sc.label}</span>
                        </td>
                        <td className="p-4 text-sm hidden md:table-cell text-neutral-400">
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
    </DashboardShell>
  );
}
