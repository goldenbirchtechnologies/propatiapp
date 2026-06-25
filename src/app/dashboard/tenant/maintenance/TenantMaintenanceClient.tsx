'use client';

import { Wrench } from 'lucide-react';

type Ticket = {
  id: string;
  title: string;
  status: string;
  priority: string;
  createdAt: string;
};

export default function TenantMaintenanceClient({ initialTickets }: { initialTickets: Ticket[] }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-bold" style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}>Maintenance</h1>
        <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>Submit and track maintenance requests</p>
      </div>

      {initialTickets.length === 0 ? (
        <div className="card-body text-center py-16">
          <Wrench className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--muted)', opacity: 0.5 }} />
          <h3 className="font-heading font-bold text-lg mb-2" style={{ color: 'var(--text)' }}>No tickets yet</h3>
          <p style={{ color: 'var(--muted)' }}>Maintenance requests will appear here.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b" style={{ borderColor: 'var(--border)' }}>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Title</th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Priority</th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Status</th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Submitted</th>
            </tr></thead>
            <tbody>
              {initialTickets.map((t) => (
                <tr key={t.id} className="border-b transition-colors hover:bg-muted/30" style={{ borderColor: 'var(--border)' }}>
                  <td className="p-4 font-medium text-sm" style={{ color: 'var(--text)' }}>{t.title}</td>
                  <td className="p-4 text-sm capitalize" style={{ color: 'var(--text)' }}>{t.priority}</td>
                  <td className="p-4 text-sm capitalize" style={{ color: 'var(--muted)' }}>{t.status}</td>
                  <td className="p-4 text-sm" style={{ color: 'var(--muted)' }}>{new Date(t.createdAt).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
