import { describe, it, expect } from 'vitest';
import { computeFees, formatCurrencyKobo, FEE_RATES } from '@/lib/fees';

describe('fees', () => {
  it('computes rent fees and agent share', () => {
    const res = computeFees('rent', 1_500_000_00, true);
    expect(res.platformFee).toBe(15_000_000);
    expect(res.agentCommission).toBe(1_500_000);
    expect(res.payeeAmount).toBe(133_500_000);
  });

  it('returns zero agent commission when no agent', () => {
    const res = computeFees('rent', 1_000_000_00, false);
    expect(res.agentCommission).toBe(0);
  });

  it('keeps subscription fees at zero', () => {
    const res = computeFees('subscription', 5_000_000, true);
    expect(res.platformFee).toBe(0);
    expect(res.agentCommission).toBe(0);
  });

  it('applies 2% platform fee for sale > 20M Naira', () => {
    const res = computeFees('sale', 3_000_000_000, false);
    expect(res.platformFee).toBe(60_000_000);
  });
});
