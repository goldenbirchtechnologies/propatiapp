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