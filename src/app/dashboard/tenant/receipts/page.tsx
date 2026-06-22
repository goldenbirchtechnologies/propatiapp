'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { TENANT_NAVIGATION } from '@/lib/navigation';
import { Receipt, Download, Eye } from 'lucide-react';

const mockReceipts = [
  { id: 'r1', ref: 'PAY-001', amount: 2500000, title: 'Annual Rent — Lekki Phase 1 Apartment', date: '2026-07-01', status: 'paid', method: 'Paystack' },
  { id: 'r2', ref: 'PAY-002', amount: 50000, title: 'Stamp Duty', date: '2026-07-01', status: 'paid', method: 'Remita' },
  { id: 'r3', ref: 'PAY-003', amount: 150000, title: 'Service Charge', date: '2026-06-15', status: 'paid', method: 'Paystack' },
  { id: 'r4', ref: 'PAY-004', amount: 2500000, title: 'Annual Rent — Ikeja GRA Flat', date: '2027-01-01', status: 'pending', method: 'Paystack' },
];

const statusConfig: Record<string, { class: string; label: string }> = {
  paid: { class: 'bg-green-50 text-green-700 border-green-200', label: 'Paid' },
  pending: { class: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Pending' },
  failed: { class: 'bg-red-50 text-red-700 border-red-200', label: 'Failed' },
};

export default function TenantReceiptsPage() {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? mockReceipts : mockReceipts.filter((r) => r.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-bold" style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}>Receipts</h1>
        <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>Download rental and transaction receipts</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries({ paid: mockReceipts.filter((r) => r.status === 'paid').length, pending: mockReceipts.filter((r) => r.status === 'pending').length, total: mockReceipts.length, totalValue: mockReceipts.reduce((sum, r) => sum + r.amount, 0) }).map(([key, val]) => (
          <div key={key} className="card p-4">
            <p className="text-xs font-medium capitalize" style={{ color: 'var(--muted)' }}>{key === 'totalValue' ? 'Total Value' : key}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text)' }}>{key === 'totalValue' ? `₦${(val / 1000000).toFixed(1)}M` : val}</p>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 flex flex-wrap gap-2 border-b" style={{ borderColor: 'var(--border)' }}>
          {['all', 'paid', 'pending', 'failed'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-md text-sm font-medium border capitalize transition-colors ${filter === f ? 'bg-accent/10 text-accent border-accent/30' : 'border-transparent hover:bg-muted/50'}`}>{f}</button>
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
              {filtered.map((r) => (
                <tr key={r.id} className="border-b transition-colors hover:bg-muted/30" style={{ borderColor: 'var(--border)' }}>
                  <td className="p-4 font-mono text-sm" style={{ color: 'var(--text)' }}>{r.ref}</td>
                  <td className="p-4 text-sm" style={{ color: 'var(--text)' }}>{r.title}</td>
                  <td className="p-4 text-sm font-medium text-right" style={{ color: 'var(--text)' }}>₦{r.amount.toLocaleString()}</td>
                  <td className="p-4"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig[r.status].class}`}>{statusConfig[r.status].label}</span></td>
                  <td className="p-4 text-sm" style={{ color: 'var(--text)' }}>{new Date(r.date).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-2 rounded-md hover:bg-muted/50"><Eye className="w-4 h-4" style={{ color: 'var(--muted)' }} /></button>
                      <button className="p-2 rounded-md hover:bg-muted/50"><Download className="w-4 h-4" style={{ color: 'var(--muted)' }} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}