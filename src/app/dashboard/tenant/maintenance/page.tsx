'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { TENANT_NAVIGATION } from '@/lib/navigation';
import { Wrench, Plus, AlertCircle, Clock, CheckCircle, XCircle, Trash2, MessageSquare } from 'lucide-react';

const mockTickets = [
  { id: 't1', title: 'Water leak in bathroom', property: 'Lekki Phase 1 Apt', status: 'in_progress', priority: 'high', createdAt: '2026-07-10', tenant: 'John Doe' },
  { id: 't2', title: 'AC not cooling', property: 'Lekki Phase 1 Apt', status: 'open', priority: 'medium', createdAt: '2026-07-12', tenant: 'John Doe' },
  { id: 't3', title: 'Broken door lock', property: 'Victoria Island Flat', status: 'resolved', priority: 'high', createdAt: '2026-07-05', tenant: 'Mary Johnson' },
  { id: 't4', title: 'Internet outage', property: 'Victoria Island Flat', status: 'resolved', priority: 'low', createdAt: '2026-07-08', tenant: 'Mary Johnson' },
];

const statusConfig: Record<string, { class: string; label: string; icon: any }> = {
  open: { class: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Open', icon: <AlertCircle className="w-3 h-3 mr-1" /> },
  in_progress: { class: 'bg-amber-50 text-amber-700 border-amber-200', label: 'In Progress', icon: <Clock className="w-3 h-3 mr-1" /> },
  resolved: { class: 'bg-green-50 text-green-700 border-green-200', label: 'Resolved', icon: <CheckCircle className="w-3 h-3 mr-1" /> },
  cancelled: { class: 'bg-red-50 text-red-700 border-red-200', label: 'Cancelled', icon: <XCircle className="w-3 h-3 mr-1" /> },
};

export default function TenantMaintenancePage() {
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? mockTickets : mockTickets.filter((t) => t.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold" style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}>
            Maintenance Requests
          </h1>
          <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>
            Track repair requests and updates
          </p>
        </div>
        <button className="btn btn-primary inline-flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Request
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries({ all: mockTickets.length, open: mockTickets.filter((t) => t.status === 'open').length, in_progress: mockTickets.filter((t) => t.status === 'in_progress').length, resolved: mockTickets.filter((t) => t.status === 'resolved').length }).map(([key, val]) => (
          <div key={key} className="card p-4">
            <p className="text-xs font-medium capitalize" style={{ color: 'var(--muted)' }}>{key.replace('_', ' ')}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text)' }}>{val}</p>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 flex flex-wrap gap-2 border-b" style={{ borderColor: 'var(--border)' }}>
          {['all', 'open', 'in_progress', 'resolved', 'cancelled'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-md text-sm font-medium border capitalize transition-colors ${filter === f ? 'bg-accent/10 text-accent border-accent/30' : 'border-transparent hover:bg-muted/50'}`}>
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <div className="card-body text-center py-16">
            <Wrench className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--muted)', opacity: 0.5 }} />
            <h3 className="font-heading font-bold text-lg mb-2" style={{ color: 'var(--text)' }}>No maintenance requests</h3>
            <p style={{ color: 'var(--muted)' }}>Create a request to get repairs started.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Request</th>
                <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Property</th>
                <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Priority</th>
                <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Status</th>
                <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Date</th>
                <th className="text-right p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ticket) => {
                const sc = statusConfig[ticket.status];
                return (
                  <tr key={ticket.id} className="border-b transition-colors hover:bg-muted/30" style={{ borderColor: 'var(--border)' }}>
                    <td className="p-4">
                      <p className="font-medium text-sm" style={{ color: 'var(--text)' }}>{ticket.title}</p>
                      <p className="text-xs" style={{ color: 'var(--muted)' }}>#{ticket.id.slice(-6).toUpperCase()}</p>
                    </td>
                    <td className="p-4 text-sm" style={{ color: 'var(--text)' }}>{ticket.property}</td>
                    <td className="p-4 text-sm capitalize" style={{ color: 'var(--text)' }}>{ticket.priority}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${sc.class}`}>{sc.label}</span>
                    </td>
                    <td className="p-4 text-sm" style={{ color: 'var(--text)' }}>
                      {new Date(ticket.createdAt).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-2 rounded-md hover:bg-muted/50"><MessageSquare className="w-4 h-4" style={{ color: 'var(--muted)' }} /></button>
                        <button className="p-2 rounded-md hover:bg-muted/50"><Trash2 className="w-4 h-4" style={{ color: 'var(--muted)' }} /></button>
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