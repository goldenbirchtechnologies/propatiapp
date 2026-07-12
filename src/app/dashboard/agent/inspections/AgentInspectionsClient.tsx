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
  scheduled: { class: 'bg-info/10 text-info border border-outline-variant', label: 'Scheduled' },
  completed: { class: 'bg-success/10 text-success border border-outline-variant', label: 'Completed' },
  cancelled: { class: 'bg-destructive/10 text-destructive border border-outline-variant', label: 'Cancelled' },
};

export default function AgentInspectionsClient({ initialInspections }: { initialInspections: Inspection[] }) {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? initialInspections : initialInspections.filter((i) => i.status === filter);

  return (
    <DashboardShell navigation={AGENT_NAVIGATION} userRole="agent" userName="Agent" userAvatar={undefined}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-headline-sm font-bold" style={{ fontSize: 'font-headline-sm', color: 'text-primary' }}>Inspections</h1>
            <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant', marginTop: 'mt-1' }}>Schedule and track property inspections</p>
          </div>
          <button className="btn btn-primary inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Schedule Inspection</button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card p-4"><p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant' }}>Total</p><p className="text-2xl font-bold" style={{ color: 'text-primary' }}>{initialInspections.length}</p></div>
          <div className="card p-4"><p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant' }}>Scheduled</p><p className="text-2xl font-bold text-info">{initialInspections.filter((i) => i.status === 'scheduled').length}</p></div>
          <div className="card p-4"><p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant' }}>Completed</p><p className="text-2xl font-bold text-success">{initialInspections.filter((i) => i.status === 'completed').length}</p></div>
          <div className="card p-4"><p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant' }}>Cancelled</p><p className="text-2xl font-bold text-destructive">{initialInspections.filter((i) => i.status === 'cancelled').length}</p></div>
        </div>

        <div className="card overflow-hidden">
          <div className="p-4 flex flex-wrap gap-2 border-b" style={{ borderColor: 'border-outline-variant' }}>
            {['all', 'scheduled', 'completed', 'cancelled'].map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={cn('px-3 py-1.5 rounded-md text-sm font-medium border capitalize transition-colors', filter === f ? 'text-primary border-outline-variant bg-surface-container-low' : 'border-transparent hover:bg-muted/50')}>{f}</button>
            ))}
          </div>
          {filtered.length === 0 ? (
            <div className="card-body text-center py-16"><Phone className="w-16 h-16 mx-auto mb-4" style={{ color: 'text-on-surface-variant', opacity: 0.5 }} /><h3 className="font-headline-sm font-bold text-lg mb-2" style={{ color: 'text-primary' }}>No inspections</h3><p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant' }}>Schedule your first inspection.</p></div>
          ) : (
            <table className="w-full">
              <thead><tr className="border-b" style={{ borderColor: 'border-outline-variant' }}>
                <th className="text-left p-4 text-sm font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant' }}>Property</th>
                <th className="text-left p-4 text-sm font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant' }}>Date</th>
                <th className="text-left p-4 text-sm font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant' }}>Status</th>
                <th className="text-left p-4 text-sm font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant' }}>Report</th>
              </tr></thead>
              <tbody>
                {filtered.map((i) => {
                  const sc = statusConfig[i.status] || statusConfig.scheduled;
                  return (
                    <tr key={i.id} className="border-b transition-colors hover:bg-muted/30" style={{ borderColor: 'border-outline-variant' }}>
                      <td className="p-4 text-sm font-medium" style={{ color: 'text-primary' }}>{i.listing?.title || '—'}</td>
                      <td className="p-4 text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-primary' }}>{new Date(i.scheduledAt).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      <td className="p-4"><span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', sc.class)}>{sc.label}</span></td>
                      <td className="p-4 text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant' }}>{i.reportUrl ? 'Available' : 'Pending'}</td>
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
