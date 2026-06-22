'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { Shield, CheckCircle, Clock, XCircle, Plus, Eye } from 'lucide-react';

const mockVerifications = [
  { id: 'v1', property: 'Lekki Phase 1 Apartment', stage: 'inspected', updatedAt: '2026-07-10', score: 92 },
  { id: 'v2', property: 'Ikeja GRA Flat', stage: 'pending', updatedAt: '2026-07-12', score: null },
  { id: 'v3', property: 'Victoria Island Duplex', stage: 'certified', updatedAt: '2026-07-08', score: 98 },
];

const stageConfig: Record<string, { class: string; label: string }> = {
  pending: { class: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Pending Inspection' },
  inspected: { class: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Inspected' },
  certified: { class: 'bg-green-50 text-green-700 border-green-200', label: 'Certified' },
  rejected: { class: 'bg-red-50 text-red-700 border-red-200', label: 'Rejected' },
};

export default function LandlordVerifyPage() {
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? mockVerifications : mockVerifications.filter((v) => v.stage === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold" style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}>
            Verify Property
          </h1>
          <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>
            Track 5-layer verification status for your listings
          </p>
        </div>
        <button className="btn btn-primary inline-flex items-center gap-2">
          <Plus className="w-4 h-4" /> Request Inspection
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>Total</p>
              <p className="text-xl font-bold" style={{ color: 'var(--text)' }}>{mockVerifications.length}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-green-50">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>Certified</p>
              <p className="text-xl font-bold" style={{ color: 'var(--text)' }}>{mockVerifications.filter((v) => v.stage === 'certified').length}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-blue-50">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>Inspected</p>
              <p className="text-xl font-bold" style={{ color: 'var(--text)' }}>{mockVerifications.filter((v) => v.stage === 'inspected').length}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-amber-50">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>Pending</p>
              <p className="text-xl font-bold" style={{ color: 'var(--text)' }}>{mockVerifications.filter((v) => v.stage === 'pending').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {['all', 'pending', 'inspected', 'certified', 'rejected'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-md text-sm font-medium border capitalize transition-colors ${filter === f ? 'bg-accent/10 text-accent border-accent/30' : 'border-transparent hover:bg-muted/50'}`}>
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="card-body text-center py-16">
            <Shield className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--muted)', opacity: 0.5 }} />
            <h3 className="font-heading font-bold text-lg mb-2" style={{ color: 'var(--text)' }}>No verifications yet</h3>
            <p style={{ color: 'var(--muted)' }}>Request an inspection to start the verification process.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Property</th>
                <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Stage</th>
                <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Score</th>
                <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Last Updated</th>
                <th className="text-right p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => {
                const sc = stageConfig[v.stage];
                return (
                  <tr key={v.id} className="border-b transition-colors hover:bg-muted/30" style={{ borderColor: 'var(--border)' }}>
                    <td className="p-4">
                      <p className="font-medium text-sm" style={{ color: 'var(--text)' }}>{v.property}</p>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${sc.class}`}>
                        {sc.label}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-mono" style={{ color: 'var(--text)' }}>
                      {v.score ? `${v.score}/100` : '—'}
                    </td>
                    <td className="p-4 text-sm" style={{ color: 'var(--text)' }}>
                      {new Date(v.updatedAt).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-4 text-right">
                      <button className="p-2 rounded-md hover:bg-muted/50 transition-colors">
                        <Eye className="w-4 h-4" style={{ color: 'var(--muted)' }} />
                      </button>
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