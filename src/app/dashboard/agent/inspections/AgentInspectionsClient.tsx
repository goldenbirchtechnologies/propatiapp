'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import { Phone, ShieldCheck, FileText, Calendar, Plus } from 'lucide-react';

type Inspection = {
  id: string;
  listing: { title: string; address: string };
  scheduledAt: string;
  status: string;
  reportUrl: string | null;
};

const statusConfig: Record<string, { class: string; label: string }> = {
  scheduled: { class: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Scheduled' },
  completed: { class: 'bg-green-50 text-green-700 border-green-200', label: 'Completed' },
  cancelled: { class: 'bg-red-50 text-red-700 border-red-200', label: 'Cancelled' },
};

export default function AgentInspectionsClient({ initialInspections }: { initialInspections: Inspection[] }) {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? initialInspections : initialInspections.filter((i) => i.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold" style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}>Inspections</h1>
          <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>Schedule and track property inspections</p>
        </div>
        <button className="btn btn-primary inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Schedule Inspection</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4"><p className="text-xs" style={{ color: 'var(--muted)' }}>Total</p><p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{initialInspections.length}</p></div>
        <div className="card p-4"><p className="text-xs" style={{ color: 'var(--muted)' }}>Scheduled</p><p className="text-2xl font-bold text-blue-600">{initialInspections.filter((i) => i.status === 'scheduled').length}</p></div>
        <div className="card p-4"><p className="text-xs" style={{ color: 'var(--muted)' }}>Completed</p><p className="text-2xl font-bold text-green-600">{initialInspections.filter((i) => i.status === 'completed').length}</p></div>
        <div className="card p-4"><p className="text-xs" style={{ color: 'var(--muted)' }}>Cancelled</p><p className="text-2xl font-bold text-red-600">{initialInspections.filter((i) => i.status === 'cancelled').length}</p></div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 flex flex-wrap gap-2 border-b" style={{ borderColor: 'var(--border)' }}>
          {['all', 'scheduled', 'completed', 'cancelled'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-md text-sm font-medium border capitalize transition-colors ${filter === f ? 'bg-accent/10 text-accent border-accent/30' : 'border-transparent hover:bg-muted/50'}`}>{f}</button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <div className="card-body text-center py-16"><Phone className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--muted)', opacity: 0.5 }} /><h3 className="font-heading font-bold text-lg mb-2" style={{ color: 'var(--text)' }}>No inspections</h3><p style={{ color: 'var(--muted)' }}>Schedule your first inspection.</p></div>
        ) : (
          <table className="w-full">
            <thead><tr className="border-b" style={{ borderColor: 'var(--border)' }}>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Property</th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Date</th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Status</th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Report</th>
            </tr></thead>
            <tbody>
              {filtered.map((i) => {
                const sc = statusConfig[i.status] || statusConfig.scheduled;
                return (
                  <tr key={i.id} className="border-b transition-colors hover:bg-muted/30" style={{ borderColor: 'var(--border)' }}>
                    <td className="p-4 font-medium text-sm" style={{ color: 'var(--text)' }}>{i.listing?.title || '—'}</td>
                    <td className="p-4 text-sm" style={{ color: 'var(--text)' }}>{new Date(i.scheduledAt).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td className="p-4"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${sc.class}`}>{sc.label}</span></td>
                    <td className="p-4 text-sm" style={{ color: 'var(--muted)' }}>{i.reportUrl ? 'Available' : 'Pending'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
