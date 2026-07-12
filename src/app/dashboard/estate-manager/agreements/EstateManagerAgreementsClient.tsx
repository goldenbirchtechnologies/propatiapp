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
  pending_landlord: { class: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Pending' },
  pending_tenant: { class: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Pending' },
  tenant_signed: { class: 'bg-teal-50 text-teal-700 border-teal-200', label: 'Tenant Signed' },
  landlord_signed: { class: 'bg-teal-50 text-teal-700 border-teal-200', label: 'Landlord Signed' },
  fully_signed: { class: 'bg-green-50 text-green-700 border-green-200', label: 'Fully Signed' },
  terminated: { class: 'bg-red-50 text-red-700 border-red-200', label: 'Terminated' },
  expired: { class: 'bg-surface-container-low text-on-surface-variant border-outline-variant', label: 'Expired' },
};

export default function EstateManagerAgreementsClient({ initialAgreements }: { initialAgreements: Agreement[] }) {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? initialAgreements : initialAgreements.filter((a) => a.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold" style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}>Agreements</h1>
          <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>Track and manage portfolio agreements</p>
        </div>
        <button className="btn btn-primary inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Create Agreement</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4"><p className="text-xs" style={{ color: 'var(--muted)' }}>Total</p><p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{initialAgreements.length}</p></div>
        <div className="card p-4"><p className="text-xs text-green-600">Signed</p><p className="text-2xl font-bold text-green-600">{initialAgreements.filter((a) => a.status === 'fully_signed').length}</p></div>
        <div className="card p-4"><p className="text-xs text-amber-600">Pending</p><p className="text-2xl font-bold text-amber-600">{initialAgreements.filter((a) => ['pending_landlord', 'pending_tenant', 'tenant_signed', 'landlord_signed'].includes(a.status)).length}</p></div>
        <div className="card p-4"><p className="text-xs" style={{ color: 'var(--muted)' }}>Draft</p><p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{initialAgreements.filter((a) => a.status === 'draft').length}</p></div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 flex flex-wrap gap-2 border-b" style={{ borderColor: 'var(--border)' }}>
          {['all', 'draft', 'pending_landlord', 'pending_tenant', 'fully_signed', 'terminated', 'expired'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-md text-sm font-medium border capitalize transition-colors ${filter === f ? 'bg-accent/10 text-accent border-accent/30' : 'border-transparent hover:bg-muted/50'}`}>
              {f === 'all' ? 'All' : f.replace('_', ' ')}
            </button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <div className="card-body text-center py-16"><FileText className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--muted)', opacity: 0.5 }} /><h3 className="font-heading font-bold text-lg mb-2" style={{ color: 'var(--text)' }}>No agreements</h3><p style={{ color: 'var(--muted)' }}>Create your first agreement.</p></div>
        ) : (
          <table className="w-full">
            <thead><tr className="border-b" style={{ borderColor: 'var(--border)' }}>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Reference</th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Title</th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Parties</th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Period</th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Rent/Price</th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Status</th>
              <th className="text-right p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map((a) => {
                const sc = statusConfig[a.status] || statusConfig.draft;
                return (
                  <tr key={a.id} className="border-b transition-colors hover:bg-muted/30" style={{ borderColor: 'var(--border)' }}>
                    <td className="p-4 font-mono text-sm" style={{ color: 'var(--text)' }}>{a.id.slice(-8).toUpperCase()}</td>
                    <td className="p-4 text-sm" style={{ color: 'var(--text)' }}>{a.listing?.title || '—'}</td>
                    <td className="p-4 text-sm" style={{ color: 'var(--muted)' }}>{a.tenant?.fullName || '—'} / {a.landlord?.fullName || '—'}</td>
                    <td className="p-4 text-sm" style={{ color: 'var(--text)' }}>
                      {a.startDate ? new Date(a.startDate).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'} —
                      {a.endDate ? new Date(a.endDate).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td className="p-4 text-sm" style={{ color: 'var(--text)' }}>₦{Number(a.rentAmount || 0).toLocaleString()}{a.rentPeriod ? `/${a.rentPeriod}` : ''}</td>
                    <td className="p-4"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${sc.class}`}>{sc.label}</span></td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-2 rounded-md hover:bg-muted/50"><Eye className="w-4 h-4" style={{ color: 'var(--muted)' }} /></button>
                        {a.status === 'fully_signed' && (
                          <button className="p-2 rounded-md hover:bg-muted/50"><Download className="w-4 h-4" style={{ color: 'var(--muted)' }} /></button>
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
