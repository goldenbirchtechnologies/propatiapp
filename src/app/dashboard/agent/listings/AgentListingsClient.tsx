'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Building2, Plus, Eye, Edit, Trash2, ShieldCheck, Shield } from 'lucide-react';

const statusConfig: Record<string, { class: string; label: string }> = {
  active: { class: 'bg-success-bright/10 text-success-bright border border-success-bright/20', label: 'Active' },
  draft: { class: 'bg-warning/10 text-warning border border-warning/20', label: 'Draft' },
  suspended: { class: 'bg-destructive/10 text-destructive border border-destructive/20', label: 'Suspended' },
  deleted: { class: 'bg-surface-container-low text-on-surface-variant border border-outline-variant', label: 'Deleted' },
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
          <h1 className="font-headline-sm text-headline-sm text-primary">
            Managed Listings
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Oversee your client property listings
          </p>
        </div>
        <button className="btn btn-primary inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Add Listing</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">Total</p>
          <p className="font-headline-md text-headline-md text-primary">{initialListings.length}</p>
        </div>
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">Active</p>
          <p className="font-headline-md text-headline-md text-success">{activeCount}</p>
        </div>
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">Verified</p>
          <p className="font-headline-md text-headline-md text-success">{verifiedCount}</p>
        </div>
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">Views</p>
          <p className="font-headline-md text-headline-md text-primary">{totalViews.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className="p-4 flex flex-wrap gap-2 border-b border-outline-variant">
          {['all', 'active', 'draft', 'suspended'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={cn('px-3 py-1.5 rounded-md text-sm font-medium border capitalize transition-colors', filter === f ? 'bg-accent/10 text-accent border-accent/30' : 'border-transparent hover:bg-surface-container')}>{f === 'all' ? 'All' : statusConfig[f]?.label || f}</button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <div className="p-6 text-center py-16">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-on-surface-variant opacity-50" />
            <h3 className="font-headline-sm text-headline-sm text-primary mb-2">No listings</h3>
            <p className="text-on-surface-variant">Add your first managed listing.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant">
                <th className="text-left p-4 text-sm font-medium text-on-surface-variant">Property</th>
                <th className="text-left p-4 text-sm font-medium text-on-surface-variant">Landlord</th>
                <th className="text-left p-4 text-sm font-medium text-on-surface-variant">Type</th>
                <th className="text-left p-4 text-sm font-medium text-on-surface-variant">Status</th>
                <th className="text-left p-4 text-sm font-medium text-on-surface-variant">Verified</th>
                <th className="text-right p-4 text-sm font-medium text-on-surface-variant">Views</th>
                <th className="text-right p-4 text-sm font-medium text-on-surface-variant">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => {
                const sc = statusConfig[l.status] || statusConfig.draft;
                return (
                <tr key={l.id} className="border-b border-outline-variant transition-colors hover:bg-surface-container-high/50">
                  <td className="p-4 font-medium text-sm text-primary">{l.title}</td>
                  <td className="p-4 text-sm text-on-surface-variant">{l.landlord}</td>
                  <td className="p-4 text-sm text-primary">{l.type}</td>
                  <td className="p-4"><span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', sc.class)}>{sc.label}</span></td>
                  <td className="p-4">{l.verified ? <span className="inline-flex items-center text-success"><ShieldCheck className="w-4 h-4" /></span> : <span className="inline-flex items-center text-on-surface-variant"><Shield className="w-4 h-4" /></span>}</td>
                  <td className="p-4 text-sm text-right text-primary">{l.views.toLocaleString()}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/dashboard/agent/listings/${l.id}`} className="p-2 rounded-md hover:bg-surface-container">
                        <Eye className="w-4 h-4 text-on-surface-variant" />
                      </Link>
                      <button className="p-2 rounded-md hover:bg-surface-container"><Edit className="w-4 h-4 text-on-surface-variant" /></button>
                      <button className="p-2 rounded-md hover:bg-destructive/5"><Trash2 className="w-4 h-4 text-destructive" /></button>
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
