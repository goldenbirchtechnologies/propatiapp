'use client';

import { useState } from 'react';
import { FileText, Plus, Eye, Download, CheckCircle, Clock, XCircle } from 'lucide-react';

type Agreement = {
  id: string;
  listing: { title: string; area: string | null; images: { url: string; isCover: boolean }[] };
  tenant: { id: string; fullName: string | null } | null;
  landlord: { id: string; fullName: string | null } | null;
  type: string;
  status: string;
  rentAmount: number;
  rentPeriod: string | null;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
};

const statusConfig: Record<string, { class: string; label: string }> = {
  draft: { class: 'bg-surface text-zinc-500 border-white/[0.08]', label: 'Draft' },
  pending_landlord: { class: 'bg-warning/10 text-warning border-warning/20', label: 'Pending' },
  pending_tenant: { class: 'bg-warning/10 text-warning border-warning/20', label: 'Pending' },
  tenant_signed: { class: 'bg-success/10 text-[#00ff66] border-success/20', label: 'Tenant Signed' },
  landlord_signed: { class: 'bg-success/10 text-[#00ff66] border-success/20', label: 'Landlord Signed' },
  fully_signed: { class: 'bg-success/10 text-[#00ff66] border-success/20', label: 'Fully Signed' },
  terminated: { class: 'bg-red-500/10 text-red-500 border-red-500/20', label: 'Terminated' },
  expired: { class: 'bg-surface text-zinc-500 border-white/[0.08]', label: 'Expired' },
};

export default function EstateManagerAgreementsClient({ initialAgreements }: { initialAgreements: Agreement[] }) {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? initialAgreements : initialAgreements.filter((a) => a.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-white" style={{ color: 'var(--primary)' }}>Agreements</h1>
          <p style={{ color: 'var(--on-surface-variant)', marginTop: 'var(--space-vs)' }}>Track and manage portfolio agreements</p>
        </div>
        <button className="btn btn-primary inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Create Agreement</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-background rounded-xl border border-white/[0.08] p-4 shadow-none"><p className="text-[10px] font-label-sm uppercase tracking-wider text-zinc-500">Total</p><p className="text-2xl font-bold text-white">{initialAgreements.length}</p></div>
        <div className="bg-background rounded-xl border border-white/[0.08] p-4 shadow-none"><p className="text-[10px] font-label-sm uppercase tracking-wider text-[#00ff66]">Signed</p><p className="text-2xl font-bold text-[#00ff66]">{initialAgreements.filter((a) => a.status === 'fully_signed').length}</p></div>
        <div className="bg-background rounded-xl border border-white/[0.08] p-4 shadow-none"><p className="text-[10px] font-label-sm uppercase tracking-wider text-warning">Pending</p><p className="text-2xl font-bold text-warning">{initialAgreements.filter((a) => ['pending_landlord', 'pending_tenant', 'tenant_signed', 'landlord_signed'].includes(a.status)).length}</p></div>
        <div className="bg-background rounded-xl border border-white/[0.08] p-4 shadow-none"><p className="text-[10px] font-label-sm uppercase tracking-wider text-zinc-500">Draft</p><p className="text-2xl font-bold text-white">{initialAgreements.filter((a) => a.status === 'draft').length}</p></div>
      </div>

      <div className="bg-background rounded-xl border border-white/[0.08] shadow-none overflow-hidden hover:shadow-none transition-shadow">
        <div className="p-4 flex flex-wrap gap-2 border-b border-white/[0.08]">
          {['all', 'draft', 'pending_landlord', 'pending_tenant', 'fully_signed', 'terminated', 'expired'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-md text-sm font-medium border capitalize transition-colors ${filter === f ? 'bg-accent/10 text-accent border-accent/30' : 'border-transparent hover:bg-muted/50'}`}>
              {f === 'all' ? 'All' : f.replace('_', ' ')}
            </button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <div className="p-8 text-center py-16"><FileText className="w-16 h-16 mx-auto mb-4 text-zinc-500 opacity-50" /><h3 className="font-heading font-bold text-lg mb-2 text-white">No agreements</h3><p className="text-zinc-500">Create your first agreement.</p></div>
        ) : (
          <table className="w-full">
            <thead><tr className="border-b border-white/[0.08]">
              <th className="text-left p-4 text-[10px] font-label-sm uppercase tracking-wider text-zinc-500">Reference</th>
              <th className="text-left p-4 text-[10px] font-label-sm uppercase tracking-wider text-zinc-500">Title</th>
              <th className="text-left p-4 text-[10px] font-label-sm uppercase tracking-wider text-zinc-500">Parties</th>
              <th className="text-left p-4 text-[10px] font-label-sm uppercase tracking-wider text-zinc-500">Period</th>
              <th className="text-left p-4 text-[10px] font-label-sm uppercase tracking-wider text-zinc-500">Rent/Price</th>
              <th className="text-left p-4 text-[10px] font-label-sm uppercase tracking-wider text-zinc-500">Status</th>
              <th className="text-right p-4 text-[10px] font-label-sm uppercase tracking-wider text-zinc-500">Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map((a) => {
                const sc = statusConfig[a.status] || statusConfig.draft;
                return (
                  <tr key={a.id} className="border-b border-white/[0.08] transition-colors hover:bg-muted/30">
                    <td className="p-4 font-mono text-sm text-white">{a.id.slice(-8).toUpperCase()}</td>
                    <td className="p-4 text-sm text-white">{a.listing?.title || '—'}</td>
                    <td className="p-4 text-sm text-zinc-500">{a.tenant?.fullName || '—'} / {a.landlord?.fullName || '—'}</td>
                    <td className="p-4 text-sm text-white">
                      {a.startDate ? new Date(a.startDate).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'} —
                      {a.endDate ? new Date(a.endDate).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td className="p-4 text-sm text-white">₦{Number(a.rentAmount || 0).toLocaleString()}{a.rentPeriod ? `/${a.rentPeriod}` : ''}</td>
                    <td className="p-4"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${sc.class}`}>{sc.label}</span></td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-2 rounded-md hover:bg-muted/50"><Eye className="w-4 h-4 text-zinc-500" /></button>
                        {a.status === 'fully_signed' && (
                          <button className="p-2 rounded-md hover:bg-muted/50"><Download className="w-4 h-4 text-zinc-500" /></button>
                        )}
                      </div>
                    </td>
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
