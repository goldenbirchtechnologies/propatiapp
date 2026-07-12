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
  released: { class: 'bg-success-bright/10 text-success border-success-bright/20', label: 'Paid' },
  pending: { class: 'bg-warning/10 text-warning border-warning/20', label: 'Pending' },
  failed: { class: 'bg-destructive/10 text-destructive border-destructive/20', label: 'Failed' },
};

export default function TenantReceiptsClient({ initialReceipts }: { initialReceipts: Receipt[] }) {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? initialReceipts : initialReceipts.filter((r) => r.status === filter);

  const totalValue = initialReceipts.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="$1 $2" style={{ fontSize: 'var(--text-page-title)' }}>Receipts</h1>
        <p className="text-on-surface-variant" style={{ marginTop: 'var(--space-vs)' }}>Download rental and transaction receipts</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4"><p className="text-xs text-on-surface-variant">Paid</p><p className="text-2xl font-bold text-primary">{initialReceipts.filter((r) => r.status === 'released').length}</p></div>
        <div className="card p-4"><p className="text-xs text-on-surface-variant">Pending</p><p className="text-2xl font-bold text-primary">{initialReceipts.filter((r) => r.status === 'pending').length}</p></div>
        <div className="card p-4"><p className="text-xs text-on-surface-variant">Total</p><p className="text-2xl font-bold text-primary">{initialReceipts.length}</p></div>
        <div className="card p-4"><p className="text-xs text-on-surface-variant">Total Value</p><p className="text-2xl font-bold text-primary">₦{(totalValue / 1000000).toFixed(1)}M</p></div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 flex flex-wrap gap-2 border-b border-outline-variant">
          {['all', 'released', 'pending', 'failed'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={cn('px-3 py-1.5 rounded-md text-sm font-medium border capitalize transition-colors', filter === f ? 'bg-accent/10 text-accent border-accent/30' : 'border-transparent hover:bg-muted/50')}>{f === 'released' ? 'Paid' : f}</button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <div className="card-body text-center py-16">
            <Receipt className="$1 $2" style={{ opacity: 0.5 }} />
            <h3 className="font-headline-sm text-headline-sm mb-2 text-primary">No receipts yet</h3>
            <p  className="text-on-surface-variant">Purchase history will appear here.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant">
                <th className="text-left p-4 text-sm font-medium text-on-surface-variant">Reference</th>
                <th className="text-left p-4 text-sm font-medium text-on-surface-variant">Description</th>
                <th className="text-right p-4 text-sm font-medium text-on-surface-variant">Amount</th>
                <th className="text-left p-4 text-sm font-medium text-on-surface-variant">Status</th>
                <th className="text-left p-4 text-sm font-medium text-on-surface-variant">Date</th>
                <th className="text-right p-4 text-sm font-medium text-on-surface-variant">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const sc = statusConfig[r.status] || statusConfig.pending;
                return (
                  <tr key={r.id} className="border-b transition-colors hover:bg-muted/30 border-outline-variant">
                    <td className="p-4 font-mono text-sm text-primary">{r.ref.slice(-8).toUpperCase()}</td>
                    <td className="p-4 text-sm text-primary">{r.title}</td>
                    <td className="p-4 text-sm font-medium text-right text-primary">₦{r.amount.toLocaleString()}</td>
                    <td className="p-4"><span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', sc.class)}>{sc.label}</span></td>
                    <td className="p-4 text-sm text-primary">{new Date(r.date).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td className="p-4 text-right">
                      <a href={`/api/payments/transactions/${r.id}/receipt`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-md hover:bg-muted/50 inline-flex items-center justify-center">
                        <Download className="w-4 h-4 text-on-surface-variant" />
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
