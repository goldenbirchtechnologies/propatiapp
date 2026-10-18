import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request, ['estate_manager', 'admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const ownedOrg = await prisma.organisation.findFirst({
      where: { ownerId: user.id },
      select: { id: true },
    });

    const membership = ownedOrg
      ? null
      : await prisma.orgMember.findFirst({
          where: { userId: user.id, status: 'active' },
          select: { orgId: true },
        });

    const orgId = ownedOrg?.id || membership?.orgId;

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { orgId: orgId ?? undefined },
          { landlordId: user.id },
          { tenantId: user.id },
          { agentId: user.id },
        ],
      },
      include: {
        listing: { select: { id: true, title: true } },
        landlord: { select: { id: true, fullName: true } },
        tenant: { select: { id: true, fullName: true, email: true } },
        agent: { select: { id: true, fullName: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { content: true, createdAt: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 100,
    });

    const data = conversations.map((c) => {
      const participants = [];
      if (c.landlord) participants.push({ id: c.landlord.id, name: c.landlord.fullName ?? 'Landlord', role: 'landlord' });
      if (c.tenant) participants.push({ id: c.tenant.id, name: c.tenant.fullName ?? 'Tenant', role: 'tenant' });
      if (c.agent) participants.push({ id: c.agent.id, name: c.agent.fullName ?? 'Agent', role: 'agent' });

      const unreadCounts = (c as any).unreadCounts as Record<string, number> | null;
      const unreadCount = unreadCounts?.[user.id] ?? 0;

      return {
        id: c.id,
        subject: c.subject,
        lastMessage: c.messages[0]?.content ?? null,
        lastMessageAt: c.messages[0]?.createdAt ?? c.updatedAt,
        status: c.status,
        participants,
        listing: c.listing,
        landlord: c.landlord,
        tenant: c.tenant,
        unreadCount,
      };
    });

    return NextResponse.json({ data });
  } catch (e) {
    console.error('[conversations] GET failed:', e);
    return NextResponse.json({ error: 'Failed to load conversations' }, { status: 500 });
  }
}
