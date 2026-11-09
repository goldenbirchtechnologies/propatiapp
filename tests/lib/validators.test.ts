import { describe, it, expect } from 'vitest';
import type { ZodTypeAny } from 'zod';
import {
  listingFilterSchema,
  onboardingEmploymentSchema,
  onboardingEstateAuthoritySchema,
  onboardingEstateRemittanceSchema,
  onboardingLandlordSettlementSchema,
  onboardingRentalApplicationSchema,
} from '@/lib/validators';

/** Paths of the fields that failed, so one missing required field cannot mask the assertion. */
function issuePaths(schema: ZodTypeAny, value: unknown): string[] {
  const result = schema.safeParse(value);
  return result.success ? [] : result.error.issues.map((issue) => issue.path.join('.'));
}

const validSettlement = {
  accountName: 'Adaeze Okafor',
  bankName: 'GTBank',
  accountNumber: '0123456789',
  commissionConsent: true,
};

describe('onboardingLandlordSettlementSchema money fields', () => {
  it('accepts a payload without the optional amounts', () => {
    expect(onboardingLandlordSettlementSchema.safeParse(validSettlement).success).toBe(true);
  });

  it('accepts finite amounts, including large ones', () => {
    const result = onboardingLandlordSettlementSchema.safeParse({
      ...validSettlement,
      targetMonthlyRent: 1_500_000,
      targetAnnualRent: 18_000_000,
      securityDeposit: 4_500_000,
    });

    expect(result.success).toBe(true);
  });

  it('accepts numeric strings, which the client sends from text inputs', () => {
    const result = onboardingLandlordSettlementSchema.safeParse({
      ...validSettlement,
      targetMonthlyRent: '1500000',
    });

    expect(result.success).toBe(true);
  });

  // Regression: Infinity passed `.nonnegative()`, reached the route's
  // `BigInt(Math.round(...))` and threw RangeError, surfacing as a 500. These
  // values must be rejected as invalid input (400) instead.
  it.each(['targetMonthlyRent', 'targetAnnualRent', 'securityDeposit'])(
    'rejects Infinity for %s',
    (field) => {
      expect(issuePaths(onboardingLandlordSettlementSchema, { ...validSettlement, [field]: Infinity }))
        .toContain(field);
      expect(issuePaths(onboardingLandlordSettlementSchema, { ...validSettlement, [field]: 'Infinity' }))
        .toContain(field);
    }
  );

  it('still rejects negative and non-numeric amounts', () => {
    expect(issuePaths(onboardingLandlordSettlementSchema, { ...validSettlement, securityDeposit: -1 }))
      .toContain('securityDeposit');
    expect(issuePaths(onboardingLandlordSettlementSchema, { ...validSettlement, securityDeposit: 'abc' }))
      .toContain('securityDeposit');
  });
});

describe('other schemas that coerce money out of request input', () => {
  it.each([
    ['employment yearlyIncome', onboardingEmploymentSchema, 'yearlyIncome'],
    ['rental monthlyBudget', onboardingRentalApplicationSchema, 'monthlyBudget'],
    ['estate minIncomeThreshold', onboardingEstateAuthoritySchema, 'minIncomeThreshold'],
    ['estate managementFeeValue', onboardingEstateRemittanceSchema, 'managementFeeValue'],
    ['listing minPrice', listingFilterSchema, 'minPrice'],
    ['listing maxPrice', listingFilterSchema, 'maxPrice'],
  ])('rejects Infinity for %s', (_label, schema, field) => {
    expect(issuePaths(schema, { [field]: Infinity })).toContain(field);
  });

  it('still accepts a normal value on those fields', () => {
    expect(issuePaths(listingFilterSchema, { minPrice: 250_000, maxPrice: 900_000 })).toEqual([]);
    expect(
      issuePaths(onboardingEmploymentSchema, {
        employmentStatus: 'employed',
        yearlyIncome: 9_600_000,
      })
    ).toEqual([]);
  });

  // Infinity never reached these: `.int()` inspects Number.isInteger and `.max()`
  // compares against the bound, so neither change was needed here.
  it('documents that bounded numeric fields already rejected Infinity', () => {
    expect(issuePaths(listingFilterSchema, { minBedrooms: Infinity })).toContain('minBedrooms');
  });
});
