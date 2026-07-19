'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { FileText, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

const clauses = [
  { id: 1, title: 'Rent & Payment Terms', status: 'pending' },
  { id: 2, title: 'Security Deposit', status: 'pending' },
  { id: 3, title: 'Lease Duration', status: 'pending' },
  { id: 4, title: 'Maintenance Responsibilities', status: 'pending' },
  { id: 5, title: 'Termination Clause', status: 'pending' },
];

export default function EstateManagerLeaseReviewPage() {
  const [error, setError] = useState<string | null>(null);

  if (error) {
    return (
      <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION}>
        <ErrorBoundary>
          <section className="space-y-6">
            <h1 className="text-3xl font-bold text-foreground">Lease Agreement Review</h1>
            <p className="text-muted-foreground">Unable to load agreement.</p>
            <div className="bg-destructive/10 rounded-xl border border-destructive/20 p-6">
              <p className="text-destructive font-medium">Error</p>
              <p className="text-destructive/80 text-sm mt-1">{error}</p>
              <button onClick={() => setError(null)} className="mt-4 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90">Retry</button>
            </div>
          </section>
        </ErrorBoundary>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION}>

      <ErrorBoundary>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Lease Agreement Review</h1>
            <p className="text-muted-foreground mt-1">Reference: PROP-2024-88492-L · Platinum Plaza, Suite 402</p>
          </div>
          <div className="flex gap-3">
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-destructive/20 text-destructive hover:bg-destructive/10 transition-colors text-sm font-medium">
              <XCircle className="w-4 h-4" /> Reject
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-secondary bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors text-sm font-medium">
              <AlertTriangle className="w-4 h-4" /> Request Changes
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-success text-success-foreground hover:bg-success/90 transition-colors text-sm font-medium shadow-md">
              <CheckCircle2 className="w-4 h-4" /> Approve Agreement
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Document Viewer */}
          <div className="lg:col-span-2 rounded-xl border border-border shadow-sm bg-background p-6">
            <div className="border-b border-border pb-4 mb-6 flex justify-between items-start">
              <div>
                <h2 className="font-heading text-xl font-bold text-primary uppercase">Commercial Lease Agreement</h2>
                <p className="text-sm text-muted-foreground mt-1">Reference: PROP-2024-88492-L</p>
              </div>
              <div className="p-2 bg-secondary-fixed/10 rounded-lg">
                <FileText className="w-6 h-6 text-secondary" />
              </div>
            </div>
            <div className="space-y-4 text-sm text-primary leading-relaxed">
              <p>
                This Agreement is made between <strong>Landlord</strong> and <strong>Tenant</strong> for the lease of commercial space located at Platinum Plaza, Suite 402, Victoria Island, Lagos.
              </p>
              <p>
                <strong>1. Rent &amp; Payment Terms.</strong> Annual rent is ₦120,000 per sqm, payable quarterly in advance.
              </p>
              <p>
                <strong>2. Security Deposit.</strong> A deposit equal to 6 months rent shall be held for the duration of the tenancy.
              </p>
              <p>
                <strong>3. Lease Duration.</strong> Minimum commitment of two (2) years, with an option to renew.
              </p>
              <p>
                <strong>4. Maintenance.</strong> Landlord shall maintain structural elements; tenant is responsible for interior upkeep.
              </p>
              <p>
                <strong>5. Termination.</strong> Either party may terminate with 90 days written notice subject to penalties.
              </p>
            </div>
          </div>

          {/* Clause Checklist */}
          <div className="rounded-xl border border-border shadow-sm bg-background p-5">
            <h3 className="font-heading font-bold text-primary mb-4">Clause Checklist</h3>
            <div className="space-y-3">
              {clauses.map((clause) => (
                <div key={clause.id} className="flex items-center justify-between p-3 bg-surface rounded-lg border border-border">
                  <span className="text-sm font-medium text-primary">{clause.title}</span>
                  <span className="tag tag-amber">Pending</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    
      </ErrorBoundary>
</DashboardShell>
  );
}
