import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import AgentApplicationsClient, {
  type ApplicationConversation,
  type ApplicationMessage,
  type ApplicationPropertyOption,
  type ApplicationRow,
} from './AgentApplicationsClient';

function safeJson<T>(value: unknown, fallback: T): T {
  if (!value) return fallback;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return value as T;
}

export default async function AgentApplicationsPage() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'agent') redirect('/dashboard');

  const managedListingFilter = {
    OR: [
      { agentId: user.id },
      { assignments: { some: { agentId: user.id, status: 'active' } } },
    ],
  };

  const [applications, managedListings, conversations] = await Promise.all([
    prisma.application.findMany({
      where: { listing: managedListingFilter },
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            address: true,
            area: true,
            price: true,
            pricePeriod: true,
            listingType: true,
          },
        },
        tenant: {
          select: { id: true, fullName: true, email: true, phone: true, avatarUrl: true },
        },
        landlord: { select: { id: true, fullName: true, email: true } },
      },
    }),
    prisma.listing.findMany({
      where: managedListingFilter,
      orderBy: { updatedAt: 'desc' },
      take: 100,
      select: { id: true, title: true, address: true, price: true },
    }),
    prisma.conversation.findMany({
      where: {
        OR: [
          { agentId: user.id },
          { listing: managedListingFilter },
          { landlordId: user.id },
          { tenantId: user.id },
        ],
      },
      orderBy: { lastMessageAt: 'desc' },
      take: 60,
      include: {
        landlord: { select: { id: true, fullName: true, avatarUrl: true, role: true } },
        tenant: { select: { id: true, fullName: true, avatarUrl: true, role: true } },
        agent: { select: { id: true, fullName: true, avatarUrl: true, role: true } },
      },
    }),
  ]);

  const conversationIds = conversations.map((c) => c.id);
  const messages = conversationIds.length
    ? await prisma.message.findMany({
        where: { conversationId: { in: conversationIds } },
        orderBy: { createdAt: 'asc' },
        take: 2000,
        include: { sender: { select: { id: true, fullName: true, role: true } } },
      })
    : [];

  const messagesByConversation: Record<string, ApplicationMessage[]> = {};
  for (const m of messages) {
    const bucket = (messagesByConversation[m.conversationId] ??= []);
    bucket.push({
      id: m.id,
      content: m.content,
      createdAt: m.createdAt.toISOString(),
      isMine: m.senderId === user.id,
      senderName: m.sender.fullName,
      attachmentUrl: m.attachmentUrl,
      attachmentType: m.attachmentType,
    });
  }

  const initialApplications: ApplicationRow[] = applications.map((a) => ({
    id: a.id,
    status: a.status,
    stage: a.stage,
    message: a.message,
    landlordNotes: a.landlordNotes,
    rejectionReason: a.rejectionReason,
    screeningStatus: safeJson<Record<string, unknown>>(a.screeningStatus, {}),
    guarantorData: safeJson<Record<string, unknown>>(a.guarantorData, {}),
    applicantDocuments: safeJson<ApplicationRow['applicantDocuments']>(a.applicantDocuments, []),
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
    listing: a.listing
      ? {
          id: a.listing.id,
          title: a.listing.title,
          address: a.listing.address,
          area: a.listing.area,
          price: a.listing.price.toString(),
          pricePeriod: a.listing.pricePeriod,
          listingType: a.listing.listingType,
        }
      : null,
    tenant: {
      id: a.tenant.id,
      fullName: a.tenant.fullName,
      email: a.tenant.email,
      phone: a.tenant.phone,
      avatarUrl: a.tenant.avatarUrl,
    },
    landlord: a.landlord,
  }));

  const conversationRows: ApplicationConversation[] = conversations.map((c) => {
    const unread = safeJson<Record<string, number>>(c.unreadCounts, {});
    const unreadCount =
      (typeof unread[user.id] === 'number' ? unread[user.id] : 0) ||
      Object.values(unread).reduce((sum, n) => sum + (typeof n === 'number' ? n : 0), 0);
    // Counterparty = the other participant (not the agent themselves)
    const counterparty =
      (c.tenant && c.tenant.id !== user.id ? c.tenant : null) ??
      (c.landlord && c.landlord.id !== user.id ? c.landlord : null) ??
      (c.agent && c.agent.id !== user.id ? c.agent : null);
    return {
      id: c.id,
      subject: c.subject,
      lastMessage: c.lastMessage,
      lastMessageAt: c.lastMessageAt ? c.lastMessageAt.toISOString() : null,
      unreadCount,
      listingId: c.listingId,
      participantName: counterparty?.fullName ?? 'Counterparty',
      participantRole: counterparty?.role ?? 'participant',
      participantAvatar: counterparty?.avatarUrl ?? null,
    };
  });

  const properties: ApplicationPropertyOption[] = managedListings.map((l) => ({
    id: l.id,
    title: l.title,
    address: l.address,
    price: l.price.toString(),
  }));

  return (
    <DashboardShell
      navigation={AGENT_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <AgentApplicationsClient
          initialApplications={initialApplications}
          conversations={conversationRows}
          messagesByConversation={messagesByConversation}
          properties={properties}
        />
      </ErrorBoundary>
    </DashboardShell>
  );
}
