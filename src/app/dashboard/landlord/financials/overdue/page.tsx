'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { AlertTriangle, Mail, Gavel } from 'lucide-react';

const overdue = [
  { id: 'o1', tenant: 'Global Mart Retail', unit: 'B4', amount: 840000, days: 30, noticeSent: false },
  { id: 'o2', tenant: 'Zenith FinTech Hub', unit: 'A1', amount: 120500, days: 5, noticeSent: true },
];

export default function LandlordOverduePaymentsPage() {
  const [error, setError] = useState<string | null>(null);

  if (error) {
    return (
      <DashboardShell navigation={LANDLORD_NAVIGATION}>
        <section className="space-y-6">
          <h1 className="text-3xl font-bold text-foreground">Overdue Payments</h1>
          <div className="rounded-lg border border-red-200 bg-red-50 p-6">
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <button onClick={() => setError(null)} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Retry</button>
          </div>
        </section>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell navigation={LANDLORD_NAVIGATION}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Overdue Payment Notices</h1>
          <p className="text-muted-foreground mt-1">Track and manage overdue rent and service charge payments.</p>
        </div>

        <div className="rounded-xl border border-outline-variant shadow-sm overflow-hidden bg-surface-container-lowest">
          <div className="p-5 border-b border-outline-variant flex justify-between items-center">
            <h3 className="font-heading font-bold text-primary">Overdue Accounts</h3>
            <span className="text-sm text-muted-foreground">{overdue.length} Accounts</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-high border-b border-outline-variant">
                <tr>
                  <th className="px-5 py-4 text-sm font-medium text-muted-foreground">Tenant</th>
                  <th className="px-5 py-4 text-sm font-medium text-muted-foreground">Unit</th>
                  <th className="px-5 py-4 text-sm font-medium text-muted-foreground">Overdue Amount</th>
                  <th className="px-5 py-4 text-sm font-medium text-muted-foreground">Days Overdue</th>
                  <th className="px-5 py-4 text-sm font-medium text-muted-foreground">Notice Sent</th>
                  <th className="px-5 py-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {overdue.map((row) => (
                  <tr key={row.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-5 py-4 text-sm font-medium text-primary">{row.tenant}</td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">{row.unit}</td>
                    <td className="px-5 py-4 text-sm font-medium text-red-600">₦{row.amount.toLocaleString()}</td>
                    <td className="px-5 py-4 text-sm text-red-600 font-bold">{row.days} days</td>
                    <td className="px-5 py-4">
                      <span className={`tag ${row.noticeSent ? 'tag-green' : 'tag-amber'}`}>
                        {row.noticeSent ? 'Sent' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button className="text-primary hover:text-secondary p-1">
                          <Mail className="w-4 h-4" />
                        </button>
                        <button className="text-primary hover:text-red-600 p-1">
                          <Gavel className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
