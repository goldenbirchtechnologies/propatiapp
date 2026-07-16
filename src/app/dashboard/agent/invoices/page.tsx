import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import TenantInvoicesClient from '@/app/dashboard/tenant/invoices/TenantInvoicesClient';

export default async function AgentInvoicesPage() {
  const { userId } = await auth();
  if (!userId) redirect('/login');
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'agent') redirect('/dashboard');
  return (
    <DashboardShell navigation={AGENT_NAVIGATION} userRole={user.role} userName={user.fullName} userAvatar={user.avatarUrl || undefined}>
      <TenantInvoicesClient />
    </DashboardShell>
  );
}
