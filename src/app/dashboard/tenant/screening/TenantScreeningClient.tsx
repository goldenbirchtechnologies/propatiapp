'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Phone, CheckCircle, XCircle, Clock, User, Shield } from 'lucide-react';

type Screening = {
  id: string;
  landlord: string;
  property: string;
  date: string;
  status: string;
  notes: string;
};

const statusConfig: Record<string, { class: string; label: string }> = {
  scheduled: { class: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Scheduled' },
  completed: { class: 'bg-success-bright/10 text-success border-success-bright/20', label: 'Completed' },
  cancelled: { class: 'bg-destructive/10 text-destructive border-destructive/20', label: 'Cancelled' },
};

export default function TenantScreeningClient({ initialScreenings }: { initialScreenings: Screening[] }) {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? initialScreenings : initialScreenings.filter((s) => s.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="$1 $2" style={{ fontSize: 'var(--text-page-title)' }}>Screening Calls</h1>
        <p className="text-on-surface-variant" style={{ marginTop: 'var(--space-vs)' }}>View landlord and tenant screening results</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {['scheduled', 'completed', 'cancelled'].map((key) => (
          <div key={key} className="card p-4">
            <p className="text-xs font-medium capitalize text-on-surface-variant">{key}</p>
            <p className="text-2xl font-bold mt-1 text-primary">{initialScreenings.filter((s) => s.status === key).length}</p>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 flex flex-wrap gap-2 border-b border-border">
          {['all', 'scheduled', 'completed', 'cancelled'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize border transition-colors ${filter === f ? 'bg-accent/10 text-accent border-accent/30' : 'hover:bg-muted/50'}`}>{f}</button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <div className="card-body text-center py-16">
            <Phone className="$1 $2" style={{ opacity: 0.5 }} />
            <h3 className="font-headline-sm text-headline-sm mb-2 text-primary">No screenings yet</h3>
            <p  className="text-on-surface-variant">Screening requests will appear here.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-sm font-medium text-on-surface-variant">Landlord</th>
                <th className="text-left p-4 text-sm font-medium text-on-surface-variant">Property</th>
                <th className="text-left p-4 text-sm font-medium text-on-surface-variant">Status</th>
                <th className="text-left p-4 text-sm font-medium text-on-surface-variant">Notes</th>
                <th className="text-left p-4 text-sm font-medium text-on-surface-variant">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const sc = statusConfig[s.status] || statusConfig.scheduled;
                return (
                  <tr key={s.id} className="border-b transition-colors hover:bg-muted/30 border-border">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="$1 $2"><User className="w-4 h-4" /></div>
                        <span className="font-medium text-sm text-primary">{s.landlord}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-primary">{s.property}</td>
                    <td className="p-4"><span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', sc.class)}>{sc.label}</span></td>
                    <td className="p-4 text-sm text-on-surface-variant">{s.notes}</td>
                    <td className="p-4 text-sm text-primary">{new Date(s.date).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
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
