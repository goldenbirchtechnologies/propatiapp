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
        <h1 className="font-heading font-semibold" style={{ fontSize: 'var(--text-page-title)' }}>Maintenance</h1>
        <p className="text-neutral-400" style={{ marginTop: 'var(--space-vs)' }}>Submit and track maintenance requests</p>
      </div>

      {initialTickets.length === 0 ? (
        <div className="card-body text-center py-16">
          <Wrench style={{ opacity: 0.5 }} />
          <h3 className="font-headline-sm text-headline-sm mb-2 text-white">No tickets yet</h3>
          <p  className="text-neutral-400">Maintenance requests will appear here.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-[#262626]">
              <th className="text-left p-4 text-sm font-medium text-neutral-400">Title</th>
              <th className="text-left p-4 text-sm font-medium text-neutral-400">Priority</th>
              <th className="text-left p-4 text-sm font-medium text-neutral-400">Status</th>
              <th className="text-left p-4 text-sm font-medium text-neutral-400">Submitted</th>
            </tr></thead>
            <tbody>
              {initialTickets.map((t) => (
                <tr key={t.id} className="border-b transition-colors hover:bg-muted/30 border-[#262626]">
                  <td className="p-4 font-medium text-sm text-white">{t.title}</td>
                  <td className="p-4 text-sm capitalize text-white">{t.priority}</td>
                  <td className="p-4 text-sm capitalize text-neutral-400">{t.status}</td>
                  <td className="p-4 text-sm text-neutral-400">{new Date(t.createdAt).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
