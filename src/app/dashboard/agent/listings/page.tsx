'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import { Building2, Plus, Eye, Edit, Trash2, ShieldCheck, Shield } from 'lucide-react';

const mockListings = [
  { id: 'l1', title: 'Lekki Phase 1 Apartment', landlord: 'Jane Smith', type: 'Rental', status: 'active', views: 245, verified: true },
  { id: 'l2', title: 'Ikeja GRA Flat', landlord: 'Jane Smith', type: 'Rental', status: 'draft', views: 0, verified: false },
  { id: 'l3', title: 'Victoria Island Duplex', landlord: 'Jane Smith', type: 'Sale', status: 'active', views: 1089, verified: true },
  { id: 'l4', title: 'Banana Island Villa', landlord: 'Jane Smith', type: 'Sale', status: 'archived', views: 342, verified: true },
];

const statusConfig: Record<string, { class: string; label: string }> = {
  active: { class: 'bg-green-50 text-green-700 border-green-200', label: 'Active' },
  draft: { class: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Draft' },
  archived: { class: 'bg-gray-50 text-gray-700 border-gray-200', label: 'Archived' },
};

export default function AgentListingsPage() {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? mockListings : mockListings.filter((l) => l.status === filter);

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
        <div className="card p-4"><p className="text-xs" style={{ color: 'var(--muted)' }}>Total</p><p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{mockListings.length}</p></div>
        <div className="card p-4"><p className="text-xs" style={{ color: 'var(--muted)' }}>Active</p><p className="text-2xl font-bold text-green-600">{mockListings.filter((l) => l.status === 'active').length}</p></div>
        <div className="card p-4"><p className="text-xs" style={{ color: 'var(--muted)' }}>Verified</p><p className="text-2xl font-bold text-green-600">{mockListings.filter((l) => l.verified).length}</p></div>
        <div className="card p-4"><p className="text-xs" style={{ color: 'var(--muted)' }}>Views</p><p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{mockListings.reduce((a, c) => a + c.views, 0).toLocaleString()}</p></div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 flex flex-wrap gap-2 border-b" style={{ borderColor: 'var(--border)' }}>
          {['all', 'active', 'draft', 'archived'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-md text-sm font-medium border capitalize transition-colors ${filter === f ? 'bg-accent/10 text-accent border-accent/30' : 'border-transparent hover:bg-muted/50'}`}>{f}</button>
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
              {filtered.map((l) => (
                <tr key={l.id} className="border-b transition-colors hover:bg-muted/30" style={{ borderColor: 'var(--border)' }}>
                  <td className="p-4 font-medium text-sm" style={{ color: 'var(--text)' }}>{l.title}</td>
                  <td className="p-4 text-sm" style={{ color: 'var(--muted)' }}>{l.landlord}</td>
                  <td className="p-4 text-sm" style={{ color: 'var(--text)' }}>{l.type}</td>
                  <td className="p-4"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig[l.status].class}`}>{statusConfig[l.status].label}</span></td>
                  <td className="p-4">{l.verified ? <span className="inline-flex items-center text-green-600"><ShieldCheck className="w-4 h-4" /></span> : <span className="text-gray-400"><Shield className="w-4 h-4" /></span>}</td>
                  <td className="p-4 text-sm text-right" style={{ color: 'var(--text)' }}>{l.views.toLocaleString()}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-2 rounded-md hover:bg-muted/50"><Eye className="w-4 h-4" style={{ color: 'var(--muted)' }} /></button>
                      <button className="p-2 rounded-md hover:bg-muted/50"><Edit className="w-4 h-4" style={{ color: 'var(--muted)' }} /></button>
                      <button className="p-2 rounded-md hover:bg-muted/50"><Trash2 className="w-4 h-4" style={{ color: 'var(--muted)' }} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}