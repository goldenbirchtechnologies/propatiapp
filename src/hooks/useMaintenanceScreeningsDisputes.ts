'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, apiEndpoints, type MaintenanceTicket, type CreateMaintenanceTicketInput, type UpdateMaintenanceTicketInput, type ScreeningCall, type ScheduleScreeningInput, type UpdateScreeningInput, type Dispute, type CreateDisputeInput, type PaginationParams } from '@/lib/api';

// Query Keys
export const maintenanceKeys = {
  all: ['maintenance'] as const,
  tickets: () => [...maintenanceKeys.all, 'tickets'] as const,
  ticketList: (params?: PaginationParams & { orgId?: string }) => 
    [...maintenanceKeys.tickets(), 'list', params] as const,
  ticket: (id: string) => [...maintenanceKeys.tickets(), id] as const,
};

export const screeningsKeys = {
  all: ['screenings'] as const,
  lists: () => [...screeningsKeys.all, 'list'] as const,
  list: (params?: PaginationParams) => [...screeningsKeys.lists(), params] as const,
  detail: (id: string) => [...screeningsKeys.all, 'detail', id] as const,
};

export const disputesKeys = {
  all: ['disputes'] as const,
  lists: () => [...disputesKeys.all, 'list'] as const,
  list: (params?: PaginationParams) => [...disputesKeys.lists(), params] as const,
  detail: (id: string) => [...disputesKeys.all, 'detail', id] as const,
};

// ============================================
// MAINTENANCE HOOKS
// ============================================

/**
 * Get all maintenance tickets
 */
export function useMaintenanceTickets(params?: PaginationParams & { orgId?: string }) {
  return useQuery({
    queryKey: maintenanceKeys.ticketList(params),
    queryFn: () => apiEndpoints.maintenance.getTickets(params),
    staleTime: 60 * 1000,
  });
}

/**
 * Get a single maintenance ticket
 */
export function useMaintenanceTicket(ticketId: string, enabled = true) {
  return useQuery({
    queryKey: maintenanceKeys.ticket(ticketId),
    queryFn: () => apiEndpoints.maintenance.getTicket(ticketId),
    enabled: enabled && !!ticketId,
    staleTime: 30 * 1000,
  });
}

/**
 * Mutation for creating a maintenance ticket
 */
export function useCreateMaintenanceTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMaintenanceTicketInput) => apiEndpoints.maintenance.create(data),
    onSuccess: (ticket) => {
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.tickets() });
      queryClient.setQueryData(maintenanceKeys.ticket(ticket.id), ticket);
    },
  });
}

/**
 * Mutation for updating a maintenance ticket
 */
export function useUpdateMaintenanceTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMaintenanceTicketInput }) => 
      apiEndpoints.maintenance.update(id, data),
    onSuccess: (ticket, { id }) => {
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.tickets() });
      queryClient.setQueryData(maintenanceKeys.ticket(id), ticket);
    },
  });
}

/**
 * Mutation for assigning a maintenance ticket
 */
export function useAssignMaintenanceTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId, userId }: { ticketId: string; userId: string }) => 
      apiEndpoints.maintenance.assign(ticketId, userId),
    onSuccess: (_, { ticketId }) => {
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.tickets() });
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.ticket(ticketId) });
    },
  });
}

/**
 * Hook for maintenance ticket status display
 */
export function useMaintenanceStatus(ticket: MaintenanceTicket | undefined) {
  if (!ticket) return { color: 'gray', label: 'Unknown' };

  const statusConfig: Record<string, { color: string; label: string }> = {
    open: { color: 'red', label: 'Open' },
    assigned: { color: 'blue', label: 'Assigned' },
    in_progress: { color: 'yellow', label: 'In Progress' },
    resolved: { color: 'green', label: 'Resolved' },
    closed: { color: 'gray', label: 'Closed' },
  };

  return statusConfig[ticket.status] || { color: 'gray', label: ticket.status };
}

/**
 * Hook for maintenance ticket priority display
 */
export function useMaintenancePriority(ticket: MaintenanceTicket | undefined) {
  if (!ticket) return { color: 'gray', label: 'Unknown' };

  const priorityConfig: Record<string, { color: string; label: string }> = {
    low: { color: 'gray', label: 'Low' },
    medium: { color: 'blue', label: 'Medium' },
    high: { color: 'green', label: 'High' },
    urgent: { color: 'red', label: 'Urgent' },
  };

  return priorityConfig[ticket.priority] || { color: 'gray', label: ticket.priority };
}

// ============================================
// SCREENING HOOKS
// ============================================

/**
 * Get all screening calls
 */
export function useScreenings(params?: PaginationParams) {
  return useQuery({
    queryKey: screeningsKeys.list(params),
    queryFn: () => apiEndpoints.screenings.getAll(params),
    staleTime: 60 * 1000,
  });
}

/**
 * Get a single screening call
 */
export function useScreening(screeningId: string, enabled = true) {
  return useQuery({
    queryKey: screeningsKeys.detail(screeningId),
    queryFn: () => apiEndpoints.screenings.getAll({ limit: 1 }).then(
      res => (res.data ?? []).find((s: { id?: string }) => s.id === screeningId)
    ).then(s => {
      if (!s) throw new Error('Screening not found');
      return s;
    }),
    enabled: enabled && !!screeningId,
    staleTime: 30 * 1000,
  });
}

/**
 * Mutation for scheduling a screening
 */
export function useScheduleScreening() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ScheduleScreeningInput) => apiEndpoints.screenings.schedule(data),
    onSuccess: (screening) => {
      queryClient.invalidateQueries({ queryKey: screeningsKeys.lists() });
      queryClient.setQueryData(screeningsKeys.detail(screening.id), screening);
    },
  });
}

/**
 * Mutation for updating a screening
 */
export function useUpdateScreening() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateScreeningInput }) => 
      apiEndpoints.screenings.update(id, data),
    onSuccess: (screening, { id }) => {
      queryClient.invalidateQueries({ queryKey: screeningsKeys.lists() });
      queryClient.setQueryData(screeningsKeys.detail(id), screening);
    },
  });
}

/**
 * Hook for screening status display
 */
export function useScreeningStatus(screening: ScreeningCall | undefined) {
  if (!screening) return { color: 'gray', label: 'Unknown' };

  const statusConfig: Record<string, { color: string; label: string }> = {
    scheduled: { color: 'blue', label: 'Scheduled' },
    completed: { color: 'green', label: 'Completed' },
    cancelled: { color: 'red', label: 'Cancelled' },
    no_show: { color: 'green', label: 'No Show' },
  };

  return statusConfig[screening.status] || { color: 'gray', label: screening.status };
}

// ============================================
// DISPUTE HOOKS
// ============================================

/**
 * Get all disputes
 */
export function useDisputes(params?: PaginationParams) {
  return useQuery({
    queryKey: disputesKeys.list(params),
    queryFn: () => apiEndpoints.disputes.getAll(params),
    staleTime: 60 * 1000,
  });
}

/**
 * Get a single dispute
 */
export function useDispute(disputeId: string, enabled = true) {
  return useQuery({
    queryKey: disputesKeys.detail(disputeId),
    queryFn: () => apiEndpoints.disputes.getById(disputeId),
    enabled: enabled && !!disputeId,
    staleTime: 30 * 1000,
  });
}

/**
 * Mutation for creating a dispute
 */
export function useCreateDispute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDisputeInput) => apiEndpoints.disputes.create(data),
    onSuccess: (dispute) => {
      queryClient.invalidateQueries({ queryKey: disputesKeys.lists() });
      queryClient.setQueryData(disputesKeys.detail(dispute.id), dispute);
    },
  });
}

/**
 * Mutation for admin dispute action
 */
export function useAdminDisputeAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ disputeId, action, resolution }: { disputeId: string; action: string; resolution?: string }) => 
      apiEndpoints.disputes.adminAction(disputeId, { action, resolution }),
    onSuccess: (dispute, { disputeId }) => {
      queryClient.invalidateQueries({ queryKey: disputesKeys.lists() });
      queryClient.setQueryData(disputesKeys.detail(disputeId), dispute);
    },
  });
}

/**
 * Hook for dispute status display
 */
export function useDisputeStatus(dispute: Dispute | undefined) {
  if (!dispute) return { color: 'gray', label: 'Unknown' };

  const statusConfig: Record<string, { color: string; label: string }> = {
    open: { color: 'red', label: 'Open' },
    investigating: { color: 'blue', label: 'Investigating' },
    mediated: { color: 'yellow', label: 'Mediated' },
    resolved: { color: 'green', label: 'Resolved' },
    closed: { color: 'gray', label: 'Closed' },
  };

  return statusConfig[dispute.status] || { color: 'gray', label: dispute.status };
}

/**
 * Hook for dispute type display
 */
export function useDisputeType(dispute: Dispute | undefined) {
  if (!dispute) return { label: 'Unknown' };

  const typeConfig: Record<string, { label: string }> = {
    non_delivery: { label: 'Non-Delivery' },
    misrepresentation: { label: 'Misrepresentation' },
    refund: { label: 'Refund Request' },
    other: { label: 'Other' },
  };

  return typeConfig[dispute.type] || { label: dispute.type };
}