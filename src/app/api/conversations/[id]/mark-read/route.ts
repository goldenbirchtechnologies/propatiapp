import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

function isInParticipants(participants: any, userId: string) {
  if (!Array.isArray(participants)) return false;
  return participants.some((p: any) => p.userId === userId);
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
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      select: { id: true, landlordId: true, tenantId: true, participants: true, unreadCounts: true },
    });
    if (!conversation) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });

    const authorized =
      conversation.landlordId === user.id ||
      conversation.tenantId === user.id ||
      isInParticipants(conversation.participants, user.id) ||
      user.role === 'admin';

    if (!authorized) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const updated = await prisma.conversation.update({
      where: { id },
      data: { unreadCounts: { ...(conversation.unreadCounts as any), [user.id]: 0 } },
      select: { id: true, unreadCounts: true, updatedAt: true },
    });

    await prisma.message.updateMany({
      where: { conversationId: id, senderId: { not: user.id }, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      data: { conversationId: updated.id, unreadCount: (updated.unreadCounts as any)?.[user.id] || 0, updatedAt: updated.updatedAt },
      message: 'Conversation marked as read',
    });
  } catch (error) {
    console.error('POST mark-read error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
