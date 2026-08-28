'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, apiEndpoints, type Conversation, type Message, type CreateConversationInput, type SendMessageInput, type MessageFilters } from '@/lib/api';
import { useCallback } from 'react';

// Query Keys
export const messagesKeys = {
  all: ['messages'] as const,
  conversations: () => [...messagesKeys.all, 'conversations'] as const,
  conversationList: (params?: { page?: number; limit?: number }) => 
    [...messagesKeys.conversations(), 'list', params] as const,
  conversation: (id: string) => [...messagesKeys.conversations(), id] as const,
  messages: (filters: MessageFilters) => [...messagesKeys.all, 'messages', filters] as const,
};

/**
 * Get all conversations for the current user
 */
export function useConversations(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: messagesKeys.conversationList(params),
    queryFn: () => apiEndpoints.messages.getConversations(params),
    staleTime: 30 * 1000,
  });
}

/**
 * Get a single conversation with its messages
 */
export function useConversation(conversationId: string, enabled = true) {
  return useQuery({
    queryKey: messagesKeys.conversation(conversationId),
    queryFn: () => apiEndpoints.messages.getMessages({ conversationId, limit: 50 }),
    enabled: enabled && !!conversationId,
    staleTime: 10 * 1000, // 10 seconds - messages update frequently
  });
}

/**
 * Get messages for a conversation with pagination (for infinite scroll)
 */
export function useMessages(filters: MessageFilters) {
  return useQuery({
    queryKey: messagesKeys.messages(filters),
    queryFn: () => apiEndpoints.messages.getMessages(filters),
    enabled: !!filters.conversationId,
    staleTime: 5 * 1000,
  });
}

/**
 * Mutation for creating a new conversation
 */
export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateConversationInput) => apiEndpoints.messages.createConversation(data),
    onSuccess: (conversation) => {
      queryClient.invalidateQueries({ queryKey: messagesKeys.conversations() });
      queryClient.setQueryData(messagesKeys.conversation(conversation.id), {
        data: [conversation],
        pagination: { page: 1, limit: 50, total: 1, totalPages: 1, hasNext: false, hasPrev: false },
      });
    },
  });
}

/**
 * Mutation for sending a message with OPTIMISTIC UPDATES
 * This provides instant UI feedback before the server responds
 */
export function useSendMessage(conversationId: string, sender?: { id: string; fullName: string; role: string }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<SendMessageInput, 'conversationId'>) =>
      apiEndpoints.messages.sendMessage({ ...data, conversationId }),
    onMutate: async (newMessage) => {
      await queryClient.cancelQueries({ queryKey: messagesKeys.conversation(conversationId) });

      const previousData = queryClient.getQueryData(messagesKeys.conversation(conversationId)) as { data?: unknown } | undefined;

      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        conversationId,
        senderId: sender?.id || 'current-user',
        content: newMessage.content,
        attachmentUrl: newMessage.attachmentUrl || null,
        attachmentType: newMessage.attachmentType || null,
        readAt: null,
        createdAt: new Date().toISOString(),
        sender: {
          id: sender?.id || 'current-user',
          fullName: sender?.fullName || 'You',
          avatarUrl: null,
          role: sender?.role || 'tenant',
        },
      };

      // Update the conversation query (which includes messages)
      queryClient.setQueryData(
        messagesKeys.conversation(conversationId),
        (old: { data?: Message[]; [k: string]: unknown } | undefined) => {
          const current = Array.isArray(old?.data) ? old.data : [];
          return {
            ...old,
            data: [...current, optimisticMessage],
          };
        }
      );

      // Also update the conversation list with latest message preview
      queryClient.setQueriesData(
        { queryKey: messagesKeys.conversations() },
        (old: { data: Conversation[]; pagination: unknown } | undefined) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map(conv =>
              conv.id === conversationId
                ? {
                    ...conv,
                    lastMessage: newMessage.content.substring(0, 200),
                    lastMessageAt: optimisticMessage.createdAt,
                  }
                : conv
            ),
          };
        }
      );

      return { previousData };
    },
    onError: (err, newMessage, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(
          messagesKeys.conversation(conversationId),
          context.previousData
        );
      }
    },
    onSuccess: (response) => {
      const serverMessage = response?.data;
      if (!serverMessage) return;

      // Replace optimistic message with server message
      queryClient.setQueryData(
        messagesKeys.conversation(conversationId),
        (old: { data?: Message[]; [k: string]: unknown } | undefined) => {
          const current = Array.isArray(old?.data) ? old.data : [];
          return {
            ...old,
            data: current.map((msg: Message) =>
              msg.id.startsWith('temp-') && msg.content === serverMessage.content
                ? serverMessage
                : msg
            ),
          };
        }
      );

      // Update conversation in list
      queryClient.setQueriesData(
        { queryKey: messagesKeys.conversations() },
        (old: { data: Conversation[]; pagination: unknown } | undefined) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map(conv =>
              conv.id === conversationId
                ? {
                    ...conv,
                    lastMessage: serverMessage.content.substring(0, 200),
                    lastMessageAt: serverMessage.createdAt,
                  }
                : conv
            ),
          };
        }
      );
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({
        queryKey: messagesKeys.conversation(conversationId),
      });
      queryClient.invalidateQueries({
        queryKey: messagesKeys.conversations(),
      });
    },
  });
}

/**
 * Mutation for marking conversation as read
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => apiEndpoints.messages.markAsRead(conversationId),
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({ queryKey: messagesKeys.conversation(conversationId) });
      queryClient.invalidateQueries({ queryKey: messagesKeys.conversations() });
    },
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) =>
      fetch(`/api/conversations/${conversationId}`, { method: 'DELETE' }).then((res) => {
        if (!res.ok) return res.json().then((err: any) => Promise.reject(new Error(err?.error || 'Failed to delete conversation')));
        return res.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messagesKeys.conversations() });
    },
  });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, messageId }: { conversationId: string; messageId: string }) =>
      fetch(`/api/conversations/${conversationId}/messages/${messageId}`, { method: 'DELETE' }).then((res) => {
        if (!res.ok) return res.json().then((err: any) => Promise.reject(new Error(err?.error || 'Failed to delete message')));
        return res.json();
      }),
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: messagesKeys.conversation(conversationId) });
      queryClient.invalidateQueries({ queryKey: messagesKeys.conversations() });
    },
  });
}

/**
 * Mutation for archiving a conversation
 */
export function useArchiveConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => apiEndpoints.messages.archiveConversation(conversationId),
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({ queryKey: messagesKeys.conversations() });
      queryClient.removeQueries({ queryKey: messagesKeys.conversation(conversationId) });
    },
  });
}

/**
 * Mutation for blocking a conversation
 */
export function useBlockConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => apiEndpoints.messages.blockConversation(conversationId),
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({ queryKey: messagesKeys.conversations() });
      queryClient.removeQueries({ queryKey: messagesKeys.conversation(conversationId) });
    },
  });
}

/**
 * Hook for real-time message updates (to be used with WebSocket/SSE)
 * Call this when receiving new messages from a real-time connection
 */
export function useReceiveMessage() {
  const queryClient = useQueryClient();

  return useCallback((message: Message) => {
    queryClient.setQueryData(
      ['messages', 'messages', { conversationId: message.conversationId, limit: 50 }],
      (old: { data: Message[]; pagination: unknown } | undefined) => {
        if (!old) return { data: [message], pagination: { page: 1, limit: 50, total: 1, totalPages: 1, hasNext: false, hasPrev: false } };
        
        // Avoid duplicates
        if (old.data.some(m => m.id === message.id)) return old;
        
        return {
          ...old,
          data: [...old.data, message],
        };
      }
    );

    // Update conversation list
    queryClient.setQueriesData(
      { queryKey: messagesKeys.conversations() },
      (old: { data: Conversation[]; pagination: unknown } | undefined) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((conv: any) => 
            conv.id === message.conversationId 
              ? { ...conv, lastMessageAt: message.createdAt, unreadCount: Number(conv.unreadCount || 0) + 1 }
              : conv
          ),
        };
      }
    );
  }, [queryClient]);
}

/**
 * Hook for reading status updates (message read receipts)
 */
export function useMessageReadReceipt() {
  const queryClient = useQueryClient();

  return useCallback((conversationId: string, messageId: string, readAt: string) => {
    queryClient.setQueryData(
      ['messages', 'messages', { conversationId, limit: 50 }],
      (old: { data: Message[]; pagination: unknown } | undefined) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map(msg => 
            msg.id === messageId ? { ...msg, readAt } : msg
          ),
        };
      }
    );
  }, [queryClient]);
}