import { getCurrentUserWithProfile } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function AgentAgreementNewPage({ searchParams }: { searchParams: { dealId?: string } }) {
  const user = await getCurrentUserWithProfile();
  if (!user) redirect('/sign-in');

  return (
    <DashboardShell navigation={AGENT_NAVIGATION} userRole={user.role} userName={user.fullName || 'Agent'} userAvatar={user.avatarUrl || undefined}>
      <Card>
        <CardHeader>
          <CardTitle>New Agreement</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {searchParams?.dealId
              ? `Create a new agreement for deal ${searchParams.dealId}.`
              : 'Select a deal to start a new agreement from the deal detail page.'}
          </p>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
