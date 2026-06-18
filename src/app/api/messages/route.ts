import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { createConversationSchema, messageFilterSchema } from '@/lib/validators';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const searchParams = request.nextUrl.searchParams;
    const params = Object.fromEntries(searchParams.entries());
    const { page, limit, sort, order, conversationId, since } = messageFilterSchema
      .extend({
        page: z.coerce.number().int().positive().default(1),
        limit: z.coerce.number().int().positive().max(100).default(50),
      })
      .parse(params);

    // Verify user has access to this conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { id: true, landlordId: true, tenantId: true },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    if (conversation.landlordId !== user.id && conversation.tenantId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
    }

    const skip = (page - 1) * limit;
    const take = limit;

    const where: Record<string, unknown> = { conversationId };
    if (since) {
      where.createdAt = { gte: new Date(since) };
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          sender: { select: { id: true, fullName: true, avatarUrl: true, role: true } },
        },
      }),
      prisma.message.count({ where }),
    ]);

    // Mark messages as read for the current user
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: user.id },
        isRead: false,
      },
      data: { isRead: true, readAt: new Date() },
    });

    // Update unread count in conversation
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

    return NextResponse.json({
      success: true,
      data: messages.reverse(), // Return in chronological order
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Messages GET error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid query parameters', details: error }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authResult = await withAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json();

    // Check if this is creating a conversation or sending a message
    if ('tenantId' in body && 'listingId' in body) {
      // Create conversation
      const validated = createConversationSchema.parse(body);

      // Verify listing exists
      const listing = await prisma.listing.findUnique({
        where: { id: validated.listingId },
        select: { id: true, ownerId: true, agentId: true, title: true },
      });

      if (!listing) {
        return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
      }

      // Verify tenant exists and is a tenant
      const tenant = await prisma.user.findUnique({
        where: { id: validated.tenantId },
        select: { id: true, role: true, fullName: true },
      });

      if (!tenant || tenant.role !== 'TENANT') {
        return NextResponse.json({ error: 'Invalid tenant' }, { status: 400 });
      }

      // Check if conversation already exists
      const existing = await prisma.conversation.findUnique({
        where: {
          landlordId_tenantId_listingId: {
            landlordId: listing.ownerId,
            tenantId: validated.tenantId,
            listingId: validated.listingId,
          },
        },
      });

      if (existing) {
        return NextResponse.json({ success: true, data: existing });
      }

      const conversation = await prisma.conversation.create({
        data: {
          listingId: validated.listingId,
          landlordId: listing.ownerId,
          tenantId: validated.tenantId,
          subject: validated.subject,
        },
        include: {
          landlord: { select: { id: true, fullName: true, avatarUrl: true } },
          tenant: { select: { id: true, fullName: true, avatarUrl: true } },
          listing: { select: { id: true, title: true, area: true } },
        },
      });

      // Notify landlord
      await prisma.notification.create({
        data: {
          userId: listing.ownerId,
          type: 'message',
          title: 'New Conversation',
          body: `${tenant.fullName} started a conversation about ${listing.title}.`,
          data: { conversationId: conversation.id },
        },
      });

      return NextResponse.json({ success: true, data: conversation }, { status: 201 });
    } else {
      // Send message - would need sendMessageSchema validation
      const { sendMessageSchema } = await import('@/lib/validators');
      const validated = sendMessageSchema.parse(body);

      const conversation = await prisma.conversation.findUnique({
        where: { id: validated.conversationId },
        select: { id: true, landlordId: true, tenantId: true, listingId: true },
      });

      if (!conversation) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }

      if (conversation.landlordId !== user.id && conversation.tenantId !== user.id && user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
      }

      const message = await prisma.message.create({
        data: {
          conversationId: validated.conversationId,
          senderId: user.id,
          content: validated.content,
          attachmentUrl: validated.attachmentUrl,
          attachmentType: validated.attachmentType,
        },
        include: {
          sender: { select: { id: true, fullName: true, avatarUrl: true, role: true } },
        },
      });

      // Update conversation
      const recipientId = conversation.landlordId === user.id ? conversation.tenantId : conversation.landlordId;
      await prisma.conversation.update({
        where: { id: validated.conversationId },
        data: {
          lastMessage: validated.content.substring(0, 200),
          lastMessageAt: new Date(),
          unreadLandlord: conversation.landlordId === recipientId ? { increment: 1 } : undefined,
          unreadTenant: conversation.tenantId === recipientId ? { increment: 1 } : undefined,
        },
      });

      // Notify recipient
      await prisma.notification.create({
        data: {
          userId: recipientId,
          type: 'message',
          title: 'New Message',
          body: `${user.fullName}: ${validated.content.substring(0, 100)}...`,
          data: { conversationId: validated.conversationId, messageId: message.id },
        },
      });

      return NextResponse.json({ success: true, data: message }, { status: 201 });
    }
  } catch (error) {
    console.error('Messages POST error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request body', details: error }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}