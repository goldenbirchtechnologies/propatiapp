'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  Home,
  FileSearch,
  BadgeDollarSign,
  XCircle,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type AgreementItem = {
  id: string;
  type: string;
  status: string;
  property: string;
  landlord: string;
  createdAt: string;
  value: number;
};

const statusConfig: Record<string, { color: string; label: string }> = {
  draft: { color: 'bg-muted text-on-surface-variant border border-outline-variant', label: 'Draft' },
  pending_landlord: { color: 'bg-warning/10 text-warning border border-warning/20', label: 'Pending Landlord' },
  pending_tenant: { color: 'bg-warning/10 text-warning border border-warning/20', label: 'Pending Tenant' },
  tenant_signed: { color: 'bg-primary/10 text-primary border border-primary/20', label: 'Tenant Signed' },
  landlord_signed: { color: 'bg-primary/10 text-primary border border-primary/20', label: 'Landlord Signed' },
  fully_signed: { color: 'bg-success/10 text-success border border-success-bright/20', label: 'Fully Signed' },
  active: { color: 'bg-success/10 text-success border border-success-bright/20', label: 'Active' },
  expired: { color: 'bg-destructive/10 text-destructive border border-destructive/20', label: 'Expired' },
  terminated: { color: 'bg-destructive/10 text-destructive border border-destructive/20', label: 'Terminated' },
};

function sc(s: string) {
  return statusConfig[s] || { color: 'bg-muted text-on-surface-variant border border-outline-variant', label: s };
}

export default function AgentBuyClient({ initialDeals }: { initialDeals: AgreementItem[] }) {
  const stats = useMemo(() => {
    let totalValue = 0;
    const counts: Record<string, number> = {};
    for (const d of initialDeals) {
      totalValue += d.value || 0;
      counts[d.status] = (counts[d.status] || 0) + 1;
    }
    return { totalValue, counts, total: initialDeals.length };
  }, [initialDeals]);

  const toNumber = (v: unknown) => (typeof v === 'number' ? v : typeof v === 'string' ? Number(v) || 0 : 0);

  const fmtCurrency = (v: number) =>
    '₦' + v.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-headline-sm font-bold text-headline-sm text-primary">Buy Pipeline</h1>
          <p className="text-sm text-on-surface-variant mt-1">Track sale agreements initiated for your clients</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-on-surface-variant">Total Deals</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-on-surface-variant">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{fmtCurrency(stats.totalValue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-on-surface-variant">Active Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{(stats.counts.draft || 0) + (stats.counts.pending_landlord || 0) + (stats.counts.pending_tenant || 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-on-surface-variant">Closed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-success">{(stats.counts.fully_signed || 0) + (stats.counts.active || 0)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          {initialDeals.length === 0 ? (
            <div className="p-12 text-center">
              <FileSearch className="w-16 h-16 mx-auto mb-4 text-on-surface-variant opacity-50" />
              <h3 className="font-headline-sm text-headline-sm text-primary mb-2">No buy deals</h3>
              <p className="text-sm text-on-surface-variant">Sale agreements will appear here.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant">
                  <th className="text-left p-4 text-sm font-medium text-on-surface-variant">Property</th>
                  <th className="text-left p-4 text-sm font-medium text-on-surface-variant">Type</th>
                  <th className="text-left p-4 text-sm font-medium text-on-surface-variant">Status</th>
                  <th className="text-right p-4 text-sm font-medium text-on-surface-variant">Value</th>
                  <th className="text-left p-4 text-sm font-medium text-on-surface-variant">Created</th>
                  <th className="text-right p-4 text-sm font-medium text-on-surface-variant">Details</th>
                </tr>
              </thead>
              <tbody>
                {initialDeals.map((d) => {
                  const st = sc(d.status);
                  return (
                    <tr key={d.id} className="border-b border-outline-variant hover:bg-surface-container-high/50 transition-colors">
                      <td className="p-4 font-medium text-sm text-primary">
                        <div>
                          <p>{d.property}</p>
                          <p className="text-xs text-on-surface-variant">{d.landlord}</p>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-primary capitalize">{d.type}</td>
                      <td className="p-4">
                        <Badge variant="outline" className={st.color}>{st.label}</Badge>
                      </td>
                      <td className="p-4 text-sm text-right text-primary font-medium">{fmtCurrency(d.value)}</td>
                      <td className="p-4 text-sm text-on-surface-variant">
                        {new Date(d.createdAt).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="p-4 text-right">
                        <Link href={`/dashboard/agent/deals/${d.id}`} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
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
