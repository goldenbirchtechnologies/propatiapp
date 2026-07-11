'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { Gavel, FileText, CheckCircle2, Clock } from 'lucide-react';

const terms = [
  {
    term: 'Annual Rent',
    original: '₦120,000 /sqm',
    proposed: '₦105,000 /sqm',
  },
  {
    term: 'Lease Duration',
    original: '2 Years (Minimum)',
    proposed: '3 Years (Requested)',
  },
  {
    term: 'Service Charge',
    original: '₦25,000 /sqm /yr',
    proposed: '₦22,000 /sqm /yr',
  },
  {
    term: 'Security Deposit',
    original: '6 Months Rent',
    proposed: '5 Months Rent',
  },
];

export default function EstateManagerLeaseNegotiationPage() {
  const [loading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (error) {
    return (
      <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION}>
        <section className="space-y-6">
          <h1 className="text-3xl font-bold text-foreground">Lease Negotiation</h1>
          <p className="text-muted-foreground">Unable to load negotiation terms.</p>
          <div className="rounded-lg border border-red-200 bg-red-50 p-6">
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </section>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-foreground">Grade A Serviced Office</h1>
              <span className="px-3 py-1 rounded-full bg-secondary-fixed/20 text-secondary text-xs font-bold border border-secondary/20">
                Active Negotiation
              </span>
            </div>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <span>📍 Victoria Island, Lagos, Nigeria</span>
              <span className="text-xs font-mono text-muted-foreground">Ref ID: PR-1092-VI</span>
            </p>
          </div>
          <div className="flex gap-3">
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-white hover:bg-surface-container-low transition-colors text-sm font-medium">
              <FileText className="w-4 h-4" />
              Request Docs
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors text-sm font-medium shadow-md">
              <Gavel className="w-4 h-4" />
              Sign Document
            </button>
          </div>
        </div>

        {/* Term Sheet Comparison */}
        <div className="rounded-xl border border-outline-variant shadow-sm overflow-hidden">
          <div className="p-5 border-b border-outline-variant bg-primary-container/10">
            <h3 className="font-heading font-bold text-primary">Term Sheet Comparison</h3>
            <p className="text-sm text-muted-foreground mt-1">Original listing vs proposed counter-offer</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-high border-b border-outline-variant">
                <tr>
                  <th className="px-5 py-4 text-sm font-medium text-muted-foreground">Term</th>
                  <th className="px-5 py-4 text-sm font-medium text-muted-foreground">Original Listing</th>
                  <th className="px-5 py-4 text-sm font-medium text-secondary">Proposed Counter</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {terms.map((item) => (
                  <tr key={item.term} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-5 py-4 font-medium text-primary">{item.term}</td>
                    <td className="px-5 py-4 text-muted-foreground">{item.original}</td>
                    <td className="px-5 py-4 font-medium text-secondary">{item.proposed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Documents */}
        <div className="rounded-xl border border-outline-variant shadow-sm p-5">
          <h3 className="font-heading font-bold text-primary mb-4">Negotiation Documents</h3>
          <div className="space-y-3">
            {[
              { name: 'Original_Offer_Letter_PR-1092-VI.pdf', date: '2 days ago', size: '245 KB' },
              { name: 'Counter_Offer_Term_Sheet_v2.pdf', date: '1 day ago', size: '198 KB' },
              { name: 'Legal_Review_Notes.docx', date: '4 hours ago', size: '86 KB' },
            ].map((doc, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg border border-outline-variant">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary-fixed/10 rounded-lg text-secondary">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-primary">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.date} · {doc.size}</p>
                  </div>
                </div>
                <button className="text-sm text-secondary hover:underline font-medium">Download</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
