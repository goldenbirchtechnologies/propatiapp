import type { StampDutyBasis, StampDutyInstrument } from '@prisma/client';

// ===========================================================================
// STAMP DUTY ASSESSMENT RULES
// ===========================================================================
//
// Deliberately dependency-free — this module is imported by client components
// (app/(public)/compare) as well as by the server-side remittance flow in
// stamp-duty.ts. stamp-duty.ts cannot be imported from the browser: it pulls
// in axios, node:crypto and cloudinary, and cloudinary's `fs` import breaks
// the client bundle outright. Keeping the statutory arithmetic here lets both
// sides share one implementation instead of re-deriving the rate inline.
//
// Nigerian Stamp Duties Act, CAP S8, LFN 2004. The duty on a tenancy or lease
// is ad valorem on the rent, with no duty below the threshold and a floor on
// the payable amount.
//
// Which base applies differs by instrument:
//   • an individual residential tenancy is assessed on ONE YEAR's rent
//   • a corporate/commercial lease is assessed on the rent payable across the
//     whole term, which is materially higher for multi-year leases
//
// Rates and thresholds are configurable per instrument so counsel can adjust
// them without a code change. The defaults below are the commonly applied
// figures — confirm the applicable band for your jurisdiction before going live.
//
// NOTE: envRule() reads process.env, which Next.js only populates on the
// server. In a browser bundle these come through undefined, so a client render
// always uses the statutory defaults. Any figure shown in the UI is therefore
// the default-rate estimate, not a configured override.

export interface StampDutyRule {
  /** Ad valorem rate applied to the taxable amount. */
  rate: number;
  /** What the rate is applied to. */
  basis: StampDutyBasis;
  /** Amounts at or below this are not stampable. */
  threshold: number;
  /** Floor for any payable duty. */
  minimum: number;
}

const DEFAULT_RULES: Record<StampDutyInstrument, StampDutyRule> = {
  residential_tenancy: { rate: 0.0078, basis: 'annual_rent', threshold: 10_000, minimum: 500 },
  commercial_lease: { rate: 0.0078, basis: 'total_term_consideration', threshold: 10_000, minimum: 500 },
  short_let: { rate: 0.0078, basis: 'total_term_consideration', threshold: 10_000, minimum: 500 },
  sale_conveyance: { rate: 0.015, basis: 'total_term_consideration', threshold: 10_000, minimum: 500 },
};

/** Read an env override for a rule field, e.g. STAMP_DUTY_RATE_COMMERCIAL_LEASE. */
function envRule(instrument: StampDutyInstrument): Partial<StampDutyRule> {
  const key = instrument.toUpperCase();
  const rate = process.env[`STAMP_DUTY_RATE_${key}`];
  const threshold = process.env[`STAMP_DUTY_THRESHOLD_${key}`];
  const minimum = process.env[`STAMP_DUTY_MINIMUM_${key}`];
  const basis = process.env[`STAMP_DUTY_BASIS_${key}`];
  return {
    ...(rate && Number.isFinite(Number(rate)) ? { rate: Number(rate) } : {}),
    ...(threshold && Number.isFinite(Number(threshold)) ? { threshold: Number(threshold) } : {}),
    ...(minimum && Number.isFinite(Number(minimum)) ? { minimum: Number(minimum) } : {}),
    ...(basis === 'annual_rent' || basis === 'total_term_consideration'
      ? { basis: basis as StampDutyBasis }
      : {}),
  };
}

export function getStampDutyRule(instrument: StampDutyInstrument): StampDutyRule {
  return { ...DEFAULT_RULES[instrument], ...envRule(instrument) };
}

export interface StampDutyAssessment {
  instrument: StampDutyInstrument;
  basis: StampDutyBasis;
  rate: number;
  /** The base the rate is applied to. */
  taxableAmount: number;
  /** Duty payable, after threshold and floor. Zero means nothing to remit. */
  amount: number;
  leaseTermMonths: number;
  annualRent: number;
}

/**
 * Assess the duty payable on an agreement.
 *
 * `annualRent` is the yearly rent. When the rule's basis is
 * `total_term_consideration` the taxable amount is annualRent × term in years.
 */
export function assessStampDuty(params: {
  instrument: StampDutyInstrument;
  annualRent: number;
  leaseTermMonths: number;
}): StampDutyAssessment {
  const rule = getStampDutyRule(params.instrument);
  const annualRent = Math.max(0, params.annualRent);

  const taxableAmount =
    rule.basis === 'annual_rent'
      ? annualRent
      : Math.round(annualRent * (params.leaseTermMonths / 12));

  if (taxableAmount <= rule.threshold) {
    return {
      instrument: params.instrument,
      basis: rule.basis,
      rate: rule.rate,
      taxableAmount,
      amount: 0,
      leaseTermMonths: params.leaseTermMonths,
      annualRent,
    };
  }

  const computed = taxableAmount * rule.rate;
  return {
    instrument: params.instrument,
    basis: rule.basis,
    rate: rule.rate,
    taxableAmount,
    amount: Math.round(Math.max(computed, rule.minimum) * 100) / 100,
    leaseTermMonths: params.leaseTermMonths,
    annualRent,
  };
}

/** Backwards-compatible helper: residential annual-rent assessment. */
export function calculateStampDuty(annualRent: number): number {
  return assessStampDuty({
    instrument: 'residential_tenancy',
    annualRent,
    leaseTermMonths: 12,
  }).amount;
}
