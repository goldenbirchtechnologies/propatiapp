import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

type Params = Promise<{ id: string }>;

export async function GET(request: NextRequest, { params }: { params: Params }) {
  const authResult = await withAuth(request, ['estate_manager', 'admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const { id } = await params;

  try {
    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        OR: [
          { landlordId: user.id },
          { tenantId: user.id },
          { agentId: user.id },
        ],
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      include: {
        sender: { select: { id: true, fullName: true } },
      },
      orderBy: { createdAt: 'asc' },
      take: 200,
    });

    const data = messages.map((m) => ({
      id: m.id,
      conversationId: m.conversationId,
      senderId: m.senderId,
      senderName: m.sender.fullName ?? 'Unknown',
      content: m.content,
      attachmentUrl: m.attachmentUrl,
      attachmentType: m.attachmentType,
      isRead: m.isRead,
      createdAt: m.createdAt,
    }));

    return NextResponse.json({ data });
  } catch (e) {
    console.error('[conversation-messages] GET failed:', e);
    return NextResponse.json({ error: 'Failed to load messages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Params }) {
  const authResult = await withAuth(request, ['estate_manager', 'admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const { id } = await params;

  try {
    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        OR: [
          { landlordId: user.id },
          { tenantId: user.id },
          { agentId: user.id },
        ],
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const body = await request.json();
    const content = typeof body.content === 'string' ? body.content.trim() : '';
    if (!content) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        conversationId: id,
        senderId: user.id,
        content,
      },
      include: {
        sender: { select: { id: true, fullName: true } },
      },
    });

    await prisma.conversation.update({
      where: { id },
      data: {
        lastMessage: content,
        lastMessageAt: new Date(),
      },
    });

    return NextResponse.json({
      data: {
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        senderName: message.sender.fullName ?? 'Unknown',
        content: message.content,
        attachmentUrl: message.attachmentUrl,
        attachmentType: message.attachmentType,
        isRead: message.isRead,
        createdAt: message.createdAt,
      },
    });
  } catch (e) {
    console.error('[conversation-messages] POST failed:', e);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
