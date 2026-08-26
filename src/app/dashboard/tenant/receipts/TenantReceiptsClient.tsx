'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Receipt, Download, Eye } from 'lucide-react';

type Receipt = {
  id: string;
  ref: string;
  amount: number;
  title: string;
  date: string;
  status: string;
  method: string;
};

const statusConfig: Record<string, { class: string; label: string }> = {
  released: { class: 'bg-[#00ff66]/10 text-[#00ff66] border-[#00ff66]/20', label: 'Paid' },
  pending: { class: 'bg-warning/10 text-warning border-warning/20', label: 'Pending' },
  failed: { class: 'bg-red-500/10 text-red-500 border-red-500/20', label: 'Failed' },
};

export default function TenantReceiptsClient({ initialReceipts }: { initialReceipts: Receipt[] }) {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? initialReceipts : initialReceipts.filter((r) => r.status === filter);

  const totalValue = initialReceipts.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-semibold" style={{ fontSize: 'var(--text-page-title)' }}>Receipts</h1>
        <p className="text-zinc-500" style={{ marginTop: 'var(--space-vs)' }}>Download rental and transaction receipts</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4"><p className="text-xs text-zinc-500">Paid</p><p className="text-2xl font-bold text-white">{initialReceipts.filter((r) => r.status === 'released').length}</p></div>
        <div className="glass-card p-4"><p className="text-xs text-zinc-500">Pending</p><p className="text-2xl font-bold text-white">{initialReceipts.filter((r) => r.status === 'pending').length}</p></div>
        <div className="glass-card p-4"><p className="text-xs text-zinc-500">Total</p><p className="text-2xl font-bold text-white">{initialReceipts.length}</p></div>
        <div className="glass-card p-4"><p className="text-xs text-zinc-500">Total Value</p><p className="text-2xl font-bold text-white">₦{(totalValue / 1000000).toFixed(1)}M</p></div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-4 flex flex-wrap gap-2 border-b border-white/[0.08]">
          {['all', 'released', 'pending', 'failed'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={cn('px-3 py-1.5 rounded-md text-sm font-medium border capitalize transition-colors', filter === f ? 'bg-accent/10 text-accent border-accent/30' : 'border-transparent hover:bg-muted/50')}>{f === 'released' ? 'Paid' : f}</button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <div className="card-body text-center py-16">
            <Receipt className="w-12 h-12 text-zinc-500" style={{ opacity: 0.5 }} />
            <h3 className="font-headline-sm text-white mb-2 text-white">No receipts yet</h3>
            <p  className="text-zinc-500">Purchase history will appear here.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.08]">
                <th className="text-left p-4 text-sm font-medium text-zinc-500">Reference</th>
                <th className="text-left p-4 text-sm font-medium text-zinc-500">Description</th>
                <th className="text-right p-4 text-sm font-medium text-zinc-500">Amount</th>
                <th className="text-left p-4 text-sm font-medium text-zinc-500">Status</th>
                <th className="text-left p-4 text-sm font-medium text-zinc-500">Date</th>
                <th className="text-right p-4 text-sm font-medium text-zinc-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const sc = statusConfig[r.status] || statusConfig.pending;
                return (
                  <tr key={r.id} className="border-b transition-colors hover:bg-muted/30 border-white/[0.08]">
                    <td className="p-4 font-mono text-sm text-white">{r.ref.slice(-8).toUpperCase()}</td>
                    <td className="p-4 text-sm text-white">{r.title}</td>
                    <td className="p-4 text-sm font-medium text-right text-white">₦{r.amount.toLocaleString()}</td>
                    <td className="p-4"><span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', sc.class)}>{sc.label}</span></td>
                    <td className="p-4 text-sm text-white">{new Date(r.date).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td className="p-4 text-right">
                      <a href={`/api/payments/transactions/${r.id}/receipt`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-md hover:bg-muted/50 inline-flex items-center justify-center">
                        <Download className="w-4 h-4 text-zinc-500" />
                      </a>
                    </td>
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
