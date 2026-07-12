'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { Download, Share, FileText } from 'lucide-react';

const reports = [
  { id: 'RPT-001', title: 'Q1 2024 Revenue Forecast', date: 'Mar 31, 2024', status: 'Signed' },
  { id: 'RPT-002', title: 'Q2 2024 Revenue Forecast', date: 'Jun 30, 2024', status: 'Pending Signature' },
  { id: 'RPT-003', title: 'Annual FY 2024-2025 Forecast', date: 'Dec 15, 2024', status: 'Draft' },
];

export default function LandlordRevenueForecastReportPage() {
  const [error, setError] = useState<string | null>(null);

  if (error) {
    return (
      <DashboardShell navigation={LANDLORD_NAVIGATION}>
        <section className="space-y-6">
          <h1 className="text-3xl font-bold text-foreground">Revenue Forecast Reports</h1>
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Revenue Forecast Reports</h1>
            <p className="text-muted-foreground mt-1">Signed and archived financial projections.</p>
          </div>
          <div className="flex gap-3">
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-surface-container-lowest hover:bg-surface-container-low transition-colors text-sm font-medium">
              <Share className="w-4 h-4" /> Share
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors text-sm font-medium shadow-md">
              <Download className="w-4 h-4" /> Export Data
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-outline-variant shadow-sm overflow-hidden bg-surface-container-lowest">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-high border-b border-outline-variant">
                <tr>
                  <th className="px-5 py-4 text-sm font-medium text-muted-foreground">Report ID</th>
                  <th className="px-5 py-4 text-sm font-medium text-muted-foreground">Title</th>
                  <th className="px-5 py-4 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="px-5 py-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="px-5 py-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {reports.map((rpt) => (
                  <tr key={rpt.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-5 py-4 text-sm font-mono text-muted-foreground">{rpt.id}</td>
                    <td className="px-5 py-4 text-sm font-medium text-primary">{rpt.title}</td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">{rpt.date}</td>
                    <td className="px-5 py-4">
                      <span className={`tag ${rpt.status === 'Signed' ? 'tag-green' : rpt.status === 'Pending Signature' ? 'tag-amber' : 'tag-gray'}`}>
                        {rpt.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button className="text-sm text-secondary hover:underline flex items-center gap-1">
                          <FileText className="w-4 h-4" /> PDF
                        </button>
                        <button className="text-sm text-primary hover:underline flex items-center gap-1">
                          <FileText className="w-4 h-4" /> Signed Copy
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


