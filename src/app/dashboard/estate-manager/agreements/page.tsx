'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { FileText, Plus, Eye, Download, CheckCircle, Clock, XCircle } from 'lucide-react';

const mockAgreements = [
  { id: 'a1', ref: 'AGR-001', title: 'Rental — Lekki Phase 1 Apartment', tenant: 'John Doe', landlord: 'Jane Smith', start: '2026-01-01', end: '2026-12-31', rent: 2500000, status: 'fully_signed' },
  { id: 'a2', ref: 'AGR-002', title: 'Rental — Ikeja GRA Flat', tenant: 'Mary Johnson', landlord: 'Jane Smith', start: '2026-02-01', end: '2027-01-31', rent: 1800000, status: 'pending' },
  { id: 'a3', ref: 'AGR-003', title: 'Sale — Victoria Island Duplex', tenant: 'Peter Okonkwo', landlord: 'Jane Smith', start: '2026-03-01', end: '2026-03-01', rent: 25000000, status: 'draft' },
];

const statusConfig: Record<string, { class: string; label: string; icon: any }> = {
  draft: { class: 'bg-gray-50 text-gray-700 border-gray-200', label: 'Draft', icon: <FileText className="w-3 h-3 mr-1" /> },
  pending: { class: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Pending', icon: <Clock className="w-3 h-3 mr-1" /> },
  fully_signed: { class: 'bg-green-50 text-green-700 border-green-200', label: 'Fully Signed', icon: <CheckCircle className="w-3 h-3 mr-1" /> },
  terminated: { class: 'bg-red-50 text-red-700 border-red-200', label: 'Terminated', icon: <XCircle className="w-3 h-3 mr-1" /> },
};

export default function EstateManagerAgreementsPage() {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? mockAgreements : mockAgreements.filter((a) => a.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="font-heading font-bold" style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}>Agreements</h1><p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>Track and manage portfolio agreements</p></div>
        <button className="btn btn-primary inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Create Agreement</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4"><p className="text-xs" style={{ color: 'var(--muted)' }}>Total</p><p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{mockAgreements.length}</p></div>
        <div className="card p-4"><p className="text-xs text-green-600">Signed</p><p className="text-2xl font-bold text-green-600">{mockAgreements.filter((a) => a.status === 'fully_signed').length}</p></div>
        <div className="card p-4"><p className="text-xs text-amber-600">Pending</p><p className="text-2xl font-bold text-amber-600">{mockAgreements.filter((a) => a.status === 'pending').length}</p></div>
        <div className="card p-4"><p className="text-xs" style={{ color: 'var(--muted)' }}>Draft</p><p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{mockAgreements.filter((a) => a.status === 'draft').length}</p></div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 flex flex-wrap gap-2 border-b" style={{ borderColor: 'var(--border)' }}>
          {['all', 'draft', 'pending', 'fully_signed', 'terminated'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-md text-sm font-medium border capitalize transition-colors ${filter === f ? 'bg-accent/10 text-accent border-accent/30' : 'border-transparent hover:bg-muted/50'}`}>{f === 'all' ? 'All' : f.replace('_', ' ')}</button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <div className="card-body text-center py-16"><FileText className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--muted)', opacity: 0.5 }} /><h3 className="font-heading font-bold text-lg mb-2" style={{ color: 'var(--text)' }}>No agreements</h3><p style={{ color: 'var(--muted)' }}>Create your first agreement.</p></div>
        ) : (
          <table className="w-full">
            <thead><tr className="border-b" style={{ borderColor: 'var(--border)' }}>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Reference</th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Title</th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Parties</th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Period</th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Rent/Price</th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Status</th>
              <th className="text-right p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map((a) => {
                const sc = statusConfig[a.status];
                return (
                  <tr key={a.id} className="border-b transition-colors hover:bg-muted/30" style={{ borderColor: 'var(--border)' }}>
                    <td className="p-4 font-mono text-sm" style={{ color: 'var(--text)' }}>{a.ref}</td>
                    <td className="p-4 text-sm" style={{ color: 'var(--text)' }}>{a.title}</td>
                    <td className="p-4 text-sm" style={{ color: 'var(--muted)' }}>{a.tenant} / {a.landlord}</td>
                    <td className="p-4 text-sm" style={{ color: 'var(--text)' }}>{new Date(a.start).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })} — {new Date(a.end).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td className="p-4 text-sm" style={{ color: 'var(--text)' }}>₦{a.rent.toLocaleString()}</td>
                    <td className="p-4"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${sc.class}`}>{sc.label}</span></td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-2 rounded-md hover:bg-muted/50"><Eye className="w-4 h-4" style={{ color: 'var(--muted)' }} /></button>
                        <button className="p-2 rounded-md hover:bg-muted/50"><Download className="w-4 h-4" style={{ color: 'var(--muted)' }} /></button>
                      </div>
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