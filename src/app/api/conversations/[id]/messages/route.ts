import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schemas
const getMessagesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  before: z.string().cuid().optional(), // Message ID for cursor-based pagination
});

const sendMessageBodySchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(5000, 'Message too long'),
  attachmentUrl: z.string().url().optional(),
  attachmentType: z.enum(['image', 'document', 'video']).optional(),
}).refine(
  (data) => {
    // If attachmentUrl is provided, attachmentType must also be provided
    if (data.attachmentUrl && !data.attachmentType) {
      return false;
    }
    return true;
  },
  {
    message: 'attachmentType is required when attachmentUrl is provided',
    path: ['attachmentType'],
  }
);

/**
 * GET /api/conversations/[id]/messages
 * Get messages for a conversation with pagination
 * Returns messages in reverse chronological order (newest first)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const { id: conversationId } = await params;

  try {
    const searchParams = request.nextUrl.searchParams;
    const queryParams = Object.fromEntries(searchParams.entries());
    const { page, limit, before } = getMessagesQuerySchema.parse(queryParams);

    // Verify conversation exists and user is a participant
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: {
        id: true,
        landlordId: true,
        tenantId: true,
        status: true,
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Authorization: Must be a participant or admin
    const isParticipant =
      conversation.landlordId === user.id || conversation.tenantId === user.id;
    if (!isParticipant && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'You are not authorized to view this conversation' },
        { status: 403 }
      );
    }

    // Build where clause for pagination
    const where: any = {
      conversationId,
    };

    // Cursor-based pagination using 'before' messageId
    if (before) {
      const beforeMessage = await prisma.message.findUnique({
        where: { id: before },
        select: { createdAt: true },
      });

      if (beforeMessage) {
        where.createdAt = { lt: beforeMessage.createdAt };
      }
    }

    // Fetch messages
    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          sender: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
              role: true,
            },
          },
        },
      }),
      prisma.message.count({ where: { conversationId } }),
    ]);

    return NextResponse.json({
      success: true,
      data: messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: messages.length === limit,
        hasPrev: !!before,
        nextCursor: messages.length > 0 ? messages[messages.length - 1].id : null,
      },
    });
  } catch (error) {
    console.error('GET /api/conversations/[id]/messages error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/conversations/[id]/messages
 * Send a new message in a conversation
 * Updates conversation lastMessageAt and increments unread count for recipient
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const { id: conversationId } = await params;

  try {
    const body = await request.json();
    const { content, attachmentUrl, attachmentType } = sendMessageBodySchema.parse(body);

    // Verify conversation exists and user is a participant
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: {
        id: true,
        landlordId: true,
        tenantId: true,
        status: true,
        listing: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Authorization: Must be a participant
    const isParticipant =
      conversation.landlordId === user.id || conversation.tenantId === user.id;
    if (!isParticipant) {
      return NextResponse.json(
        { error: 'You are not authorized to send messages in this conversation' },
        { status: 403 }
      );
    }

    // Check if conversation is blocked
    if (conversation.status === 'blocked') {
      return NextResponse.json(
        { error: 'This conversation has been blocked' },
        { status: 403 }
      );
    }

    // Determine recipient
    const recipientId =
      conversation.landlordId === user.id
        ? conversation.tenantId
        : conversation.landlordId;
    const isLandlord = conversation.landlordId === user.id;

    // Create message and update conversation in a transaction
    const [message] = await prisma.$transaction([
      // Create message
      prisma.message.create({
        data: {
          conversationId,
          senderId: user.id,
          content,
          attachmentUrl,
          attachmentType: attachmentType as any,
        },
        include: {
          sender: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
              role: true,
            },
          },
        },
      }),
      // Update conversation
      prisma.conversation.update({
        where: { id: conversationId },
        data: {
          lastMessage: content.substring(0, 200),
          lastMessageAt: new Date(),
          // Increment unread count for recipient
          ...(isLandlord
            ? { unreadTenant: { increment: 1 } }
            : { unreadLandlord: { increment: 1 } }),
        },
      }),
      // Create notification for recipient
      prisma.notification.create({
        data: {
          userId: recipientId,
          type: 'message',
          title: 'New Message',
          body: `${user.fullName}: ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`,
          data: {
            conversationId,
            messageId: '', // Will be updated after message creation
            listingId: conversation.listing?.id,
            listingTitle: conversation.listing?.title,
          },
        },
      }),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: message,
        message: 'Message sent successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/conversations/[id]/messages error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request body', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
