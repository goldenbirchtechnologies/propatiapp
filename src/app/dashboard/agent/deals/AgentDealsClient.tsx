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
  draft: { color: 'bg-[#171717] text-zinc-400 border border-white/[0.08]', label: 'Draft' },
  pending_landlord: { color: 'bg-zinc-800 text-zinc-300 border border-white/[0.08]', label: 'Pending Landlord' },
  pending_tenant: { color: 'bg-zinc-800 text-zinc-300 border border-white/[0.08]', label: 'Pending Tenant' },
  tenant_signed: { color: 'bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20', label: 'Tenant Signed' },
  landlord_signed: { color: 'bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20', label: 'Landlord Signed' },
  fully_signed: { color: 'bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20', label: 'Fully Signed' },
  active: { color: 'bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20', label: 'Active' },
  expired: { color: 'bg-red-500/10 text-red-500 border border-red-500/20', label: 'Expired' },
  terminated: { color: 'bg-red-500/10 text-red-500 border border-red-500/20', label: 'Terminated' },
};

function sc(s: string) {
  return statusConfig[s] || { color: 'bg-[#171717] text-zinc-400 border border-white/[0.08]', label: s };
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
        <p className="text-base text-zinc-400 mt-1">All agreements currently in progress</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card">
          <div className="px-6 py-5 border-b border-white/[0.08] pb-2">
            <h3 className="text-lg font-semibold text-white text-xs uppercase tracking-wider text-zinc-400">Total</h3>
          </div>
          <div className="p-6">
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
        </div>
        <div className="glass-card">
          <div className="px-6 py-5 border-b border-white/[0.08] pb-2">
            <h3 className="text-lg font-semibold text-white text-xs uppercase tracking-wider text-zinc-400">In Progress</h3>
          </div>
          <div className="p-6">
            <p className="text-2xl font-bold text-zinc-300">{stats.pending}</p>
          </div>
        </div>
        <div className="glass-card">
          <div className="px-6 py-5 border-b border-white/[0.08] pb-2">
            <h3 className="text-lg font-semibold text-white text-xs uppercase tracking-wider text-zinc-400">Active</h3>
          </div>
          <div className="p-6">
            <p className="text-2xl font-bold text-[#10b981]">{stats.active}</p>
          </div>
        </div>
        <div className="glass-card">
          <div className="px-6 py-5 border-b border-white/[0.08] pb-2">
            <h3 className="text-lg font-semibold text-white text-xs uppercase tracking-wider text-zinc-400">Est. Value</h3>
          </div>
          <div className="p-6">
            <p className="text-2xl font-bold text-white">{fmtCurrency(stats.totalValue)}</p>
          </div>
        </div>
      </div>

      <div className="glass-card">
        <div className="p-6 p-0">
          {initialDeals.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <FileCheck className="w-16 h-16 mx-auto mb-4 text-zinc-400 opacity-50" />
              <h3 className="font-headline-sm text-white text-white mb-2">No active deals</h3>
              <p className="text-sm text-zinc-400">Agreements will appear here once drafted or signed.</p>
            </div>
          ) : (
            <table className="w-full divide-y divide-[#262626]">
              <thead>
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-zinc-400">Property</th>
                  <th className="text-left p-4 text-sm font-medium text-zinc-400">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-zinc-400">Tenant</th>
                  <th className="text-right p-4 text-sm font-medium text-zinc-400">Rent</th>
                  <th className="text-left p-4 text-sm font-medium text-zinc-400">Deposit</th>
                  <th className="text-right p-4 text-sm font-medium text-zinc-400">Details</th>
                </tr>
              </thead>
              <tbody>
                {initialDeals.map((d) => {
                  const st = sc(d.status);
                  return (
                    <tr key={d.id} className="border-b border-white/[0.08] hover:bg-zinc-950/30 transition-colors">
                      <td className="p-4 font-medium text-sm text-white">
                        <div>
                          <p>{d.property}</p>
                          <p className="text-xs text-zinc-400">Landlord: {d.landlord}</p>
                        </div>
                      </td>
                      <td className="p-4"><Badge variant="outline" className={st.color}>{st.label}</Badge></td>
                      <td className="p-4 text-sm text-zinc-400">{d.tenant}</td>
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
        </div>
      </div>
    </div>
  );
}
