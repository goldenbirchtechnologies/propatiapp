'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, apiEndpoints, type Verification } from '@/lib/api';

// Query Keys
export const verificationsKeys = {
  all: ['verifications'] as const,
  lists: () => [...verificationsKeys.all, 'list'] as const,
  list: (params?: { page?: number; limit?: number; status?: string }) => 
    [...verificationsKeys.lists(), params] as const,
  details: () => [...verificationsKeys.all, 'detail'] as const,
  detail: (listingId: string) => [...verificationsKeys.details(), listingId] as const,
  adminQueue: (params?: { page?: number; limit?: number; status?: string }) => 
    [...verificationsKeys.all, 'admin', 'queue', params] as const,
};

/**
 * Get verification status for a listing
 */
export function useVerificationStatus(listingId: string, enabled = true) {
  return useQuery({
    queryKey: verificationsKeys.detail(listingId),
    queryFn: () => apiEndpoints.verifications.getStatus(listingId),
    enabled: enabled && !!listingId,
    staleTime: 30 * 1000, // 30 seconds - verification status changes frequently
  });
}

/**
 * Get admin verification queue
 */
export function useAdminVerificationQueue(params?: { page?: number; limit?: number; status?: string }) {
  return useQuery({
    queryKey: verificationsKeys.adminQueue(params),
    queryFn: () => apiEndpoints.verifications.getAdminQueue(params),
    staleTime: 30 * 1000,
  });
}

/**
 * Mutation for submitting Layer 1 (documents)
 */
export function useSubmitLayer1() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ listingId, docUrl }: { listingId: string; docUrl: string }) => 
      apiEndpoints.verifications.submitLayer1(listingId, { docUrl }),
    onSuccess: (updatedVerification, { listingId }) => {
      queryClient.invalidateQueries({ queryKey: verificationsKeys.detail(listingId) });
      queryClient.invalidateQueries({ queryKey: verificationsKeys.adminQueue() });
      queryClient.setQueryData(verificationsKeys.detail(listingId), updatedVerification);
    },
  });
}

/**
 * Mutation for submitting Layer 2 (identity)
 */
export function useSubmitLayer2() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      listingId, 
      idType, 
      idNumber 
    }: { 
      listingId: string; 
      idType: 'nin' | 'bvn' | 'passport' | 'drivers_licence' | 'voters_card';
      idNumber: string;
    }) => apiEndpoints.verifications.submitLayer2(listingId, { idType, idNumber }),
    onSuccess: (updatedVerification, { listingId }) => {
      queryClient.invalidateQueries({ queryKey: verificationsKeys.detail(listingId) });
      queryClient.setQueryData(verificationsKeys.detail(listingId), updatedVerification);
    },
  });
}

/**
 * Mutation for confirming Layer 2
 */
export function useConfirmLayer2() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ listingId, confirmed }: { listingId: string; confirmed: boolean }) => 
      apiEndpoints.verifications.confirmLayer2(listingId, { confirmed }),
    onSuccess: (updatedVerification, { listingId }) => {
      queryClient.invalidateQueries({ queryKey: verificationsKeys.detail(listingId) });
      queryClient.invalidateQueries({ queryKey: verificationsKeys.adminQueue() });
      queryClient.setQueryData(verificationsKeys.detail(listingId), updatedVerification);
    },
  });
}

/**
 * Mutation for uploading video (Layer 3)
 */
export function useUploadVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ listingId, videoUrl }: { listingId: string; videoUrl: string }) => 
      apiEndpoints.verifications.uploadVideo(listingId, { videoUrl }),
    onSuccess: (updatedVerification, { listingId }) => {
      queryClient.invalidateQueries({ queryKey: verificationsKeys.detail(listingId) });
      queryClient.setQueryData(verificationsKeys.detail(listingId), updatedVerification);
    },
  });
}

/**
 * Mutation for requesting inspection (Layer 4)
 */
export function useRequestInspection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ listingId, preferredDate, preferredTime }: { 
      listingId: string; 
      preferredDate: string; 
      preferredTime: string;
    }) => apiEndpoints.verifications.requestInspection(listingId, { preferredDate, preferredTime }),
    onSuccess: (updatedVerification, { listingId }) => {
      queryClient.invalidateQueries({ queryKey: verificationsKeys.detail(listingId) });
      queryClient.setQueryData(verificationsKeys.detail(listingId), updatedVerification);
    },
  });
}

/**
 * Mutation for admin review (approve/reject any layer)
 */
export function useAdminReviewVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      listingId, 
      layer, 
      action, 
      notes 
    }: { 
      listingId: string; 
      layer: number; 
      action: 'approve' | 'reject';
      notes?: string;
    }) => apiEndpoints.verifications.adminReview(listingId, { layer, action, notes }),
    onSuccess: (updatedVerification, { listingId }) => {
      queryClient.invalidateQueries({ queryKey: verificationsKeys.detail(listingId) });
      queryClient.invalidateQueries({ queryKey: verificationsKeys.adminQueue() });
      queryClient.setQueryData(verificationsKeys.detail(listingId), updatedVerification);
    },
  });
}

/**
 * Hook for getting verification progress percentage
 */
export function useVerificationProgress(listingId: string) {
  const { data: verification } = useVerificationStatus(listingId);

  if (!verification) return { progress: 0, currentLayer: 0, totalLayers: 5, status: 'not_started' as const };

  const layerStatuses = [
    verification.l1Status,
    verification.l2Status,
    verification.l3Status,
    verification.l4Status,
    verification.l5Status ?? 'pending',
  ];

  const approvedCount = layerStatuses.filter(s => s === 'approved').length;
  const progress = Math.round((approvedCount / 5) * 100);

  return {
    progress,
    currentLayer: verification.currentLayer,
    totalLayers: 5,
    status: verification.overallStatus,
    layerStatuses: {
      layer1: verification.l1Status,
      layer2: verification.l2Status,
      layer3: verification.l3Status,
      layer4: verification.l4Status,
      layer5: verification.l5Status ?? 'pending',
    },
  };
}