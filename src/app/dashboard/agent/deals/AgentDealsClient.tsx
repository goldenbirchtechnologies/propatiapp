'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  FileCheck,
  Clock,
  BadgeDollarSign,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type DealItem = {
  id: string;
  type: string;
  status: string;
  rentAmount: number;
  cautionDeposit: number;
  startDate: string | null;
  endDate: string | null;
  property: string;
  tenant: string;
  landlord: string;
  createdAt: string;
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

const fmtCurrency = (v: number) =>
  '₦' + v.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function AgentDealsClient({ initialDeals }: { initialDeals: DealItem[] }) {
  const stats = useMemo(() => {
    let totalValue = 0;
    const active = initialDeals.filter((d) => ['tenant_signed', 'landlord_signed', 'fully_signed', 'active'].includes(d.status));
    const pending = initialDeals.filter((d) => ['draft', 'pending_landlord', 'pending_tenant'].includes(d.status));
    for (const d of initialDeals) {
      totalValue += d.rentAmount || d.cautionDeposit || 0;
    }
    return { totalValue, active: active.length, pending: pending.length, total: initialDeals.length };
  }, [initialDeals]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline-sm font-bold text-headline-sm text-primary">Active Deals</h1>
        <p className="text-sm text-on-surface-variant mt-1">All agreements currently in progress</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-on-surface-variant">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-on-surface-variant">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-warning">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-on-surface-variant">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-success">{stats.active}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-on-surface-variant">Est. Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{fmtCurrency(stats.totalValue)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          {initialDeals.length === 0 ? (
            <div className="p-12 text-center">
              <FileCheck className="w-16 h-16 mx-auto mb-4 text-on-surface-variant opacity-50" />
              <h3 className="font-headline-sm text-headline-sm text-primary mb-2">No active deals</h3>
              <p className="text-sm text-on-surface-variant">Agreements will appear here once drafted or signed.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant">
                  <th className="text-left p-4 text-sm font-medium text-on-surface-variant">Property</th>
                  <th className="text-left p-4 text-sm font-medium text-on-surface-variant">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-on-surface-variant">Tenant</th>
                  <th className="text-right p-4 text-sm font-medium text-on-surface-variant">Rent</th>
                  <th className="text-left p-4 text-sm font-medium text-on-surface-variant">Deposit</th>
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
                          <p className="text-xs text-on-surface-variant">Landlord: {d.landlord}</p>
                        </div>
                      </td>
                      <td className="p-4"><Badge variant="outline" className={st.color}>{st.label}</Badge></td>
                      <td className="p-4 text-sm text-on-surface-variant">{d.tenant}</td>
                      <td className="p-4 text-sm text-right text-primary font-medium">{fmtCurrency(d.rentAmount)}</td>
                      <td className="p-4 text-sm text-right text-primary">{fmtCurrency(d.cautionDeposit)}</td>
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
