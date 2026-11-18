import { z } from 'zod';
import defaults from '@/config/platform-config.json';

const kobo = z.number().int().nonnegative();
const rate = z.number().min(0).max(1);
const rateRange = z.object({ default: rate, min: rate, max: rate });

const tierSchema = z.object({
  planId: z.string(),
  name: z.string(),
  priceMonthlyKobo: kobo.nullable(),
  perUnitTiers: z
    .array(
      z.object({
        minUnits: z.number().int(),
        maxUnits: z.number().int().nullable(),
        pricePerUnitMonthlyKobo: kobo.nullable(),
        label: z.string(),
      })
    )
    .optional(),
  limits: z.record(z.number().nullable()),
  features: z.record(z.boolean()),
});

const roleSchema = z.object({
  free: tierSchema,
  pro: tierSchema.optional(),
  addOns: z
    .record(
      z.object({
        name: z.string(),
        priceOneTimeKobo: kobo.nullable(),
        description: z.string(),
      })
    )
    .optional(),
});

export const platformConfigSchema = z.object({
  version: z.number().int().positive(),
  currency: z.literal('NGN'),
  amountUnit: z.literal('kobo'),
  vat: z.object({ rate, appliesTo: z.literal('platform_fees_only') }),
  gatewayFees: z.object({
    local: z.object({ rate, flatKobo: kobo, capKobo: kobo.nullable() }),
    international: z.object({ rate, flatKobo: kobo, capKobo: kobo.nullable() }),
  }),
  transactionFees: z.object({
    shortlet: z.object({
      platformCommissionRate: rate,
      platformFeePayer: z.literal('host'),
      guestPlatformFeeRate: rate,
      agencyFeeRate: rate,
      agreementFeeRate: rate,
      cautionDepositRate: rate,
      cautionDepositPlatformFeeRate: rate,
      vatAppliesToPlatformFee: z.boolean(),
      note: z.string().optional(),
    }),
    long_term_rent: z.object({
      initialPlatformFeeRate: rate,
      renewalPlatformFeeRate: rate,
      platformFeePayer: z.enum(['agent_first', 'landlord', 'split']),
      agentShortfallSplit: z.object({ agent: rate, landlord: rate }),
      agencyFeeRate: rateRange,
      agreementFeeRate: rateRange,
      cautionDepositRate: rate,
      stampDutyInstrument: z.string(),
      vatAppliesToPlatformFee: z.boolean(),
      note: z.string().optional(),
    }),
    property_sale: z.object({
      platformCommissionRate: rate,
      platformFeePayer: z.enum(['selling_agent_or_developer', 'seller']),
      vatAppliesToPlatformFee: z.boolean(),
      note: z.string().optional(),
    }),
    estate_service_charge: z.object({
      convenienceFeeRate: rate,
      convenienceFeeCapKobo: kobo,
      payer: z.enum(['tenant', 'landlord']),
      vatAppliesToPlatformFee: z.boolean(),
      note: z.string().optional(),
    }),
    saas_subscription: z.object({
      platformFeeRate: rate,
      payer: z.literal('subscriber'),
      vatAppliesToPlatformFee: z.boolean(),
      note: z.string().optional(),
    }),
  }),
  entitlements: z.object({
    landlord: roleSchema,
    agent: roleSchema,
    tenant: roleSchema,
    estate_manager: roleSchema,
  }),
});

export type PlatformConfig = z.infer<typeof platformConfigSchema>;
export type RoleKey = keyof PlatformConfig['entitlements'];
export type Vertical = keyof PlatformConfig['transactionFees'];

export const DEFAULT_PLATFORM_CONFIG: PlatformConfig = platformConfigSchema.parse(defaults);

export function validatePlatformConfig(value: unknown): PlatformConfig {
  return platformConfigSchema.parse(value);
}
