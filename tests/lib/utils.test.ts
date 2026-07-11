import { describe, it, expect } from 'vitest';
import { formatCurrency, slugify, truncate, getInitials, parseKoboToNaira, parseNairaToKobo } from '@/lib/utils';

describe('utils', () => {
  it('formats currency from kobo', () => {
    expect(formatCurrency(250_000)).toBe('₦2,500');
  });

  it('parses kobo to naira and back', () => {
    expect(parseKoboToNaira(200_000)).toBe(2000);
    expect(parseNairaToKobo(2000)).toBe(200_000);
  });

  it('slugifies titles', () => {
    expect(slugify('Luxury Apartment Lagos')).toBe('luxury-apartment-lagos');
  });

  it('getInitials', () => {
    expect(getInitials('John Doe')).toBe('JD');
  });

  it('truncates long text', () => {
    expect(truncate('ABCDEFGHIJKLMNO', 5)).toBe('ABCDE...');
  });
});
