'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { TENANT_NAVIGATION } from '@/lib/navigation';
import { Phone, CheckCircle, XCircle, Clock, User, Shield } from 'lucide-react';

const mockScreenings = [
  { id: 's1', landlord: 'Jane Smith', property: 'Ikeja GRA Flat', date: '2026-07-10', status: 'verified', notes: 'Clean record. Able to pay.' },
  { id: 's2', landlord: 'Robert Taylor', property: 'Banana Island Villa', date: '2026-07-12', status: 'pending', notes: 'Awaiting documentation.' },
  { id: 's3', landlord: 'Emma Davis', property: 'Eko Atlantic Penthouse', date: '2026-07-08', status: 'failed', notes: 'Discrepancy found in ID.' },
];

const statusConfig: Record<string, { class: string; label: string; icon: any }> = {
  verified: { class: 'bg-green-50 text-green-700 border-green-200', label: 'Verified', icon: <CheckCircle className="w-3 h-3 mr-1" /> },
  pending: { class: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Pending', icon: <Clock className="w-3 h-3 mr-1" /> },
  failed: { class: 'bg-red-50 text-red-700 border-red-200', label: 'Failed', icon: <XCircle className="w-3 h-3 mr-1" /> },
};

export default function TenantScreeningPage() {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? mockScreenings : mockScreenings.filter((s) => s.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-bold" style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}>Screening Calls</h1>
        <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>View landlord and tenant screening results</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries({ verified: mockScreenings.filter((s) => s.status === 'verified').length, pending: mockScreenings.filter((s) => s.status === 'pending').length, failed: mockScreenings.filter((s) => s.status === 'failed').length }).map(([key, val]) => (
          <div key={key} className="card p-4">
            <p className="text-xs font-medium capitalize" style={{ color: 'var(--muted)' }}>{key}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text)' }}>{val}</p>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 flex flex-wrap gap-2 border-b" style={{ borderColor: 'var(--border)' }}>
          {['all', 'verified', 'pending', 'failed'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-md text-sm font-medium border capitalize transition-colors ${filter === f ? 'bg-accent/10 text-accent border-accent/30' : 'border-transparent hover:bg-muted/50'}`}>{f}</button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <div className="card-body text-center py-16">
            <Phone className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--muted)', opacity: 0.5 }} />
            <h3 className="font-heading font-bold text-lg mb-2" style={{ color: 'var(--text)' }}>No screenings yet</h3>
            <p style={{ color: 'var(--muted)' }}>Screening requests will appear here.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Landlord</th>
                <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Property</th>
                <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Status</th>
                <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Notes</th>
                <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const sc = statusConfig[s.status];
                return (
                  <tr key={s.id} className="border-b transition-colors hover:bg-muted/30" style={{ borderColor: 'var(--border)' }}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full flex items-center justify-center" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}><User className="w-4 h-4" /></div>
                        <span className="font-medium text-sm" style={{ color: 'var(--text)' }}>{s.landlord}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm" style={{ color: 'var(--text)' }}>{s.property}</td>
                    <td className="p-4"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${sc.class}`}>{sc.label}</span></td>
                    <td className="p-4 text-sm" style={{ color: 'var(--muted)' }}>{s.notes}</td>
                    <td className="p-4 text-sm" style={{ color: 'var(--text)' }}>{new Date(s.date).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
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