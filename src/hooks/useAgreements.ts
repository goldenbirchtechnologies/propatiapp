'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, apiEndpoints, type Agreement, type CreateAgreementInput, type UpdateAgreementInput, type SignAgreementInput } from '@/lib/api';

// Query Keys
export const agreementsKeys = {
  all: ['agreements'] as const,
  lists: () => [...agreementsKeys.all, 'list'] as const,
  list: (params?: { page?: number; limit?: number }) => [...agreementsKeys.lists(), params] as const,
  details: () => [...agreementsKeys.all, 'detail'] as const,
  detail: (id: string) => [...agreementsKeys.details(), id] as const,
  byListing: (listingId: string) => [...agreementsKeys.all, 'listing', listingId] as const,
};

/**
 * Get all agreements (with pagination)
 */
export function useAgreements(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: agreementsKeys.list(params),
    queryFn: () => apiEndpoints.agreements.getAll(params),
    staleTime: 60 * 1000,
  });
}

/**
 * Get a single agreement by ID
 */
export function useAgreement(id: string, enabled = true) {
  return useQuery({
    queryKey: agreementsKeys.detail(id),
    queryFn: () => apiEndpoints.agreements.getById(id),
    enabled: enabled && !!id,
    staleTime: 60 * 1000,
  });
}

/**
 * Get agreements for a specific listing
 */
export function useAgreementsByListing(listingId: string, enabled = true) {
  return useQuery({
    queryKey: agreementsKeys.byListing(listingId),
    queryFn: () => apiEndpoints.agreements.getByListing(listingId),
    enabled: enabled && !!listingId,
    staleTime: 60 * 1000,
  });
}

/**
 * Mutation for creating a new agreement
 */
export function useCreateAgreement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAgreementInput) => apiEndpoints.agreements.create(data),
    onSuccess: (newAgreement) => {
      queryClient.invalidateQueries({ queryKey: agreementsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: agreementsKeys.byListing(newAgreement.listingId) });
      queryClient.setQueryData(agreementsKeys.detail(newAgreement.id), newAgreement);
    },
  });
}

/**
 * Mutation for updating an agreement
 */
export function useUpdateAgreement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAgreementInput }) => 
      apiEndpoints.agreements.update(id, data),
    onSuccess: (updatedAgreement, { id }) => {
      queryClient.invalidateQueries({ queryKey: agreementsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: agreementsKeys.byListing(updatedAgreement.listingId) });
      queryClient.setQueryData(agreementsKeys.detail(id), updatedAgreement);
    },
  });
}

/**
 * Mutation for signing an agreement
 */
export function useSignAgreement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SignAgreementInput }) => 
      apiEndpoints.agreements.sign(id, data),
    onSuccess: (signedAgreement, { id }) => {
      queryClient.invalidateQueries({ queryKey: agreementsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: agreementsKeys.byListing(signedAgreement.listingId) });
      queryClient.setQueryData(agreementsKeys.detail(id), signedAgreement);
    },
  });
}

/**
 * Mutation for terminating an agreement
 */
export function useTerminateAgreement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiEndpoints.agreements.terminate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: agreementsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: agreementsKeys.detail(id) });
    },
  });
}

/**
 * Hook for agreement status helpers
 */
export function useAgreementStatus(agreement: Agreement | undefined) {
  if (!agreement) return { isSignable: false, isTerminatable: false, currentStep: '' };

  const isSignable = ['pending_landlord', 'pending_tenant', 'tenant_signed', 'landlord_signed'].includes(agreement.status);
  const isTerminatable = ['fully_signed', 'pending_landlord', 'pending_tenant', 'tenant_signed', 'landlord_signed'].includes(agreement.status);

  const statusOrder = [
    'draft',
    'pending_landlord',
    'pending_tenant',
    'tenant_signed',
    'landlord_signed',
    'fully_signed',
    'terminated',
    'expired',
  ];

  const currentStepIndex = statusOrder.indexOf(agreement.status);
  const currentStep = statusOrder[currentStepIndex] || agreement.status;

  return {
    isSignable,
    isTerminatable,
    currentStep,
    progress: Math.max(0, (currentStepIndex / (statusOrder.length - 2)) * 100), // Exclude terminated/expired
    nextSteps: statusOrder.slice(currentStepIndex + 1, -2), // Exclude terminated/expired
  };
}

/**
 * Get agreement preview HTML
 */
export function useAgreementPreview(id: string, enabled = true) {
  return useQuery({
    queryKey: ['agreement-preview', id],
    queryFn: async () => {
      const res = await fetch(`/api/agreements/${id}/preview`);
      if (!res.ok) throw new Error('Failed to load agreement preview');
      return res.text();
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get rent schedule for an agreement
 */
export function useRentSchedule(agreementId: string, enabled = true) {
  return useQuery({
    queryKey: ['rent-schedule', agreementId],
    queryFn: async () => {
      const res = await fetch(`/api/agreements/${agreementId}/rent-schedule`);
      if (!res.ok) throw new Error('Failed to load rent schedule');
      return res.json();
    },
    enabled: enabled && !!agreementId,
    staleTime: 60 * 1000,
  });
}