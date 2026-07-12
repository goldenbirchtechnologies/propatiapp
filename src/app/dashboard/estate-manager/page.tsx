import { getCurrentUserWithProfile } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';

export default async function EstateManagerDashboardPage() {
  const user = await getCurrentUserWithProfile();
  if (!user) {
    redirect('/sign-in');
  }

  const displayName = user.fullName || 'User';

  return (
    <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName={displayName} userAvatar={user.avatarUrl || undefined}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h3 className="font-heading text-headline-lg text-primary">
              Welcome, {displayName}
            </h3>
            <p className="text-on-surface-variant">Manage your estate operations and service charges.</p>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 space-y-6">
            <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm">
              <h3 className="font-headline-sm text-headline-sm text-primary mb-3">Units & Tenants</h3>
              <p className="text-on-surface-variant text-body-sm">No units configured yet.</p>
            </section>

            <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm">
              <h3 className="font-headline-sm text-headline-sm text-primary mb-3">Service Charges</h3>
              <p className="text-on-surface-variant text-body-sm">No service charge records yet.</p>
            </section>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
