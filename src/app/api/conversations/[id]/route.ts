import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});

const sendSchema = z.object({
  content: z.string().min(1).max(5000),
  attachmentUrl: z.string().url().optional(),
  attachmentType: z.enum(['image', 'document', 'video']).optional(),
}).refine((d) => d.attachmentUrl ? d.attachmentType : true, { message: 'attachmentType required when attachmentUrl present', path: ['attachmentType'] });

type Participant = { userId: string; role?: string };
type ConversationSelect = {
  id: string;
  landlordId: string;
  tenantId: string;
  participants?: JsonValue;
  status: string;
  listing?: { id: string; title: string };
};

function isInParticipants(participants: JsonValue, userId: string): boolean {
  if (!Array.isArray(participants)) return false;
  return participants.some((p) => (p as Participant).userId === userId);
}

function isAuthorized(conv: ConversationSelect, userId: string, role: string): boolean {
  return conv.landlordId === userId || conv.tenantId === userId || isInParticipants(conv.participants ?? [], userId) || role === 'admin';
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;
  const { id } = await params;

  try {
    const { page, limit, before } = querySchema.parse(Object.fromEntries(request.nextUrl.searchParams.entries()));

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      select: { id: true, landlordId: true, tenantId: true, participants: true, status: true },
    });
    if (!conversation) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    if (!isAuthorized(conversation, user.id, user.role)) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const skip = (page - 1) * limit;
    const where: { conversationId: string; createdAt?: { lt?: string } } = { conversationId: id };
    if (before) {
      const cursor = await prisma.message.findUnique({ where: { id: before }, select: { createdAt: true } });
      if (cursor?.createdAt) where.createdAt = { lt: cursor.createdAt };
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({ where, orderBy: { createdAt: 'desc' }, take: limit, include: { sender: { select: { id: true, fullName: true, avatarUrl: true, role: true } } } }),
      prisma.message.count({ where: { conversationId: id } }),
    ]);

    return NextResponse.json({
      success: true,
      data: messages,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasNext: messages.length === limit, hasPrev: !!before, nextCursor: messages.length ? messages[messages.length - 1].id : null },
    });
  } catch (error) {
    console.error('GET messages error:', error);
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'Invalid query', details: error.errors }, { status: 400 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;
  const { id } = await params;

  try {
    const body = await request.json();
    const { content, attachmentUrl, attachmentType } = sendSchema.parse(body);

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      select: { id: true, landlordId: true, tenantId: true, participants: true, status: true, listing: { select: { id: true, title: true } } },
    });
    if (!conversation) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    if (!isAuthorized(conversation, user.id, user.role)) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    if (conversation.status === 'blocked') {
      return NextResponse.json({ error: 'Conversation blocked' }, { status: 403 });
    }

    const update: { lastMessage: string; lastMessageAt: Date; unreadCounts?: JsonValue } = {
      lastMessage: content.substring(0, 200),
      lastMessageAt: new Date(),
    };
    const counts: Record<string, { increment: number }> = {};
    const otherParticipants = Array.isArray(conversation.participants ?? null)
      ? conversation.participants!.filter((p: Participant) => p.userId !== user.id && !!p.userId)
      : [];
    const legacyOthers: string[] = [];
    if (conversation.landlordId && conversation.landlordId !== user.id) legacyOthers.push(conversation.landlordId);
    if (conversation.tenantId && conversation.tenantId !== user.id) legacyOthers.push(conversation.tenantId);

    const recipients = Array.from(new Set([...otherParticipants.map((p) => p.userId), ...legacyOthers]));

    recipients.forEach((recipientId) => {
      counts[recipientId] = { increment: 1 };
    });
    update.unreadCounts = ({ ...counts, ...(conversation as { unreadCounts?: JsonValue }).unreadCounts } as JsonValue);

    const [message] = await prisma.$transaction([
      prisma.message.create({
        data: { conversationId: id, senderId: user.id, content, attachmentUrl: attachmentUrl || null, attachmentType: (attachmentType as 'image' | 'document' | 'video' | null) || null },
        include: { sender: { select: { id: true, fullName: true, avatarUrl: true, role: true } } },
      }),
      prisma.conversation.update({ where: { id }, data: update }),
      ...recipients.map((recipientId) =>
        prisma.notification.create({
          data: {
            userId: recipientId,
            type: 'message',
            title: 'New Message',
            body: `${user.fullName}: ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`,
            data: { conversationId: id, messageId: '', listingId: (conversation.listing as any)?.id, listingTitle: (conversation.listing as any)?.title },
          },
        })
      ),
    ]);

    return NextResponse.json({ success: true, data: message, message: 'Message sent' }, { status: 201 });
  } catch (error) {
    console.error('POST messages error:', error);
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'Invalid body', details: error.errors }, { status: 400 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;
  const { id } = await params;

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      select: { id: true, landlordId: true, tenantId: true, participants: true },
    });
    if (!conversation) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });

    const participants = (() => {
      try { return JSON.parse((conversation as any).participants || '[]'); }
      catch { return []; }
    })();
    const isAuthorized =
      conversation.landlordId === user.id ||
      conversation.tenantId === user.id ||
      participants.some((p: any) => p?.userId === user.id) ||
      user.role === 'admin';

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    await prisma.message.deleteMany({ where: { conversationId: id } });
    await prisma.conversation.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE conversation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
