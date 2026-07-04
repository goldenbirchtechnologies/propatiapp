// src/app/dashboard/admin/agreements/page.tsx
'use client';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ADMIN_NAVIGATION } from '@/lib/navigation';

export default function AdminAgreementsPage() {
  return (
    <DashboardShell navigation={ADMIN_NAVIGATION}>
      <section className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Admin – Agreements</h1>
        <p className="text-muted-foreground">Manage platform agreements, terms, and contracts.</p>
        {/* Placeholder content; replace with real UI components */}
        <div className="rounded-lg border border-border bg-white p-6 shadow-card">
          <p className="text-gray-600">No agreements found. Create a new agreement to get started.</p>
        </div>
      </section>
    </DashboardShell>
  );
}
