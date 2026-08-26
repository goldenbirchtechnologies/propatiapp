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
  completed: { class: 'bg-[#00ff66]/10 text-[#00ff66] border-[#00ff66]/20', label: 'Completed' },
  cancelled: { class: 'bg-red-500/10 text-red-500 border-red-500/20', label: 'Cancelled' },
};

export default function LandlordScreeningClient({ initialScreenings }: { initialScreenings: Screening[] }) {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? initialScreenings : initialScreenings.filter((s) => s.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline-sm text-white font-bold text-white text-white">Screening Calls</h1>
        <p className="text-zinc-500">View tenant screening results</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {['scheduled', 'completed', 'cancelled'].map((key) => (
          <div key={key} className="bg-zinc-950/50 rounded-xl border border-white/[0.08] p-4 shadow-none hover:shadow-none transition-shadow">
            <p className="text-xs font-medium capitalize text-zinc-500">{key}</p>
            <p className="text-2xl font-bold mt-1 text-white">{initialScreenings.filter((s) => s.status === key).length}</p>
          </div>
        ))}
      </div>

      <div className="bg-zinc-950/50 rounded-xl border border-white/[0.08] overflow-hidden shadow-none hover:shadow-none transition-shadow">
        <div className="p-4 flex flex-wrap gap-2 border-b border-white/[0.08]">
          {['all', 'scheduled', 'completed', 'cancelled'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize border transition-colors ${filter === f ? 'bg-accent/10 text-accent border-accent/30' : 'hover:bg-muted/50'}`}>{f}</button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <div className="bg-zinc-950/50 rounded-xl border border-white/[0.08] p-12 text-center shadow-none hover:shadow-none transition-shadow">
            <Phone className="w-16 h-16 mx-auto mb-4 text-zinc-500" />
            <h3 className="font-headline-sm text-white text-white mb-2 text-white">No screenings yet</h3>
            <p className="text-zinc-500">Screening requests will appear here.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.08]">
                <th className="px-4 py-3 text-[10px] font-label-sm uppercase tracking-wider text-zinc-500 text-zinc-500">Tenant</th>
                <th className="px-4 py-3 text-[10px] font-label-sm uppercase tracking-wider text-zinc-500 text-zinc-500">Property</th>
                <th className="px-4 py-3 text-[10px] font-label-sm uppercase tracking-wider text-zinc-500 text-zinc-500">Status</th>
                <th className="px-4 py-3 text-[10px] font-label-sm uppercase tracking-wider text-zinc-500 text-zinc-500">Notes</th>
                <th className="px-4 py-3 text-[10px] font-label-sm uppercase tracking-wider text-zinc-500 text-zinc-500">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const sc = statusConfig[s.status] || statusConfig.scheduled;
                return (
                  <tr key={s.id} className="border-b transition-colors hover:bg-muted/30 border-white/[0.08]">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center"><User className="w-4 h-4" /></div>
                        <span className="font-medium text-sm text-white">{s.tenant}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-white">{s.property}</td>
                    <td className="p-4"><span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', sc.class)}>{sc.label}</span></td>
                    <td className="p-4 text-sm text-zinc-500">{s.notes}</td>
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
