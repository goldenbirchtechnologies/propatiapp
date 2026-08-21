'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Plus, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type Bill = {
  id: string;
  title: string;
  tenant: string;
  amount: number;
  dueDate: string;
  status: string;
};

const statusConfig: Record<string, { class: string; label: string }> = {
  paid: { class: 'bg-success/10 text-[#00ff66] border border-[#262626]', label: 'Paid' },
  pending: { class: 'bg-warning/10 text-warning border border-[#262626]', label: 'Pending' },
  overdue: { class: 'bg-red-500/10 text-red-500 border border-[#262626]', label: 'Overdue' },
};

export default function EstateManagerBillingClient({ initialBills }: { initialBills: Bill[] }) {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? initialBills : initialBills.filter((b) => b.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-headline-sm font-bold" style={{ fontSize: 'font-headline-sm', color: 'text-white' }}>Billing</h1>
          <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-muted-foreground', marginTop: 'mt-1' }}>Manage portfolio invoices and payments</p>
        </div>
        <button className="btn btn-primary inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Generate Invoice</button>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 flex flex-wrap gap-2 border-b border-[#262626]">
          {['all', 'paid', 'pending', 'overdue'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={cn('px-3 py-1.5 rounded-md text-sm font-medium border capitalize transition-colors', filter === f ? 'text-white border-[#262626] bg-surface' : 'border-transparent hover:bg-muted/50')}>{f}</button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <div className="card-body text-center py-16">
            <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-muted-foreground' }}>No bills found.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#262626]">
                <th className="text-left p-4 text-sm font-label-md uppercase tracking-wider" style={{ color: 'text-muted-foreground' }}>Title</th>
                <th className="text-left p-4 text-sm font-label-md uppercase tracking-wider" style={{ color: 'text-muted-foreground' }}>Tenant</th>
                <th className="text-right p-4 text-sm font-label-md uppercase tracking-wider" style={{ color: 'text-muted-foreground' }}>Amount</th>
                <th className="text-left p-4 text-sm font-label-md uppercase tracking-wider" style={{ color: 'text-muted-foreground' }}>Due</th>
                <th className="text-left p-4 text-sm font-label-md uppercase tracking-wider" style={{ color: 'text-muted-foreground' }}>Status</th>
                <th className="text-right p-4 text-sm font-label-md uppercase tracking-wider" style={{ color: 'text-muted-foreground' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => {
                const sc = statusConfig[b.status] || statusConfig.pending;
                return (
                  <tr key={b.id} className="border-b transition-colors hover:bg-muted/30 border-[#262626]">
                    <td className="p-4 font-medium text-sm" className="text-white">{b.title}</td>
                    <td className="p-4 text-sm" style={{ color: 'text-muted-foreground' }}>{b.tenant}</td>
                    <td className="p-4 text-sm font-medium text-right" className="text-white">₦{b.amount.toLocaleString()}</td>
                    <td className="p-4 text-sm" className="text-white">{new Date(b.dueDate).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td className="p-4">
                      <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', sc.class)}>{sc.label}</span>
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="icon"><Download className="w-4 h-4" /></Button>
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
