'use client';

import { useQuery } from '@tanstack/react-query';

// Types
export interface Tenant {
  id: string;
  name: string;
  email: string;
  unit: string;
  status: string;
  leaseEnd: string;
  noticePeriod: boolean;
}

export interface EstateManagerTenantsResponse {
  success: boolean;
  data: Tenant[];
}

// Query Keys
export const tenantsKeys = {
  all: ['tenants'] as const,
  lists: () => [...tenantsKeys.all, 'list'] as const,
  list: (orgId: string) => [...tenantsKeys.lists(), orgId] as const,
};

/**
 * Get all tenants for an estate manager's organization
 */
export function useTenants(orgId: string) {
  return useQuery({
    queryKey: tenantsKeys.list(orgId),
    queryFn: async (): Promise<EstateManagerTenantsResponse> => {
      const res = await fetch(`/api/dashboard/estate-manager/tenants?orgId=${encodeURIComponent(orgId)}`);
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Failed to fetch tenants' }));
        throw new Error(error.error || 'Failed to fetch tenants');
      }
      return res.json();
    },
    enabled: !!orgId,
    staleTime: 30 * 1000,
  });
}
