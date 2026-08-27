'use server';

import { prisma } from '@/lib/prisma';

export type Conversation = {
  id: string;
  subject: string | null;
  listing?: Record<string, unknown> | null;
  participant?: Record<string, unknown> | null;
  lastMessage?: { content: string; createdAt: string } | null;
  lastMessageAt?: string | null;
  unreadCount: number;
  status: string;
  participants?: unknown;
  propertyId?: string | null;
  orgId?: string | null;
};

export type Message = {
  id: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  senderId: string;
  sender?: {
    id?: string;
    fullName?: string | null;
    avatarUrl?: string | null;
    role?: string | null;
  } | null;
};

export async function getConversations(userId: string, userRole: string) {
  const where: Record<string, unknown> = {};
  if (userRole === 'tenant') where.tenantId = userId;
  else if (userRole === 'landlord') where.landlordId = userId;
  else if (userRole === 'agent') where.agentId = userId;
  else if (userRole === 'estate_manager') where.orgId = userId;

  const conversations = await prisma.conversation.findMany({
    where,
    include: {
      listing: { select: { id: true, title: true, address: true, images: true } },
      tenant: { select: { id: true, fullName: true, avatarUrl: true } },
      landlord: { select: { id: true, fullName: true, avatarUrl: true } },
      agent: { select: { id: true, fullName: true, avatarUrl: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { lastMessageAt: 'desc' },
    take: 50,
  });

  return conversations.map((conv) => {
    const unreadCounts = typeof conv.unreadCounts === 'object' && conv.unreadCounts !== null ? (conv.unreadCounts as Record<string, number>) : {};
    const participant =
      conv.tenant?.id === userId ? conv.landlord : conv.tenant || conv.agent;

    return {
      id: conv.id,
      subject: conv.subject,
      listing: conv.listing,
      participant,
      lastMessage: conv.messages[0] ? { content: conv.messages[0].content, createdAt: conv.messages[0].createdAt.toISOString() } : null,
      lastMessageAt: conv.lastMessageAt?.toISOString() || null,
      unreadCount: unreadCounts[userId] || 0,
      status: conv.status,
      participants: conv.participants || [],
      propertyId: conv.propertyId,
      orgId: conv.orgId,
    };
  });
}

export async function getMessages(conversationId: string) {
  const messages = await prisma.message.findMany({
    where: { conversationId },
    include: {
      sender: { select: { id: true, fullName: true, avatarUrl: true, role: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  return messages.map((msg) => ({
    id: msg.id,
    content: msg.content,
    createdAt: msg.createdAt.toISOString(),
    isRead: msg.isRead,
    senderId: msg.senderId,
    sender: msg.sender
      ? {
          id: msg.sender.id,
          fullName: msg.sender.fullName,
          avatarUrl: msg.sender.avatarUrl,
          role: msg.sender.role,
        }
      : null,
  }));
}

export async function sendMessage(conversationId: string, senderId: string, content: string) {
  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId,
      content,
    },
    include: {
      sender: { select: { id: true, fullName: true, avatarUrl: true, role: true } },
    },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      lastMessage: content,
      lastMessageAt: new Date(),
    },
  });

  return {
    id: message.id,
    content: message.content,
    createdAt: message.createdAt.toISOString(),
    isRead: message.isRead,
    senderId: message.senderId,
    sender: message.sender
      ? {
          id: message.sender.id,
          fullName: message.sender.fullName,
          avatarUrl: message.sender.avatarUrl,
          role: message.sender.role,
        }
      : null,
  };
}
