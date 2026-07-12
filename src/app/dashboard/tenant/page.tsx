import { getCurrentUserWithProfile } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { TENANT_NAVIGATION } from '@/lib/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';

export default async function TenantDashboardPage() {
  const user = await getCurrentUserWithProfile();
  if (!user) {
    redirect('/sign-in');
  }

  const displayName = user.fullName || 'User';
  const initials = (displayName || 'U').charAt(0).toUpperCase();

  return (
    <DashboardShell
      navigation={TENANT_NAVIGATION}
      userRole="tenant"
      userName={displayName}
      userAvatar={user.avatarUrl || undefined}
    >
      <div className="app-layout dashboard-two-col">
        <div className="dashboard-content-area fade-up">
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="font-headline-sm text-headline-sm text-primary">
                Welcome, {displayName}
              </h2>
              <p className="text-on-surface-variant mt-1">
                {initials === 'U' ? 'Please complete your profile.' : 'Your tenancy overview and recent activity.'}
              </p>
            </div>
          </header>

          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 space-y-6">
              <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm">
                <h3 className="font-headline-sm text-headline-sm text-primary mb-3">Current Property</h3>
                <p className="text-on-surface-variant text-body-sm">You do not have an active lease yet. Browse listings to find a property.</p>
              </section>

              <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm">
                <h3 className="font-headline-sm text-headline-sm text-primary mb-3">Recent Payments</h3>
                <p className="text-on-surface-variant text-body-sm">No payments yet.</p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
