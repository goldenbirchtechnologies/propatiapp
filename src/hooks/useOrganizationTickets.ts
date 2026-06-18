'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateMaintenanceTicketInput, UpdateMaintenanceTicketInput, PaginationParams } from '@/lib/api';

// Query Keys
export const orgTicketsKeys = {
  all: ['org-tickets'] as const,
  lists: () => [...orgTicketsKeys.all, 'list'] as const,
  list: (orgId: string, params?: TicketFilters) =>
    [...orgTicketsKeys.lists(), orgId, params] as const,
  detail: (orgId: string, ticketId: string) =>
    [...orgTicketsKeys.all, orgId, 'detail', ticketId] as const,
};

export interface TicketFilters extends PaginationParams {
  status?: 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
  category?: 'plumbing' | 'electrical' | 'structural' | 'security' | 'cleaning' | 'other';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  listingId?: string;
  assignedTo?: string;
}

/**
 * Get all maintenance tickets for an organization
 */
export function useOrganizationTickets(orgId: string, params?: TicketFilters, enabled = true) {
  return useQuery({
    queryKey: orgTicketsKeys.list(orgId, params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      if (params?.status) searchParams.set('status', params.status);
      if (params?.category) searchParams.set('category', params.category);
      if (params?.priority) searchParams.set('priority', params.priority);
      if (params?.listingId) searchParams.set('listingId', params.listingId);
      if (params?.assignedTo) searchParams.set('assignedTo', params.assignedTo);

      const res = await fetch(`/api/orgs/${orgId}/tickets?${searchParams}`);
      if (!res.ok) throw new Error('Failed to fetch tickets');
      return res.json();
    },
    enabled: enabled && !!orgId,
    staleTime: 30 * 1000,
  });
}

/**
 * Get a single ticket by ID
 */
export function useOrganizationTicket(orgId: string, ticketId: string, enabled = true) {
  return useQuery({
    queryKey: orgTicketsKeys.detail(orgId, ticketId),
    queryFn: async () => {
      const res = await fetch(`/api/orgs/${orgId}/tickets/${ticketId}`);
      if (!res.ok) throw new Error('Failed to fetch ticket');
      return res.json();
    },
    enabled: enabled && !!orgId && !!ticketId,
    staleTime: 30 * 1000,
  });
}

/**
 * Mutation for creating a maintenance ticket
 */
export function useCreateOrganizationTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orgId, ...data }: CreateMaintenanceTicketInput & { orgId: string }) => {
      const res = await fetch(`/api/orgs/${orgId}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create ticket');
      }
      return res.json();
    },
    onSuccess: (response, { orgId }) => {
      queryClient.invalidateQueries({ queryKey: orgTicketsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orgTicketsKeys.list(orgId) });
      if (response.data) {
        queryClient.setQueryData(
          orgTicketsKeys.detail(orgId, response.data.id),
          response
        );
      }
    },
  });
}

/**
 * Mutation for updating a maintenance ticket
 */
export function useUpdateOrganizationTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orgId,
      ticketId,
      ...data
    }: UpdateMaintenanceTicketInput & { orgId: string }) => {
      const res = await fetch(`/api/orgs/${orgId}/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update ticket');
      }
      return res.json();
    },
    onSuccess: (response, { orgId, ticketId }) => {
      queryClient.invalidateQueries({ queryKey: orgTicketsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orgTicketsKeys.list(orgId) });
      queryClient.invalidateQueries({ queryKey: orgTicketsKeys.detail(orgId, ticketId) });
    },
  });
}

/**
 * Mutation for deleting a ticket
 */
export function useDeleteOrganizationTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orgId, ticketId }: { orgId: string; ticketId: string }) => {
      const res = await fetch(`/api/orgs/${orgId}/tickets/${ticketId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete ticket');
      }
      return res.json();
    },
    onSuccess: (_, { orgId }) => {
      queryClient.invalidateQueries({ queryKey: orgTicketsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orgTicketsKeys.list(orgId) });
    },
  });
}

/**
 * Hook for ticket status color/label
 */
export function useTicketStatusConfig() {
  return {
    open: { color: 'red', label: 'Open', variant: 'destructive' as const },
    assigned: { color: 'blue', label: 'Assigned', variant: 'default' as const },
    in_progress: { color: 'yellow', label: 'In Progress', variant: 'secondary' as const },
    resolved: { color: 'green', label: 'Resolved', variant: 'success' as const },
    closed: { color: 'gray', label: 'Closed', variant: 'outline' as const },
  };
}

/**
 * Hook for ticket priority color/label
 */
export function useTicketPriorityConfig() {
  return {
    low: { color: 'gray', label: 'Low', variant: 'outline' as const },
    medium: { color: 'blue', label: 'Medium', variant: 'default' as const },
    high: { color: 'orange', label: 'High', variant: 'secondary' as const },
    urgent: { color: 'red', label: 'Urgent', variant: 'destructive' as const },
  };
}
