import { DEFAULT_PLATFORM_CONFIG, type PlatformConfig } from '@/lib/platform-config';
import {
  calculateTransactionBreakdown,
  type TransactionBreakdown,
} from '@/lib/transaction-fees';

export interface ListingFeeBreakdown {
  monthlyRent: number;
  /** Actual base the fees were assessed on (a nightly rate for shortlets). */
  baseAmount: number;
  annualRent: number;
  agreementFee: number;
  agencyFee: number;
  stampDuty: number;
  totalInitialPayable: number;
  vertical: 'shortlet' | 'long_term_rent' | 'property_sale';
  agencyFeeRate: number;
  agreementFeeRate: number;
  platformFee: number;
  vatOnPlatformFee: number;
  hostNetPayout: number;
  agentNetPayout: number;
  transaction: TransactionBreakdown;
}

function toNaira(kobo: number): number {
  return Math.round(kobo) / 100;
}

export function calculateListingFees(params: {
  monthlyRent: number;
  pricePeriod?: string;
  leaseTermMonths?: number;
  listingType?: string;
  agencyFeeRate?: number;
  agreementFeeRate?: number;
  config?: PlatformConfig;
}): ListingFeeBreakdown {
  const monthlyRent = Math.max(0, params.monthlyRent ?? 0);
  const pricePeriod = params.pricePeriod ?? 'month';
  const leaseTermMonths = params.leaseTermMonths ?? 12;
  const config = params.config ?? DEFAULT_PLATFORM_CONFIG;

  let annualRent: number;
  switch (pricePeriod) {
    case 'year':
    case 'total':
      annualRent = monthlyRent;
      break;
    case 'night':
      annualRent = monthlyRent * 30 * 12;
      break;
    case 'month':
    default:
      annualRent = monthlyRent * 12;
      break;
  }

  const vertical: ListingFeeBreakdown['vertical'] =
    params.listingType === 'short_let'
      ? 'shortlet'
      : params.listingType === 'sale'
        ? 'property_sale'
        : 'long_term_rent';

  const rentRules = config.transactionFees.long_term_rent;
  const agencyFeeRate = Math.min(
    rentRules.agencyFeeRate.max,
    Math.max(rentRules.agencyFeeRate.min, params.agencyFeeRate ?? rentRules.agencyFeeRate.default)
  );
  const agreementFeeRate = Math.min(
    rentRules.agreementFeeRate.max,
    Math.max(rentRules.agreementFeeRate.min, params.agreementFeeRate ?? rentRules.agreementFeeRate.default)
  );

  // A shortlet nightly rate and a one-off sale price are not annual rents;
  // assessing them as 12× (or 360×) would inflate every fee.
  const baseAmount =
    vertical === 'shortlet' || pricePeriod === 'total' ? monthlyRent : annualRent;

  const transaction = calculateTransactionBreakdown(
    {
      vertical,
      amountKobo: Math.round(baseAmount * 100),
      leaseTermMonths,
      agencyFeeRate,
      agreementFeeRate,
      agentInvolved: true,
    },
    config
  );

  const agreementFee = toNaira(transaction.agreementFeeKobo);
  const agencyFee = toNaira(transaction.agencyFeeKobo);
  const stampDuty = toNaira(transaction.stampDutyKobo);
  const platformFee = toNaira(transaction.platformFeeKobo);
  const vatOnPlatformFee = toNaira(transaction.vatOnPlatformFee);

  // Shortlets and sales never add agency/legal/stamp charges to what the guest
  // or buyer pays; the platform fee is deducted from the seller/host side.
  const totalInitialPayable =
    vertical === 'long_term_rent'
      ? Math.round((annualRent + agreementFee + agencyFee + stampDuty) * 100) / 100
      : baseAmount;

  return {
    monthlyRent,
    baseAmount,
    annualRent: Math.round(annualRent * 100) / 100,
    agreementFee,
    agencyFee,
    stampDuty,
    totalInitialPayable,
    vertical,
    agencyFeeRate,
    agreementFeeRate,
    platformFee,
    vatOnPlatformFee,
    hostNetPayout: toNaira(transaction.landlordNetPayout),
    agentNetPayout: toNaira(transaction.agentNetPayout),
    transaction,
  };
}
