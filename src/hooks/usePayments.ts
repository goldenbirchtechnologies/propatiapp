'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Types
export interface InitiatePaymentInput {
  listingId: string;
  agreementId?: string;
  type: 'rent' | 'caution' | 'sale' | 'short_let' | 'subscription';
  amount: number;
  email: string;
  phone?: string;
  metadata?: Record<string, string>;
}

export interface ReleaseEscrowInput {
  transactionId: string;
  recipientBankCode: string;
  recipientAccountNumber: string;
  recipientName: string;
  amount?: number;
  reason?: string;
}

export interface TransactionFilters {
  page?: number;
  limit?: number;
  userId?: string;
  status?: 'pending' | 'in_escrow' | 'released' | 'failed' | 'refunded';
  type?: 'rent' | 'caution' | 'sale' | 'short_let' | 'subscription';
  listingId?: string;
  agreementId?: string;
}

export interface Transaction {
  id: string;
  reference?: string | null;
  type: string;
  status: string;
  amount: number;
  platformFee: number;
  agentCommission: number;
  payeeAmount?: number | null;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

// Query Keys
export const paymentsKeys = {
  all: ['payments'] as const,
  transactions: () => [...paymentsKeys.all, 'transactions'] as const,
  transactionList: (params?: TransactionFilters) =>
    [...paymentsKeys.transactions(), 'list', params] as const,
  transaction: (id: string) => [...paymentsKeys.transactions(), id] as const,
};

/**
 * Get all transactions with pagination and filters
 */
export function useTransactions(params?: TransactionFilters) {
  return useQuery({
    queryKey: paymentsKeys.transactionList(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams((params ?? {}) as Record<string, string>);
      const response = await fetch(`/api/payments/transactions?${searchParams}`);
      if (!response.ok) throw new Error('Failed to fetch transactions');
      return response.json();
    },
    staleTime: 60 * 1000,
  });
}

/**
 * Get a single transaction by ID
 */
export function useTransaction(id: string, enabled = true) {
  return useQuery({
    queryKey: paymentsKeys.transaction(id),
    queryFn: async () => {
      const response = await fetch(`/api/payments/transactions/${id}`);
      if (!response.ok) throw new Error('Failed to fetch transaction');
      return response.json();
    },
    enabled: enabled && !!id,
    staleTime: 30 * 1000,
  });
}

/**
 * Mutation for initiating a payment
 * Returns authorization URL for Paystack checkout
 */
export function useInitiatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InitiatePaymentInput) => {
      const response = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Payment initiation failed');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentsKeys.transactions() });
    },
  });
}

/**
 * Mutation for verifying a payment by reference
 */
export function useVerifyPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reference: string) => {
      const response = await fetch(`/api/payments/verify/${reference}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Payment verification failed');
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: paymentsKeys.transactions() });
      if (data?.transaction?.id) {
        queryClient.setQueryData(paymentsKeys.transaction(data.transaction.id), data);
      }
    },
  });
}

/**
 * Mutation for releasing escrow funds
 */
export function useReleaseEscrow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ transactionId, ...data }: ReleaseEscrowInput) => {
      const response = await fetch(`/api/payments/release-escrow/${transactionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Escrow release failed');
      }
      return response.json();
    },
    onSuccess: (_, { transactionId }) => {
      queryClient.invalidateQueries({ queryKey: paymentsKeys.transactions() });
      queryClient.invalidateQueries({ queryKey: paymentsKeys.transaction(transactionId) });
    },
  });
}

/**
 * Helper hook for payment status display
 */
export function usePaymentStatus(transaction: Transaction | undefined) {
  if (!transaction) return { status: 'unknown', color: 'gray', label: 'Unknown' };

  const statusConfig: Record<string, { color: string; label: string }> = {
    pending: { color: 'yellow', label: 'Pending' },
    in_escrow: { color: 'blue', label: 'In Escrow' },
    released: { color: 'green', label: 'Released' },
    failed: { color: 'red', label: 'Failed' },
    refunded: { color: 'orange', label: 'Refunded' },
  };

  return statusConfig[transaction.status] || { color: 'gray', label: transaction.status };
}

/**
 * Hook for wallet balance
 */
export function useWallet() {
  return useQuery({
    queryKey: ['wallet'],
    queryFn: async () => {
      const response = await fetch(`/api/wallet`);
      if (!response.ok) {
        // Return mock wallet if API doesn't exist yet
        return { balance: 0, currency: 'NGN' };
      }
      return response.json();
    },
    staleTime: 60 * 1000,
  });
}

/**
 * Hook for computing fee breakdown
 */
export function usePaymentBreakdown(transaction: Transaction | undefined) {
  if (!transaction) return null;

  const amount = Number(transaction.amount);
  const platformFee = Number(transaction.platformFee);
  const agentCommission = Number(transaction.agentCommission);
  const payeeAmount = Number(transaction.payeeAmount);

  return {
    total: amount,
    platformFee,
    agentCommission,
    payeeAmount,
    platformFeePercent: amount > 0 ? ((platformFee / amount) * 100).toFixed(1) : '0',
    agentCommissionPercent: amount > 0 ? ((agentCommission / amount) * 100).toFixed(1) : '0',
    payeePercent: amount > 0 ? ((payeeAmount / amount) * 100).toFixed(1) : '0',
  };
}