/**
 * Countries PropatiBox knows how to operate in, independent of the database.
 *
 * The `countries` / `jurisdictions` tables are the runtime source of truth, but
 * they are only populated by `prisma/seed.ts`. On a fresh environment they are
 * empty, which used to leave the onboarding country picker blank and made
 * location validation reject every country. This module is the single static
 * source of truth: the seed imports it, the options route falls back to it,
 * and location validation uses it when the row is missing.
 */
export interface PlatformCountry {
  code: string;
  name: string;
  currency: string;
  locale: string;
  timezone: string;
  /** Whether onboarding may actually select this country. */
  active: boolean;
}

export const PLATFORM_COUNTRIES: PlatformCountry[] = [
  {
    code: 'NG',
    name: 'Nigeria',
    currency: 'NGN',
    locale: 'en-NG',
    timezone: 'Africa/Lagos',
    active: true,
  },
  {
    code: 'BJ',
    name: 'Benin',
    currency: 'XOF',
    locale: 'fr-BJ',
    timezone: 'Africa/Porto-Novo',
    active: false,
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    currency: 'GBP',
    locale: 'en-GB',
    timezone: 'Europe/London',
    active: false,
  },
  {
    code: 'GH',
    name: 'Ghana',
    currency: 'GHS',
    locale: 'en-GH',
    timezone: 'Africa/Accra',
    active: false,
  },
  {
    code: 'IT',
    name: 'Italy',
    currency: 'EUR',
    locale: 'it-IT',
    timezone: 'Europe/Rome',
    active: false,
  },
];

export function findPlatformCountry(code: string | null | undefined): PlatformCountry | undefined {
  if (!code) return undefined;
  const normalized = code.trim().toUpperCase();
  return PLATFORM_COUNTRIES.find((c) => c.code === normalized);
}
