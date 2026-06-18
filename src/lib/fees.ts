// Platform Fee & Agent Commission Calculator
// Based on BUILD_PLAN.md and DATABASE_SCHEMA.md

export interface FeeBreakdown {
  platformFee: number;      // in kobo
  agentCommission: number; // in kobo
  payeeAmount: number;     // in kobo (amount - platformFee - agentCommission)
}

export interface FeeRates {
  platform: number; // percentage as decimal (e.g., 0.10 = 10%)
  agent: number;    // percentage of platform fee that goes to agent
}

export const FEE_RATES: Record<string, FeeRates> = {
  rent: { platform: 0.10, agent: 0.10 },           // 10% platform, 10% of platform to agent
  sale: { platform: 0.01, agent: 0.015 },          // 1% platform (2% for >20M), 1.5% of amount to agent
  short_let: { platform: 0.10, agent: 0.10 },      // 10% platform, 10% of platform to agent
  subscription: { platform: 0, agent: 0 },         // No fees for subscriptions
  caution: { platform: 0.10, agent: 0.10 },        // Same as rent
};

/**
 * Calculate fees for a transaction
 * @param type - Transaction type
 * @param amountKobo - Total amount in kobo
 * @param hasAgent - Whether an agent is involved
 * @returns Fee breakdown
 */
export function computeFees(
  type: keyof typeof FEE_RATES,
  amountKobo: number,
  hasAgent: boolean = false
): FeeBreakdown {
  const rates = FEE_RATES[type];

  // Special case for sale > 20M Naira (20,000,000 * 100 = 2,000,000,000 kobo)
  let platformRate = rates.platform;
  if (type === 'sale' && amountKobo > 2_000_000_000) {
    platformRate = 0.02;
  }

  const platformFee = Math.round(amountKobo * platformRate);
  const agentCommission = hasAgent ? Math.round(platformFee * rates.agent) : 0;
  const payeeAmount = amountKobo - platformFee - agentCommission;

  return {
    platformFee,
    agentCommission,
    payeeAmount,
  };
}

/**
 * Calculate subscription plan pricing
 */
export const SUBSCRIPTION_PLANS = {
  starter: {
    name: 'Starter',
    monthlyKobo: 2_500_000, // ₦25,000
    maxUnits: 20,
    maxSeats: 1,
    features: ['Portfolio Management', 'Rent Collection', 'Basic Reports'],
  },
  growth: {
    name: 'Growth',
    monthlyKobo: 6_000_000, // ₦60,000
    maxUnits: 100,
    maxSeats: 5,
    features: ['All Starter features', 'Maintenance Tickets', 'Team Management', 'Advanced Reports'],
  },
  enterprise: {
    name: 'Enterprise',
    monthlyKobo: 15_000_000, // ₦150,000
    maxUnits: -1, // Unlimited
    maxSeats: -1, // Custom
    features: ['All Growth features', 'Unlimited Units', 'Custom Seats', 'API Access', 'Priority Support', 'Custom Reports'],
  },
} as const;

export type PlanTier = keyof typeof SUBSCRIPTION_PLANS;

export function getPlanDetails(tier: PlanTier) {
  return SUBSCRIPTION_PLANS[tier];
}

export function canAddUnit(currentUnits: number, tier: PlanTier): boolean {
  const plan = SUBSCRIPTION_PLANS[tier];
  if (plan.maxUnits === -1) return true;
  return currentUnits < plan.maxUnits;
}

export function canAddSeat(currentSeats: number, tier: PlanTier): boolean {
  const plan = SUBSCRIPTION_PLANS[tier];
  if (plan.maxSeats === -1) return true;
  return currentSeats < plan.maxSeats;
}

/**
 * Format fee breakdown for display
 */
export function formatFeeBreakdown(breakdown: FeeBreakdown) {
  return {
    platformFee: formatCurrencyKobo(breakdown.platformFee),
    agentCommission: formatCurrencyKobo(breakdown.agentCommission),
    payeeAmount: formatCurrencyKobo(breakdown.payeeAmount),
  };
}

import { formatCurrencyKobo } from './utils';