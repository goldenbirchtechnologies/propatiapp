import { describe, it, expect } from 'vitest';
import { calculateStampDuty } from '@/lib/stamp-duty';

describe('stamp-duty', () => {
  it('returns 0 for rent at threshold', () => {
    expect(calculateStampDuty(10_000)).toBe(0);
  });

  it('returns min ₦500', () => {
    expect(calculateStampDuty(11_000)).toBe(500);
  });

  it('rounds computed 0.78%', () => {
    expect(calculateStampDuty(100_000)).toBeCloseTo(780);
    expect(calculateStampDuty(500_000)).toBeCloseTo(3900);
  });
});
