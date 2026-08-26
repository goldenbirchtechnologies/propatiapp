import { getCurrentUserWithProfile } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function AgentInspectionNewPage({ searchParams }: { searchParams: { dealId?: string } }) {
  const user = await getCurrentUserWithProfile();
  if (!user) redirect('/sign-in');

  return (
    <DashboardShell navigation={AGENT_NAVIGATION} userRole={user.role} userName={user.fullName || 'Agent'} userAvatar={user.avatarUrl || undefined}>
      <div className="glass-card">
        <div className="px-6 py-5 border-b border-white/[0.08]">
          <h3 className="text-lg font-semibold text-white">New Inspection</h3>
        </div>
        <div className="p-6">
          <p className="text-zinc-500">
            {searchParams?.dealId
              ? `Create an inspection request for deal ${searchParams.dealId}.`
              : 'Select a deal and create a new inspection request from the deal detail page.'}
          </p>
        </div>
      </div>
    </DashboardShell>
  );
}
