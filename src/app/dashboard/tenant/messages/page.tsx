import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import TenantRailShell from '@/components/layout/TenantRailShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { TENANT_NAVIGATION } from '@/lib/navigation';
import MessagePage from "@/components/ui/message-page";
import { SidebarProvider } from '@/components/blocks/sidebar';

export default async function TenantMessagesPage() {
  const user = await getCurrentUserWithProfile();
  if (!user) redirect('/sign-in');
  if (user.role !== 'tenant') redirect('/dashboard');

  return (
    <TenantRailShell
      navigation={TENANT_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <div className="space-y-6">
          <SidebarProvider>
            <MessagePage userId={user.id} userName={user.fullName} userRole={user.role} />
          </SidebarProvider>
        </div>
      </ErrorBoundary>
    </TenantRailShell>
  );
}