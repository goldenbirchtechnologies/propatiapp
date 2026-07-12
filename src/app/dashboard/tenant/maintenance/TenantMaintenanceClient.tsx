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
        <h1 className="$1 $2" style={{ fontSize: 'var(--text-page-title)' }}>Maintenance</h1>
        <p className="text-on-surface-variant" style={{ marginTop: 'var(--space-vs)' }}>Submit and track maintenance requests</p>
      </div>

      {initialTickets.length === 0 ? (
        <div className="card-body text-center py-16">
          <Wrench className="$1 $2" style={{ opacity: 0.5 }} />
          <h3 className="font-headline-sm text-headline-sm mb-2 text-primary">No tickets yet</h3>
          <p  className="text-on-surface-variant">Maintenance requests will appear here.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-outline-variant">
              <th className="text-left p-4 text-sm font-medium text-on-surface-variant">Title</th>
              <th className="text-left p-4 text-sm font-medium text-on-surface-variant">Priority</th>
              <th className="text-left p-4 text-sm font-medium text-on-surface-variant">Status</th>
              <th className="text-left p-4 text-sm font-medium text-on-surface-variant">Submitted</th>
            </tr></thead>
            <tbody>
              {initialTickets.map((t) => (
                <tr key={t.id} className="border-b transition-colors hover:bg-muted/30 border-outline-variant">
                  <td className="p-4 font-medium text-sm text-primary">{t.title}</td>
                  <td className="p-4 text-sm capitalize text-primary">{t.priority}</td>
                  <td className="p-4 text-sm capitalize text-on-surface-variant">{t.status}</td>
                  <td className="p-4 text-sm text-on-surface-variant">{new Date(t.createdAt).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
