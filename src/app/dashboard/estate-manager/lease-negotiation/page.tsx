'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { Gavel, FileText, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const terms = [
  { term: 'Annual Rent', original: '₦120,000 /sqm', proposed: '₦105,000 /sqm' },
  { term: 'Lease Duration', original: '2 Years (Minimum)', proposed: '3 Years (Requested)' },
  { term: 'Service Charge', original: '₦25,000 /sqm /yr', proposed: '₦22,000 /sqm /yr' },
  { term: 'Security Deposit', original: '6 Months Rent', proposed: '5 Months Rent' },
];

export default function EstateManagerLeaseNegotiationPage() {
  const [loading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (error) {
    return (
      <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Estate Manager" userAvatar={undefined}>
        <div className="space-y-6">
          <h1 className="font-headline-sm font-bold" style={{ fontSize: 'font-headline-sm', color: 'text-primary' }}>Lease Negotiation</h1>
          <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-muted-foreground' }}>Unable to load negotiation terms.</p>
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6">
            <p className="text-destructive font-medium mb-1">Error</p>
            <p className="text-sm text-muted-foreground mb-3">{error}</p>
            <button onClick={() => setError(null)} className="px-4 py-2 bg-destructive text-white rounded-lg hover:bg-destructive/90">Retry</button>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Estate Manager" userAvatar={undefined}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-headline-sm font-bold" style={{ fontSize: 'font-headline-sm', color: 'text-primary' }}>Grade A Serviced Office</h1>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border border-border bg-warning/10 text-warning">Active Negotiation</span>
            </div>
            <p className="text-xs font-label-md uppercase tracking-wider mt-1" style={{ color: 'text-muted-foreground' }}>
              <span className="inline-block mr-2">📍 Victoria Island, Lagos, Nigeria</span>
              <span className="text-xs font-mono">Ref ID: PR-1092-VI</span>
            </p>
          </div>
          <div className="flex gap-3">
            <button className="btn btn-outline inline-flex items-center gap-2"><FileText className="w-4 h-4" /> Request Docs</button>
            <button className="btn btn-primary inline-flex items-center gap-2 shadow-md"><Gavel className="w-4 h-4" /> Sign Document</button>
          </div>
        </div>

        <div className="rounded-xl border border-border shadow-sm overflow-hidden bg-background">
          <div className="p-5 border-b border-border bg-surface">
            <h3 className="font-headline-sm font-bold" style={{ color: 'text-primary' }}>Term Sheet Comparison</h3>
            <p className="text-xs font-label-md uppercase tracking-wider mt-1" style={{ color: 'text-muted-foreground' }}>Original listing vs proposed counter-offer</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-5 py-4 text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-muted-foreground' }}>Term</th>
                  <th className="px-5 py-4 text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-muted-foreground' }}>Original Listing</th>
                  <th className="px-5 py-4 text-xs font-label-md uppercase tracking-wider text-primary">Proposed Counter</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {terms.map((item) => (
                  <tr key={item.term} className="hover:bg-surface transition-colors">
                    <td className="px-5 py-4 font-medium text-sm" style={{ color: 'text-primary' }}>{item.term}</td>
                    <td className="px-5 py-4 text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-muted-foreground' }}>{item.original}</td>
                    <td className="px-5 py-4 text-sm font-medium text-primary">{item.proposed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-border shadow-sm p-5">
          <h3 className="font-headline-sm font-bold mb-4" style={{ color: 'text-primary' }}>Negotiation Documents</h3>
          <div className="space-y-3">
            {[
              { name: 'Original_Offer_Letter_PR-1092-VI.pdf', date: '2 days ago', size: '245 KB' },
              { name: 'Counter_Offer_Term_Sheet_v2.pdf', date: '1 day ago', size: '198 KB' },
              { name: 'Legal_Review_Notes.docx', date: '4 hours ago', size: '86 KB' },
            ].map((doc, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-surface rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'text-primary' }}>{doc.name}</p>
                    <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-muted-foreground' }}>{doc.date} · {doc.size}</p>
                  </div>
                </div>
                <button className="text-xs font-label-md uppercase tracking-wider text-primary hover:underline font-medium">Download</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
