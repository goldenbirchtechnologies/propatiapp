import type { StampDutyInstrument } from '@prisma/client';
import {
  DEFAULT_PLATFORM_CONFIG,
  type PlatformConfig,
  type Vertical,
} from '@/lib/platform-config';
import { assessStampDuty } from '@/lib/stamp-duty-rules';

export type GatewayCardType = 'local' | 'international';
export type AllocationRole =
  | 'landlord'
  | 'agent'
  | 'estate_manager'
  | 'escrow'
  | 'legal'
  | 'tax_authority'
  | 'platform';

export interface SubaccountCodes {
  landlord?: string;
  agent?: string;
  estateManager?: string;
  escrow?: string;
  legal?: string;
  taxAuthority?: string;
}

export interface TransactionInput {
  vertical: Vertical;
  /** Base consideration in kobo, excluding caution, statutory fees and gateway fees. */
  amountKobo: number;
  cardType?: GatewayCardType;
  cautionDepositKobo?: number;
  /** Rent renewals carry no fresh agency/legal/stamp duty charges. */
  isRenewal?: boolean;
  leaseTermMonths?: number;
  /** Decimal rates. Rent agency fee is capped at 10%; legal fee is 5–10%. */
  agencyFeeRate?: number;
  agreementFeeRate?: number;
  agentInvolved?: boolean;
  /** Sale commission carved out of the sale proceeds, in kobo. */
  agentCommissionKobo?: number;
  /** Overrides the configured initial-rent payer. */
  platformFeePayer?: 'agent' | 'landlord' | 'split';
  subaccounts?: SubaccountCodes;
}

export interface FeeAllocation {
  role: AllocationRole;
  share: number;
  subaccountCode?: string;
}

export interface TransactionBreakdown {
  vertical: Vertical;
  unit: 'kobo';
  baseAmountKobo: number;
  cautionDepositKobo: number;
  agencyFeeKobo: number;
  agreementFeeKobo: number;
  stampDutyKobo: number;
  convenienceFeeKobo: number;
  platformFeeKobo: number;
  /** All requested outputs below are integer kobo. */
  grossChargedToTenant: number;
  gatewayFee: number;
  platformNetRevenue: number;
  vatOnPlatformFee: number;
  landlordNetPayout: number;
  agentNetPayout: number;
  estateManagerNetPayout: number;
  escrowHoldAmount: number;
  allocations: FeeAllocation[];
  paystack: {
    splits: Array<{ subaccount: string; share: number; charge: 'fees' }>;
    totalShareKobo: number;
  };
  flutterwave: {
    subaccounts: Array<{ id: string; transaction_charge: number; bearer: 'subaccount' }>;
  };
}

const round = (value: number) => Math.round(value);
const nonNegative = (value: number | undefined) =>
  Number.isFinite(value) ? Math.max(0, round(value as number)) : 0;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function gatewayFeeFor(totalKobo: number, cardType: GatewayCardType, config: PlatformConfig): number {
  const rule = config.gatewayFees[cardType];
  const fee = round(totalKobo * rule.rate) + rule.flatKobo;
  return rule.capKobo === null ? fee : Math.min(fee, rule.capKobo);
}

/**
 * Computes who pays what and who receives what for a single in-app collection.
 * All monetary inputs and outputs are integer kobo so they can be sent straight
 * to Paystack/Flutterwave without a floating-point conversion at the boundary.
 */
export function calculateTransactionBreakdown(
  transaction: TransactionInput,
  config: PlatformConfig = DEFAULT_PLATFORM_CONFIG
): TransactionBreakdown {
  const feeRules = config.transactionFees[transaction.vertical];
  if (!feeRules) throw new Error(`Unsupported transaction vertical: ${transaction.vertical}`);

  const base = nonNegative(transaction.amountKobo);
  const caution = nonNegative(transaction.cautionDepositKobo);
  const cardType = transaction.cardType ?? 'local';
  const isRenewal = Boolean(transaction.isRenewal);

  let agencyFee = 0;
  let agreementFee = 0;
  let stampDuty = 0;
  let convenienceFee = 0;
  let platformFee = 0;
  let landlordNet = 0;
  let agentNet = 0;
  let estateManagerNet = 0;
  let escrowHold = 0;
  let saleCommission = 0;
  let rentAgentFeeCover = 0;

  switch (transaction.vertical) {
    case 'shortlet': {
      const rules = config.transactionFees.shortlet;
      platformFee = round(base * rules.platformCommissionRate);
      landlordNet = base - platformFee;
      escrowHold = caution;
      break;
    }

    case 'long_term_rent': {
      const rent = config.transactionFees.long_term_rent;
      const agencyRate = clamp(
        transaction.agencyFeeRate ?? rent.agencyFeeRate.default,
        rent.agencyFeeRate.min,
        rent.agencyFeeRate.max
      );
      const legalRate = clamp(
        transaction.agreementFeeRate ?? rent.agreementFeeRate.default,
        rent.agreementFeeRate.min,
        rent.agreementFeeRate.max
      );
      const hasFreshLease = !isRenewal;

      if (hasFreshLease) {
        if (transaction.agentInvolved !== false) agencyFee = round(base * agencyRate);
        agreementFee = round(base * legalRate);
        stampDuty = round(
          assessStampDuty({
            instrument: rent.stampDutyInstrument as StampDutyInstrument,
            annualRent: base / 100,
            leaseTermMonths: transaction.leaseTermMonths ?? 12,
          }).amount * 100
        );
      }

      const rate = isRenewal ? rent.renewalPlatformFeeRate : rent.initialPlatformFeeRate;
      platformFee = round(base * rate);

      const payer = isRenewal ? 'landlord' : (transaction.platformFeePayer ?? rent.platformFeePayer);

      if (payer === 'split' && transaction.agentInvolved !== false) {
        rentAgentFeeCover = Math.min(agencyFee, round(platformFee * rent.agentShortfallSplit.agent));
      } else if (payer === 'agent_first' && transaction.agentInvolved !== false && !isRenewal) {
        rentAgentFeeCover = Math.min(agencyFee, platformFee);
      }

      agentNet = agencyFee - rentAgentFeeCover;
      landlordNet = base - (platformFee - rentAgentFeeCover);
      break;
    }

    case 'property_sale': {
      const rules = config.transactionFees.property_sale;
      platformFee = round(base * rules.platformCommissionRate);
      saleCommission = Math.min(nonNegative(transaction.agentCommissionKobo), base);
      agentNet = saleCommission;
      landlordNet = base - saleCommission;
      break;
    }

    case 'estate_service_charge': {
      const rules = config.transactionFees.estate_service_charge;
      convenienceFee = Math.min(
        round(base * rules.convenienceFeeRate),
        rules.convenienceFeeCapKobo
      );
      platformFee = convenienceFee;
      estateManagerNet = base;
      break;
    }

    case 'saas_subscription': {
      const rules = config.transactionFees.saas_subscription;
      platformFee = round(base * rules.platformFeeRate);
      break;
    }
  }

  const vat = feeRules.vatAppliesToPlatformFee ? round(platformFee * config.vat.rate) : 0;

  if (transaction.vertical === 'shortlet') {
    landlordNet -= vat;
  } else if (transaction.vertical === 'property_sale') {
    const shortfall = Math.max(0, platformFee + vat - saleCommission);
    agentNet = Math.max(0, saleCommission - platformFee - vat);
    landlordNet = base - saleCommission - shortfall;
  }

  // VAT follows the party who bears the platform fee on initial rent; every
  // other vertical adds it to the tenant/consumer checkout total.
  if (transaction.vertical === 'long_term_rent') {
    if (isRenewal) {
      landlordNet -= vat;
    } else {
      const agentVat = platformFee > 0 ? round(vat * (rentAgentFeeCover / platformFee)) : 0;
      agentNet = Math.max(0, agentNet - agentVat);
      landlordNet -= vat - agentVat;
    }
  }

  // Only consumer-borne VAT (service charges, subscriptions) is added at
  // checkout. Host/agent/landlord-borne VAT is already inside their shares.
  const vatInCheckout =
    transaction.vertical === 'estate_service_charge' || transaction.vertical === 'saas_subscription'
      ? vat
      : 0;
  const subtotal = base + caution + agencyFee + agreementFee + stampDuty + convenienceFee + vatInCheckout;
  const gatewayFee = gatewayFeeFor(subtotal, cardType, config);
  const grossChargedToTenant = subtotal + gatewayFee;
  const splitTotal = grossChargedToTenant - gatewayFee;

  const codes = transaction.subaccounts ?? {};
  const allocations: FeeAllocation[] = [];
  const add = (role: AllocationRole, share: number, subaccountCode?: string) => {
    if (share > 0) allocations.push({ role, share, subaccountCode });
  };

  add('escrow', escrowHold, codes.escrow);
  add('landlord', landlordNet, codes.landlord);
  add('agent', agentNet, codes.agent);
  add('estate_manager', estateManagerNet, codes.estateManager);
  add('legal', agreementFee, codes.legal);
  add('tax_authority', stampDuty, codes.taxAuthority);

  const allocated = allocations.reduce((sum, item) => sum + item.share, 0);
  add('platform', splitTotal - allocated);

  return {
    vertical: transaction.vertical,
    unit: 'kobo',
    baseAmountKobo: base,
    cautionDepositKobo: caution,
    agencyFeeKobo: agencyFee,
    agreementFeeKobo: agreementFee,
    stampDutyKobo: stampDuty,
    convenienceFeeKobo: convenienceFee,
    platformFeeKobo: platformFee,
    grossChargedToTenant,
    gatewayFee,
    platformNetRevenue: platformFee,
    vatOnPlatformFee: vat,
    landlordNetPayout: landlordNet,
    agentNetPayout: agentNet,
    estateManagerNetPayout: estateManagerNet,
    escrowHoldAmount: escrowHold,
    allocations,
    paystack: {
      splits: allocations
        .filter((item): item is FeeAllocation & { subaccountCode: string } => Boolean(item.subaccountCode))
        .map((item) => ({ subaccount: item.subaccountCode, share: item.share, charge: 'fees' as const })),
      totalShareKobo: splitTotal,
    },
    flutterwave: {
      subaccounts: allocations
        .filter((item): item is FeeAllocation & { subaccountCode: string } => Boolean(item.subaccountCode))
        .map((item) => ({
          id: item.subaccountCode,
          transaction_charge: Math.round(item.share) / 100,
          bearer: 'subaccount' as const,
        })),
    },
  };
}
