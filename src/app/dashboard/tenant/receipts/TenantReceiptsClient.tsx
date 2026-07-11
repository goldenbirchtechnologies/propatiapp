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
  released: { class: 'bg-green-50 text-green-700 border-green-200', label: 'Paid' },
  pending: { class: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Pending' },
  failed: { class: 'bg-red-50 text-red-700 border-red-200', label: 'Failed' },
};

export default function TenantReceiptsClient({ initialReceipts }: { initialReceipts: Receipt[] }) {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? initialReceipts : initialReceipts.filter((r) => r.status === filter);

  const totalValue = initialReceipts.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-bold" style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}>Receipts</h1>
        <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>Download rental and transaction receipts</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4"><p className="text-xs" style={{ color: 'var(--muted)' }}>Paid</p><p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{initialReceipts.filter((r) => r.status === 'released').length}</p></div>
        <div className="card p-4"><p className="text-xs" style={{ color: 'var(--muted)' }}>Pending</p><p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{initialReceipts.filter((r) => r.status === 'pending').length}</p></div>
        <div className="card p-4"><p className="text-xs" style={{ color: 'var(--muted)' }}>Total</p><p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{initialReceipts.length}</p></div>
        <div className="card p-4"><p className="text-xs" style={{ color: 'var(--muted)' }}>Total Value</p><p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>₦{(totalValue / 1000000).toFixed(1)}M</p></div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 flex flex-wrap gap-2 border-b" style={{ borderColor: 'var(--border)' }}>
          {['all', 'released', 'pending', 'failed'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={cn('px-3 py-1.5 rounded-md text-sm font-medium border capitalize transition-colors', filter === f ? 'bg-accent/10 text-accent border-accent/30' : 'border-transparent hover:bg-muted/50')}>{f === 'released' ? 'Paid' : f}</button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <div className="card-body text-center py-16">
            <Receipt className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--muted)', opacity: 0.5 }} />
            <h3 className="font-heading font-bold text-lg mb-2" style={{ color: 'var(--text)' }}>No receipts yet</h3>
            <p style={{ color: 'var(--muted)' }}>Purchase history will appear here.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Reference</th>
                <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Description</th>
                <th className="text-right p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Amount</th>
                <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Status</th>
                <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Date</th>
                <th className="text-right p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const sc = statusConfig[r.status] || statusConfig.pending;
                return (
                  <tr key={r.id} className="border-b transition-colors hover:bg-muted/30" style={{ borderColor: 'var(--border)' }}>
                    <td className="p-4 font-mono text-sm" style={{ color: 'var(--text)' }}>{r.ref.slice(-8).toUpperCase()}</td>
                    <td className="p-4 text-sm" style={{ color: 'var(--text)' }}>{r.title}</td>
                    <td className="p-4 text-sm font-medium text-right" style={{ color: 'var(--text)' }}>₦{r.amount.toLocaleString()}</td>
                    <td className="p-4"><span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', sc.class)}>{sc.label}</span></td>
                    <td className="p-4 text-sm" style={{ color: 'var(--text)' }}>{new Date(r.date).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td className="p-4 text-right">
                      <a href={`/api/payments/transactions/${r.id}/receipt`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-md hover:bg-muted/50 inline-flex items-center justify-center">
                        <Download className="w-4 h-4" style={{ color: 'var(--muted)' }} />
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
