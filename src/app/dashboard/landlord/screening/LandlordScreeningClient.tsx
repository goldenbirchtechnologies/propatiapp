'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Phone, CheckCircle, XCircle, Clock, User, Shield } from 'lucide-react';

type Screening = {
  id: string;
  tenant: string;
  property: string;
  date: string;
  status: string;
  notes: string;
};

const statusConfig: Record<string, { class: string; label: string }> = {
  scheduled: { class: 'bg-accent/10 text-accent border-accent/30', label: 'Scheduled' },
  completed: { class: 'bg-success-bright/10 text-success border-success-bright/20', label: 'Completed' },
  cancelled: { class: 'bg-destructive/10 text-destructive border-destructive/20', label: 'Cancelled' },
};

export default function LandlordScreeningClient({ initialScreenings }: { initialScreenings: Screening[] }) {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? initialScreenings : initialScreenings.filter((s) => s.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline-sm text-headline-sm font-bold text-primary text-primary">Screening Calls</h1>
        <p className="text-on-surface-variant">View tenant screening results</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {['scheduled', 'completed', 'cancelled'].map((key) => (
          <div key={key} className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs font-medium capitalize text-on-surface-variant">{key}</p>
            <p className="text-2xl font-bold mt-1 text-primary">{initialScreenings.filter((s) => s.status === key).length}</p>
          </div>
        ))}
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className="p-4 flex flex-wrap gap-2 border-b border-outline-variant">
          {['all', 'scheduled', 'completed', 'cancelled'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize border transition-colors ${filter === f ? 'bg-accent/10 text-accent border-accent/30' : 'hover:bg-muted/50'}`}>{f}</button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-12 text-center shadow-sm hover:shadow-md transition-shadow">
            <Phone className="w-16 h-16 mx-auto mb-4 text-on-surface-variant" />
            <h3 className="font-headline-sm text-headline-sm text-primary mb-2 text-primary">No screenings yet</h3>
            <p className="text-on-surface-variant">Screening requests will appear here.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant">
                <th className="px-4 py-3 text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant text-on-surface-variant">Tenant</th>
                <th className="px-4 py-3 text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant text-on-surface-variant">Property</th>
                <th className="px-4 py-3 text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant text-on-surface-variant">Status</th>
                <th className="px-4 py-3 text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant text-on-surface-variant">Notes</th>
                <th className="px-4 py-3 text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant text-on-surface-variant">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const sc = statusConfig[s.status] || statusConfig.scheduled;
                return (
                  <tr key={s.id} className="border-b transition-colors hover:bg-muted/30 border-outline-variant">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="$1 $2"><User className="w-4 h-4" /></div>
                        <span className="font-medium text-sm text-primary">{s.tenant}</span>
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
