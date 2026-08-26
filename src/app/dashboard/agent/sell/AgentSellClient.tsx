'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ArrowUpRight, FileSearch } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type AgreementItem = {
  id: string;
  type: string;
  status: string;
  property: string;
  tenant: string;
  createdAt: string;
  value: number;
};

const statusConfig: Record<string, { color: string; label: string }> = {
  draft: { color: 'bg-[#171717] text-zinc-500 border border-white/[0.08]', label: 'Draft' },
  pending_landlord: { color: 'bg-zinc-900 text-zinc-300 border border-white/[0.08]', label: 'Pending Landlord' },
  pending_tenant: { color: 'bg-zinc-900 text-zinc-300 border border-white/[0.08]', label: 'Pending Tenant' },
  tenant_signed: { color: 'bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/20', label: 'Tenant Signed' },
  landlord_signed: { color: 'bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/20', label: 'Landlord Signed' },
  fully_signed: { color: 'bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/20', label: 'Fully Signed' },
  active: { color: 'bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/20', label: 'Active' },
  expired: { color: 'bg-red-500/10 text-red-500 border border-red-500/20', label: 'Expired' },
  terminated: { color: 'bg-red-500/10 text-red-500 border border-red-500/20', label: 'Terminated' },
};

function sc(s: string) {
  return statusConfig[s] || { color: 'bg-[#171717] text-zinc-500 border border-white/[0.08]', label: s };
}

const fmtCurrency = (v: number) =>
  '₦' + v.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function AgentSellClient({ initialDeals }: { initialDeals: AgreementItem[] }) {
  const stats = useMemo(() => {
    let totalValue = 0;
    const activeCount = initialDeals.filter((d) => ['pending_landlord', 'pending_tenant', 'tenant_signed', 'landlord_signed'].includes(d.status)).length;
    const closedCount = initialDeals.filter((d) => ['fully_signed', 'active'].includes(d.status)).length;
    for (const d of initialDeals) totalValue += d.value || 0;
    return { totalValue, activeCount, closedCount, total: initialDeals.length };
  }, [initialDeals]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Sell Pipeline</h1>
          <p className="text-base text-zinc-500 mt-1">Sale agreements where you are the listing agent</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card">
          <div className="px-6 py-5 border-b border-white/[0.08] pb-2">
            <h3 className="text-lg font-semibold text-white text-xs uppercase tracking-wider text-zinc-500">Total Deals</h3>
          </div>
          <div className="p-6">
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
        </div>
        <div className="glass-card">
          <div className="px-6 py-5 border-b border-white/[0.08] pb-2">
            <h3 className="text-lg font-semibold text-white text-xs uppercase tracking-wider text-zinc-500">Total Value</h3>
          </div>
          <div className="p-6">
            <p className="text-2xl font-bold text-white">{fmtCurrency(stats.totalValue)}</p>
          </div>
        </div>
        <div className="glass-card">
          <div className="px-6 py-5 border-b border-white/[0.08] pb-2">
            <h3 className="text-lg font-semibold text-white text-xs uppercase tracking-wider text-zinc-500">In Progress</h3>
          </div>
          <div className="p-6">
            <p className="text-2xl font-bold text-zinc-300">{stats.activeCount}</p>
          </div>
        </div>
        <div className="glass-card">
          <div className="px-6 py-5 border-b border-white/[0.08] pb-2">
            <h3 className="text-lg font-semibold text-white text-xs uppercase tracking-wider text-zinc-500">Closed</h3>
          </div>
          <div className="p-6">
            <p className="text-2xl font-bold text-[#00ff66]">{stats.closedCount}</p>
          </div>
        </div>
      </div>

      <div className="glass-card">
        <div className="p-6 p-0">
          {initialDeals.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <FileSearch className="w-16 h-16 mx-auto mb-4 text-zinc-500 opacity-50" />
              <h3 className="font-headline-sm text-white text-white mb-2">No sell deals</h3>
              <p className="text-sm text-zinc-500">Sale agreements will appear here.</p>
            </div>
          ) : (
            <table className="w-full divide-y divide-[#262626]">
              <thead>
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-zinc-500">Property</th>
                  <th className="text-left p-4 text-sm font-medium text-zinc-500">Status</th>
                  <th className="text-right p-4 text-sm font-medium text-zinc-500">Value</th>
                  <th className="text-left p-4 text-sm font-medium text-zinc-500">Client</th>
                  <th className="text-left p-4 text-sm font-medium text-zinc-500">Created</th>
                  <th className="text-right p-4 text-sm font-medium text-zinc-500">Details</th>
                </tr>
              </thead>
              <tbody>
                {initialDeals.map((d) => {
                  const st = sc(d.status);
                  return (
                    <tr key={d.id} className="border-b border-white/[0.08] hover:bg-zinc-950/30 transition-colors">
                      <td className="p-4 font-medium text-sm text-white">{d.property}</td>
                      <td className="p-4"><Badge variant="outline" className={st.color}>{st.label}</Badge></td>
                      <td className="p-4 text-sm text-right text-white font-medium">{fmtCurrency(d.value)}</td>
                      <td className="p-4 text-sm text-zinc-500">{d.tenant}</td>
                      <td className="p-4 text-sm text-zinc-500">
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
        </div>
      </div>
    </div>
  );
}
