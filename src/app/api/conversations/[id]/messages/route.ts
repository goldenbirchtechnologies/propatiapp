import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

function safeParseParticipants(raw: unknown): any[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

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
    const unreadCounts = (conversation as { unreadCounts?: JsonValue }).unreadCounts || {};
    const participantsForUnread = Array.isArray(conversation.participants)
      ? conversation.participants
      : typeof conversation.participants === 'string'
        ? JSON.parse(conversation.participants || '[]')
        : [];
    const otherParticipants = participantsForUnread.filter((p: any) => p?.userId && p.userId !== user.id);
    const legacyOthers: string[] = [];
    if (conversation.landlordId && conversation.landlordId !== user.id) legacyOthers.push(conversation.landlordId);
    if (conversation.tenantId && conversation.tenantId !== user.id) legacyOthers.push(conversation.tenantId);

    const recipients = Array.from(new Set([...otherParticipants.map((p: any) => p.userId).filter(Boolean), ...legacyOthers]));

    const messageRecord = await prisma.message.create({
      data: { conversationId: id, senderId: user.id, content, attachmentUrl: attachmentUrl || null, attachmentType: (attachmentType as 'image' | 'document' | 'video' | null) || null },
      include: { sender: { select: { id: true, fullName: true, avatarUrl: true, role: true } } },
    });

    await prisma.conversation.update({
      where: { id },
      data: { lastMessage: content.substring(0, 200), lastMessageAt: new Date(), unreadCounts },
    });

    await Promise.all(
      recipients.map((recipientId) =>
        prisma.notification.create({
          data: {
            userId: recipientId,
            type: 'message',
            title: 'New Message',
            body: `${user.fullName}: ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`,
            data: { conversationId: id, messageId: '', listingId: (conversation.listing as any)?.id, listingTitle: (conversation.listing as any)?.title },
          },
        })
      )
    );

    return NextResponse.json({ success: true, data: messageRecord, message: 'Message sent' }, { status: 201 });
  } catch (error) {
    console.error('POST messages error:', error);
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'Invalid body', details: error.errors }, { status: 400 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
