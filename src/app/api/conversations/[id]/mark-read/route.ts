import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/conversations/[id]/mark-read
 * Mark all messages in a conversation as read for the current user
 * Updates the unread count to 0 for the current user
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
        unreadLandlord: true,
        unreadTenant: true,
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Authorization: Must be a participant
    const isLandlord = conversation.landlordId === user.id;
    const isTenant = conversation.tenantId === user.id;

    if (!isLandlord && !isTenant) {
      return NextResponse.json(
        { error: 'You are not authorized to mark this conversation as read' },
        { status: 403 }
      );
    }

    // Determine which unread count to reset
    const updateData = isLandlord
      ? { unreadLandlord: 0 }
      : { unreadTenant: 0 };

    // Update conversation unread count
    const updatedConversation = await prisma.conversation.update({
      where: { id: conversationId },
      data: updateData,
      select: {
        id: true,
        unreadLandlord: true,
        unreadTenant: true,
        updatedAt: true,
      },
    });

    // Also mark all unread messages as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: user.id }, // Only mark messages from the other person
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        conversationId: updatedConversation.id,
        unreadCount: isLandlord
          ? updatedConversation.unreadLandlord
          : updatedConversation.unreadTenant,
        updatedAt: updatedConversation.updatedAt,
      },
      message: 'Conversation marked as read',
    });
  } catch (error) {
    console.error('POST /api/conversations/[id]/mark-read error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
