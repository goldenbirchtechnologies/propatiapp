'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface EstateCommandOrg {
  id: string;
  name: string;
  address: string | null;
  maxUnits: number;
}

export interface EstateCommandFleet {
  totalUnits: number;
  estateCount: number;
  occupiedUnits: number;
  vacantUnits: number;
  noticeUnits: number;
  maintenanceUnits: number;
  activeTurnover: number;
  occupancyRate: number;
  monthlyRentRoll: number;
}

export interface EstateCommandEscrow {
  billed: number;
  collected: number;
  pending: number;
  collectionRate: number;
  collectionsYtd: number;
  opexYtd: number;
  overdueCount: number;
}

export interface EstateCommandWorkOrders {
  open: number;
  urgent: number;
  high: number;
  dispatched: number;
  inProgress: number;
  resolved: number;
  total: number;
}

export interface EstateCommandUtilities {
  totalOpex: number;
  paidOpex: number;
  breakdown: Array<{ type: string; amount: number }>;
}

export interface EstateCommandMonth {
  key: string;
  month: string;
  collections: number;
  opex: number;
  isCurrent: boolean;
}

export interface EstateCommandEstate {
  id: string;
  name: string;
  address: string | null;
  propertyType: string | null;
  unitCount: number;
  occupiedCount: number;
  billed: number;
  collected: number;
  paidRate: number;
  openTickets: number;
}

export interface EstateCommandTicket {
  id: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  raisedBy: string | null;
  assignedTo: string | null;
  listing: { id: string; title: string; address: string | null } | null;
}

export interface EstateCommandCharge {
  id: string;
  period: string;
  amount: number;
  status: string;
  dueDate: string;
  paidAt: string | null;
  listing: { id: string; title: string; address: string | null } | null;
}

export interface EstateCommandOverdueCharge {
  id: string;
  period: string;
  amount: number;
  status: string;
  dueDate: string;
  daysOverdue: number;
  listing: { id: string; title: string; address: string | null } | null;
}

export interface EstateCommandUnit {
  id: string;
  unitNumber: string;
  buildingName: string | null;
  type: string;
  bedrooms: number;
  bathrooms: number;
  rent: number;
  serviceCharge: number | null;
  status: string;
  occupancy: string;
  leaseStartDate: string | null;
  leaseEndDate: string | null;
  nextMaintenanceDate: string | null;
  currentTenant: { id: string; fullName: string | null; email: string; avatarUrl?: string | null } | null;
  listing: { id: string; title: string; address: string | null } | null;
}

export interface EstateCommandData {
  generatedAt: string;
  org: EstateCommandOrg;
  fleet: EstateCommandFleet;
  escrow: EstateCommandEscrow;
  workOrders: EstateCommandWorkOrders;
  utilities: EstateCommandUtilities;
  months: EstateCommandMonth[];
  estates: EstateCommandEstate[];
  overdueCharges: EstateCommandOverdueCharge[];
  recentTickets: EstateCommandTicket[];
  recentCharges: EstateCommandCharge[];
  units: EstateCommandUnit[];
  hasData: boolean;
}

export const estateCommandKeys = {
  all: ['estate-command'] as const,
  detail: (orgId: string) => [...estateCommandKeys.all, orgId] as const,
};

/** Poll interval for the live operations feed (ms). */
const POLL_INTERVAL = 30_000;

/**
 * Aggregated estate command centre payload for an organisation.
 * Polls so the live-sync badge and operational counts stay current.
 */
export function useEstateCommand(orgId: string | null, enabled = true) {
  return useQuery({
    queryKey: estateCommandKeys.detail(orgId ?? 'none'),
    queryFn: async () => {
      const res = await fetch(`/api/dashboard/estate-manager/command?orgId=${orgId}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || `Request failed (${res.status})`);
      }
      const json = await res.json();
      return json.data as EstateCommandData;
    },
    enabled: enabled && !!orgId,
    refetchInterval: POLL_INTERVAL,
    staleTime: 10_000,
  });
}

export interface DispatchInput {
  ticketId: string;
  assignedTo: string;
}

/**
 * Local-only refresh channel for the command centre.
 * Lets sibling panels force a re-sync without a full page reload.
 */
export function useEstateCommandRefresh(orgId: string | null) {
  const queryClient = useQueryClient();
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(() => {
    if (!orgId) return;
    queryClient.invalidateQueries({ queryKey: estateCommandKeys.detail(orgId) });
    setLastSyncedAt(new Date());
  }, [orgId, queryClient]);

  // Track the latest successful sync so the ribbon can report freshness.
  useEffect(() => {
    timerRef.current = setInterval(() => setLastSyncedAt(new Date()), POLL_INTERVAL);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return { refresh, lastSyncedAt };
}

/** Relative age label for a timestamp, e.g. "just now", "18s ago", "4m ago". */
export function formatRelativeAge(date: Date | string | null): string {
  if (!date) return 'never';
  const then = typeof date === 'string' ? new Date(date) : date;
  const seconds = Math.max(0, Math.floor((Date.now() - then.getTime()) / 1000));
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
