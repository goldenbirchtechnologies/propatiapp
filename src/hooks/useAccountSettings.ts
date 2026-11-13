'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface AccountSettings {
  paystackInvoicingEnabled: boolean;
  paymentRemindersEnabled: boolean;
  stampDutySurchargeEnabled: boolean;
  escrowSplitPercent: number;
}

export interface AccountSettlement {
  identity: {
    verified: boolean;
    status: string;
    idType: string | null;
    verifiedAt: string | null;
  };
  settlement: {
    linked: boolean;
    state: 'verified' | 'pending' | 'missing';
    bankName: string | null;
    accountName: string | null;
    accountNumberMasked: string | null;
  };
}

export interface AccountOnboarding {
  required: boolean;
  completed: boolean;
  remaining: number;
}

export interface AccountSettingsPayload {
  settings: AccountSettings;
  settlement: AccountSettlement;
  onboarding: AccountOnboarding;
}

export const accountKeys = {
  all: ['accounts'] as const,
  settings: () => [...accountKeys.all, 'settings'] as const,
};

/**
 * Address of the billing tab's single source of truth. Exported so the
 * onboarding overlay can invalidate exactly this query when a dossier closes —
 * a settlement account added during onboarding must show up on the profile
 * without the user reloading the page.
 */
export function useAccountSettings() {
  return useQuery({
    queryKey: accountKeys.settings(),
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: AccountSettingsPayload }>(
        '/accounts/settings'
      );
      return res.data;
    },
    // A settlement account can change on the server (onboarding, Paystack
    // webhook) while this tab sits open, so a cached read is never trusted on
    // a return visit.
    staleTime: 30 * 1000,
    refetchOnMount: 'always',
  });
}

/**
 * Patches one or more settings. Writes optimistically so the switch moves on
 * click, and restores the previous value if the request fails — a toggle that
 * stays flipped after a rejected save is worse than one that flickers back.
 */
export function useUpdateAccountSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (patch: Partial<AccountSettings>) => {
      const res = await api.patch<{ success: boolean; data: { settings: AccountSettings } }>(
        '/accounts/settings',
        patch
      );
      return res.data.settings;
    },
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: accountKeys.settings() });
      const previous = queryClient.getQueryData<AccountSettingsPayload>(accountKeys.settings());

      if (previous) {
        queryClient.setQueryData<AccountSettingsPayload>(accountKeys.settings(), {
          ...previous,
          settings: { ...previous.settings, ...patch },
        });
      }

      return { previous };
    },
    onError: (_error, _patch, context) => {
      if (context?.previous) {
        queryClient.setQueryData(accountKeys.settings(), context.previous);
      }
    },
    // Settle on the server's own copy either way: on success it is the stored
    // row, on failure it is the rollback the invalidation refetches.
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.settings() });
    },
  });
}
