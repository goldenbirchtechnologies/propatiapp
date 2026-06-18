import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/conversations/[id]/typing
 * Signal that the user is typing in a conversation
 *
 * This is a lightweight endpoint for typing indicators.
 * In production, this could store typing status in Redis with a 3-second TTL.
 * For MVP with polling, clients can call this endpoint and poll for typing status.
 *
 * Current implementation: Just validates the user has access to the conversation
 * and returns success. Frontend handles showing typing indicators based on timing.
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

    // Authorization: Must be a participant
    const isParticipant =
      conversation.landlordId === user.id || conversation.tenantId === user.id;
    if (!isParticipant) {
      return NextResponse.json(
        { error: 'You are not authorized to access this conversation' },
        { status: 403 }
      );
    }

    // Check if conversation is active
    if (conversation.status === 'blocked') {
      return NextResponse.json(
        { error: 'This conversation has been blocked' },
        { status: 403 }
      );
    }

    // In a real implementation with Redis/WebSocket:
    // 1. Store typing status in Redis with 3-second TTL
    // 2. Broadcast typing event via WebSocket to the other participant
    //
    // Example Redis implementation:
    // await redis.setex(`typing:${conversationId}:${user.id}`, 3, '1');
    //
    // Example WebSocket broadcast:
    // io.to(conversationId).emit('typing', { userId: user.id, conversationId });

    // For polling-based MVP, just return success
    // Frontend will handle showing "X is typing..." based on recent API calls
    return NextResponse.json({
      success: true,
      data: {
        conversationId,
        userId: user.id,
        timestamp: new Date().toISOString(),
      },
      message: 'Typing indicator sent',
    });
  } catch (error) {
    console.error('POST /api/conversations/[id]/typing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/conversations/[id]/typing (Optional)
 * Poll to check if other participant is typing
 *
 * Returns typing status based on recent typing signals (within last 3 seconds)
 * This would typically be served from Redis in production
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
    // Verify conversation exists and user is a participant
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: {
        id: true,
        landlordId: true,
        tenantId: true,
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
        { error: 'You are not authorized to access this conversation' },
        { status: 403 }
      );
    }

    // In a real implementation with Redis:
    // const otherUserId = conversation.landlordId === user.id
    //   ? conversation.tenantId
    //   : conversation.landlordId;
    // const isTyping = await redis.exists(`typing:${conversationId}:${otherUserId}`);

    // For polling-based MVP without Redis, always return false
    // Frontend can implement client-side typing detection based on POST calls
    return NextResponse.json({
      success: true,
      data: {
        conversationId,
        isTyping: false, // Always false in MVP without Redis/WebSocket
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('GET /api/conversations/[id]/typing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
