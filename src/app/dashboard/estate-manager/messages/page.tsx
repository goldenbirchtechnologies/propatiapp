import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { Home as ChatHome } from '@/components/ui/chat-template';
import { SidebarProvider } from '@/components/blocks/sidebar';

export default async function EstateManagerMessagesPage() {
  const user = await getCurrentUserWithProfile();
  if (!user) redirect('/sign-in');
  if (user.role !== 'estate_manager') redirect('/dashboard');

  return (
    <DashboardShell
      navigation={ESTATE_MANAGER_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <SidebarProvider>
          <ChatHome userId={user.id} userName={user.fullName} userRole={user.role} />
        </SidebarProvider>
      </ErrorBoundary>
    </DashboardShell>
  );
}
