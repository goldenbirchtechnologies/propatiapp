'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import AdminFlagsClient from './AdminFlagsClient';

export default function AdminFlagsPage() {
  const [error, setError] = useState<string | null>(null);

  if (error) {
    return (
      <DashboardShell navigation={ADMIN_NAVIGATION} userRole="admin" userName="Admin">
        <AdminFlagsClient error={error} onRetry={() => setError(null)} />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell navigation={ADMIN_NAVIGATION} userRole="admin" userName="Admin">
      <AdminFlagsClient />
    </DashboardShell>
  );
}
