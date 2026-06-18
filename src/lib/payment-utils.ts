/**
 * Payment utility functions for PROPATI
 * Handles amount formatting, fee calculations, and Paystack integration
 */

export function formatAmount(amount: number): string {
  return `₦${amount.toLocaleString('en-NG')}`;
}

export function formatAmountFromKobo(kobo: number): string {
  const naira = kobo / 100;
  return `₦${naira.toLocaleString('en-NG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

/**
 * Calculate platform fee based on transaction type
 * @param amount - Amount in kobo
 * @param type - Transaction type
 * @returns Platform fee in kobo
 */
export function calculatePlatformFee(amount: number, type: string): number {
  // Fees are in percentages
  const feeRates: Record<string, number> = {
    rent: 0.10,
    sale: amount > 2000000000 ? 0.02 : 0.015, // 20M Naira = 2B kobo
    short_let: 0.10,
    caution: 0.10,
    service_charge: 0.05,
    subscription: 0,
  };

  const rate = feeRates[type] || 0;
  return Math.round(amount * rate);
}

/**
 * Calculate agent commission based on platform fee
 * @param platformFee - Platform fee in kobo
 * @param hasAgent - Whether transaction has an agent
 * @returns Agent commission in kobo
 */
export function calculateAgentCommission(platformFee: number, hasAgent: boolean): number {
  if (!hasAgent) return 0;
  return Math.round(platformFee * 0.10); // 10% of platform fee
}

/**
 * Calculate payment breakdown
 */
export function calculatePaymentBreakdown(
  amount: number,
  type: string,
  hasAgent: boolean = false
): {
  amount: number;
  platformFee: number;
  agentCommission: number;
  payeeAmount: number;
  total: number;
} {
  const platformFee = calculatePlatformFee(amount, type);
  const agentCommission = calculateAgentCommission(platformFee, hasAgent);
  const payeeAmount = amount - platformFee - agentCommission;

  return {
    amount,
    platformFee,
    agentCommission,
    payeeAmount,
    total: amount, // Payer pays the full amount
  };
}

/**
 * Get Paystack public key from environment
 */
export function getPaystackPublicKey(): string {
  return process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '';
}

/**
 * Build Paystack checkout URL
 */
export function buildPaystackCheckoutUrl(authorizationUrl: string): string {
  return authorizationUrl;
}

/**
 * Convert Naira to Kobo (Paystack uses kobo)
 */
export function nairaToKobo(naira: number): number {
  return Math.round(naira * 100);
}

/**
 * Convert Kobo to Naira
 */
export function koboToNaira(kobo: number): number {
  return kobo / 100;
}

/**
 * Get payment type display label
 */
export function getPaymentTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    rent: 'Rent Payment',
    sale: 'Property Sale',
    short_let: 'Short Let',
    caution: 'Caution Deposit',
    service_charge: 'Service Charge',
    subscription: 'Subscription',
  };

  return labels[type] || type;
}

/**
 * Get transaction status color
 */
export function getTransactionStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'amber',
    in_escrow: 'blue',
    released: 'green',
    completed: 'green',
    failed: 'red',
    refunded: 'gray',
  };

  return colors[status] || 'gray';
}

/**
 * Format transaction reference for display
 */
export function formatTransactionReference(reference: string): string {
  // Take last 8 characters and make uppercase
  return reference.slice(-8).toUpperCase();
}
