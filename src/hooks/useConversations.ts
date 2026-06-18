'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

// Types
interface User {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  role: string;
}

interface Listing {
  id: string;
  title: string;
  area: string;
  state: string;
  price: number;
  listingType: string;
  images: { url: string }[];
}

interface LastMessage {
  id: string;
  content: string;
  createdAt: string;
  isSentByMe: boolean;
}

export interface Conversation {
  id: string;
  listingId: string | null;
  listing: Listing | null;
  participant: User;
  subject: string | null;
  lastMessage: LastMessage | null;
  lastMessageAt: string | null;
  unreadCount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachmentUrl: string | null;
  attachmentType: 'image' | 'document' | 'video' | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  sender: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
    role: string;
  };
}

export interface CreateConversationInput {
  listingId: string;
  participantId: string;
  subject?: string;
}

export interface SendMessageInput {
  content: string;
  attachmentUrl?: string;
  attachmentType?: 'image' | 'document' | 'video';
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    nextCursor?: string | null;
  };
}

// Query Keys
export const conversationsKeys = {
  all: ['conversations'] as const,
  lists: () => [...conversationsKeys.all, 'list'] as const,
  list: (params?: { page?: number; limit?: number }) =>
    [...conversationsKeys.lists(), params] as const,
  details: () => [...conversationsKeys.all, 'detail'] as const,
  detail: (id: string) => [...conversationsKeys.details(), id] as const,
  messages: (conversationId: string, params?: { page?: number; limit?: number }) =>
    [...conversationsKeys.all, 'messages', conversationId, params] as const,
};

/**
 * Hook: useConversations
 * Get all conversations for the current user
 * Polls every 4 seconds for new messages
 */
export function useConversations(params?: { page?: number; limit?: number }) {
  return useQuery<ApiResponse<Conversation[]>>({
    queryKey: conversationsKeys.list(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams(
        params ? (Object.fromEntries(
          Object.entries(params).filter(([_, v]) => v !== undefined)
        ) as Record<string, string>) : {}
      );
      const response = await fetch(`/api/conversations?${searchParams}`, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }
      return response.json();
    },
    refetchInterval: 4000, // Poll every 4 seconds
    staleTime: 3000, // Consider data stale after 3 seconds
  });
}

/**
 * Hook: useConversation
 * Get a single conversation by ID
 * Does not poll (use useMessages for message polling)
 */
export function useConversation(conversationId: string, enabled = true) {
  return useQuery({
    queryKey: conversationsKeys.detail(conversationId),
    queryFn: async () => {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch conversation');
      }
      return response.json();
    },
    enabled: enabled && !!conversationId,
  });
}

/**
 * Hook: useMessages
 * Get messages for a conversation with pagination
 * Polls every 4 seconds for new messages
 */
export function useMessages(
  conversationId: string,
  params?: { page?: number; limit?: number; before?: string }
) {
  return useQuery<ApiResponse<Message[]>>({
    queryKey: conversationsKeys.messages(conversationId, params),
    queryFn: async () => {
      const searchParams = new URLSearchParams(
        params ? (Object.fromEntries(
          Object.entries(params).filter(([_, v]) => v !== undefined)
        ) as Record<string, string>) : {}
      );
      const response = await fetch(
        `/api/conversations/${conversationId}/messages?${searchParams}`,
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      return response.json();
    },
    enabled: !!conversationId,
    refetchInterval: 4000, // Poll every 4 seconds for new messages
    staleTime: 3000,
  });
}

/**
 * Hook: useCreateConversation
 * Create a new conversation or get existing one (idempotent)
 */
export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<Conversation>, Error, CreateConversationInput>({
    mutationFn: async (data) => {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create conversation');
      }
      return response.json();
    },
    onSuccess: (response) => {
      // Invalidate conversations list
      queryClient.invalidateQueries({ queryKey: conversationsKeys.lists() });

      // Set the new conversation in cache
      queryClient.setQueryData(
        conversationsKeys.detail(response.data.id),
        response
      );
    },
  });
}

/**
 * Hook: useSendMessage
 * Send a message in a conversation with OPTIMISTIC UPDATES
 * Provides instant UI feedback before server responds
 */
export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<Message>, Error, SendMessageInput>({
    mutationFn: async (data) => {
      const response = await fetch(
        `/api/conversations/${conversationId}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }
      return response.json();
    },
    onMutate: async (newMessage) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: conversationsKeys.messages(conversationId),
      });

      // Snapshot previous value
      const previousMessages = queryClient.getQueryData(
        conversationsKeys.messages(conversationId, { page: 1, limit: 50 })
      );

      // Create optimistic message
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        conversationId,
        senderId: 'current-user',
        content: newMessage.content,
        attachmentUrl: newMessage.attachmentUrl || null,
        attachmentType: newMessage.attachmentType || null,
        isRead: false,
        readAt: null,
        createdAt: new Date().toISOString(),
        sender: {
          id: 'current-user',
          fullName: 'You',
          avatarUrl: null,
          role: 'user',
        },
      };

      // Optimistically update messages cache
      queryClient.setQueryData<ApiResponse<Message[]>>(
        conversationsKeys.messages(conversationId, { page: 1, limit: 50 }),
        (old) => {
          if (!old) {
            return {
              success: true,
              data: [optimisticMessage],
              pagination: {
                page: 1,
                limit: 50,
                total: 1,
                totalPages: 1,
                hasNext: false,
                hasPrev: false,
              },
            };
          }
          return {
            ...old,
            data: [...old.data, optimisticMessage],
          };
        }
      );

      // Optimistically update conversation list
      queryClient.setQueriesData<ApiResponse<Conversation[]>>(
        { queryKey: conversationsKeys.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((conv) =>
              conv.id === conversationId
                ? {
                    ...conv,
                    lastMessage: {
                      id: optimisticMessage.id,
                      content: optimisticMessage.content.substring(0, 100),
                      createdAt: optimisticMessage.createdAt,
                      isSentByMe: true,
                    },
                    lastMessageAt: optimisticMessage.createdAt,
                  }
                : conv
            ),
          };
        }
      );

      return { previousMessages };
    },
    onError: (err, newMessage, context) => {
      // Rollback on error
      if (context?.previousMessages) {
        queryClient.setQueryData(
          conversationsKeys.messages(conversationId, { page: 1, limit: 50 }),
          context.previousMessages
        );
      }
    },
    onSuccess: (response) => {
      // Replace optimistic message with server message
      queryClient.setQueryData<ApiResponse<Message[]>>(
        conversationsKeys.messages(conversationId, { page: 1, limit: 50 }),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((msg) =>
              msg.id.startsWith('temp-') && msg.content === response.data.content
                ? response.data
                : msg
            ),
          };
        }
      );

      // Invalidate to ensure consistency
      queryClient.invalidateQueries({
        queryKey: conversationsKeys.messages(conversationId),
      });
      queryClient.invalidateQueries({ queryKey: conversationsKeys.lists() });
    },
  });
}

/**
 * Hook: useMarkConversationRead
 * Mark all messages in a conversation as read
 */
export function useMarkConversationRead() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<{ conversationId: string; unreadCount: number }>, Error, string>({
    mutationFn: async (conversationId) => {
      const response = await fetch(
        `/api/conversations/${conversationId}/mark-read`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to mark conversation as read');
      }
      return response.json();
    },
    onSuccess: (_, conversationId) => {
      // Update conversation in cache
      queryClient.setQueriesData<ApiResponse<Conversation[]>>(
        { queryKey: conversationsKeys.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((conv) =>
              conv.id === conversationId
                ? { ...conv, unreadCount: 0 }
                : conv
            ),
          };
        }
      );

      queryClient.invalidateQueries({
        queryKey: conversationsKeys.detail(conversationId),
      });
    },
  });
}

/**
 * Hook: useTypingIndicator
 * Send typing indicator signal
 */
export function useTypingIndicator(conversationId: string) {
  return useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `/api/conversations/${conversationId}/typing`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      if (!response.ok) {
        throw new Error('Failed to send typing indicator');
      }
      return response.json();
    },
    // Don't show errors for typing indicators (non-critical)
    onError: () => {
      // Silent fail - typing indicators are non-critical
    },
  });
}
