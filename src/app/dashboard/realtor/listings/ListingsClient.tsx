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
  active: 'bg-green-100 text-green-700 border-green-200',
  draft: 'bg-amber-100 text-amber-700 border-amber-200',
  suspended: 'bg-red-100 text-red-700 border-red-200',
  deleted: 'bg-gray-100 text-on-surface-variant border-outline-variant',
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
          <h1 className="font-heading font-bold" style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}>My Listings</h1>
          <p className="text-sm" style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>Manage your property listings</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted)' }} />
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
        <div className="card p-4">
          <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Total Listings</p>
          <p className="text-2xl font-heading font-bold" style={{ color: 'var(--text)' }}>{initialListings.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Active</p>
          <p className="text-2xl font-heading font-bold" style={{ color: 'var(--green)' }}>{activeCount}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Total Views</p>
          <p className="text-2xl font-heading font-bold" style={{ color: 'var(--text)' }}>{totalViews.toLocaleString()}</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm" style={{ color: 'var(--text)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th className="p-4 font-semibold">Property</th>
                <th className="p-4 font-semibold">Location</th>
                <th className="p-4 font-semibold">Price</th>
                <th className="p-4 font-semibold">Type</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Views</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredListings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center" style={{ color: 'var(--muted)' }}>No listings found</td>
                </tr>
              ) : (
                filteredListings.map((listing) => (
                  <tr key={listing.id} className="transition-colors hover:bg-muted/30" style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="p-4 font-medium">{listing.title}</td>
                    <td className="p-4" style={{ color: 'var(--muted)' }}>{listing.location}</td>
                    <td className="p-4 font-bold">₦{listing.price.toLocaleString()}</td>
                    <td className="p-4" style={{ color: 'var(--muted)' }}>{listing.type}</td>
                    <td className="p-4">
                      <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', statusStyles[listing.status] || 'tag-gray')}>
                        {listing.status}
                      </span>
                    </td>
                    <td className="p-4" style={{ color: 'var(--muted)' }}>{listing.views.toLocaleString()}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/dashboard/realtor/listings/${listing.id}`} className="p-1.5 rounded-md hover:bg-muted/50 transition-colors" style={{ color: 'var(--muted)' }}>
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button className="p-1.5 rounded-md hover:bg-muted/50 transition-colors" style={{ color: 'var(--muted)' }}><Edit className="w-4 h-4" /></button>
                        <button className="p-1.5 rounded-md hover:bg-red-50 transition-colors" style={{ color: 'var(--red)' }}><Trash2 className="w-4 h-4" /></button>
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
