'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Castle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const listingStatusConfig: Record<string, { color: string; label: string }> = {
  active: { color: 'bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/20', label: 'Active' },
  draft: { color: 'bg-[#171717] text-zinc-500 border border-white/[0.08]', label: 'Draft' },
  suspended: { color: 'bg-red-500/10 text-red-500 border border-red-500/20', label: 'Suspended' },
  deleted: { color: 'bg-destructive/5 text-red-500/60 border border-white/[0.08]', label: 'Deleted' },
};

type ListingItem = {
  id: string;
  title: string;
  address: string;
  price: number;
  type: string;
  status: string;
  landlord: string;
  createdAt: string;
};

const fmtCurrency = (v: number) =>
  '₦' + v.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export default function AgentMarketClient({ initialListings }: { initialListings: ListingItem[] }) {
  const stats = useMemo(() => {
    const active = initialListings.filter((l) => l.status === 'active');
    const avgPrice = active.length > 0 ? active.reduce((sum, l) => sum + l.price, 0) / active.length : 0;
    return {
      total: initialListings.length,
      active: active.length,
      avgPrice,
      types: Array.from(new Set(initialListings.map((l) => l.type))),
    };
  }, [initialListings]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-white">Market Overview</h1>
        <p className="text-base text-zinc-500 mt-1">Browse active listings across the marketplace</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card">
          <div className="px-6 py-5 border-b border-white/[0.08] pb-2">
            <h3 className="text-lg font-semibold text-white text-xs uppercase tracking-wider text-zinc-500">Active Listings</h3>
          </div>
          <div className="p-6">
            <p className="text-2xl font-bold text-white">{stats.active}</p>
          </div>
        </div>
        <div className="glass-card">
          <div className="px-6 py-5 border-b border-white/[0.08] pb-2">
            <h3 className="text-lg font-semibold text-white text-xs uppercase tracking-wider text-zinc-500">Avg Price</h3>
          </div>
          <div className="p-6">
            <p className="text-2xl font-bold text-white">{fmtCurrency(stats.avgPrice)}</p>
          </div>
        </div>
        <div className="glass-card">
          <div className="px-6 py-5 border-b border-white/[0.08] pb-2">
            <h3 className="text-lg font-semibold text-white text-xs uppercase tracking-wider text-zinc-500">Total Shown</h3>
          </div>
          <div className="p-6">
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
        </div>
        <div className="glass-card">
          <div className="px-6 py-5 border-b border-white/[0.08] pb-2">
            <h3 className="text-lg font-semibold text-white text-xs uppercase tracking-wider text-zinc-500">Property Types</h3>
          </div>
          <div className="p-6">
            <p className="text-2xl font-bold text-white">{stats.types.length}</p>
          </div>
        </div>
      </div>

      <div className="glass-card">
        <div className="p-6 p-0">
          {initialListings.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <TrendingUp className="w-16 h-16 mx-auto mb-4 text-zinc-500 opacity-50" />
              <h3 className="font-headline-sm text-white text-white mb-2">No active listings</h3>
              <p className="text-sm text-zinc-500">Market listings will appear here.</p>
            </div>
          ) : (
            <table className="w-full divide-y divide-[#262626]">
              <thead>
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-zinc-500">Property</th>
                  <th className="text-left p-4 text-sm font-medium text-zinc-500">Type</th>
                  <th className="text-left p-4 text-sm font-medium text-zinc-500">Price</th>
                  <th className="text-left p-4 text-sm font-medium text-zinc-500">Status</th>
                  <th className="text-right p-4 text-sm font-medium text-zinc-500">Details</th>
                </tr>
              </thead>
              <tbody>
                {initialListings.map((l) => {
                  const sc = listingStatusConfig[l.status] || listingStatusConfig.draft;
                  return (
                    <tr key={l.id} className="border-b border-white/[0.08] hover:bg-zinc-950/30 transition-colors">
                      <td className="p-4">
                        <p className="font-medium text-sm text-white">{l.title}</p>
                        <p className="text-xs text-zinc-500">{l.address}</p>
                      </td>
                      <td className="p-4 text-sm text-white capitalize">{l.type}</td>
                      <td className="p-4 text-sm text-white font-medium">{fmtCurrency(l.price)}</td>
                      <td className="p-4"><Badge variant="outline" className={sc.color}>{sc.label}</Badge></td>
                      <td className="p-4 text-right">
                        <Link href={`/dashboard/agent/listings/${l.id}`} className="inline-flex items-center gap-1 text-sm text-white hover:underline">
                          View <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
