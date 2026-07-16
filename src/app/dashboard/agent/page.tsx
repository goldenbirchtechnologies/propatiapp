import { getCurrentUserWithProfile } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';

export default async function AgentDashboardPage() {
  const user = await getCurrentUserWithProfile();
  if (!user) {
    redirect('/login');
  }

  const displayName = user.fullName || 'User';

  return (
    <DashboardShell navigation={AGENT_NAVIGATION} userRole="agent" userName={displayName} userAvatar={user.avatarUrl || undefined}>
      <div className="dashboard-content-area fade-up">
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="font-headline-sm text-headline-sm text-primary">
                Welcome, {displayName}
              </h2>
              <p className="text-on-surface-variant mt-1">Here is what is happening with your real estate activity today.</p>
            </div>
          </header>

          <div className="grid grid-cols-12 gap-6 mt-6">
            <div className="col-span-12 space-y-6">
              <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-lg shadow-sm sd-section-empty">
                <h3 className="font-headline-sm text-headline-sm font-semibold text-primary mb-3">Active Deals</h3>
                <div className="section-content">
                  <p className="text-body-sm text-muted-foreground">No active deals yet. Start by browsing available listings.</p>
                </div>
                <div className="section-empty-msg items-center justify-center py-8 text-center">
                  <p className="text-sm text-muted-foreground">No active deals yet. Start by browsing available listings.</p>
                </div>
              </section>

              <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-lg shadow-sm sd-section-empty">
                <h3 className="font-headline-sm text-headline-sm font-semibold text-primary mb-3">Recent Messages</h3>
                <div className="section-content">
                  <p className="text-body-sm text-muted-foreground">No messages yet.</p>
                </div>
                <div className="section-empty-msg items-center justify-center py-8 text-center">
                  <p className="text-sm text-muted-foreground">No messages yet.</p>
                </div>
              </section>
            </div>
          </div>
        </div>
    </DashboardShell>
  );
}
