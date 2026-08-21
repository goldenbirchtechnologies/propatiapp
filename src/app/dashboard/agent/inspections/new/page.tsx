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
      <Card>
        <CardHeader>
          <CardTitle>New Inspection</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-neutral-400">
            {searchParams?.dealId
              ? `Create an inspection request for deal ${searchParams.dealId}.`
              : 'Select a deal and create a new inspection request from the deal detail page.'}
          </p>
        </CardContent>
      </div>
    </DashboardShell>
  );
}
