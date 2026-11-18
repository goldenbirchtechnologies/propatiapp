import { NextResponse } from 'next/server';
import { SubscriptionStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getEffectivePlatformConfig } from '@/lib/platform-config-server';
import type { PlatformConfig, RoleKey } from '@/lib/platform-config';

export interface AccessUser {
  id: string;
  role: string;
}

export interface UpgradePrompt {
  planId: string;
  planName: string;
  amountKobo: number | null;
  amountLabel: string;
  cadence: 'monthly' | 'one_time' | 'custom';
  message: string;
}

export interface FeatureAccessResult {
  allowed: boolean;
  featureKey: string;
  tier: 'admin' | 'free' | 'pro' | 'add_on';
  current?: number;
  limit?: number;
  reason?: string;
  upgradePrompt?: UpgradePrompt;
}

export interface AccessContext {
  orgId?: string;
  /** Caller-supplied count avoids a second query when the route already counted. */
  current?: number;
}

const naira = (kobo: number) => `₦${(kobo / 100).toLocaleString('en-NG')}`;

function ownsFeature(config: PlatformConfig, role: RoleKey, featureKey: string): boolean {
  const entitlement = config.entitlements[role];
  return Boolean(
    entitlement.free.features[featureKey] || entitlement.pro?.features[featureKey]
  );
}

function featureOwner(config: PlatformConfig, role: RoleKey, featureKey: string): RoleKey | null {
  if (ownsFeature(config, role, featureKey)) return role;
  return (Object.keys(config.entitlements) as RoleKey[]).find((key) =>
    ownsFeature(config, key, featureKey)
  ) ?? null;
}

async function isProSubscriber(
  user: AccessUser,
  role: RoleKey,
  config: PlatformConfig,
  context: AccessContext
): Promise<boolean> {
  const pro = config.entitlements[role].pro;
  if (!pro) return false;

  const subscription = await prisma.userSubscription.findFirst({
    where: { userId: user.id, status: SubscriptionStatus.active },
    include: { plan: true },
    orderBy: { createdAt: 'desc' },
  });

  if (subscription?.plan) {
    const name = subscription.plan.name.toLowerCase();
    if (name.includes('pro') || name.includes('premium') || name.includes('professional')) return true;
    if (
      subscription.plan.id === pro.planId ||
      subscription.plan.name === pro.planId ||
      subscription.plan.name === pro.name
    ) return true;
    if (role === 'landlord' && subscription.plan.maxProperties === -1) return true;
    if (role === 'agent' && subscription.plan.maxListings === -1) return true;
  }

  if (role === 'estate_manager' && context.orgId) {
    const org = await prisma.organisation.findUnique({
      where: { id: context.orgId },
      select: { maxUnits: true, planTier: true },
    });
    if (org && ['pro', 'professional', 'enterprise', 'growth'].includes(String(org.planTier).toLowerCase())) {
      return true;
    }
  }

  return false;
}

function upgradePromptFor(
  config: PlatformConfig,
  role: RoleKey,
  featureKey: string,
  quantity: number
): UpgradePrompt | undefined {
  const entitlement = config.entitlements[role];

  const addOn = entitlement.addOns?.[featureKey];
  if (addOn) {
    const amount = addOn.priceOneTimeKobo;
    return {
      planId: featureKey,
      planName: addOn.name,
      amountKobo: amount,
      amountLabel: amount === null ? 'Quoted at checkout' : naira(amount),
      cadence: amount === null ? 'custom' : 'one_time',
      message: amount === null
        ? `${addOn.name}: financing fees are quoted at checkout.`
        : `Unlock ${addOn.name} for a one-time ${naira(amount)}.`,
    };
  }

  const pro = entitlement.pro;
  if (!pro) return undefined;

  let amount = pro.priceMonthlyKobo;
  let amountLabel = amount === null ? 'Custom quote' : `${naira(amount)}/mo`;
  if (role === 'estate_manager' && pro.perUnitTiers) {
    const tier = pro.perUnitTiers.find(
      (band) => quantity >= band.minUnits && (band.maxUnits === null || quantity <= band.maxUnits)
    );
    if (tier?.pricePerUnitMonthlyKobo != null) {
      amount = tier.pricePerUnitMonthlyKobo * quantity;
      amountLabel = `${naira(tier.pricePerUnitMonthlyKobo)}/unit/mo (${tier.label})`;
    } else {
      amount = null;
      amountLabel = 'Custom quote';
    }
  }

  return {
    planId: pro.planId,
    planName: pro.name,
    amountKobo: amount,
    amountLabel,
    cadence: amount === null ? 'custom' : 'monthly',
    message: `Upgrade to ${pro.name} (${amountLabel}) to unlock this feature.`,
  };
}

async function currentUsage(
  user: AccessUser,
  featureKey: string,
  context: AccessContext
): Promise<number> {
  if (context.current !== undefined) return context.current;
  if (featureKey === 'listing.create') {
    return prisma.listing.count({ where: { ownerId: user.id } });
  }
  if (featureKey === 'estate.create_unit' && context.orgId) {
    return prisma.unit.count({ where: { organizationId: context.orgId } });
  }
  return 0;
}

/**
 * Server-side entitlement gate. Free-tier caps are enforced here rather than
 * in the UI so a direct API call cannot exceed them.
 */
export async function checkFeatureAccess(
  user: AccessUser,
  featureKey: string,
  context: AccessContext = {}
): Promise<FeatureAccessResult> {
  const config = await getEffectivePlatformConfig();

  if (user.role === 'admin') {
    return { allowed: true, featureKey, tier: 'admin' };
  }

  const role = user.role as RoleKey;
  if (!(role in config.entitlements)) {
    return {
      allowed: false,
      featureKey,
      tier: 'free',
      reason: 'This feature is not available for your role.',
    };
  }

  const owner = featureOwner(config, role, featureKey);
  if (!owner) {
    return {
      allowed: false,
      featureKey,
      tier: 'free',
      reason: `Unknown feature: ${featureKey}`,
    };
  }

  const pro = await isProSubscriber(user, owner, config, context);
  const tierConfig = config.entitlements[owner];
  const tier = pro && tierConfig.pro ? tierConfig.pro : tierConfig.free;
  const tierName = pro && tierConfig.pro ? 'pro' : 'free';
  const current = await currentUsage(user, featureKey, context);

  const limitKey =
    featureKey === 'listing.create'
      ? role === 'landlord'
        ? 'max_properties'
        : 'max_listings'
      : featureKey === 'estate.create_unit'
        ? 'max_units'
        : null;
  const limit = limitKey ? (tier.limits[limitKey] ?? null) : null;

  if (limit !== null && limit >= 0 && current >= limit) {
    const quantity = current + 1;
    return {
      allowed: false,
      featureKey,
      tier: tierName,
      current,
      limit,
      reason:
        owner === 'estate_manager'
          ? `Unit limit reached (${current}/${limit}). Upgrade your plan to add more units.`
          : `Property limit reached (${current}/${limit}). Upgrade to list more properties.`,
      upgradePrompt: upgradePromptFor(config, owner, featureKey, quantity),
    };
  }

  if (tier.features[featureKey] === true) {
    return { allowed: true, featureKey, tier: tierName, current, limit: limit ?? undefined };
  }

  return {
    allowed: false,
    featureKey,
    tier: tierName,
    current,
    limit: limit ?? undefined,
    reason: tierConfig.addOns?.[featureKey]
      ? `${tierConfig.addOns[featureKey].name} is a paid add-on.`
      : `Upgrade to ${tierConfig.pro?.name ?? 'a paid plan'} to use ${featureKey}.`,
    upgradePrompt: upgradePromptFor(config, owner, featureKey, Math.max(current + 1, 16)),
  };
}

export async function enforceFeatureAccess(
  user: AccessUser,
  featureKey: string,
  context: AccessContext = {}
): Promise<NextResponse | null> {
  const access = await checkFeatureAccess(user, featureKey, context);
  if (access.allowed) return null;
  return NextResponse.json(
    {
      error: access.reason,
      code: 'FEATURE_GATED',
      feature: featureKey,
      usage: { current: access.current, limit: access.limit },
      upgrade: access.upgradePrompt,
    },
    { status: 403 }
  );
}
