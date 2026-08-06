'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Types
export interface UnitFilters {
  status?: string;
  occupancy?: string;
  buildingName?: string;
  type?: string;
  page?: number;
  limit?: number;
}

export interface CreateUnitInput {
  orgId: string;
  buildingName?: string;
  unitNumber: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  sizeSqm?: number;
  rent: number;
  cautionDeposit?: number;
  serviceCharge?: number;
  status?: string;
  occupancy?: string;
  listingId: string;
  listingType?: string;
}

export interface UpdateUnitInput extends Partial<CreateUnitInput> {
  currentTenantId?: string | null;
  leaseStartDate?: string | null;
  leaseEndDate?: string | null;
  lastMaintenanceDate?: string | null;
  nextMaintenanceDate?: string | null;
}

export interface BulkUploadInput {
  orgId: string;
  csvData: string;
}

export interface LedgerFilters {
  month?: string;
  year?: string;
  unitId?: string;
  status?: string;
  export?: string;
}

export interface PortfolioSummary {
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  underMaintenanceUnits: number;
  totalMonthlyRent: number;
  occupancyRate: number;
  unitsByType: Array<{ type: string; count: number }>;
}

// Query Keys
export const unitsKeys = {
  all: ['units'] as const,
  lists: () => [...unitsKeys.all, 'list'] as const,
  list: (orgId: string, params?: UnitFilters) => [...unitsKeys.lists(), orgId, params] as const,
  details: () => [...unitsKeys.all, 'detail'] as const,
  detail: (orgId: string, unitId: string) => [...unitsKeys.details(), orgId, unitId] as const,
  portfolio: (orgId: string) => [...unitsKeys.all, 'portfolio', orgId] as const,
  ledger: (orgId: string, params?: LedgerFilters) => [...unitsKeys.all, 'ledger', orgId, params] as const,
};

/**
 * Get all units for an organization
 */
export function useUnits(orgId: string, params?: UnitFilters) {
  return useQuery({
    queryKey: unitsKeys.list(orgId, params),
    queryFn: async () => {
      const searchParams = new URLSearchParams(params as Record<string, string>);
      const res = await fetch(`/api/orgs/${orgId}/units?${searchParams}`);
      if (!res.ok) throw new Error('Failed to fetch units');
      return res.json();
    },
    enabled: !!orgId,
    staleTime: 30 * 1000,
  });
}

/**
 * Get a single unit
 */
export function useUnit(orgId: string, unitId: string) {
  return useQuery({
    queryKey: unitsKeys.detail(orgId, unitId),
    queryFn: async () => {
      const res = await fetch(`/api/orgs/${orgId}/units/${unitId}`);
      if (!res.ok) throw new Error('Failed to fetch unit');
      return res.json();
    },
    enabled: !!(orgId && unitId),
    staleTime: 30 * 1000,
  });
}

/**
 * Create a new unit
 */
export function useCreateUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orgId, ...data }: CreateUnitInput) => {
      const res = await fetch(`/api/orgs/${orgId}/units`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create unit');
      }
      return res.json();
    },
    onSuccess: (_, { orgId }) => {
      queryClient.invalidateQueries({ queryKey: unitsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: unitsKeys.portfolio(orgId) });
    },
  });
}

/**
 * Update a unit
 */
export function useUpdateUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orgId, unitId, ...data }: UpdateUnitInput & { orgId: string; unitId: string }) => {
      const res = await fetch(`/api/orgs/${orgId}/units/${unitId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update unit');
      }
      return res.json();
    },
    onSuccess: (_, { orgId, unitId }) => {
      queryClient.invalidateQueries({ queryKey: unitsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: unitsKeys.detail(orgId, unitId) });
      queryClient.invalidateQueries({ queryKey: unitsKeys.portfolio(orgId) });
    },
  });
}

/**
 * Delete a unit
 */
export function useDeleteUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orgId, unitId }: { orgId: string; unitId: string }) => {
      const res = await fetch(`/api/orgs/${orgId}/units/${unitId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete unit');
      }
      return res.json();
    },
    onSuccess: (_, { orgId }) => {
      queryClient.invalidateQueries({ queryKey: unitsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: unitsKeys.portfolio(orgId) });
    },
  });
}

/**
 * Bulk upload units from CSV
 */
export function useBulkUploadUnits() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orgId, csvData }: BulkUploadInput) => {
      const res = await fetch(`/api/orgs/${orgId}/bulk-upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvData }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Bulk upload failed');
      }
      return res.json();
    },
    onSuccess: (_, { orgId }) => {
      queryClient.invalidateQueries({ queryKey: unitsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: unitsKeys.portfolio(orgId) });
    },
  });
}

/**
 * Get portfolio overview including unit statistics
 */
export function usePortfolioOverview(orgId: string, params?: Record<string, string>) {
  return useQuery({
    queryKey: unitsKeys.portfolio(orgId),
    queryFn: async () => {
      const searchParams = new URLSearchParams(params);
      const res = await fetch(`/api/orgs/${orgId}/portfolio?${searchParams}`);
      if (!res.ok) throw new Error('Failed to fetch portfolio');
      return res.json();
    },
    enabled: !!orgId,
    staleTime: 60 * 1000,
  });
}

/**
 * Get rent ledger with unit information
 */
export function useRentLedger(orgId: string, params?: LedgerFilters) {
  return useQuery({
    queryKey: unitsKeys.ledger(orgId, params),
    queryFn: async () => {
      const searchParams = new URLSearchParams(params as Record<string, string>);
      const res = await fetch(`/api/orgs/${orgId}/ledger?${searchParams}`);
      if (!res.ok) throw new Error('Failed to fetch ledger');
      return res.json();
    },
    enabled: !!orgId,
    staleTime: 30 * 1000,
  });
}

/**
 * Download CSV template for bulk upload
 */
export function downloadUnitsCSVTemplate() {
  const template = `buildingName,unitNumber,type,listingType,bedrooms,bathrooms,sizeSqm,rent,cautionDeposit,serviceCharge,status,occupancy\nBuilding A,101,apartment,rent,2,2,85,150000,300000,15000,AVAILABLE,VACANT\nBuilding A,102,apartment,short_let,3,2,110,200000,400000,20000,RENTED,OCCUPIED\nBuilding B,201,apartment,sale,1,1,60,100000,200000,10000,AVAILABLE,VACANT`;

  const blob = new Blob([template], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'units-template.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

/**
 * Export rent ledger as CSV
 */
export async function exportRentLedgerCSV(orgId: string, params?: LedgerFilters) {
  const searchParams = new URLSearchParams({ ...params, export: 'csv' } as Record<string, string>);
  const res = await fetch(`/api/orgs/${orgId}/ledger?${searchParams}`);
  if (!res.ok) throw new Error('Failed to export ledger');

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `rent-ledger-${orgId}-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
