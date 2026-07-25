import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// --- Validation ---
const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

const createBodySchema = z.object({
  participants: z.array(z.object({ userId: z.string().cuid(), role: z.string() })).min(2),
  subject: z.string().optional(),
  listingId: z.string().cuid().optional(),
  propertyId: z.string().cuid().optional(),
  orgId: z.string().cuid().optional(),
});

type ConversationParticipant = { userId: string; role: string };
type ConversationInclude = {
  id: string;
  landlordId: string;
  tenantId: string;
  participants: JsonValue;
  subject: string | null;
  lastMessageAt: string | Date;
  status: string;
  listing?: {
    id: string;
    title: string;
    area: string;
    state: string;
    price: number;
    listingType: string | null;
    images: { url: string }[];
  };
}
type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

function participantUnreadCount(participants: JsonValue, userId: string): number {
  if (!participants || typeof participants !== 'object') return 0;
  const asMap = participants as Record<string, unknown>;
  const counts = asMap && typeof asMap === 'object' && 'unreadCounts' in asMap
    ? (asMap as { unreadCounts?: Record<string, number> }).unreadCounts
    : asMap;
  if (!counts || typeof counts !== 'object') return 0;
  return (counts as Record<string, number>)[userId] || 0;
}

// --- LIST ---
export async function GET(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const searchParams = request.nextUrl.searchParams;
    const { page, limit } = listQuerySchema.parse(Object.fromEntries(searchParams.entries()));
    const skip = (page - 1) * limit;

    const [legacyConvs, participantRows] = await Promise.all([
      prisma.conversation.findMany({
        where: {
          OR: [{ landlordId: user.id }, { tenantId: user.id }],
          status: { not: 'blocked' },
        },
        orderBy: { lastMessageAt: 'desc' },
        skip,
        take: limit,
        include: {
          landlord: { select: { id: true, fullName: true, avatarUrl: true, role: true } },
          tenant: { select: { id: true, fullName: true, avatarUrl: true, role: true } },
          listing: {
            select: { id: true, title: true, area: true, state: true, price: true, listingType: true, images: { where: { isCover: true }, take: 1, select: { url: true } } },
          },
          messages: { take: 1, orderBy: { createdAt: 'desc' }, select: { id: true, content: true, createdAt: true, senderId: true } },
        },
      }),
      prisma.$queryRaw<Array<{ id: string }>>`
        SELECT id FROM conversations
        WHERE participants @> ${JSON.stringify([{ userId: user.id }])}::jsonb
          AND status != 'blocked'
        ORDER BY last_message_at DESC
        LIMIT ${skip + limit}
        OFFSET ${skip}
      `,
    ]);

    const legacyIds = new Set(legacyConvs.map((c: any) => c.id));
    const missingIds = participantRows.filter((r: any) => !legacyIds.has(r.id)).map((r: any) => r.id);
    let extraConvs: Array<Record<string, unknown>> = [];
    if (missingIds.length > 0) {
      extraConvs = await prisma.conversation.findMany({
        where: { id: { in: missingIds } },
        orderBy: { lastMessageAt: 'desc' },
        include: {
          landlord: { select: { id: true, fullName: true, avatarUrl: true, role: true } },
          tenant: { select: { id: true, fullName: true, avatarUrl: true, role: true } },
          listing: {
            select: { id: true, title: true, area: true, state: true, price: true, listingType: true, images: { where: { isCover: true }, take: 1, select: { url: true } } },
          },
          messages: { take: 1, orderBy: { createdAt: 'desc' }, select: { id: true, content: true, createdAt: true, senderId: true } },
        },
      });
    }

    const conversations = [...legacyConvs, ...extraConvs];

    const formatted = conversations.map((conv) => {
      const isLandlord = (conv as { landlordId?: string }).landlordId === user.id;
      const other = isLandlord
        ? (conv as { tenant?: { id: string; fullName?: string | null; avatarUrl?: string | null; role?: string } }).tenant
        : (conv as { landlord?: { id: string; fullName?: string | null; avatarUrl?: string | null; role?: string } }).landlord;
      const unread = participantUnreadCount((conv as JsonValue).participants, user.id) || 0;
      const lastMessage = (Array.isArray((conv as { messages?: unknown[] }).messages) ? (conv as { messages?: unknown[] }).messages[0] : null);

      return {
        id: conv.id,
        listingId: conv.listingId,
        listing: conv.listing,
        participant: other,
        subject: conv.subject,
        lastMessage: lastMessage
          ? { id: lastMessage.id, content: lastMessage.content.substring(0, 100), createdAt: lastMessage.createdAt, isSentByMe: lastMessage.senderId === user.id }
          : null,
        lastMessageAt: conv.lastMessageAt,
        unreadCount: unread,
        status: conv.status,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        participants: conv.participants,
        propertyId: conv.propertyId,
        orgId: conv.orgId,
      };
    });

    return NextResponse.json({
      success: true,
      data: formatted,
      pagination: { page, limit, total: formatted.length, totalPages: 1, hasNext: false, hasPrev: false },
    });
  } catch (error) {
    console.error('GET /api/conversations error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid query parameters', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// --- CREATE ---
export async function POST(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const validated = createBodySchema.parse(body);

    if (!validated.participants.some((p) => p.userId === user.id)) {
      return NextResponse.json({ error: 'You must be included as a participant' }, { status: 400 });
    }

    const listing = validated.listingId
      ? await prisma.listing.findUnique({ where: { id: validated.listingId }, select: { id: true, title: true } })
      : null;
    if (validated.listingId && !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    const fallbackLandlord = validated.participants.find((p) => p.role === 'landlord')?.userId || null;
    const fallbackTenant = validated.participants.find((p) => p.role === 'tenant')?.userId || null;

    const conversation = await prisma.conversation.create({
      data: {
        listingId: validated.listingId || null,
        propertyId: validated.propertyId || null,
        orgId: validated.orgId || null,
        landlordId: fallbackLandlord,
        tenantId: fallbackTenant,
        participants: validated.participants,
        subject: validated.subject || (listing ? `Inquiry about ${listing.title}` : 'New Conversation'),
        lastMessageAt: new Date(),
        status: 'active',
      },
      include: {
        landlord: { select: { id: true, fullName: true, avatarUrl: true, role: true } },
        tenant: { select: { id: true, fullName: true, avatarUrl: true, role: true } },
        listing: {
          select: { id: true, title: true, area: true, state: true, price: true, listingType: true, images: { where: { isCover: true }, take: 1, select: { url: true } } },
        },
      },
    });

    const others = validated.participants.filter((p) => p.userId !== user.id);
    if (others.length) {
      const notifications = others.map((p) => ({
        userId: p.userId,
        type: 'message',
        title: 'New Conversation',
        body: `${user.fullName} started a conversation${conversation.listing ? ` about ${(conversation.listing as { title?: string | null }).title ?? ''}` : ''}`,
        data: { conversationId: conversation.id, listingId: validated.listingId },
      }));
      await Promise.all(notifications.map((item) => prisma.notification.create({ data: item })));
    }

    return NextResponse.json({ success: true, data: conversation, message: 'Conversation created successfully' }, { status: 201 });
  } catch (error) {
    console.error('POST /api/conversations error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request body', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
