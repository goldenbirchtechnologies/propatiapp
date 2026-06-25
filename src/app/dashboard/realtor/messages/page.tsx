import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { REALTOR_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import RealtorMessagesClient from './RealtorMessagesClient';

export default async function RealtorMessagesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await getCurrentUserWithProfile();

  if (!user || user.role !== 'realtor') {
    redirect('/dashboard');
  }

  const conversations = await prisma.conversation.findMany({
    where: { OR: [{ landlordId: user.id }, { tenantId: user.id }] },
    include: {
      landlord: { select: { id: true, fullName: true } },
      tenant: { select: { id: true, fullName: true } },
      listing: { select: { id: true, title: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { updatedAt: 'desc' },
    take: 50,
  });

  const initialConversations = conversations.map((c) => ({
    id: c.id,
    name: `${c.landlord.fullName || 'Landlord'} / ${c.tenant.fullName || 'Tenant'}${c.listing ? ` — ${c.listing.title}` : ''}`,
    lastMessage: c.lastMessage || c.messages[0]?.content || 'No messages',
    time: c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleDateString('en-NG', { day: '2-digit', month: 'short' }) : new Date(c.createdAt).toLocaleDateString('en-NG', { day: '2-digit', month: 'short' }),
    unread: 0,
  }));

  return (
    <DashboardShell
      navigation={REALTOR_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <RealtorMessagesClient initialConversations={initialConversations} />
    </DashboardShell>
  );
}
