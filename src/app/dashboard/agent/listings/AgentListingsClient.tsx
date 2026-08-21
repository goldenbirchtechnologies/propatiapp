'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Building2, Plus, Eye, Edit, Trash2, ShieldCheck, Shield } from 'lucide-react';

const statusConfig: Record<string, { class: string; label: string }> = {
  active: { class: 'bg-success-bright/10 text-[#00ff66] border border-[#00ff66]/20', label: 'Active' },
  draft: { class: 'bg-[#262626] text-neutral-300 border border-[#262626]', label: 'Draft' },
  suspended: { class: 'bg-red-500/10 text-red-500 border border-red-500/20', label: 'Suspended' },
  deleted: { class: 'bg-surface-container-low text-neutral-400 border border-[#262626]', label: 'Deleted' },
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
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Managed Listings
          </h1>
          <p className="text-base text-neutral-400 mt-1">
            Oversee your client property listings
          </p>
        </div>
        <button className="btn btn-primary inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Add Listing</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest rounded-xl border border-[#262626] p-4  hover:shadow-md transition-shadow">
          <p className="text-[10px] font-label-md uppercase tracking-wider text-neutral-400">Total</p>
          <p className="font-headline-md text-headline-md text-white">{initialListings.length}</p>
        </div>
        <div className="bg-surface-container-lowest rounded-xl border border-[#262626] p-4  hover:shadow-md transition-shadow">
          <p className="text-[10px] font-label-md uppercase tracking-wider text-neutral-400">Active</p>
          <p className="font-headline-md text-headline-md text-[#00ff66]">{activeCount}</p>
        </div>
        <div className="bg-surface-container-lowest rounded-xl border border-[#262626] p-4  hover:shadow-md transition-shadow">
          <p className="text-[10px] font-label-md uppercase tracking-wider text-neutral-400">Verified</p>
          <p className="font-headline-md text-headline-md text-[#00ff66]">{verifiedCount}</p>
        </div>
        <div className="bg-surface-container-lowest rounded-xl border border-[#262626] p-4  hover:shadow-md transition-shadow">
          <p className="text-[10px] font-label-md uppercase tracking-wider text-neutral-400">Views</p>
          <p className="font-headline-md text-headline-md text-white">{totalViews.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-[#262626] overflow-hidden  hover:shadow-md transition-shadow">
        <div className="p-4 flex flex-wrap gap-2 border-b border-[#262626]">
          {['all', 'active', 'draft', 'suspended'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={cn('px-3 py-1.5 rounded-md text-sm font-medium border capitalize transition-colors', filter === f ? 'bg-[#00ff66]/10 text-white border-[#00ff66]/20' : 'border-transparent hover:bg-surface-container')}>{f === 'all' ? 'All' : statusConfig[f]?.label || f}</button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <div className="p-6 text-center py-16">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-neutral-400 opacity-50" />
            <h3 className="font-headline-sm text-headline-sm text-white mb-2">No listings</h3>
            <p className="text-neutral-400">Add your first managed listing.</p>
          </div>
        ) : (
          <table className="w-full divide-y divide-[#262626]">
            <thead>
              <tr>
                <th className="text-left p-4 text-sm font-medium text-neutral-400">Property</th>
                <th className="text-left p-4 text-sm font-medium text-neutral-400">Landlord</th>
                <th className="text-left p-4 text-sm font-medium text-neutral-400">Type</th>
                <th className="text-left p-4 text-sm font-medium text-neutral-400">Status</th>
                <th className="text-left p-4 text-sm font-medium text-neutral-400">Verified</th>
                <th className="text-right p-4 text-sm font-medium text-neutral-400">Views</th>
                <th className="text-right p-4 text-sm font-medium text-neutral-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => {
                const sc = statusConfig[l.status] || statusConfig.draft;
                return (
                <tr key={l.id} className="border-b border-[#262626] transition-colors hover:bg-[#0a0a0a]/30">
                  <td className="p-4 font-medium text-sm text-white">{l.title}</td>
                  <td className="p-4 text-sm text-neutral-400">{l.landlord}</td>
                  <td className="p-4 text-sm text-white">{l.type}</td>
                  <td className="p-4"><span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', sc.class)}>{sc.label}</span></td>
                  <td className="p-4">{l.verified ? <span className="inline-flex items-center text-[#00ff66]"><ShieldCheck className="w-4 h-4" /></span> : <span className="inline-flex items-center text-neutral-400"><Shield className="w-4 h-4" /></span>}</td>
                  <td className="p-4 text-sm text-right text-white">{l.views.toLocaleString()}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/dashboard/agent/listings/${l.id}`} className="p-2 rounded-md hover:bg-surface-container">
                        <Eye className="w-4 h-4 text-neutral-400" />
                      </Link>
                      <button className="p-2 rounded-md hover:bg-surface-container"><Edit className="w-4 h-4 text-neutral-400" /></button>
                      <button className="p-2 rounded-md hover:bg-destructive/5"><Trash2 className="w-4 h-4 text-red-500" /></button>
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
