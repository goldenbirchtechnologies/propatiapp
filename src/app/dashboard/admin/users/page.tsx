'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ADMIN_NAVIGATION } from '@/lib/navigation';

export default function AdminUsersPage() {
  const [error, setError] = useState<string | null>(null);

  if (error) {
    return (
      <DashboardShell navigation={ADMIN_NAVIGATION}>
        <section className="space-y-6">
          <h1 className="text-3xl font-bold text-foreground">Users</h1>
          <p className="text-muted-foreground">Manage user accounts and platform access.</p>
          <div className="rounded-lg border border-red-200 bg-red-50 p-6">
            <p className="text-red-800 font-medium">Unable to load page</p>
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
    <DashboardShell navigation={ADMIN_NAVIGATION}>
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Users</h1>
            <p className="text-muted-foreground mt-1">Manage user accounts and platform access.</p>
          </div>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Add User
          </button>
        </div>
        <div className="rounded-lg border border-border bg-surface-container-lowest p-12 text-center shadow-card">
          <div className="text-muted-foreground mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 008 0 4 4 0 008 0 8 4 0 00-8 0" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14c.634 0 1.31-.107 1.936-.304.344-.107.672-.252.98-.436a4.002 4.002 0 00-.392-.784c-.187-.227-.427-.41-.704-.535a4.003 4.003 0 00-.936-.348c-.064-.012-.13-.02-.196-.027a3.004 3.004 0 00-.316-.045A3.004 3.004 0 008 14a3.004 3.004 0 00-3.372.908c-.1.023-.198.05-.295.083-.094.03-.186.066-.276.108A3.003 3.003 0 005 15.5a3.003 3.003 0 00.5 1.75c.095.13.206.247.33.35.126.105.266.197.416.275.153.08.316.14.486.183.17.043.347.072.527.083.18.012.363.01.545-.01.182-.02.363-.054.54-.103a4.003 4.003 0 00.98-.436c.35-.2.669-.454.94-.754.15-.166.285-.346.402-.536a4.003 4.003 0 00.346-.747 3.996 3.996 0 00.147-.821c.012-.18.004-.36-.025-.538-.028-.178-.076-.352-.143-.518a3.995 3.995 0 00-.385-.693c-.162-.227-.355-.428-.573-.595a4.003 4.003 0 00-.98-.632c-.346-.142-.713-.219-1.084-.227-.371-.007-.738.05-1.08.17a3.99 3.99 0 00-.817.366c-.255.146-.492.329-.703.542-.21.213-.394.455-.542.718-.15.263-.267.543-.35.83-.082.287-.129.583-.14.875-.01.292.016.583.08.863.063.28.16.55.287.8.127.25.284.482.466.688a4 4 0 00.7.527z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-primary">No users found</h3>
          <p className="mt-1 text-on-surface-variant">Registered users will appear here for management.</p>
        </div>
      </section>
    </DashboardShell>
  );
}
