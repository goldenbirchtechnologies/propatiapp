'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, apiEndpoints, type Organization, type OrgMember, type OrgInvite, type CreateOrganisationInput, type UpdateOrganisationInput, type InviteOrgMemberInput, type Listing, type PaginationParams } from '@/lib/api';

// Query Keys
export const organizationsKeys = {
  all: ['organizations'] as const,
  lists: () => [...organizationsKeys.all, 'list'] as const,
  list: (params?: PaginationParams) => [...organizationsKeys.lists(), params] as const,
  details: () => [...organizationsKeys.all, 'detail'] as const,
  detail: (id: string) => [...organizationsKeys.details(), id] as const,
  members: (orgId: string) => [...organizationsKeys.all, 'members', orgId] as const,
  listings: (orgId: string, params?: PaginationParams) => [...organizationsKeys.all, 'listings', orgId, params] as const,
};

/**
 * Get all organizations (for estate managers/admins)
 */
export function useOrganizations(params?: PaginationParams) {
  return useQuery({
    queryKey: organizationsKeys.list(params),
    queryFn: () => apiEndpoints.organizations.getAll(params),
    staleTime: 60 * 1000,
  });
}

/**
 * Get a single organization by ID
 */
export function useOrganization(orgId: string, enabled = true) {
  return useQuery({
    queryKey: organizationsKeys.detail(orgId),
    queryFn: () => apiEndpoints.organizations.getById(orgId),
    enabled: enabled && !!orgId,
    staleTime: 60 * 1000,
  });
}

/**
 * Get organization members
 */
export function useOrganizationMembers(orgId: string, enabled = true) {
  return useQuery({
    queryKey: organizationsKeys.members(orgId),
    queryFn: () => apiEndpoints.organizations.getMembers(orgId),
    enabled: enabled && !!orgId,
    staleTime: 60 * 1000,
  });
}

/**
 * Get organization listings
 */
export function useOrganizationListings(orgId: string, params?: PaginationParams, enabled = true) {
  return useQuery({
    queryKey: organizationsKeys.listings(orgId, params),
    queryFn: () => apiEndpoints.organizations.getListings(orgId, params),
    enabled: enabled && !!orgId,
    staleTime: 60 * 1000,
  });
}

/**
 * Mutation for creating an organization
 */
export function useCreateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrganisationInput) => apiEndpoints.organizations.create(data),
    onSuccess: (organization) => {
      queryClient.invalidateQueries({ queryKey: organizationsKeys.lists() });
      queryClient.setQueryData(organizationsKeys.detail(organization.id), organization);
    },
  });
}

/**
 * Mutation for updating an organization
 */
export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrganisationInput }) => 
      apiEndpoints.organizations.update(id, data),
    onSuccess: (updatedOrg, { id }) => {
      queryClient.invalidateQueries({ queryKey: organizationsKeys.lists() });
      queryClient.setQueryData(organizationsKeys.detail(id), updatedOrg);
    },
  });
}

/**
 * Mutation for deleting an organization
 */
export function useDeleteOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiEndpoints.organizations.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: organizationsKeys.lists() });
      queryClient.removeQueries({ queryKey: organizationsKeys.detail(id) });
    },
  });
}

/**
 * Mutation for inviting a member
 */
export function useInviteMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InviteOrgMemberInput) => apiEndpoints.organizations.inviteMember(data),
    onSuccess: (_, { orgId }) => {
      queryClient.invalidateQueries({ queryKey: organizationsKeys.members(orgId) });
      queryClient.invalidateQueries({ queryKey: organizationsKeys.detail(orgId) });
    },
  });
}

/**
 * Mutation for accepting an invite
 */
export function useAcceptInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => apiEndpoints.organizations.acceptInvite(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationsKeys.lists() });
    },
  });
}

/**
 * Mutation for removing a member
 */
export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orgId, userId }: { orgId: string; userId: string }) => 
      apiEndpoints.organizations.removeMember(orgId, userId),
    onSuccess: (_, { orgId }) => {
      queryClient.invalidateQueries({ queryKey: organizationsKeys.members(orgId) });
      queryClient.invalidateQueries({ queryKey: organizationsKeys.detail(orgId) });
    },
  });
}

/**
 * Mutation for updating member role
 */
export function useUpdateMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orgId, userId, role }: { orgId: string; userId: string; role: string }) => 
      apiEndpoints.organizations.updateMemberRole(orgId, userId, role),
    onSuccess: (_, { orgId }) => {
      queryClient.invalidateQueries({ queryKey: organizationsKeys.members(orgId) });
    },
  });
}

/**
 * Mutation for adding a listing to organization
 */
export function useAddOrganizationListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orgId, listingId }: { orgId: string; listingId: string }) => 
      apiEndpoints.organizations.addListing(orgId, listingId),
    onSuccess: (_, { orgId, listingId }) => {
      queryClient.invalidateQueries({ queryKey: organizationsKeys.listings(orgId) });
      queryClient.invalidateQueries({ 
        queryKey: ['listings', 'list'] 
      });
    },
  });
}

/**
 * Mutation for removing a listing from organization
 */
export function useRemoveOrganizationListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orgId, listingId }: { orgId: string; listingId: string }) => 
      apiEndpoints.organizations.removeListing(orgId, listingId),
    onSuccess: (_, { orgId }) => {
      queryClient.invalidateQueries({ queryKey: organizationsKeys.listings(orgId) });
    },
  });
}

/**
 * Hook for organization role-based permissions
 */
export function useOrganizationPermissions(org: Organization | undefined, member: OrgMember | undefined) {
  if (!org || !member) return { isOwner: false, isManager: false, isAccountant: false, isMaintenance: false, canManageListings: false, canManageMembers: false, canViewAnalytics: false };

  const memberRole = member.role;
  const isOwner = org.ownerId === member.userId;
  const isManager = memberRole === 'manager';
  const isAccountant = memberRole === 'accountant';
  const isMaintenance = memberRole === 'maintenance';

  return {
    isOwner,
    isManager,
    isAccountant,
    isMaintenance,
    canManageListings: isOwner || isManager,
    canManageMembers: isOwner || isManager,
    canViewAnalytics: isOwner || isManager || isAccountant,
    canManageFinances: isOwner || isManager || isAccountant,
    canCreateMaintenanceTickets: true,
    canAssignTickets: isOwner || isManager || isMaintenance,
  };
}

// ============================================================================
// SUBSCRIPTION HOOKS (Phase F)
// ============================================================================

/**
 * Get organization subscription details
 */
export function useOrganizationSubscription(orgId: string, enabled = true) {
  return useQuery({
    queryKey: [...organizationsKeys.detail(orgId), 'subscription'],
    queryFn: async () => {
      const res = await fetch(`/api/orgs/${orgId}/subscription`);
      if (!res.ok) throw new Error('Failed to fetch subscription');
      const data = await res.json();
      return data.data;
    },
    enabled: enabled && !!orgId,
    staleTime: 60 * 1000,
  });
}

/**
 * Subscribe an organization to a plan (Phase F)
 */
export function useSubscribeOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orgId, plan, paymentMethod }: { orgId: string; plan: string; paymentMethod?: string }) => {
      const res = await fetch(`/api/orgs/${orgId}/subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, paymentMethod }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to subscribe');
      }
      return res.json();
    },
    onSuccess: (_, { orgId }) => {
      queryClient.invalidateQueries({ queryKey: [...organizationsKeys.detail(orgId), 'subscription'] });
      queryClient.invalidateQueries({ queryKey: organizationsKeys.detail(orgId) });
    },
  });
}

/**
 * Get team members for an organization
 */
export function useTeamMembers(orgId: string, enabled = true) {
  return useQuery({
    queryKey: [...organizationsKeys.detail(orgId), 'team'],
    queryFn: async () => {
      const res = await fetch(`/api/orgs/${orgId}/members`);
      if (!res.ok) throw new Error('Failed to fetch team members');
      const data = await res.json();
      return data.data || [];
    },
    enabled: enabled && !!orgId,
    staleTime: 60 * 1000,
  });
}

/**
 * Invite a team member to the organization
 */
export function useInviteTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orgId, email, role }: { orgId: string; email: string; role: string }) => {
      const res = await fetch(`/api/orgs/${orgId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to invite member');
      }
      return res.json();
    },
    onSuccess: (_, { orgId }) => {
      queryClient.invalidateQueries({ queryKey: [...organizationsKeys.detail(orgId), 'team'] });
      queryClient.invalidateQueries({ queryKey: organizationsKeys.members(orgId) });
      queryClient.invalidateQueries({ queryKey: organizationsKeys.detail(orgId) });
    },
  });
}

/**
 * Update a team member's role or status
 */
export function useUpdateTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orgId,
      memberId,
      role,
      status
    }: {
      orgId: string;
      memberId: string;
      role?: string;
      status?: string;
    }) => {
      const res = await fetch(`/api/orgs/${orgId}/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, status }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update member');
      }
      return res.json();
    },
    onSuccess: (_, { orgId }) => {
      queryClient.invalidateQueries({ queryKey: [...organizationsKeys.detail(orgId), 'team'] });
      queryClient.invalidateQueries({ queryKey: organizationsKeys.members(orgId) });
      queryClient.invalidateQueries({ queryKey: organizationsKeys.detail(orgId) });
    },
  });
}

/**
 * Remove a team member from the organization
 */
export function useRemoveTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orgId, memberId }: { orgId: string; memberId: string }) => {
      const res = await fetch(`/api/orgs/${orgId}/members/${memberId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to remove member');
      }
    },
    onSuccess: (_, { orgId }) => {
      queryClient.invalidateQueries({ queryKey: [...organizationsKeys.detail(orgId), 'team'] });
      queryClient.invalidateQueries({ queryKey: organizationsKeys.members(orgId) });
      queryClient.invalidateQueries({ queryKey: organizationsKeys.detail(orgId) });
    },
  });
}