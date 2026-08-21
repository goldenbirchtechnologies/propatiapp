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
  draft: { color: 'bg-[#171717] text-neutral-400 border border-[#262626]', label: 'Draft' },
  pending_landlord: { color: 'bg-[#262626] text-neutral-300 border border-[#262626]', label: 'Pending Landlord' },
  pending_tenant: { color: 'bg-[#262626] text-neutral-300 border border-[#262626]', label: 'Pending Tenant' },
  tenant_signed: { color: 'bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/20', label: 'Tenant Signed' },
  landlord_signed: { color: 'bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/20', label: 'Landlord Signed' },
  fully_signed: { color: 'bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/20', label: 'Fully Signed' },
  active: { color: 'bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/20', label: 'Active' },
  expired: { color: 'bg-red-500/10 text-red-500 border border-red-500/20', label: 'Expired' },
  terminated: { color: 'bg-red-500/10 text-red-500 border border-red-500/20', label: 'Terminated' },
};

function sc(s: string) {
  return statusConfig[s] || { color: 'bg-[#171717] text-neutral-400 border border-[#262626]', label: s };
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
          <h1 className="text-3xl font-semibold tracking-tight text-white">Buy Pipeline</h1>
          <p className="text-base text-neutral-400 mt-1">Track sale agreements initiated for your clients</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-neutral-400">Total Deals</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </CardContent>
        </div>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-neutral-400">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">{fmtCurrency(stats.totalValue)}</p>
          </CardContent>
        </div>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-neutral-400">Active Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">{(stats.counts.draft || 0) + (stats.counts.pending_landlord || 0) + (stats.counts.pending_tenant || 0)}</p>
          </CardContent>
        </div>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-neutral-400">Closed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[#00ff66]">{(stats.counts.fully_signed || 0) + (stats.counts.active || 0)}</p>
          </CardContent>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {initialDeals.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <FileSearch className="w-16 h-16 mx-auto mb-4 text-neutral-400 opacity-50" />
              <h3 className="font-headline-sm text-headline-sm text-white mb-2">No buy deals</h3>
              <p className="text-sm text-neutral-400">Sale agreements will appear here.</p>
            </div>
          ) : (
            <table className="w-full divide-y divide-[#262626]">
              <thead>
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-neutral-400">Property</th>
                  <th className="text-left p-4 text-sm font-medium text-neutral-400">Type</th>
                  <th className="text-left p-4 text-sm font-medium text-neutral-400">Status</th>
                  <th className="text-right p-4 text-sm font-medium text-neutral-400">Value</th>
                  <th className="text-left p-4 text-sm font-medium text-neutral-400">Created</th>
                  <th className="text-right p-4 text-sm font-medium text-neutral-400">Details</th>
                </tr>
              </thead>
              <tbody>
                {initialDeals.map((d) => {
                  const st = sc(d.status);
                  return (
                    <tr key={d.id} className="border-b border-[#262626] hover:bg-[#0a0a0a]/30 transition-colors">
                      <td className="p-4 font-medium text-sm text-white">
                        <div>
                          <p>{d.property}</p>
                          <p className="text-xs text-neutral-400">{d.landlord}</p>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-white capitalize">{d.type}</td>
                      <td className="p-4">
                        <Badge variant="outline" className={st.color}>{st.label}</Badge>
                      </td>
                      <td className="p-4 text-sm text-right text-white font-medium">{fmtCurrency(d.value)}</td>
                      <td className="p-4 text-sm text-neutral-400">
                        {new Date(d.createdAt).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="p-4 text-right">
                        <Link href={`/dashboard/agent/deals/${d.id}`} className="inline-flex items-center gap-1 text-sm text-white hover:underline">
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
      </div>
    </div>
  );
}
