'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Plus, Download } from 'lucide-react';

type Bill = {
  id: string;
  title: string;
  tenant: string;
  amount: number;
  dueDate: string;
  status: string;
};

const statusConfig: Record<string, { class: string; label: string }> = {
  paid: { class: 'bg-green-50 text-green-700 border-green-200', label: 'Paid' },
  pending: { class: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Pending' },
  overdue: { class: 'bg-red-50 text-red-700 border-red-200', label: 'Overdue' },
};

export default function EstateManagerBillingClient({ initialBills }: { initialBills: Bill[] }) {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? initialBills : initialBills.filter((b) => b.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold" style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}>Billing</h1>
          <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>Manage portfolio invoices and payments</p>
        </div>
        <button className="btn btn-primary inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Generate Invoice</button>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 flex flex-wrap gap-2 border-b" style={{ borderColor: 'var(--border)' }}>
          {['all', 'paid', 'pending', 'overdue'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={cn('px-3 py-1.5 rounded-md text-sm font-medium border capitalize transition-colors', filter === f ? 'bg-accent/10 text-accent border-accent/30' : 'border-transparent hover:bg-muted/50')}>{f}</button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <div className="card-body text-center py-16">
            <p style={{ color: 'var(--muted)' }}>No bills found.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead><tr className="border-b" style={{ borderColor: 'var(--border)' }}>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Title</th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Tenant</th>
              <th className="text-right p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Amount</th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Due</th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Status</th>
              <th className="text-right p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map((b) => {
                const sc = statusConfig[b.status] || statusConfig.pending;
                return (
                  <tr key={b.id} className="border-b transition-colors hover:bg-muted/30" style={{ borderColor: 'var(--border)' }}>
                    <td className="p-4 font-medium text-sm" style={{ color: 'var(--text)' }}>{b.title}</td>
                    <td className="p-4 text-sm" style={{ color: 'var(--muted)' }}>{b.tenant}</td>
                    <td className="p-4 text-sm font-medium text-right" style={{ color: 'var(--text)' }}>₦{b.amount.toLocaleString()}</td>
                    <td className="p-4 text-sm" style={{ color: 'var(--text)' }}>{new Date(b.dueDate).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td className="p-4"><span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', sc.class)}>{sc.label}</span></td>
                    <td className="p-4 text-right"><button className="btn btn-ghost btn-sm"><Download className="w-4 h-4" /></button></td>
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
