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
  detail: (id: string) => [...verificationsKeys.details(), id] as const,
  byListing: (listingId: string) => [...verificationsKeys.all, 'byListing', listingId] as const,
  status: (id: string) => [...verificationsKeys.all, 'status', id] as const,
  my: (params?: { status?: string; listingId?: string }) =>
    [...verificationsKeys.all, 'my', params] as const,
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
 * Mutation for uploading video (Layer 3) - Enhanced with FormData
 */
export function useUploadVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, verificationId, listingId }: {
      file: File;
      verificationId: string;
      listingId: string;
    }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('verificationId', verificationId);
      formData.append('listingId', listingId);

      const res = await fetch('/api/verification/upload-video', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Video upload failed');
      }

      return res.json();
    },
    onSuccess: (data, { listingId }) => {
      queryClient.invalidateQueries({ queryKey: verificationsKeys.detail(listingId) });
    },
  });
}

/**
 * Hook to get QR code for video verification
 */
export function useVerificationQRCode(verificationId: string, enabled = true) {
  return useQuery({
    queryKey: [...verificationsKeys.details(), 'qr', verificationId],
    queryFn: async () => {
      const res = await fetch(`/api/verification/qr-code/${verificationId}`);
      if (!res.ok) throw new Error('Failed to generate QR code');
      return res.json();
    },
    enabled: enabled && !!verificationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Mutation for requesting inspection (Layer 4) - Enhanced
 */
export function useRequestInspection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      verificationId: string;
      listingId: string;
      preferredDate: string;
      preferredTime: 'morning' | 'afternoon' | 'evening';
      notes?: string;
    }) => {
      const res = await fetch('/api/verification/request-inspection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Inspection request failed');
      }

      return res.json();
    },
    onSuccess: (data, { listingId }) => {
      queryClient.invalidateQueries({ queryKey: verificationsKeys.detail(listingId) });
    },
  });
}

/**
 * Hook to get inspection details
 */
export function useInspection(verificationId: string, enabled = true) {
  return useQuery({
    queryKey: [...verificationsKeys.details(), 'inspection', verificationId],
    queryFn: async () => {
      const res = await fetch(`/api/verification/inspections/${verificationId}`);
      if (!res.ok) throw new Error('Failed to fetch inspection');
      return res.json();
    },
    enabled: enabled && !!verificationId,
    staleTime: 30 * 1000,
  });
}

/**
 * Mutation for updating inspection
 */
export function useUpdateInspection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      verificationId,
      data
    }: {
      verificationId: string;
      data: {
        scheduledDate?: string;
        agentId?: string;
        status?: string;
        notes?: string;
      };
    }) => {
      const res = await fetch(`/api/verification/inspections/${verificationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Update failed');
      }

      return res.json();
    },
    onSuccess: (data, { verificationId }) => {
      queryClient.invalidateQueries({
        queryKey: [...verificationsKeys.details(), 'inspection', verificationId]
      });
    },
  });
}

/**
 * Mutation for completing inspection
 */
export function useCompleteInspection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      verificationId,
      data
    }: {
      verificationId: string;
      data: {
        status: 'passed' | 'failed' | 'requires_followup';
        report: string;
        rating: number;
        issues?: string[];
        reportUrl?: string;
      };
    }) => {
      const res = await fetch(`/api/verification/inspections/${verificationId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Complete inspection failed');
      }

      return res.json();
    },
    onSuccess: (data, { verificationId }) => {
      queryClient.invalidateQueries({
        queryKey: [...verificationsKeys.details(), 'inspection', verificationId]
      });
      queryClient.invalidateQueries({ queryKey: verificationsKeys.adminQueue() });
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
 * Mutation for verifying identity (Prembly NIN/BVN verification)
 */
export function useVerifyIdentity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      verificationId: string;
      verificationType: 'nin' | 'bvn';
      number: string;
      firstName: string;
      lastName: string;
    }) => {
      const res = await fetch('/api/verification/verify-identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || error.error || 'Identity verification failed');
      }

      return res.json();
    },
    onSuccess: (result, variables) => {
      // Invalidate verification status query
      queryClient.invalidateQueries({ queryKey: verificationsKeys.detail(variables.verificationId) });
      queryClient.invalidateQueries({ queryKey: verificationsKeys.adminQueue() });
    },
  });
}

/**
 * Query identity verification status
 */
export function useIdentityStatus(verificationId: string, enabled = true) {
  return useQuery({
    queryKey: [...verificationsKeys.detail(verificationId), 'identity-status'],
    queryFn: async () => {
      const res = await fetch(`/api/verification/${verificationId}/identity-status`);
      if (!res.ok) throw new Error('Failed to fetch identity status');
      return res.json();
    },
    enabled: enabled && !!verificationId,
    staleTime: 30 * 1000,
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

// ============================================================================
// DOCUMENT UPLOAD SYSTEM (Layer 1)
// ============================================================================

/**
 * Types for document upload
 */
export type DocumentType = 'ownership' | 'id' | 'photos' | 'utility';

export interface UploadDocumentInput {
  file: File;
  documentType: DocumentType;
  listingId: string;
}

export interface VerificationDocument {
  id: string;
  documentType: DocumentType;
  url: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  uploadedAt: string;
}

export interface DocumentsResponse {
  success: boolean;
  documents: VerificationDocument[];
  documentsByType: {
    ownership: VerificationDocument[];
    id: VerificationDocument[];
    photos: VerificationDocument[];
    utility: VerificationDocument[];
  };
  completion: {
    hasOwnership: boolean;
    hasId: boolean;
    hasPhotos: boolean;
    hasUtility: boolean;
    allRequiredDocuments: boolean;
    photosCount: number;
    totalDocuments: number;
  };
}

/**
 * Mutation for uploading verification documents
 */
export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, documentType, listingId }: UploadDocumentInput) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);
      formData.append('listingId', listingId);

      const res = await fetch('/api/verification/upload-document', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Upload failed');
      }

      return res.json();
    },
    onSuccess: (data, { listingId }) => {
      // Invalidate verification status and documents queries
      queryClient.invalidateQueries({ queryKey: verificationsKeys.detail(listingId) });
      // Invalidate all verification queries to refresh document counts
      queryClient.invalidateQueries({ queryKey: verificationsKeys.all });
    },
  });
}

/**
 * Query for fetching verification documents
 */
export function useVerificationDocuments(verificationId: string, enabled = true) {
  return useQuery({
    queryKey: [...verificationsKeys.all, 'documents', verificationId] as const,
    queryFn: async (): Promise<DocumentsResponse> => {
      const res = await fetch(`/api/verification/${verificationId}/documents`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to fetch documents');
      }
      return res.json();
    },
    enabled: enabled && !!verificationId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Mutation for deleting a verification document
 */
export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ verificationId, documentId }: { verificationId: string; documentId: string }) => {
      const res = await fetch(
        `/api/verification/${verificationId}/documents?documentId=${documentId}`,
        { method: 'DELETE' }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Delete failed');
      }

      return res.json();
    },
    onSuccess: (data, { verificationId }) => {
      // Invalidate documents query
      queryClient.invalidateQueries({ queryKey: [...verificationsKeys.all, 'documents', verificationId] });
      queryClient.invalidateQueries({ queryKey: verificationsKeys.all });
    },
  });
}

// ============================================================================
// NEW CORE VERIFICATION MANAGEMENT HOOKS
// ============================================================================

/**
 * Start a new verification for a listing
 */
export function useStartVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listingId: string) => {
      const res = await fetch('/api/verification/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to start verification');
      }

      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: verificationsKeys.all });
      queryClient.invalidateQueries({ queryKey: verificationsKeys.byListing(data.verification.listingId) });
    },
  });
}

/**
 * Get verification by ID
 */
export function useVerification(id: string, enabled = true) {
  return useQuery({
    queryKey: verificationsKeys.detail(id),
    queryFn: async () => {
      const res = await fetch(`/api/verification/${id}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to fetch verification');
      }
      const result = await res.json();
      return result.data;
    },
    enabled: enabled && !!id,
    staleTime: 30 * 1000,
  });
}

/**
 * Get detailed verification status with requirements
 */
export function useVerificationDetailedStatus(id: string, enabled = true) {
  return useQuery({
    queryKey: verificationsKeys.status(id),
    queryFn: async () => {
      const res = await fetch(`/api/verification/${id}/status`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to fetch status');
      }
      return res.json();
    },
    enabled: enabled && !!id,
    refetchInterval: 5000, // Poll every 5s for status updates
    staleTime: 3000,
  });
}

/**
 * Submit verification for final admin review (Layer 5)
 */
export function useSubmitForReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (verificationId: string) => {
      const res = await fetch(`/api/verification/${verificationId}/submit`, {
        method: 'POST',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || error.message || 'Failed to submit for review');
      }

      return res.json();
    },
    onSuccess: (data, verificationId) => {
      queryClient.invalidateQueries({ queryKey: verificationsKeys.detail(verificationId) });
      queryClient.invalidateQueries({ queryKey: verificationsKeys.status(verificationId) });
      queryClient.invalidateQueries({ queryKey: verificationsKeys.adminQueue() });
    },
  });
}

/**
 * Get all verifications for current user
 */
export function useMyVerifications(params?: { status?: string; listingId?: string }) {
  return useQuery({
    queryKey: verificationsKeys.my(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.status) searchParams.append('status', params.status);
      if (params?.listingId) searchParams.append('listingId', params.listingId);

      const url = `/api/verification/my${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      const res = await fetch(url);

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to fetch verifications');
      }

      const result = await res.json();
      return result.data;
    },
    staleTime: 30 * 1000,
  });
}

/**
 * Update verification (admin only)
 */
export function useUpdateVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: { status?: 'certified' | 'rejected'; rejectionReason?: string; adminNotes?: string };
    }) => {
      const res = await fetch(`/api/verification/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update verification');
      }

      return res.json();
    },
    onSuccess: (result, { id }) => {
      queryClient.invalidateQueries({ queryKey: verificationsKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: verificationsKeys.status(id) });
      queryClient.invalidateQueries({ queryKey: verificationsKeys.adminQueue() });
      queryClient.invalidateQueries({ queryKey: verificationsKeys.all });
    },
  });
}

/**
 * Cancel verification (delete)
 */
export function useCancelVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/verification/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to cancel verification');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: verificationsKeys.all });
    },
  });
}