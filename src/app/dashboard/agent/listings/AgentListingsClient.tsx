'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Building2, Plus, Eye, Edit, Trash2, ShieldCheck, Shield } from 'lucide-react';

const statusConfig: Record<string, { class: string; label: string }> = {
  active: { class: 'bg-green-50 text-green-700 border-green-200', label: 'Active' },
  draft: { class: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Draft' },
  suspended: { class: 'bg-red-50 text-red-700 border-red-200', label: 'Suspended' },
  deleted: { class: 'bg-gray-50 text-gray-700 border-gray-200', label: 'Deleted' },
};

type Listing = {
  id: string;
  title: string;
  landlord: string;
  type: string;
  status: string;
  views: number;
  verified: boolean;
};

export default function AgentListingsClient({ initialListings }: { initialListings: Listing[] }) {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? initialListings : initialListings.filter((l) => l.status === filter);

  const activeCount = initialListings.filter((l) => l.status === 'active').length;
  const verifiedCount = initialListings.filter((l) => l.verified).length;
  const totalViews = initialListings.reduce((sum, l) => sum + l.views, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold" style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}>Managed Listings</h1>
          <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>Oversee your client property listings</p>
        </div>
        <button className="btn btn-primary inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Add Listing</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4"><p className="text-xs" style={{ color: 'var(--muted)' }}>Total</p><p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{initialListings.length}</p></div>
        <div className="card p-4"><p className="text-xs" style={{ color: 'var(--muted)' }}>Active</p><p className="text-2xl font-bold" style={{ color: 'var(--green)' }}>{activeCount}</p></div>
        <div className="card p-4"><p className="text-xs" style={{ color: 'var(--muted)' }}>Verified</p><p className="text-2xl font-bold" style={{ color: 'var(--green)' }}>{verifiedCount}</p></div>
        <div className="card p-4"><p className="text-xs" style={{ color: 'var(--muted)' }}>Views</p><p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{totalViews.toLocaleString()}</p></div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 flex flex-wrap gap-2 border-b" style={{ borderColor: 'var(--border)' }}>
          {['all', 'active', 'draft', 'suspended'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={cn('px-3 py-1.5 rounded-md text-sm font-medium border capitalize transition-colors', filter === f ? 'bg-accent/10 text-accent border-accent/30' : 'border-transparent hover:bg-muted/50')}>{f === 'all' ? 'All' : statusConfig[f]?.label || f}</button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <div className="card-body text-center py-16"><Building2 className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--muted)', opacity: 0.5 }} /><h3 className="font-heading font-bold text-lg mb-2" style={{ color: 'var(--text)' }}>No listings</h3><p style={{ color: 'var(--muted)' }}>Add your first managed listing.</p></div>
        ) : (
          <table className="w-full">
            <thead><tr className="border-b" style={{ borderColor: 'var(--border)' }}>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Property</th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Landlord</th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Type</th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Status</th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Verified</th>
              <th className="text-right p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Views</th>
              <th className="text-right p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map((l) => {
                const sc = statusConfig[l.status] || statusConfig.draft;
                return (
                <tr key={l.id} className="border-b transition-colors hover:bg-muted/30" style={{ borderColor: 'var(--border)' }}>
                  <td className="p-4 font-medium text-sm" style={{ color: 'var(--text)' }}>{l.title}</td>
                  <td className="p-4 text-sm" style={{ color: 'var(--muted)' }}>{l.landlord}</td>
                  <td className="p-4 text-sm" style={{ color: 'var(--text)' }}>{l.type}</td>
                  <td className="p-4"><span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', sc.class)}>{sc.label}</span></td>
                  <td className="p-4">{l.verified ? <span className="inline-flex items-center" style={{ color: 'var(--green)' }}><ShieldCheck className="w-4 h-4" /></span> : <span style={{ color: 'var(--muted)' }}><Shield className="w-4 h-4" /></span>}</td>
                  <td className="p-4 text-sm text-right" style={{ color: 'var(--text)' }}>{l.views.toLocaleString()}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-2 rounded-md hover:bg-muted/50"><Eye className="w-4 h-4" style={{ color: 'var(--muted)' }} /></button>
                      <button className="p-2 rounded-md hover:bg-muted/50"><Edit className="w-4 h-4" style={{ color: 'var(--muted)' }} /></button>
                      <button className="p-2 rounded-md hover:bg-muted/50"><Trash2 className="w-4 h-4" style={{ color: 'var(--muted)' }} /></button>
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
