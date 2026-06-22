'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { Phone, Clock, CheckCircle, XCircle, MoreVertical, Calendar, User } from 'lucide-react';

const mockScreenings = [
  { id: '1', tenant: 'John Doe', property: 'Lekki Phase 1 Apartment', scheduledAt: '2026-07-15T10:00:00Z', status: 'scheduled', phone: '0803 456 7890' },
  { id: '2', tenant: 'Mary Johnson', property: 'Ikeja GRA Flat', scheduledAt: '2026-07-14T14:30:00Z', status: 'completed', phone: '0806 123 4567' },
  { id: '3', tenant: 'Peter Okonkwo', property: 'Victoria Island Duplex', scheduledAt: '2026-07-13T09:00:00Z', status: 'completed', phone: '0809 987 6543' },
  { id: '4', tenant: 'Sarah Williams', property: 'Ajah Studio', scheduledAt: '2026-07-16T11:00:00Z', status: 'cancelled', phone: '0703 111 2222' },
];

const statusConfig: Record<string, { class: string; label: string; icon: any }> = {
  scheduled: { class: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Scheduled', icon: <Clock className="w-3 h-3 mr-1" /> },
  completed: { class: 'bg-green-50 text-green-700 border-green-200', label: 'Completed', icon: <CheckCircle className="w-3 h-3 mr-1" /> },
  cancelled: { class: 'bg-red-50 text-red-700 border-red-200', label: 'Cancelled', icon: <XCircle className="w-3 h-3 mr-1" /> },
};

export default function LandlordScreeningPage() {
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? mockScreenings : mockScreenings.filter((s) => s.status === filter);

  const stats = {
    all: mockScreenings.length,
    scheduled: mockScreenings.filter((s) => s.status === 'scheduled').length,
    completed: mockScreenings.filter((s) => s.status === 'completed').length,
    cancelled: mockScreenings.filter((s) => s.status === 'cancelled').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-bold" style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}>
          Screening Calls
        </h1>
        <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>
          Review tenant screening results and verification history
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Total Screenings</p>
          <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text)' }}>{stats.all}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Scheduled</p>
          <p className="text-2xl font-bold mt-1" style={{ color: 'var(--blue)' }}>{stats.scheduled}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Completed</p>
          <p className="text-2xl font-bold mt-1 text-green-600">{stats.completed}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Cancelled</p>
          <p className="text-2xl font-bold mt-1 text-red-600">{stats.cancelled}</p>
        </div>
      </div>

      {/* Content */}
      <div className="card overflow-hidden">
        <div className="p-4 flex flex-wrap gap-2 border-b" style={{ borderColor: 'var(--border)' }}>
          {['all', 'scheduled', 'completed', 'cancelled'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors capitalize ${filter === f ? 'bg-accent/10 text-accent border-accent/30' : 'border-transparent hover:bg-muted/50'}`}
            >
              {f}
            </button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <div className="card-body text-center py-16">
            <Phone className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--muted)', opacity: 0.5 }} />
            <h3 className="font-heading font-bold text-lg mb-2" style={{ color: 'var(--text)' }}>No screenings found</h3>
            <p style={{ color: 'var(--muted)' }}>Screening calls will appear here once scheduled.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                  <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Tenant</th>
                  <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Property</th>
                  <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Scheduled</th>
                  <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Status</th>
                  <th className="text-right p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const sc = statusConfig[s.status];
                  return (
                    <tr key={s.id} className="border-b transition-colors hover:bg-muted/30" style={{ borderColor: 'var(--border)' }}>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-medium text-sm" style={{ color: 'var(--text)' }}>{s.tenant}</p>
                            <p className="text-xs" style={{ color: 'var(--muted)' }}>{s.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm" style={{ color: 'var(--text)' }}>{s.property}</td>
                      <td className="p-4 text-sm" style={{ color: 'var(--text)' }}>
                        {new Date(s.scheduledAt).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}
                        <span className="block text-xs" style={{ color: 'var(--muted)' }}>
                          {new Date(s.scheduledAt).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${sc.class}`}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button className="p-2 rounded-md hover:bg-muted/50 transition-colors">
                          <MoreVertical className="w-4 h-4" style={{ color: 'var(--muted)' }} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}