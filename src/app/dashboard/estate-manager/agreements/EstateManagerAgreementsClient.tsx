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
  draft: { class: 'bg-surface-container-low text-on-surface-variant border-outline-variant', label: 'Draft' },
  pending_landlord: { class: 'bg-warning/10 text-warning border-warning/20', label: 'Pending' },
  pending_tenant: { class: 'bg-warning/10 text-warning border-warning/20', label: 'Pending' },
  tenant_signed: { class: 'bg-success/10 text-success border-success/20', label: 'Tenant Signed' },
  landlord_signed: { class: 'bg-success/10 text-success border-success/20', label: 'Landlord Signed' },
  fully_signed: { class: 'bg-success/10 text-success border-success/20', label: 'Fully Signed' },
  terminated: { class: 'bg-destructive/10 text-destructive border-destructive/20', label: 'Terminated' },
  expired: { class: 'bg-surface-container-low text-on-surface-variant border-outline-variant', label: 'Expired' },
};

export default function EstateManagerAgreementsClient({ initialAgreements }: { initialAgreements: Agreement[] }) {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? initialAgreements : initialAgreements.filter((a) => a.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-headline-sm" style={{ color: 'var(--primary)' }}>Agreements</h1>
          <p style={{ color: 'var(--on-surface-variant)', marginTop: 'var(--space-vs)' }}>Track and manage portfolio agreements</p>
        </div>
        <button className="btn btn-primary inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Create Agreement</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 shadow-sm"><p className="text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">Total</p><p className="text-2xl font-bold text-primary">{initialAgreements.length}</p></div>
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 shadow-sm"><p className="text-[10px] font-label-md uppercase tracking-wider text-success">Signed</p><p className="text-2xl font-bold text-success">{initialAgreements.filter((a) => a.status === 'fully_signed').length}</p></div>
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 shadow-sm"><p className="text-[10px] font-label-md uppercase tracking-wider text-warning">Pending</p><p className="text-2xl font-bold text-warning">{initialAgreements.filter((a) => ['pending_landlord', 'pending_tenant', 'tenant_signed', 'landlord_signed'].includes(a.status)).length}</p></div>
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 shadow-sm"><p className="text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">Draft</p><p className="text-2xl font-bold text-primary">{initialAgreements.filter((a) => a.status === 'draft').length}</p></div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden hover:shadow-md transition-shadow">
        <div className="p-4 flex flex-wrap gap-2 border-b border-outline-variant">
          {['all', 'draft', 'pending_landlord', 'pending_tenant', 'fully_signed', 'terminated', 'expired'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-md text-sm font-medium border capitalize transition-colors ${filter === f ? 'bg-accent/10 text-accent border-accent/30' : 'border-transparent hover:bg-muted/50'}`}>
              {f === 'all' ? 'All' : f.replace('_', ' ')}
            </button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <div className="p-8 text-center py-16"><FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" /><h3 className="font-heading font-bold text-lg mb-2 text-primary">No agreements</h3><p className="text-on-surface-variant">Create your first agreement.</p></div>
        ) : (
          <table className="w-full">
            <thead><tr className="border-b border-outline-variant">
              <th className="text-left p-4 text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">Reference</th>
              <th className="text-left p-4 text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">Title</th>
              <th className="text-left p-4 text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">Parties</th>
              <th className="text-left p-4 text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">Period</th>
              <th className="text-left p-4 text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">Rent/Price</th>
              <th className="text-left p-4 text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">Status</th>
              <th className="text-right p-4 text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map((a) => {
                const sc = statusConfig[a.status] || statusConfig.draft;
                return (
                  <tr key={a.id} className="border-b border-outline-variant transition-colors hover:bg-muted/30">
                    <td className="p-4 font-mono text-sm text-primary">{a.id.slice(-8).toUpperCase()}</td>
                    <td className="p-4 text-sm text-primary">{a.listing?.title || '—'}</td>
                    <td className="p-4 text-sm text-on-surface-variant">{a.tenant?.fullName || '—'} / {a.landlord?.fullName || '—'}</td>
                    <td className="p-4 text-sm text-primary">
                      {a.startDate ? new Date(a.startDate).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'} —
                      {a.endDate ? new Date(a.endDate).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td className="p-4 text-sm text-primary">₦{Number(a.rentAmount || 0).toLocaleString()}{a.rentPeriod ? `/${a.rentPeriod}` : ''}</td>
                    <td className="p-4"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${sc.class}`}>{sc.label}</span></td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-2 rounded-md hover:bg-muted/50"><Eye className="w-4 h-4 text-muted-foreground" /></button>
                        {a.status === 'fully_signed' && (
                          <button className="p-2 rounded-md hover:bg-muted/50"><Download className="w-4 h-4 text-muted-foreground" /></button>
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
