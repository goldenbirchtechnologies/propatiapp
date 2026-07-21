import { getCurrentUserWithProfile } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import AgentAgreementNewClient from './AgentAgreementNewClient';

export default async function AgentAgreementNewPage({ searchParams }: { searchParams: { dealId?: string } }) {
  const user = await getCurrentUserWithProfile();
  if (!user) redirect('/sign-in');
  if (user.role !== 'agent') redirect('/dashboard');

  return (
    <DashboardShell
      navigation={AGENT_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <AgentAgreementNewClient dealId={searchParams.dealId} />
    </DashboardShell>
  );
}
