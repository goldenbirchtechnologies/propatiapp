// ===========================================================================
// PROPATI — useNotifications Hook
// React Query hooks for notifications
// ===========================================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// ===========================================================================
// TYPES
// ===========================================================================

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: any;
  read: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  success: boolean;
  data: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ===========================================================================
// HOOKS
// ===========================================================================

/**
 * Fetch user's notifications with pagination and filters
 */
export function useNotifications(params?: {
  unreadOnly?: boolean;
  page?: number;
  limit?: number;
}) {
  const { unreadOnly = false, page = 1, limit = 20 } = params || {};

  return useQuery({
    queryKey: ['notifications', { unreadOnly, page, limit }],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (unreadOnly) {
        searchParams.append('unreadOnly', 'true');
      }

      const response: any = await api.get(`/api/notifications?${searchParams}`);
      return response.data as NotificationsResponse;
    },
    refetchInterval: 30000, // Poll every 30 seconds
    staleTime: 20000, // Consider data stale after 20 seconds
  });
}

/**
 * Get unread notification count
 */
export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const response: any = await api.get('/api/notifications/unread-count');
      return response.data.count as number;
    },
    refetchInterval: 30000, // Poll every 30 seconds
    staleTime: 20000,
  });
}

/**
 * Mark a notification as read/unread
 */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string; read: boolean }) => {
      const response: any = await api.patch(
        `/api/notifications/${params.id}/read`,
        {
          read: params.read,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate all notification queries
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

/**
 * Mark all notifications as read
 */
export function useMarkAllRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response: any = await api.post('/api/notifications/mark-all-read');
      return response.data;
    },
    onSuccess: () => {
      // Invalidate all notification queries
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

/**
 * Quick helper: Mark notification as read (shorthand)
 */
export function useMarkAsRead() {
  const markRead = useMarkNotificationRead();

  return {
    markAsRead: (id: string) => markRead.mutate({ id, read: true }),
    markAsUnread: (id: string) => markRead.mutate({ id, read: false }),
    isLoading: markRead.isPending,
    error: markRead.error,
  };
}
