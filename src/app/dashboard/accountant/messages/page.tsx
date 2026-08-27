import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ACCOUNTANT_NAVIGATION } from '@/lib/navigation';
import MessagePage from "@/components/ui/message-page";
import { SidebarProvider } from '@/components/blocks/sidebar';

export default async function AccountantMessagesPage() {
  const user = await getCurrentUserWithProfile();
  if (!user) redirect('/sign-in');
  if ((user.role as string) !== 'accountant') redirect('/dashboard');

  return (
    <DashboardShell navigation={ACCOUNTANT_NAVIGATION} userRole={user.role} userName={user.fullName} userAvatar={user.avatarUrl || undefined}>
      <ErrorBoundary>
        <SidebarProvider>
          <MessagePage />
        </SidebarProvider>
      </ErrorBoundary>
    </DashboardShell>
  );
}
