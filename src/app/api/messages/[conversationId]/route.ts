import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const { conversationId } = await params;

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        landlord: { select: { id: true, fullName: true, avatarUrl: true, email: true, phone: true } },
        tenant: { select: { id: true, fullName: true, avatarUrl: true, email: true, phone: true } },
        listing: { select: { id: true, title: true, area: true, state: true, price: true, images: { where: { isCover: true }, take: 1 } } },
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 50,
          include: { sender: { select: { id: true, fullName: true, avatarUrl: true, role: true } } },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    if (conversation.landlordId !== user.id && conversation.tenantId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    // Mark as read
    if (conversation.landlordId === user.id) {
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { unreadLandlord: 0 },
      });
    } else if (conversation.tenantId === user.id) {
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { unreadTenant: 0 },
      });
    }

    return NextResponse.json({ success: true, data: conversation });
  } catch (error) {
    console.error('Conversation GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const { conversationId } = await params;

  try {
    const body = await request.json();
    const { status, action } = body;

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { id: true, landlordId: true, tenantId: true, status: true },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    if (conversation.landlordId !== user.id && conversation.tenantId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    let updateData: Record<string, unknown> = {};

    if (status && ['active', 'archived', 'blocked'].includes(status)) {
      updateData.status = status;
    }

    if (action === 'archive') {
      updateData.status = 'archived';
    } else if (action === 'block') {
      updateData.status = 'blocked';
    } else if (action === 'unblock') {
      updateData.status = 'active';
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid action provided' }, { status: 400 });
    }

    const updated = await prisma.conversation.update({
      where: { id: conversationId },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Conversation PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}