'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  ApproveVerificationInput,
  RejectVerificationInput,
  UpdateUserAdminInput,
  SuspendUserInput,
  BanUserInput,
  ApproveAgentInput,
  DismissFlagsInput,
  SuspendListingInput,
  RevenueFilters,
  AuditLogFilters,
  AdminUserFilters,
  VerificationQueueFilters,
  FlaggedListingsFilters,
} from '@/lib/validators';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const adminKeys = {
  all: ['admin'] as const,
  stats: () => [...adminKeys.all, 'stats'] as const,
  verificationQueue: (filters?: VerificationQueueFilters) =>
    [...adminKeys.all, 'verification-queue', filters] as const,
  flaggedListings: (filters?: FlaggedListingsFilters) =>
    [...adminKeys.all, 'flagged-listings', filters] as const,
  users: (filters?: AdminUserFilters) => [...adminKeys.all, 'users', filters] as const,
  user: (id: string) => [...adminKeys.all, 'user', id] as const,
  revenue: (filters?: RevenueFilters) => [...adminKeys.all, 'revenue', filters] as const,
  auditLogs: (filters?: AuditLogFilters) => [...adminKeys.all, 'audit-logs', filters] as const,
};

// ============================================================================
// STATS & OVERVIEW
// ============================================================================

/**
 * Get admin dashboard stats
 * Refreshes every minute
 */
export function useAdminStats() {
  return useQuery({
    queryKey: adminKeys.stats(),
    queryFn: async () => {
      const res = await fetch('/api/admin/stats');
      if (!res.ok) throw new Error('Failed to fetch admin stats');
      return res.json();
    },
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000, // 30 seconds
  });
}

// ============================================================================
// VERIFICATION QUEUE
// ============================================================================

/**
 * Get verification queue for admin review
 */
export function useVerificationQueue(filters?: VerificationQueueFilters) {
  return useQuery({
    queryKey: adminKeys.verificationQueue(filters),
    queryFn: async () => {
      const searchParams = new URLSearchParams(filters as any);
      const res = await fetch(`/api/admin/verification-queue?${searchParams}`);
      if (!res.ok) throw new Error('Failed to fetch verification queue');
      return res.json();
    },
  });
}

/**
 * Approve a verification
 */
export function useApproveVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, notes }: { id: string } & ApproveVerificationInput) => {
      const res = await fetch(`/api/admin/verifications/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to approve verification');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.verificationQueue() });
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
    },
  });
}

/**
 * Reject a verification
 */
export function useRejectVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason, layer }: { id: string } & RejectVerificationInput) => {
      const res = await fetch(`/api/admin/verifications/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, layer }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to reject verification');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.verificationQueue() });
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
    },
  });
}

// ============================================================================
// FLAGGED LISTINGS
// ============================================================================

/**
 * Get flagged listings
 */
export function useFlaggedListings(filters?: FlaggedListingsFilters) {
  return useQuery({
    queryKey: adminKeys.flaggedListings(filters),
    queryFn: async () => {
      const searchParams = new URLSearchParams(filters as any);
      const res = await fetch(`/api/admin/flagged-listings?${searchParams}`);
      if (!res.ok) throw new Error('Failed to fetch flagged listings');
      return res.json();
    },
  });
}

/**
 * Dismiss flags for a listing
 */
export function useDismissFlags() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ listingId, reason }: { listingId: string } & DismissFlagsInput) => {
      const res = await fetch(`/api/admin/flagged-listings/${listingId}/dismiss`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to dismiss flags');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.flaggedListings() });
    },
  });
}

/**
 * Suspend a flagged listing
 */
export function useSuspendListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ listingId, reason }: { listingId: string } & SuspendListingInput) => {
      const res = await fetch(`/api/admin/flagged-listings/${listingId}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to suspend listing');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.flaggedListings() });
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
    },
  });
}

/**
 * Ban user who owns a flagged listing
 */
export function useBanUserFromListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ listingId, reason }: { listingId: string } & BanUserInput) => {
      const res = await fetch(`/api/admin/flagged-listings/${listingId}/ban-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to ban user');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.flaggedListings() });
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
    },
  });
}

// ============================================================================
// USER MANAGEMENT
// ============================================================================

/**
 * Get all users with filters
 */
export function useAdminUsers(filters?: AdminUserFilters) {
  return useQuery({
    queryKey: adminKeys.users(filters),
    queryFn: async () => {
      const searchParams = new URLSearchParams(filters as any);
      const res = await fetch(`/api/admin/users?${searchParams}`);
      if (!res.ok) throw new Error('Failed to fetch users');
      return res.json();
    },
  });
}

/**
 * Update user details
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: UpdateUserAdminInput }) => {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update user');
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      queryClient.invalidateQueries({ queryKey: adminKeys.user(variables.userId) });
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
    },
  });
}

/**
 * Suspend a user
 */
export function useSuspendUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, reason }: { userId: string } & SuspendUserInput) => {
      const res = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to suspend user');
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      queryClient.invalidateQueries({ queryKey: adminKeys.user(variables.userId) });
    },
  });
}

/**
 * Activate a suspended user
 */
export function useActivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/admin/users/${userId}/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to activate user');
      }
      return res.json();
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      queryClient.invalidateQueries({ queryKey: adminKeys.user(userId) });
    },
  });
}

/**
 * Approve agent application
 */
export function useApproveAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: ApproveAgentInput }) => {
      const res = await fetch(`/api/admin/users/${userId}/approve-agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to approve agent');
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      queryClient.invalidateQueries({ queryKey: adminKeys.user(variables.userId) });
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
    },
  });
}

// ============================================================================
// REVENUE & ANALYTICS
// ============================================================================

/**
 * Get revenue reports
 */
export function useRevenueReports(filters?: RevenueFilters) {
  return useQuery({
    queryKey: adminKeys.revenue(filters),
    queryFn: async () => {
      const searchParams = new URLSearchParams(filters as any);
      const res = await fetch(`/api/admin/revenue?${searchParams}`);
      if (!res.ok) throw new Error('Failed to fetch revenue reports');
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ============================================================================
// AUDIT LOGS
// ============================================================================

/**
 * Get audit logs
 */
export function useAuditLogs(filters?: AuditLogFilters) {
  return useQuery({
    queryKey: adminKeys.auditLogs(filters),
    queryFn: async () => {
      const searchParams = new URLSearchParams(filters as any);
      const res = await fetch(`/api/admin/audit-logs?${searchParams}`);
      if (!res.ok) throw new Error('Failed to fetch audit logs');
      return res.json();
    },
  });
}
