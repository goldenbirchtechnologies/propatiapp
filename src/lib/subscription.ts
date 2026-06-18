import { Organisation, OrgMember } from '@prisma/client';

/**
 * Subscription Plan Configuration for Estate Manager Organizations
 * Phase F: Estate Manager B2B Pricing
 */

export interface SubscriptionPlan {
  id: 'starter' | 'professional' | 'enterprise';
  name: string;
  price: number; // NGN per month
  priceKobo: number; // Kobo for Paystack
  maxUnits: number; // -1 = unlimited
  maxTeamMembers: number; // -1 = unlimited
  features: string[];
  interval: 'monthly';
}

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 25000, // ₦25,000 per month
    priceKobo: 2500000,
    maxUnits: 10,
    maxTeamMembers: 5,
    features: [
      '10 property units',
      '5 team members',
      'Basic rent collection',
      'Maintenance ticketing',
      'Basic reports',
      'Email support',
    ],
    interval: 'monthly',
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    price: 60000, // ₦60,000 per month
    priceKobo: 6000000,
    maxUnits: 50,
    maxTeamMembers: 15,
    features: [
      '50 property units',
      '15 team members',
      'Advanced rent collection',
      'Automated reminders',
      'Maintenance tracking',
      'Advanced reports & analytics',
      'API access',
      'Priority email support',
    ],
    interval: 'monthly',
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 150000, // ₦150,000 per month
    priceKobo: 15000000,
    maxUnits: -1, // unlimited
    maxTeamMembers: -1, // unlimited
    features: [
      'Unlimited property units',
      'Unlimited team members',
      'Full rent & ledger management',
      'Custom workflows',
      'Bulk operations',
      'Custom reports',
      'White-label options',
      'Dedicated account manager',
      'Phone & priority support',
    ],
    interval: 'monthly',
  },
};

/**
 * Get subscription plan details by ID
 */
export function getSubscriptionPlan(planId: string): SubscriptionPlan | null {
  return SUBSCRIPTION_PLANS[planId] || null;
}

/**
 * Get all subscription plans
 */
export function getSubscriptionPlans(): SubscriptionPlan[] {
  return Object.values(SUBSCRIPTION_PLANS);
}

/**
 * Check if organization can add a new unit based on subscription limits
 */
export function canAddUnit(org: Organisation & { _count?: { listings: number } }): {
  allowed: boolean;
  reason?: string;
  current: number;
  limit: number;
} {
  const currentUnits = org._count?.listings ?? 0;
  const maxUnits = org.maxUnits;

  // Unlimited units
  if (maxUnits === -1) {
    return { allowed: true, current: currentUnits, limit: -1 };
  }

  // Check limit
  if (currentUnits >= maxUnits) {
    return {
      allowed: false,
      reason: `Unit limit reached (${currentUnits}/${maxUnits}). Upgrade your plan to add more units.`,
      current: currentUnits,
      limit: maxUnits,
    };
  }

  return {
    allowed: true,
    current: currentUnits,
    limit: maxUnits,
  };
}

/**
 * Check if organization can add a new team member based on subscription limits
 */
export function canAddTeamMember(org: Organisation & { members?: OrgMember[] }): {
  allowed: boolean;
  reason?: string;
  current: number;
  limit: number;
} {
  const activeMembers = org.members?.filter((m) => m.status === 'active') ?? [];
  const currentMembers = activeMembers.length;
  const maxTeamMembers = org.maxSeats;

  // Unlimited team members
  if (maxTeamMembers === -1) {
    return { allowed: true, current: currentMembers, limit: -1 };
  }

  // Check limit
  if (currentMembers >= maxTeamMembers) {
    return {
      allowed: false,
      reason: `Team member limit reached (${currentMembers}/${maxTeamMembers}). Upgrade your plan to add more members.`,
      current: currentMembers,
      limit: maxTeamMembers,
    };
  }

  return {
    allowed: true,
    current: currentMembers,
    limit: maxTeamMembers,
  };
}

/**
 * Calculate prorated amount for plan changes
 * Returns amount in kobo
 */
export function calculateProratedAmount(
  currentPlan: string,
  newPlan: string,
  daysRemainingInPeriod: number
): number {
  const currentPlanDetails = getSubscriptionPlan(currentPlan);
  const newPlanDetails = getSubscriptionPlan(newPlan);

  if (!currentPlanDetails || !newPlanDetails) {
    return 0;
  }

  // Calculate daily rates
  const daysInMonth = 30; // Standardize to 30 days
  const currentDailyRate = currentPlanDetails.priceKobo / daysInMonth;
  const newDailyRate = newPlanDetails.priceKobo / daysInMonth;

  // Calculate unused amount from current plan
  const unusedAmount = currentDailyRate * daysRemainingInPeriod;

  // Calculate amount for new plan
  const newAmount = newDailyRate * daysRemainingInPeriod;

  // Return the difference (could be negative for downgrades)
  return Math.round(newAmount - unusedAmount);
}

/**
 * Get subscription status display text
 */
export function getSubscriptionStatusText(status: string): {
  text: string;
  color: 'green' | 'yellow' | 'red' | 'gray';
} {
  switch (status) {
    case 'active':
      return { text: 'Active', color: 'green' };
    case 'paused':
      return { text: 'Paused', color: 'yellow' };
    case 'cancelled':
      return { text: 'Cancelled', color: 'red' };
    default:
      return { text: 'Unknown', color: 'gray' };
  }
}

/**
 * Map internal plan tier to Paystack plan code
 * In production, these would be actual Paystack plan codes created via API
 */
export function getPaystackPlanCode(planId: string): string {
  // These should match plan codes created in Paystack
  // For now, use a simple mapping
  const planCodes: Record<string, string> = {
    starter: process.env.PAYSTACK_PLAN_STARTER || 'PLN_starter',
    professional: process.env.PAYSTACK_PLAN_PROFESSIONAL || 'PLN_professional',
    enterprise: process.env.PAYSTACK_PLAN_ENTERPRISE || 'PLN_enterprise',
  };

  return planCodes[planId] || planId;
}

/**
 * Format price for display
 */
export function formatPrice(kobo: number): string {
  const naira = kobo / 100;
  return `₦${naira.toLocaleString('en-NG')}`;
}

/**
 * Validate plan upgrade/downgrade
 */
export function validatePlanChange(
  currentPlan: string,
  newPlan: string,
  currentUnits: number,
  currentMembers: number
): { valid: boolean; errors: string[] } {
  const newPlanDetails = getSubscriptionPlan(newPlan);
  const errors: string[] = [];

  if (!newPlanDetails) {
    errors.push('Invalid plan selected');
    return { valid: false, errors };
  }

  // Check if downgrade would exceed limits
  if (newPlanDetails.maxUnits !== -1 && currentUnits > newPlanDetails.maxUnits) {
    errors.push(
      `Cannot downgrade: You have ${currentUnits} units, but ${newPlanDetails.name} plan allows only ${newPlanDetails.maxUnits} units. Please remove units first.`
    );
  }

  if (newPlanDetails.maxTeamMembers !== -1 && currentMembers > newPlanDetails.maxTeamMembers) {
    errors.push(
      `Cannot downgrade: You have ${currentMembers} team members, but ${newPlanDetails.name} plan allows only ${newPlanDetails.maxTeamMembers} members. Please remove team members first.`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
