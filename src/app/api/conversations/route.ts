import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schemas
const createConversationBodySchema = z.object({
  listingId: z.string().cuid(),
  participantId: z.string().cuid(),
});

const getConversationsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

/**
 * GET /api/conversations
 * List user's conversations with last message preview and unread counts
 * Sorted by last message timestamp (newest first)
 */
export async function GET(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const searchParams = request.nextUrl.searchParams;
    const params = Object.fromEntries(searchParams.entries());
    const { page, limit } = getConversationsQuerySchema.parse(params);

    const skip = (page - 1) * limit;

    // Find conversations where user is either landlord or tenant
    const where = {
      OR: [
        { landlordId: user.id },
        { tenantId: user.id },
      ],
      status: { not: 'blocked' as const },
    };

    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where,
        orderBy: { lastMessageAt: 'desc' },
        skip,
        take: limit,
        include: {
          landlord: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
              role: true,
            },
          },
          tenant: {
            select: {
              id: true,
              fullName: true,
              avatarUrl: true,
              role: true,
            },
          },
          listing: {
            select: {
              id: true,
              title: true,
              area: true,
              state: true,
              price: true,
              listingType: true,
              images: {
                where: { isCover: true },
                take: 1,
                select: { url: true },
              },
            },
          },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              content: true,
              createdAt: true,
              senderId: true,
            },
          },
        },
      }),
      prisma.conversation.count({ where }),
    ]);

    // Format conversations with unread count for current user
    const formattedConversations = conversations.map((conv) => {
      const isLandlord = conv.landlordId === user.id;
      const unreadCount = isLandlord ? conv.unreadLandlord : conv.unreadTenant;
      const otherParticipant = isLandlord ? conv.tenant : conv.landlord;
      const lastMessage = conv.messages[0] || null;

      return {
        id: conv.id,
        listingId: conv.listingId,
        listing: conv.listing,
        participant: otherParticipant,
        subject: conv.subject,
        lastMessage: lastMessage
          ? {
              id: lastMessage.id,
              content: lastMessage.content.substring(0, 100),
              createdAt: lastMessage.createdAt,
              isSentByMe: lastMessage.senderId === user.id,
            }
          : null,
        lastMessageAt: conv.lastMessageAt,
        unreadCount,
        status: conv.status,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedConversations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('GET /api/conversations error:', error);
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
 * POST /api/conversations
 * Create or get existing conversation between landlord and tenant about a listing
 * Idempotent: Returns existing conversation if already created
 */
export async function POST(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();
    const { listingId, participantId } = createConversationBodySchema.parse(body);

    // Verify listing exists
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: {
        id: true,
        ownerId: true,
        title: true,
        area: true,
        state: true,
        status: true,
      },
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (listing.status === 'deleted') {
      return NextResponse.json({ error: 'Listing is no longer available' }, { status: 400 });
    }

    // Verify participant exists
    const participant = await prisma.user.findUnique({
      where: { id: participantId },
      select: {
        id: true,
        role: true,
        fullName: true,
        isActive: true,
        isBanned: true,
      },
    });

    if (!participant) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
    }

    if (!participant.isActive || participant.isBanned) {
      return NextResponse.json({ error: 'Participant account is not active' }, { status: 400 });
    }

    // Determine landlord and tenant based on listing owner and participant
    let landlordId: string;
    let tenantId: string;

    if (listing.ownerId === user.id) {
      // Current user is the landlord
      landlordId = user.id;
      tenantId = participantId;

      // Validate participant is tenant
      if (participant.role !== 'tenant') {
        return NextResponse.json(
          { error: 'Participant must be a tenant' },
          { status: 400 }
        );
      }
    } else if (listing.ownerId === participantId) {
      // Current user is the tenant
      landlordId = participantId;
      tenantId = user.id;

      // Validate current user is tenant
      if (user.role !== 'tenant') {
        return NextResponse.json(
          { error: 'Only tenants can initiate conversations with landlords' },
          { status: 403 }
        );
      }
    } else {
      // Neither user is the landlord
      return NextResponse.json(
        { error: 'Invalid conversation participants. One must be the listing owner.' },
        { status: 400 }
      );
    }

    // Check if conversation already exists (idempotent)
    const existingConversation = await prisma.conversation.findUnique({
      where: {
        landlordId_tenantId_listingId: {
          landlordId,
          tenantId,
          listingId,
        },
      },
      include: {
        landlord: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            role: true,
          },
        },
        tenant: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            role: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
            area: true,
            state: true,
            price: true,
            listingType: true,
            images: {
              where: { isCover: true },
              take: 1,
              select: { url: true },
            },
          },
        },
      },
    });

    if (existingConversation) {
      // If conversation was blocked or archived, reactivate it
      if (existingConversation.status !== 'active') {
        await prisma.conversation.update({
          where: { id: existingConversation.id },
          data: { status: 'active', updatedAt: new Date() },
        });
      }

      return NextResponse.json({
        success: true,
        data: existingConversation,
        message: 'Existing conversation retrieved',
      });
    }

    // Create new conversation
    const newConversation = await prisma.conversation.create({
      data: {
        listingId,
        landlordId,
        tenantId,
        subject: `Inquiry about ${listing.title}`,
        lastMessageAt: new Date(),
        status: 'active',
      },
      include: {
        landlord: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            role: true,
          },
        },
        tenant: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            role: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
            area: true,
            state: true,
            price: true,
            listingType: true,
            images: {
              where: { isCover: true },
              take: 1,
              select: { url: true },
            },
          },
        },
      },
    });

    // Create notification for the other participant
    const recipientId = user.id === landlordId ? tenantId : landlordId;
    await prisma.notification.create({
      data: {
        userId: recipientId,
        type: 'message',
        title: 'New Conversation',
        body: `${user.fullName} started a conversation about ${listing.title}`,
        data: {
          conversationId: newConversation.id,
          listingId,
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: newConversation,
        message: 'Conversation created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/conversations error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request body', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
