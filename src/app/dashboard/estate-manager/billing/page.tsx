'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { Receipt, CreditCard, Clock, CheckCircle, Download, AlertCircle } from 'lucide-react';

const mockBills = [
  { id: 'b1', ref: 'INV-001', amount: 500000, description: 'Q2 Platform Subscription', date: '2026-07-01', status: 'paid', due: '2026-07-31' },
  { id: 'b2', ref: 'INV-002', amount: 150000, description: 'Add-on: Extra 500 Listings', date: '2026-07-05', status: 'pending', due: '2026-07-15' },
  { id: 'b3', ref: 'INV-003', amount: 250000, description: 'Q2 Platform Subscription', date: '2026-04-01', status: 'paid', due: '2026-04-30' },
];

const statusConfig: Record<string, { class: string; label: string; icon: any }> = {
  paid: { class: 'bg-green-50 text-green-700 border-green-200', label: 'Paid', icon: <CheckCircle className="w-3 h-3 mr-1" /> },
  pending: { class: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Pending', icon: <Clock className="w-3 h-3 mr-1" /> },
  overdue: { class: 'bg-red-50 text-red-700 border-red-200', label: 'Overdue', icon: <AlertCircle className="w-3 h-3 mr-1" /> },
};

export default function EstateManagerBillingPage() {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? mockBills : mockBills.filter((b) => b.status === filter);
  const totalPaid = mockBills.filter((b) => b.status === 'paid').reduce((s, b) => s + b.amount, 0);
  const totalPending = mockBills.filter((b) => b.status === 'pending').reduce((s, b) => s + b.amount, 0);

  return (
    <div className="space-y-6">
      <div><h1 className="font-heading font-bold" style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}>Billing</h1><p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>Subscription and invoice management</p></div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4"><p className="text-xs" style={{ color: 'var(--muted)' }}>Total Paid</p><p className="text-2xl font-bold text-green-600">₦{totalPaid.toLocaleString()}</p></div>
        <div className="card p-4"><p className="text-xs text-amber-600">Pending</p><p className="text-2xl font-bold text-amber-600">₦{totalPending.toLocaleString()}</p></div>
        <div className="card p-4"><p className="text-xs" style={{ color: 'var(--muted)' }}>Invoices</p><p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{mockBills.length}</p></div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 flex justify-end gap-2 border-b" style={{ borderColor: 'var(--border)' }}>
          <button className="btn btn-outline inline-flex items-center gap-2"><CreditCard className="w-4 h-4" /> Pay Now</button>
        </div>
        <table className="w-full">
          <thead><tr className="border-b" style={{ borderColor: 'var(--border)' }}>
            <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Reference</th>
            <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Description</th>
            <th className="text-right p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Amount</th>
            <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Due</th>
            <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Status</th>
            <th className="text-right p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Actions</th>
          </tr></thead>
          <tbody>
            {filtered.map((bill) => {
              const sc = statusConfig[bill.status];
              return (
                <tr key={bill.id} className="border-b transition-colors hover:bg-muted/30" style={{ borderColor: 'var(--border)' }}>
                  <td className="p-4 font-mono text-sm" style={{ color: 'var(--text)' }}>{bill.ref}</td>
                  <td className="p-4 text-sm" style={{ color: 'var(--text)' }}>{bill.description}</td>
                  <td className="p-4 text-sm font-medium text-right" style={{ color: 'var(--text)' }}>₦{bill.amount.toLocaleString()}</td>
                  <td className="p-4 text-sm" style={{ color: 'var(--text)' }}>{new Date(bill.due).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td className="p-4"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${sc.class}`}>{sc.label}</span></td>
                  <td className="p-4 text-right"><button className="p-2 rounded-md hover:bg-muted/50"><Download className="w-4 h-4" style={{ color: 'var(--muted)' }} /></button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}