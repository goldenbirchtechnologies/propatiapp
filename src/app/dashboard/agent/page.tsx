import { getCurrentUserWithProfile } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';

export default async function AgentDashboardPage() {
  const user = await getCurrentUserWithProfile();
  if (!user) {
    redirect('/sign-in');
  }

  const displayName = user.fullName || 'User';

  return (
    <DashboardShell navigation={AGENT_NAVIGATION} userRole="agent" userName={displayName} userAvatar={user.avatarUrl || undefined}>
      <div className="app-layout dashboard-two-col">
        <div className="dashboard-content-area fade-up">
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h3 className="font-heading text-headline-lg text-primary">
                Welcome, {displayName}
              </h3>
              <p className="text-on-surface-variant">Here is what is happening with your real estate activity today.</p>
            </div>
          </header>

          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 space-y-6">
              <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm">
                <h3 className="font-headline-sm text-headline-sm text-primary mb-3">Active Deals</h3>
                <p className="text-on-surface-variant text-body-sm">No active deals yet. Start by browsing available listings.</p>
              </section>

              <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm">
                <h3 className="font-headline-sm text-headline-sm text-primary mb-3">Recent Messages</h3>
                <p className="text-on-surface-variant text-body-sm">No messages yet.</p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
