'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
  scheduled: { class: 'bg-[#262626] text-neutral-300 border-[#262626]', label: 'Scheduled' },
  completed: { class: 'bg-[#00ff66]/10 text-[#00ff66] border-[#00ff66]/20', label: 'Completed' },
  cancelled: { class: 'bg-red-500/10 text-red-500 border-red-500/20', label: 'Cancelled' },
};

export default function TenantScreeningClient({ initialScreenings }: { initialScreenings: Screening[] }) {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? initialScreenings : initialScreenings.filter((s) => s.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-semibold" style={{ fontSize: 'var(--text-page-title)' }}>Screening Calls</h1>
        <p className="text-neutral-400" style={{ marginTop: 'var(--space-vs)' }}>View landlord and tenant screening results</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {['scheduled', 'completed', 'cancelled'].map((key) => (
          <div key={key} className="card p-4">
            <p className="text-xs font-medium capitalize text-neutral-400">{key}</p>
            <p className="text-2xl font-bold mt-1 text-white">{initialScreenings.filter((s) => s.status === key).length}</p>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 flex flex-wrap gap-2 border-b border-[#262626]">
          {['all', 'scheduled', 'completed', 'cancelled'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize border transition-colors ${filter === f ? 'bg-accent/10 text-accent border-accent/30' : 'hover:bg-muted/50'}`}>{f}</button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <div className="card-body text-center py-16">
            <Phone className="w-12 h-12 text-neutral-400" style={{ opacity: 0.5 }} />
            <h3 className="font-headline-sm text-headline-sm mb-2 text-white">No screenings yet</h3>
            <p className="text-neutral-400">Screening requests will appear here.</p>
            <Button variant="default" className="mt-4">Schedule a Screening</Button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#262626]">
                <th className="text-left p-4 text-sm font-medium text-neutral-400">Landlord</th>
                <th className="text-left p-4 text-sm font-medium text-neutral-400">Property</th>
                <th className="text-left p-4 text-sm font-medium text-neutral-400">Status</th>
                <th className="text-left p-4 text-sm font-medium text-neutral-400">Notes</th>
                <th className="text-left p-4 text-sm font-medium text-neutral-400">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const sc = statusConfig[s.status] || statusConfig.scheduled;
                return (
                  <tr key={s.id} className="border-b transition-colors hover:bg-muted/30 border-[#262626]">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/10 text-accent" style={{ flexShrink: 0 }}>
                          <User className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-sm text-white">{s.landlord}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-white">{s.property}</td>
                    <td className="p-4"><span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', sc.class)}>{sc.label}</span></td>
                    <td className="p-4 text-sm text-neutral-400">{s.notes}</td>
                    <td className="p-4 text-sm text-white">{new Date(s.date).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
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
