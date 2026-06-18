'use client';

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, apiEndpoints, type Listing, type ListingsFilters, type CreateListingInput, type UpdateListingInput } from '@/lib/api';

// Query Keys
export const listingsKeys = {
  all: ['listings'] as const,
  lists: () => [...listingsKeys.all, 'list'] as const,
  list: (filters: ListingsFilters) => [...listingsKeys.lists(), filters] as const,
  infinite: (filters: Omit<ListingsFilters, 'page'>) => [...listingsKeys.all, 'infinite', filters] as const,
  details: () => [...listingsKeys.all, 'detail'] as const,
  detail: (id: string) => [...listingsKeys.details(), id] as const,
  myListings: (params?: { page?: number; limit?: number }) => 
    [...listingsKeys.all, 'my', params] as const,
  saved: (params?: { page?: number; limit?: number }) => 
    [...listingsKeys.all, 'saved', params] as const,
};

/**
 * Infinite scroll hook for listings
 * Uses page-based pagination with cursor-like behavior via page numbers
 */
export function useListings(filters: Omit<ListingsFilters, 'page'> = {}) {
  return useInfiniteQuery({
    queryKey: listingsKeys.infinite(filters),
    queryFn: async ({ pageParam = 1 }) => {
      const response = await apiEndpoints.listings.getAll({
        ...filters,
        page: pageParam,
      });
      return response;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      // lastPage has structure: { listings: Listing[], pagination: {...} }
      const pagination = (lastPage as unknown as { pagination: { page: number; totalPages: number; hasNext: boolean } }).pagination;
      return pagination.hasNext ? pagination.page + 1 : undefined;
    },
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
  });
}

/**
 * Hook for getting a single listing by ID
 */
export function useListing(id: string, enabled = true) {
  return useQuery({
    queryKey: listingsKeys.detail(id),
    queryFn: () => apiEndpoints.listings.getById(id),
    enabled: enabled && !!id,
    staleTime: 60 * 1000,
  });
}

/**
 * Hook for getting user's own listings
 */
export function useMyListings(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: listingsKeys.myListings(params),
    queryFn: () => apiEndpoints.listings.getMyListings(params),
    staleTime: 60 * 1000,
  });
}

/**
 * Hook for getting saved listings
 */
export function useSavedListings(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: listingsKeys.saved(params),
    queryFn: () => apiEndpoints.listings.getSaved(params),
    staleTime: 60 * 1000,
  });
}

/**
 * Mutation for creating a new listing
 */
export function useCreateListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateListingInput) => apiEndpoints.listings.create(data),
    onSuccess: (newListing) => {
      // Invalidate and refetch listings queries
      queryClient.invalidateQueries({ queryKey: listingsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: listingsKeys.myListings() });
      
      // Optimistically add to cache
      queryClient.setQueryData(listingsKeys.detail(newListing.id), newListing);
    },
  });
}

/**
 * Mutation for updating a listing
 */
export function useUpdateListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateListingInput }) => 
      apiEndpoints.listings.update(id, data),
    onSuccess: (updatedListing, { id }) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: listingsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: listingsKeys.myListings() });
      queryClient.invalidateQueries({ queryKey: listingsKeys.detail(id) });
      
      // Update cached listing
      queryClient.setQueryData(listingsKeys.detail(id), updatedListing);
    },
  });
}

/**
 * Mutation for deleting a listing
 */
export function useDeleteListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiEndpoints.listings.delete(id),
    onSuccess: (_, id) => {
      // Invalidate lists and remove from cache
      queryClient.invalidateQueries({ queryKey: listingsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: listingsKeys.myListings() });
      queryClient.removeQueries({ queryKey: listingsKeys.detail(id) });
    },
  });
}

/**
 * Mutation for saving/unsaving a listing
 */
export function useToggleSaveListing() {
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: (listingId: string) => apiEndpoints.listings.save(listingId),
    onSuccess: (_, listingId) => {
      queryClient.invalidateQueries({ queryKey: listingsKeys.saved() });
      // Update saved status in listing details
      queryClient.setQueryData(listingsKeys.detail(listingId), (old: Listing | undefined) => 
        old ? { ...old, savedByCurrentUser: true } : old
      );
    },
  });

  const unsaveMutation = useMutation({
    mutationFn: (listingId: string) => apiEndpoints.listings.unsave(listingId),
    onSuccess: (_, listingId) => {
      queryClient.invalidateQueries({ queryKey: listingsKeys.saved() });
      queryClient.setQueryData(listingsKeys.detail(listingId), (old: Listing | undefined) => 
        old ? { ...old, savedByCurrentUser: false } : old
      );
    },
  });

  return {
    save: saveMutation.mutate,
    saveAsync: saveMutation.mutateAsync,
    unsave: unsaveMutation.mutate,
    unsaveAsync: unsaveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    isUnsaving: unsaveMutation.isPending,
  };
}

/**
 * Mutation for flagging a listing
 */
export function useFlagListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ listingId, data }: { listingId: string; data: { type: string; description?: string } }) => 
      apiEndpoints.listings.flag(listingId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listingsKeys.lists() });
    },
  });
}

/**
 * Hook for prefetching a listing (useful for hover intent)
 */
export function usePrefetchListing() {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: listingsKeys.detail(id),
      queryFn: () => apiEndpoints.listings.getById(id),
      staleTime: 60 * 1000,
    });
  };
}