'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import { Eye, Calendar, MapPin, CheckCircle, Clock, XCircle, Plus } from 'lucide-react';

const mockInspections = [
  { id: 'i1', property: 'Lekki Phase 1 Apartment', landlord: 'Jane Smith', tenant: 'John Doe', date: '2026-07-15T10:00:00Z', status: 'scheduled', notes: 'Initial inspection scheduled' },
  { id: 'i2', property: 'Victoria Island Duplex', landlord: 'Jane Smith', tenant: 'Peter Okonkwo', date: '2026-07-08T14:00:00Z', status: 'completed', notes: 'All checks passed' },
  { id: 'i3', property: 'Banana Island Villa', landlord: 'Jane Smith', tenant: 'Emma Davis', date: '2026-07-05T09:00:00Z', status: 'cancelled', notes: 'Postponed by landlord' },
];

const statusConfig: Record<string, { class: string; label: string; icon: any }> = {
  scheduled: { class: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Scheduled', icon: <Clock className="w-3 h-3 mr-1" /> },
  completed: { class: 'bg-green-50 text-green-700 border-green-200', label: 'Completed', icon: <CheckCircle className="w-3 h-3 mr-1" /> },
  cancelled: { class: 'bg-red-50 text-red-700 border-red-200', label: 'Cancelled', icon: <XCircle className="w-3 h-3 mr-1" /> },
};

export default function AgentInspectionsPage() {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? mockInspections : mockInspections.filter((i) => i.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold" style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}>Inspections</h1>
          <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>Schedule and track property inspections</p>
        </div>
        <button className="btn btn-primary inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Schedule Inspection</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4"><p className="text-xs" style={{ color: 'var(--muted)' }}>Total</p><p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{mockInspections.length}</p></div>
        <div className="card p-4"><p className="text-xs" style={{ color: 'var(--muted)' }}>Scheduled</p><p className="text-2xl font-bold text-blue-600">{mockInspections.filter((i) => i.status === 'scheduled').length}</p></div>
        <div className="card p-4"><p className="text-xs" style={{ color: 'var(--muted)' }}>Completed</p><p className="text-2xl font-bold text-green-600">{mockInspections.filter((i) => i.status === 'completed').length}</p></div>
        <div className="card p-4"><p className="text-xs" style={{ color: 'var(--muted)' }}>Cancelled</p><p className="text-2xl font-bold text-red-600">{mockInspections.filter((i) => i.status === 'cancelled').length}</p></div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 flex flex-wrap gap-2 border-b" style={{ borderColor: 'var(--border)' }}>
          {['all', 'scheduled', 'completed', 'cancelled'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-md text-sm font-medium border capitalize transition-colors ${filter === f ? 'bg-accent/10 text-accent border-accent/30' : 'border-transparent hover:bg-muted/50'}`}>{f}</button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <div className="card-body text-center py-16"><Eye className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--muted)', opacity: 0.5 }} /><h3 className="font-heading font-bold text-lg mb-2" style={{ color: 'var(--text)' }}>No inspections</h3><p style={{ color: 'var(--muted)' }}>Schedule a new inspection to get started.</p></div>
        ) : (
          <table className="w-full">
            <thead><tr className="border-b" style={{ borderColor: 'var(--border)' }}>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Property</th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Landlord</th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Tenant</th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Date</th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Status</th>
              <th className="text-right p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map((insp) => {
                const sc = statusConfig[insp.status];
                return (
                  <tr key={insp.id} className="border-b transition-colors hover:bg-muted/30" style={{ borderColor: 'var(--border)' }}>
                    <td className="p-4 font-medium text-sm" style={{ color: 'var(--text)' }}>{insp.property}</td>
                    <td className="p-4 text-sm" style={{ color: 'var(--muted)' }}>{insp.landlord}</td>
                    <td className="p-4 text-sm" style={{ color: 'var(--muted)' }}>{insp.tenant}</td>
                    <td className="p-4 text-sm" style={{ color: 'var(--text)' }}>{new Date(insp.date).toLocaleString('en-NG', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="p-4"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${sc.class}`}>{sc.label}</span></td>
                    <td className="p-4 text-right"><button className="p-2 rounded-md hover:bg-muted/50"><MapPin className="w-4 h-4" style={{ color: 'var(--muted)' }} /></button></td>
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