'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Castle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const listingStatusConfig: Record<string, { color: string; label: string }> = {
  active: { color: 'bg-success/10 text-success border border-success-bright/20', label: 'Active' },
  draft: { color: 'bg-muted text-on-surface-variant border border-outline-variant', label: 'Draft' },
  suspended: { color: 'bg-destructive/10 text-destructive border border-destructive/20', label: 'Suspended' },
  deleted: { color: 'bg-destructive/5 text-destructive/60 border border-outline-variant', label: 'Deleted' },
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
        <h1 className="font-headline-sm font-bold text-headline-sm text-primary">Market Overview</h1>
        <p className="text-sm text-on-surface-variant mt-1">Browse active listings across the marketplace</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-on-surface-variant">Active Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{stats.active}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-on-surface-variant">Avg Price</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{fmtCurrency(stats.avgPrice)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-on-surface-variant">Total Shown</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-on-surface-variant">Property Types</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{stats.types.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          {initialListings.length === 0 ? (
            <div className="p-12 text-center">
              <TrendingUp className="w-16 h-16 mx-auto mb-4 text-on-surface-variant opacity-50" />
              <h3 className="font-headline-sm text-headline-sm text-primary mb-2">No active listings</h3>
              <p className="text-sm text-on-surface-variant">Market listings will appear here.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant">
                  <th className="text-left p-4 text-sm font-medium text-on-surface-variant">Property</th>
                  <th className="text-left p-4 text-sm font-medium text-on-surface-variant">Type</th>
                  <th className="text-left p-4 text-sm font-medium text-on-surface-variant">Price</th>
                  <th className="text-left p-4 text-sm font-medium text-on-surface-variant">Status</th>
                  <th className="text-right p-4 text-sm font-medium text-on-surface-variant">Details</th>
                </tr>
              </thead>
              <tbody>
                {initialListings.map((l) => {
                  const sc = listingStatusConfig[l.status] || listingStatusConfig.draft;
                  return (
                    <tr key={l.id} className="border-b border-outline-variant hover:bg-surface-container-high/50 transition-colors">
                      <td className="p-4">
                        <p className="font-medium text-sm text-primary">{l.title}</p>
                        <p className="text-xs text-on-surface-variant">{l.address}</p>
                      </td>
                      <td className="p-4 text-sm text-primary capitalize">{l.type}</td>
                      <td className="p-4 text-sm text-primary font-medium">{fmtCurrency(l.price)}</td>
                      <td className="p-4"><Badge variant="outline" className={sc.color}>{sc.label}</Badge></td>
                      <td className="p-4 text-right">
                        <Link href={`/dashboard/agent/listings/${l.id}`} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                          View <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
