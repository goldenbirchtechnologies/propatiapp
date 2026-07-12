'use client';

import { DashboardShell } from '@/components/layout/DashboardShell';
import { ADMIN_NAVIGATION } from '@/lib/navigation';

export default function AdminPaymentsPage() {
  return (
    <DashboardShell navigation={ADMIN_NAVIGATION}>
      <section className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Payments</h1>
          <p className="text-muted-foreground mt-1">Monitor escrow, rent, and agreement payments across the platform.</p>
        </div>
        <div className="rounded-lg border border-border bg-surface-container-lowest p-12 text-center shadow-card">
          <div className="text-muted-foreground mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-primary">No payment data yet</h3>
          <p className="mt-1 text-on-surface-variant">Payment analytics and escrow controls will appear here.</p>
        </div>
      </section>
    </DashboardShell>
  );
}
