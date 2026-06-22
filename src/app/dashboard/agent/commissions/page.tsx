'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import { DollarSign, TrendingUp, Download } from 'lucide-react';

const mockCommissions = [
  { id: 'c1', deal: '3-Bed Lekki Apartment — John Doe', amount: 150000, rate: '5%', date: '2026-07-10', status: 'paid' },
  { id: 'c2', deal: 'Lekki Phase 1 — Mary Johnson', amount: 90000, rate: '5%', date: '2026-07-08', status: 'paid' },
  { id: 'c3', deal: 'VI Duplex — Peter Okonkwo', amount: 300000, rate: '3.75%', date: '2026-07-05', status: 'pending' },
  { id: 'c4', deal: 'Ikeja GRA Flat — Sarah Williams', amount: 80000, rate: '5%', date: '2026-06-28', status: 'paid' },
];

const statusConfig: Record<string, { class: string; label: string }> = {
  paid: { class: 'bg-green-50 text-green-700 border-green-200', label: 'Paid' },
  pending: { class: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Pending' },
  cancelled: { class: 'bg-red-50 text-red-700 border-red-200', label: 'Cancelled' },
};

export default function AgentCommissionsPage() {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? mockCommissions : mockCommissions.filter((c) => c.status === filter);
  const totalPaid = mockCommissions.filter((c) => c.status === 'paid').reduce((s, c) => s + c.amount, 0);
  const totalPending = mockCommissions.filter((c) => c.status === 'pending').reduce((s, c) => s + c.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-bold" style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}>Commissions</h1>
        <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>Track earnings and payouts per deal</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4"><p className="text-xs" style={{ color: 'var(--muted)' }}>Total Earned</p><p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>₦{(totalPaid + totalPending).toLocaleString()}</p></div>
        <div className="card p-4"><p className="text-xs text-green-600">Paid Out</p><p className="text-2xl font-bold text-green-600">₦{totalPaid.toLocaleString()}</p></div>
        <div className="card p-4"><p className="text-xs text-amber-600">Pending</p><p className="text-2xl font-bold text-amber-600">₦{totalPending.toLocaleString()}</p></div>
      </div>

      <div className="card p-4 flex flex-wrap gap-4 items-center justify-between">
        <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Commission summary</p>
        <button className="btn btn-outline inline-flex items-center gap-2"><Download className="w-4 h-4" /> Export CSV</button>
      </div>
    </div>
  );
}