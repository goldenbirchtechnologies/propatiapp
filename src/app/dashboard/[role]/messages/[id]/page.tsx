import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { getNavigationForRole } from '@/lib/navigation';
import ChatPageClient from './ChatPageClient';

export default async function ChatPage({
  params,
}: {
  params: Promise<{ role: string; id: string }>;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await getCurrentUserWithProfile();
  const { role, id } = await params;

  if (!user || user.role !== role) {
    redirect('/dashboard');
  }

  const navigation = getNavigationForRole(user.role);

  return (
    <DashboardShell
      navigation={navigation}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ChatPageClient
        conversationId={id}
        userId={user.id}
        userName={user.fullName}
        userRole={user.role as 'landlord' | 'tenant' | 'agent' | 'admin'}
      />
    </DashboardShell>
  );
}
