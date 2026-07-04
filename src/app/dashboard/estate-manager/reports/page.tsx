'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { BarChart3, TrendingUp, Download, Filter } from 'lucide-react';

export default function EstateManagerReportsPage() {
  const [period, setPeriod] = useState('month');

  const mockBills = [
    { id: '1', description: 'Unit 101 Service Charge', ref: 'TX-1044', amount: 120000, date: '2026-06-01' },
    { id: '2', description: 'Unit 204 Rent', ref: 'TX-1045', amount: 350000, date: '2026-06-02' },
    { id: '3', description: 'Unit 307 Rent', ref: 'TX-1046', amount: 420000, date: '2026-06-03' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold" style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}>
            Reports
          </h1>
          <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>
            Portfolio performance and financial insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select className="inp-field" value={period} onChange={(e) => setPeriod(e.target.value)} style={{ maxWidth: '180px' }}>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button className="btn btn-outline inline-flex items-center gap-2">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-xs" style={{ color: 'var(--muted)' }}>Portfolio Value</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>₦1.2B</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-green-600">Collections</p>
          <p className="text-2xl font-bold text-green-600">₦42M</p>
        </div>
        <div className="card p-4">
          <p className="text-xs" style={{ color: 'var(--muted)' }}>Occupancy</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>87%</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-green-600">Growth</p>
          <p className="text-2xl font-bold text-green-600">+12%</p>
        </div>
      </div>

      {/* Charts placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-heading font-bold mb-4" style={{ color: 'var(--text)' }}>Rent Collection</h2>
          <div className="h-64 flex items-center justify-center border border-dashed rounded-lg" style={{ borderColor: 'var(--border)' }}>
            <div className="text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-2" style={{ color: 'var(--muted)' }} />
              <p className="text-sm" style={{ color: 'var(--muted)' }}>Collection trend chart</p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <h2 className="font-heading font-bold mb-4" style={{ color: 'var(--text)' }}>Occupancy Rate</h2>
          <div className="h-64 flex items-center justify-center border border-dashed rounded-lg" style={{ borderColor: 'var(--border)' }}>
            <div className="text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-2" style={{ color: 'var(--muted)' }} />
              <p className="text-sm" style={{ color: 'var(--muted)' }}>Occupancy trend chart</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent data table */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h3 className="font-heading font-bold" style={{ color: 'var(--text)' }}>Recent Transactions</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Unit</th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Tenant</th>
              <th className="text-right p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Amount</th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {mockBills.map((r) => (
              <tr key={r.id} className="border-b transition-colors hover:bg-muted/30" style={{ borderColor: 'var(--border)' }}>
                <td className="p-4 text-sm" style={{ color: 'var(--text)' }}>{r.description}</td>
                <td className="p-4 text-sm" style={{ color: 'var(--muted)' }}>{r.ref}</td>
                <td className="p-4 text-sm font-medium text-right" style={{ color: 'var(--text)' }}>₦{r.amount.toLocaleString()}</td>
                <td className="p-4 text-sm" style={{ color: 'var(--text)' }}>{new Date(r.date).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}