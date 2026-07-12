'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Search, Plus, Eye, Edit, Trash2 } from 'lucide-react';

type Listing = {
  id: string;
  title: string;
  location: string;
  price: number;
  status: string;
  type: string;
  views: number;
};

const statusStyles: Record<string, string> = {
  active: 'bg-success-bright/10 text-success-bright border border-success-bright/20',
  draft: 'bg-warning/10 text-warning border border-warning/20',
  suspended: 'bg-destructive/10 text-destructive border border-destructive/20',
  deleted: 'bg-surface-container-low text-on-surface-variant border border-outline-variant',
};

export default function ListingsClient({ initialListings }: { initialListings: Listing[] }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredListings = useMemo(() => {
    if (!searchQuery) return initialListings;
    const q = searchQuery.toLowerCase();
    return initialListings.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.location.toLowerCase().includes(q) ||
        l.type.toLowerCase().includes(q)
    );
  }, [searchQuery, initialListings]);

  const activeCount = initialListings.filter((l) => l.status === 'active').length;
  const totalViews = initialListings.reduce((sum, l) => sum + l.views, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-headline-sm text-headline-sm text-primary">My Listings</h1>
          <p className="text-sm text-on-surface-variant">Manage your property listings</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Search listings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="inp-field pl-10 w-64"
            />
          </div>
          <button className="btn btn-primary inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Add Listing</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">Total Listings</p>
          <p className="font-headline-md text-headline-md text-primary">{initialListings.length}</p>
        </div>
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">Active</p>
          <p className="font-headline-md text-headline-md text-success">{activeCount}</p>
        </div>
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">Total Views</p>
          <p className="font-headline-md text-headline-md text-primary">{totalViews.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-outline-variant">
                <th className="p-4 font-semibold text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">Property</th>
                <th className="p-4 font-semibold text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">Location</th>
                <th className="p-4 font-semibold text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">Price</th>
                <th className="p-4 font-semibold text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">Type</th>
                <th className="p-4 font-semibold text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">Status</th>
                <th className="p-4 font-semibold text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant">Views</th>
                <th className="p-4 font-semibold text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredListings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-on-surface-variant">No listings found</td>
                </tr>
              ) : (
                filteredListings.map((listing) => (
                  <tr key={listing.id} className="border-b border-outline-variant/30 transition-colors hover:bg-surface-container-high/50">
                    <td className="p-4 font-medium text-primary">{listing.title}</td>
                    <td className="p-4 text-on-surface-variant">{listing.location}</td>
                    <td className="p-4 font-bold text-primary">₦{listing.price.toLocaleString()}</td>
                    <td className="p-4 text-on-surface-variant">{listing.type}</td>
                    <td className="p-4">
                      <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', statusStyles[listing.status] || 'bg-surface-container-low text-on-surface-variant border border-outline-variant')}>
                        {listing.status}
                      </span>
                    </td>
                    <td className="p-4 text-on-surface-variant">{listing.views.toLocaleString()}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/dashboard/realtor/listings/${listing.id}`} className="p-1.5 rounded-md hover:bg-surface-container transition-colors text-on-surface-variant">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button className="p-1.5 rounded-md hover:bg-surface-container transition-colors text-on-surface-variant"><Edit className="w-4 h-4" /></button>
                        <button className="p-1.5 rounded-md hover:bg-destructive/5 transition-colors text-destructive"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
