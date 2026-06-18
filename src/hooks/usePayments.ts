'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, apiEndpoints, type Transaction, type Wallet, type InitiatePaymentInput } from '@/lib/api';

// Query Keys
export const paymentsKeys = {
  all: ['payments'] as const,
  transactions: () => [...paymentsKeys.all, 'transactions'] as const,
  transactionList: (params?: { page?: number; limit?: number }) => 
    [...paymentsKeys.transactions(), 'list', params] as const,
  transaction: (id: string) => [...paymentsKeys.transactions(), id] as const,
  wallet: () => [...paymentsKeys.all, 'wallet'] as const,
};

/**
 * Get all transactions with pagination
 */
export function useTransactions(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: paymentsKeys.transactionList(params),
    queryFn: () => apiEndpoints.payments.getTransactions(params),
    staleTime: 60 * 1000,
  });
}

/**
 * Get a single transaction by ID
 */
export function useTransaction(id: string, enabled = true) {
  return useQuery({
    queryKey: paymentsKeys.transaction(id),
    queryFn: () => apiEndpoints.payments.getTransaction(id),
    enabled: enabled && !!id,
    staleTime: 30 * 1000,
  });
}

/**
 * Get user's wallet
 */
export function useWallet() {
  return useQuery({
    queryKey: paymentsKeys.wallet(),
    queryFn: () => apiEndpoints.payments.getWallet(),
    staleTime: 30 * 1000,
  });
}

/**
 * Mutation for initiating a payment
 * Returns authorization URL for Paystack checkout
 */
export function useInitiatePayment() {
  return useMutation({
    mutationFn: (data: InitiatePaymentInput) => apiEndpoints.payments.initiate(data),
  });
}

/**
 * Mutation for verifying a payment
 */
export function useVerifyPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reference: string) => apiEndpoints.payments.verify(reference),
    onSuccess: (transaction) => {
      queryClient.invalidateQueries({ queryKey: paymentsKeys.transactions() });
      queryClient.invalidateQueries({ queryKey: paymentsKeys.wallet() });
      queryClient.setQueryData(paymentsKeys.transaction(transaction.id), transaction);
    },
  });
}

/**
 * Mutation for requesting a refund
 */
export function useRequestRefund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ transactionId, reason }: { transactionId: string; reason: string }) => 
      apiEndpoints.payments.requestRefund(transactionId, { reason }),
    onSuccess: (_, { transactionId }) => {
      queryClient.invalidateQueries({ queryKey: paymentsKeys.transactions() });
      queryClient.invalidateQueries({ queryKey: paymentsKeys.transaction(transactionId) });
      queryClient.invalidateQueries({ queryKey: paymentsKeys.wallet() });
    },
  });
}

/**
 * Mutation for withdrawing from wallet
 */
export function useWithdraw() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { amount: number; accountId: string }) => apiEndpoints.payments.withdraw(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentsKeys.wallet() });
      queryClient.invalidateQueries({ queryKey: paymentsKeys.transactions() });
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