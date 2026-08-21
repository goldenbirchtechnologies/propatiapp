'use client';

import React, { useState } from 'react';
import { Building2, Users, CreditCard, Wrench, TrendingUp, MapPin, Search, Bell, ChevronDown, Box } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

const statusStyles: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  draft: 'bg-zinc-500/10 text-neutral-400 border-zinc-500/30',
  pending: 'bg-amber-500/10 text-neutral-300 border-amber-500/30',
  accepted: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  rejected: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
};

interface ListingItem {
  id: string;
  title: string;
  listingType?: string;
  status?: string;
  price?: number | string;
  createdAt?: string;
}

interface Props {
  displayName: string;
  totalRevenue: number;
  listingCount: number;
  activeListingCount: number;
  pendingApplicationCount: number;
  openMaintenanceCount: number;
  recentListings: ListingItem[];
}

export default function LandlordDashboardClient({
  displayName,
  totalRevenue,
  listingCount,
  activeListingCount,
  pendingApplicationCount,
  openMaintenanceCount,
  recentListings,
}: Props) {
  const [query, setQuery] = useState('');

  const filtered = recentListings.filter((item) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (item.title || '').toLowerCase().includes(q) || (item.listingType || '').toLowerCase().includes(q);
  });

  return (
    <div className="min-h-[calc(100vh-var(--topbar-height))] bg-[#0b1015] text-zinc-100 antialiased">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
              Overview: {displayName}
            </h1>
            <p className="mt-2 text-sm text-neutral-400">Portfolio snapshot and recent listings.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search listings..."
                className="w-full rounded-lg border border-zinc-800 bg-[#141b22] pl-9 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 outline-none focus:border-emerald-500/50"
              />
            </div>
            <button className="relative rounded-lg p-2 text-neutral-400 hover:text-zinc-200 hover:bg-zinc-800/50">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-4 w-4 rounded-full bg-emerald-500 text-[10px] font-bold text-zinc-950">0</span>
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-zinc-800/80 bg-[#121820] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">Total Properties</p>
                <p className="mt-1 text-2xl font-bold text-zinc-100">{listingCount}</p>
              </div>
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-2 text-emerald-400">
                <Building2 className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-zinc-800/80 bg-[#121820] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">Monthly Revenue</p>
                <p className="mt-1 text-2xl font-bold text-zinc-100">{formatCurrency(totalRevenue)}</p>
              </div>
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-2 text-emerald-400">
                <CreditCard className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-zinc-800/80 bg-[#121820] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">Active Listings</p>
                <p className="mt-1 text-2xl font-bold text-zinc-100">
                  {activeListingCount} <span className="text-base text-zinc-500">/ {listingCount}</span>
                </p>
              </div>
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-2 text-emerald-400">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-zinc-800/80 bg-[#121820] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">Open Maintenance</p>
                <p className="mt-1 text-2xl font-bold text-zinc-100">{openMaintenanceCount}</p>
              </div>
              <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-2 text-rose-400">
                <Wrench className="h-5 w-5" />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-medium text-zinc-200">Recent Listings</h2>
            <Link href="/dashboard/landlord/properties" className="text-xs text-emerald-400 hover:text-emerald-300">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.length === 0 ? (
              <div className="col-span-full rounded-xl border border-dashed border-zinc-800 bg-[#121820] p-10 text-center text-sm text-neutral-400">
                No listings found.
              </div>
            ) : (
              filtered.map((item) => (
                <div key={item.id} className="flex flex-col rounded-xl border border-zinc-800/80 bg-[#121820] transition hover:border-zinc-700/80">
                  <div className="flex h-44 items-center justify-center bg-zinc-900">
                    <Box className="h-10 w-10 text-zinc-700" />
                  </div>
                  <div className="flex flex-1 flex-col justify-between p-4">
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-100">{item.title}</h3>
                      <div className="mt-1 flex items-center justify-between text-xs text-neutral-400">
                        <span className="capitalize">{item.listingType || 'Listing'}</span>
                        <span>{formatCurrency(Number(item.price))}</span>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusStyles[item.status || 'draft'] || statusStyles.draft}`}>
                        {item.status || 'draft'}
                      </span>
                      <div className="flex gap-2">
                        <Link href={`/dashboard/landlord/listing/${item.id}`} className="rounded-lg border border-emerald-500/40 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/10">
                          Manage
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
