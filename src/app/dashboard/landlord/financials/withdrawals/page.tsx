'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { AccountBalanceWallet, Download, Plus } from 'lucide-react';

const withdrawals = [
  { id: 'w1', date: '2024-11-01', amount: 450000, method: 'Bank Transfer', status: 'completed', ref: 'WD-88421' },
  { id: 'w2', date: '2024-10-15', amount: 320000, method: 'Bank Transfer', status: 'completed', ref: 'WD-88420' },
  { id: 'w3', date: '2024-10-01', amount: 180000, method: 'Mobile Money', status: 'pending', ref: 'WD-88419' },
];

export default function LandlordWithdrawalsPage() {
  const [error, setError] = useState<string | null>(null);

  if (error) {
    return (
      <DashboardShell navigation={LANDLORD_NAVIGATION}>
        <section className="space-y-6">
          <h1 className="text-3xl font-bold text-foreground">Withdrawals</h1>
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6">
            <p className="text-destructive font-medium">Error</p>
            <p className="text-destructive text-sm mt-1">{error}</p>
            <button onClick={() => setError(null)} className="mt-4 px-4 py-2 bg-destructive text-white rounded-lg hover:bg-destructive">Retry</button>
          </div>
        </section>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell navigation={LANDLORD_NAVIGATION}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Withdrawals &amp; Fund Management</h1>
            <p className="text-muted-foreground mt-1">Manage your payouts and fund transfers.</p>
          </div>
          <div className="flex gap-3">
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-surface-container-lowest hover:bg-surface-container-low transition-colors text-sm font-medium">
              <Download className="w-4 h-4" /> Export History
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors text-sm font-medium shadow-md">
              <Plus className="w-4 h-4" /> Request Payout
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-outline-variant shadow-sm overflow-hidden bg-surface-container-lowest">
          <div className="p-5 border-b border-outline-variant">
            <h3 className="font-heading font-bold text-primary">Recent Withdrawals</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-high border-b border-outline-variant">
                <tr>
                  <th className="px-5 py-4 text-sm font-medium text-muted-foreground">Reference</th>
                  <th className="px-5 py-4 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="px-5 py-4 text-sm font-medium text-muted-foreground">Method</th>
                  <th className="px-5 py-4 text-sm font-medium text-muted-foreground">Amount</th>
                  <th className="px-5 py-4 text-sm font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {withdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-5 py-4 text-sm font-mono text-muted-foreground">{w.ref}</td>
                    <td className="px-5 py-4 text-sm text-primary">{w.date}</td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">{w.method}</td>
                    <td className="px-5 py-4 text-sm font-medium text-primary">₦{w.amount.toLocaleString()}</td>
                    <td className="px-5 py-4">
                      <span className={`tag ${w.status === 'completed' ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'}`}>
                        {w.status === 'completed' ? 'Completed' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
