import { getCurrentUserWithProfile } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';

export default async function LandlordDashboardPage() {
  const user = await getCurrentUserWithProfile();
  if (!user) {
    redirect('/sign-in');
  }

  const displayName = user.fullName || 'User';

  return (
    <DashboardShell navigation={LANDLORD_NAVIGATION} userRole="landlord" userName={displayName} userAvatar={user.avatarUrl || undefined}>
      <div className="app-layout dashboard-two-col">
        <div className="dashboard-content-area fade-up">
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h3 className="font-heading text-headline-lg text-primary">
                Welcome, {displayName}
              </h3>
              <p className="text-on-surface-variant">Your property portfolio at a glance.</p>
            </div>
          </header>

          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 space-y-6">
              <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm">
                <h3 className="font-headline-sm text-headline-sm text-primary mb-3">Properties</h3>
                <p className="text-on-surface-variant text-body-sm">No properties listed yet. Add your first property to get started.</p>
              </section>

              <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm">
                <h3 className="font-headline-sm text-headline-sm text-primary mb-3">Recent Rent Payments</h3>
                <p className="text-on-surface-variant text-body-sm">No payments recorded yet.</p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
