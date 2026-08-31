import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import AgentVerificationsClient from './AgentVerificationsClient';

export default async function Page() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'agent') redirect('/dashboard');

  return (
    <DashboardShell
      navigation={AGENT_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >

      <ErrorBoundary>

      <AgentVerificationsClient />
    
      </ErrorBoundary>
</DashboardShell>
  );
}
