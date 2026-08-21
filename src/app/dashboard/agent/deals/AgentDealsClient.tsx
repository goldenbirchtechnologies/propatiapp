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
        <h1 className="text-3xl font-semibold tracking-tight text-white">Active Deals</h1>
        <p className="text-base text-neutral-400 mt-1">All agreements currently in progress</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-neutral-400">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </CardContent>
        </div>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-neutral-400">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-neutral-300">{stats.pending}</p>
          </CardContent>
        </div>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-neutral-400">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[#00ff66]">{stats.active}</p>
          </CardContent>
        </div>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-wider text-neutral-400">Est. Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">{fmtCurrency(stats.totalValue)}</p>
          </CardContent>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {initialDeals.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <FileCheck className="w-16 h-16 mx-auto mb-4 text-neutral-400 opacity-50" />
              <h3 className="font-headline-sm text-headline-sm text-white mb-2">No active deals</h3>
              <p className="text-sm text-neutral-400">Agreements will appear here once drafted or signed.</p>
            </div>
          ) : (
            <table className="w-full divide-y divide-[#262626]">
              <thead>
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-neutral-400">Property</th>
                  <th className="text-left p-4 text-sm font-medium text-neutral-400">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-neutral-400">Tenant</th>
                  <th className="text-right p-4 text-sm font-medium text-neutral-400">Rent</th>
                  <th className="text-left p-4 text-sm font-medium text-neutral-400">Deposit</th>
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
                          <p className="text-xs text-neutral-400">Landlord: {d.landlord}</p>
                        </div>
                      </td>
                      <td className="p-4"><Badge variant="outline" className={st.color}>{st.label}</Badge></td>
                      <td className="p-4 text-sm text-neutral-400">{d.tenant}</td>
                      <td className="p-4 text-sm text-right text-white font-medium">{fmtCurrency(d.rentAmount)}</td>
                      <td className="p-4 text-sm text-right text-white">{fmtCurrency(d.cautionDeposit)}</td>
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
