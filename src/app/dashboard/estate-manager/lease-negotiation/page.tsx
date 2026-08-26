'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
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
        <ErrorBoundary>
          <div className="space-y-6">
            <h1 className="text-white font-bold" style={{ fontSize: 'text-white', color: 'text-white' }}>Lease Negotiation</h1>
            <p className="text-xs text-xs uppercase tracking-wider" style={{ color: 'text-zinc-500' }}>Unable to load negotiation terms.</p>
            <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-6">
              <p className="text-red-500 font-medium mb-1">Error</p>
              <p className="text-sm text-zinc-500 mb-3">{error}</p>
              <button onClick={() => setError(null)} className="mt-4 px-4 py-2 bg-destructive text-on-destructive rounded-lg hover:bg-destructive">Retry</button>
            </div>
          </div>
        </ErrorBoundary>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Estate Manager" userAvatar={undefined}>

      <ErrorBoundary>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-white font-bold" style={{ fontSize: 'text-white', color: 'text-white' }}>Grade A Serviced Office</h1>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border border-white/[0.08] bg-amber-500/10 text-amber-400">Active Negotiation</span>
            </div>
            <p className="text-xs text-xs uppercase tracking-wider mt-1" style={{ color: 'text-zinc-500' }}>
              <span className="inline-block mr-2">📍 Victoria Island, Lagos, Nigeria</span>
              <span className="text-xs font-mono">Ref ID: PR-1092-VI</span>
            </p>
          </div>
          <div className="flex gap-3">
            <button className="btn btn-outline inline-flex items-center gap-2"><FileText className="w-4 h-4" /> Request Docs</button>
            <button className="btn btn-primary inline-flex items-center gap-2 shadow-none"><Gavel className="w-4 h-4" /> Sign Document</button>
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.08] shadow-none overflow-hidden bg-zinc-900">
          <div className="p-5 border-b border-white/[0.08] bg-surface">
            <h3 className="text-white font-bold text-white">Term Sheet Comparison</h3>
            <p className="text-xs text-xs uppercase tracking-wider mt-1" style={{ color: 'text-zinc-500' }}>Original listing vs proposed counter-offer</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-zinc-900 border-b border-white/[0.08]">
                <tr>
                  <th className="px-5 py-4 text-xs text-xs uppercase tracking-wider" style={{ color: 'text-zinc-500' }}>Term</th>
                  <th className="px-5 py-4 text-xs text-xs uppercase tracking-wider" style={{ color: 'text-zinc-500' }}>Original Listing</th>
                  <th className="px-5 py-4 text-xs text-xs uppercase tracking-wider text-white">Proposed Counter</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {terms.map((item) => (
                  <tr key={item.term} className="hover:bg-surface transition-colors">
                    <td className="px-5 py-4 font-medium text-sm text-white">{item.term}</td>
                    <td className="px-5 py-4 text-xs text-xs uppercase tracking-wider" style={{ color: 'text-zinc-500' }}>{item.original}</td>
                    <td className="px-5 py-4 text-sm font-medium text-white">{item.proposed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.08] shadow-none p-5">
          <h3 className="text-white font-bold mb-4 text-white">Negotiation Documents</h3>
          <div className="space-y-3">
            {[
              { name: 'Original_Offer_Letter_PR-1092-VI.pdf', date: '2 days ago', size: '245 KB' },
              { name: 'Counter_Offer_Term_Sheet_v2.pdf', date: '1 day ago', size: '198 KB' },
              { name: 'Legal_Review_Notes.docx', date: '4 hours ago', size: '86 KB' },
            ].map((doc, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-surface rounded-lg border border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-zinc-900 rounded-lg text-white">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{doc.name}</p>
                    <p className="text-xs text-xs uppercase tracking-wider" style={{ color: 'text-zinc-500' }}>{doc.date} · {doc.size}</p>
                  </div>
                </div>
                <button className="text-xs text-xs uppercase tracking-wider text-white hover:underline font-medium">Download</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    
      </ErrorBoundary>
</DashboardShell>
  );
}
