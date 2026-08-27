import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { Home as ChatHome } from '@/components/ui/chat-template';

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

      <ChatHome userId={user.id} userName={user.fullName} userRole={user.role} />
    
      </ErrorBoundary>
</DashboardShell>
  );
}
