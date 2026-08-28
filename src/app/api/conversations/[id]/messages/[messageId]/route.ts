import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;
  const { id, messageId } = await params;

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      select: { id: true, landlordId: true, tenantId: true, participants: true, status: true },
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

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      select: { id: true, conversationId: true, senderId: true },
    });
    if (!message || message.conversationId !== id) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    if (message.senderId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'You can only delete your own messages' }, { status: 403 });
    }

    await prisma.message.delete({ where: { id: messageId } });

    return NextResponse.json({ success: true, data: { id: messageId } });
  } catch (error) {
    console.error('DELETE message error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
