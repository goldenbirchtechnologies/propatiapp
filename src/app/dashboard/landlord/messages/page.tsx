import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import MessagePage from "@/components/ui/message-page";
import { SidebarProvider } from '@/components/blocks/sidebar';

export const metadata = {
  title: 'Messages',
  description: 'Manage landlord conversations and screening calls.',
};

export default async function LandlordMessagesPage() {
  const user = await getCurrentUserWithProfile();
  if (!user) redirect('/sign-in');
  if (user.role !== 'landlord') redirect('/dashboard');

  return (
    <DashboardShell
      navigation={LANDLORD_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <SidebarProvider>
          <MessagePage userId={user.id} userName={user.fullName} userRole={user.role} />
        </SidebarProvider>
      </ErrorBoundary>
    </DashboardShell>
  );
}
