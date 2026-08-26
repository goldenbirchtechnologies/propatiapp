import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import AgentMessagesClient from './AgentMessagesClient';

export default async function Page() {
  const user = await getCurrentUserWithProfile();
  if (!user) redirect('/sign-in');
  if (user.role !== 'agent') redirect('/dashboard');

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ landlordId: user.id }, { tenantId: user.id }],
    },
    select: {
      id: true,
      subject: true,
      lastMessage: true,
      lastMessageAt: true,
      status: true,
      listingId: true,
      unreadCounts: true,
    },
    orderBy: { lastMessageAt: 'desc' },
    take: 30,
  });

  const initialConversations = conversations.map((c) => ({
    id: c.id,
    subject: c.subject,
    lastMessage: c.lastMessage,
    lastMessageAt: c.lastMessageAt?.toISOString() || null,
    status: c.status,
    listingId: c.listingId,
    unreadCounts: c.unreadCounts as Record<string, number> | null,
  }));

  return (
    <DashboardShell
      navigation={AGENT_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >

      <ErrorBoundary>

      <AgentMessagesClient initialConversations={initialConversations} userId={user.id} />
    
      </ErrorBoundary>
</DashboardShell>
  );
}
