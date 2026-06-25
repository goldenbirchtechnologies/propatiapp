'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { DollarSign, TrendingUp, Download } from 'lucide-react';

type Commission = {
  id: string;
  deal: string;
  amount: number;
  rate: string;
  date: string;
  status: string;
  client: string;
};

const statusConfig: Record<string, { class: string; label: string }> = {
  paid: { class: 'bg-green-50 text-green-700 border-green-200', label: 'Paid' },
  pending: { class: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Pending' },
  cancelled: { class: 'bg-red-50 text-red-700 border-red-200', label: 'Cancelled' },
};

export default function AgentCommissionsClient({
  initialCommissions,
  totalEarned,
  totalPaid,
  totalPending,
}: {
  initialCommissions: Commission[];
  totalEarned: number;
  totalPaid: number;
  totalPending: number;
}) {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? initialCommissions : initialCommissions.filter((c) => c.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-bold" style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}>Commissions</h1>
        <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>Track earnings and payouts per deal</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <p className="text-xs" style={{ color: 'var(--muted)' }}>Total Earned</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>₦{totalEarned.toLocaleString()}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-green-600">Paid Out</p>
          <p className="text-2xl font-bold text-green-600">₦{totalPaid.toLocaleString()}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-amber-600">Pending</p>
          <p className="text-2xl font-bold text-amber-600">₦{totalPending.toLocaleString()}</p>
        </div>
      </div>

      <div className="card p-4 flex flex-wrap gap-4 items-center justify-between">
        <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Commission summary</p>
        <button className="btn btn-outline inline-flex items-center gap-2"><Download className="w-4 h-4" /> Export CSV</button>
      </div>

      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="card-body text-center py-16">
            <p style={{ color: 'var(--muted)' }}>No commissions yet</p>
          </div>
        ) : (
          <table className="w-full">
            <thead><tr className="border-b" style={{ borderColor: 'var(--border)' }}>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Deal</th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Client</th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Amount</th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Rate</th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Status</th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Date</th>
            </tr></thead>
            <tbody>
              {filtered.map((c) => {
                const sc = statusConfig[c.status] || statusConfig.pending;
                return (
                  <tr key={c.id} className="border-b transition-colors hover:bg-muted/30" style={{ borderColor: 'var(--border)' }}>
                    <td className="p-4 font-medium text-sm" style={{ color: 'var(--text)' }}>{c.deal}</td>
                    <td className="p-4 text-sm" style={{ color: 'var(--muted)' }}>{c.client}</td>
                    <td className="p-4 text-sm font-bold" style={{ color: 'var(--text)' }}>₦{c.amount.toLocaleString()}</td>
                    <td className="p-4 text-sm" style={{ color: 'var(--muted)' }}>{c.rate}</td>
                    <td className="p-4"><span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', sc.class)}>{sc.label}</span></td>
                    <td className="p-4 text-sm" style={{ color: 'var(--muted)' }}>{new Date(c.date).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
