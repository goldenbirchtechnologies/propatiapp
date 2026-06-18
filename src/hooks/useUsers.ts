'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, apiEndpoints, type User, type UpdateUserInput, type OnboardingFormData, type UserSummary } from '@/lib/api';

// Query Keys
export const usersKeys = {
  all: ['users'] as const,
  current: () => [...usersKeys.all, 'current'] as const,
  profile: () => [...usersKeys.current(), 'profile'] as const,
  details: () => [...usersKeys.all, 'detail'] as const,
  detail: (id: string) => [...usersKeys.details(), id] as const,
};

/**
 * Get current user's profile
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: usersKeys.profile(),
    queryFn: () => apiEndpoints.users.getProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes - profile doesn't change often
    retry: 1,
  });
}

/**
 * Get user by ID
 */
export function useUser(userId: string, enabled = true) {
  return useQuery({
    queryKey: usersKeys.detail(userId),
    queryFn: () => apiEndpoints.users.getById(userId),
    enabled: enabled && !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get multiple users by IDs (for displaying in lists)
 */
export function useUsers(userIds: string[], enabled = true) {
  return useQuery({
    queryKey: [...usersKeys.all, 'batch', userIds.sort()],
    queryFn: async () => {
      const users = await Promise.all(
        userIds.map(id => apiEndpoints.users.getById(id))
      );
      return users;
    },
    enabled: enabled && userIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Mutation for updating current user's profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserInput) => apiEndpoints.users.updateProfile(data),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(usersKeys.profile(), updatedUser);
      queryClient.invalidateQueries({ queryKey: usersKeys.details() });
    },
  });
}

/**
 * Mutation for completing onboarding
 */
export function useCompleteOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: OnboardingFormData) => apiEndpoints.users.completeOnboarding(data),
    onSuccess: (user) => {
      queryClient.setQueryData(usersKeys.profile(), user);
    },
  });
}

/**
 * Mutation for uploading avatar
 */
export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => apiEndpoints.users.uploadAvatar(file),
    onSuccess: (data) => {
      queryClient.setQueryData(usersKeys.profile(), (old: User | undefined) => 
        old ? { ...old, avatarUrl: data.avatarUrl } : old
      );
    },
  });
}

/**
 * Mutation for phone verification
 */
export function useVerifyPhone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { phone: string; otp: string }) => apiEndpoints.users.verifyPhone(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.profile() });
    },
  });
}

/**
 * Mutation for requesting phone OTP
 */
export function useRequestPhoneOTP() {
  return useMutation({
    mutationFn: (phone: string) => apiEndpoints.users.requestPhoneOTP(phone),
  });
}

/**
 * Mutation for NIN verification
 */
export function useVerifyNIN() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { nin: string }) => apiEndpoints.users.verifyNIN(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.profile() });
    },
  });
}

/**
 * Mutation for BVN verification
 */
export function useVerifyBVN() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { bvn: string }) => apiEndpoints.users.verifyBVN(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.profile() });
    },
  });
}

/**
 * Hook for user role-based permissions
 */
export function useUserPermissions(user: User | undefined) {
  if (!user) return { isLandlord: false, isTenant: false, isAgent: false, isAdmin: false, isEstateManager: false };

  return {
    isLandlord: user.role === 'landlord',
    isTenant: user.role === 'tenant',
    isAgent: user.role === 'agent',
    isAdmin: user.role === 'admin',
    isEstateManager: user.role === 'estate_manager',
    canCreateListing: user.role === 'landlord' || user.role === 'agent',
    canManageAgreements: user.role === 'landlord' || user.role === 'agent',
    canAccessAdmin: user.role === 'admin',
    canManageOrganization: user.role === 'estate_manager' || user.role === 'admin',
    isProfileComplete: user.profileCompleted,
    isPhoneVerified: user.phoneVerified,
    isNINVerified: user.ninVerified,
    isIDVerified: user.idVerified,
  };
}

/**
 * Hook for getting user display name with fallback
 */
export function useUserDisplayName(user: User | UserSummary | undefined) {
  if (!user) return 'Unknown User';
  return user.fullName || user.email || 'Unknown User';
}

/**
 * Hook for getting user avatar with fallback
 */
export function useUserAvatar(user: User | UserSummary | undefined) {
  if (!user?.avatarUrl) return null;
  return user.avatarUrl;
}