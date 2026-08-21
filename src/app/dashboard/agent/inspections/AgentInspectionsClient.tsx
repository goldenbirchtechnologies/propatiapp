'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import { Phone, ShieldCheck, FileText, Calendar, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

type Inspection = {
  id: string;
  listing: { title: string; address: string };
  scheduledAt: string;
  status: string;
  reportUrl: string | null;
};

const statusConfig: Record<string, { class: string; label: string }> = {
  scheduled: { class: 'bg-info/10 text-info border border-[#262626]', label: 'Scheduled' },
  completed: { class: 'bg-[#00ff66]/10 text-[#00ff66] border border-[#262626]', label: 'Completed' },
  cancelled: { class: 'bg-red-500/10 text-red-500 border border-[#262626]', label: 'Cancelled' },
};

export default function AgentInspectionsClient({ initialInspections }: { initialInspections: Inspection[] }) {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? initialInspections : initialInspections.filter((i) => i.status === filter);

  return (
    <DashboardShell navigation={AGENT_NAVIGATION} userRole="agent" userName="Agent" userAvatar={undefined}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-headline-sm font-bold" style={{ fontSize: 'font-headline-sm', color: 'text-white' }}>Inspections</h1>
            <p className="text-xs font-label-md uppercase tracking-wider text-neutral-400 mt-1">Schedule and track property inspections</p>
          </div>
          <button className="btn btn-primary inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Schedule Inspection</button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-4"><p className="text-xs font-label-md uppercase tracking-wider text-neutral-400">Total</p><p className="text-2xl font-bold text-white">{initialInspections.length}</p></div>
          <div className="card p-4"><p className="text-xs font-label-md uppercase tracking-wider text-neutral-400">Scheduled</p><p className="text-2xl font-bold text-info">{initialInspections.filter((i) => i.status === 'scheduled').length}</p></div>
          <div className="card p-4"><p className="text-xs font-label-md uppercase tracking-wider text-neutral-400">Completed</p><p className="text-2xl font-bold text-[#00ff66]">{initialInspections.filter((i) => i.status === 'completed').length}</p></div>
          <div className="card p-4"><p className="text-xs font-label-md uppercase tracking-wider text-neutral-400">Cancelled</p><p className="text-2xl font-bold text-red-500">{initialInspections.filter((i) => i.status === 'cancelled').length}</p></div>
        </div>

        <div className="card overflow-hidden">
          <div className="p-4 flex flex-wrap gap-2 border-b" style={{ borderColor: 'border-[#262626]' }}>
            {['all', 'scheduled', 'completed', 'cancelled'].map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={cn('px-3 py-1.5 rounded-md text-sm font-medium border capitalize transition-colors', filter === f ? 'text-white border-[#262626] bg-surface-container-low' : 'border-transparent hover:bg-[#171717]/50')}>{f}</button>
            ))}
          </div>
          {filtered.length === 0 ? (
            <div className="card-body text-center py-16"><Phone className="w-16 h-16 mx-auto mb-4 text-neutral-400" style={{ opacity: 0.5 }} /><h3 className="font-headline-sm font-bold text-lg mb-2 text-white">No inspections</h3><p className="text-xs font-label-md uppercase tracking-wider text-neutral-400">Schedule your first inspection.</p></div>
          ) : (
            <table className="w-full divide-y divide-[#262626]">
              <thead><tr className="border-b" style={{ borderColor: 'border-[#262626]' }}>
                <th className="text-left p-4 text-sm font-label-md uppercase tracking-wider text-neutral-400">Property</th>
                <th className="text-left p-4 text-sm font-label-md uppercase tracking-wider text-neutral-400">Date</th>
                <th className="text-left p-4 text-sm font-label-md uppercase tracking-wider text-neutral-400">Status</th>
                <th className="text-left p-4 text-sm font-label-md uppercase tracking-wider text-neutral-400">Report</th>
              </tr></thead>
              <tbody>
                {filtered.map((i) => {
                  const sc = statusConfig[i.status] || statusConfig.scheduled;
                  return (
                    <tr key={i.id} className="border-b transition-colors hover:bg-[#171717]/30" style={{ borderColor: 'border-[#262626]' }}>
                      <td className="p-4 text-sm font-medium text-white">{i.listing?.title || '—'}</td>
                      <td className="p-4 text-xs font-label-md uppercase tracking-wider text-white">{new Date(i.scheduledAt).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      <td className="p-4"><span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', sc.class)}>{sc.label}</span></td>
                      <td className="p-4 text-xs font-label-md uppercase tracking-wider text-neutral-400">{i.reportUrl ? 'Available' : 'Pending'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
