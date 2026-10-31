import { prisma } from '@/lib/prisma';
import { isSupportedCountry } from '@/lib/countries';
import { findNigerianStateByCode, NIGERIAN_STATES } from './nigeria-states';
import { findPlatformCountry, type PlatformCountry } from './platform-countries';

export interface LocationInput {
  countryCode: string;
  jurisdictionId?: string | null;
  jurisdictionCode?: string | null;
  city: string;
  addressLine1?: string | null;
  addressLine2?: string | null;
}

export type LocationValidation =
  | {
      ok: true;
      countryCode: string;
      jurisdictionId: string | null;
      jurisdictionCode: string | null;
      jurisdictionName: string | null;
    }
  | { ok: false; errors: Record<string, string> };

interface ResolvedJurisdiction {
  id: string;
  name: string;
  code: string | null;
}

/** `jur_la` (the id the options fallback hands out) → the Lagos state record. */
function stateFromFallbackId(id: string | null | undefined) {
  if (!id) return undefined;
  const match = /^jur_([a-z]{2})$/i.exec(id.trim());
  return match ? findNigerianStateByCode(match[1].toUpperCase()) : undefined;
}

/**
 * Returns the jurisdiction row, creating it on demand for a Nigerian state.
 *
 * The `jurisdictions` table is only populated by `prisma/seed.ts`. On a fresh
 * environment it can legitimately be empty, and the options route hands out
 * `jur_xx` ids from the static list. Rather than rejecting those — which made
 * onboarding un-completable — the row is upserted here and the real id saved.
 */
async function resolveJurisdiction(
  countryCode: string,
  input: LocationInput
): Promise<ResolvedJurisdiction | null> {
  const where = input.jurisdictionId
    ? { id: input.jurisdictionId }
    : input.jurisdictionCode
      ? { code: input.jurisdictionCode.toUpperCase() }
      : null;
  if (!where) return null;

  const existing = await prisma.jurisdiction.findFirst({
    where: { ...where, countryId: countryCode, active: true },
    select: { id: true, name: true, code: true },
  });
  if (existing) return existing;

  if (countryCode !== 'NG') return null;

  const state =
    (input.jurisdictionCode ? findNigerianStateByCode(input.jurisdictionCode) : undefined) ??
    stateFromFallbackId(input.jurisdictionId);
  if (!state) return null;

  const id = `jur_${state.code.toLowerCase()}`;
  return prisma.jurisdiction.upsert({
    where: { id },
    update: {},
    create: {
      id,
      countryId: 'NG',
      name: state.name,
      level: 'state',
      code: state.code,
      active: true,
    },
    select: { id: true, name: true, code: true },
  });
}

/**
 * Validates a location, tolerating an unseeded countries table.
 *
 * The database stays authoritative once seeded: an inactive row there still
 * blocks the country. Only when the row is missing entirely does the static
 * platform list stand in, and it is re-persisted so later reads agree.
 */
export async function validateLocation(input: LocationInput): Promise<LocationValidation> {
  const errors: Record<string, string> = {};
  const code = input.countryCode?.trim().toUpperCase();

  if (!code || !isSupportedCountry(code)) {
    return { ok: false, errors: { countryCode: 'Select a valid country.' } };
  }

  let country: Pick<PlatformCountry, 'code' | 'name' | 'active'> | null = null;
  try {
    country = await prisma.country.findUnique({ where: { code } });
  } catch (error) {
    console.error('Location validation: country lookup failed', error);
  }

  if (!country) {
    const platform = findPlatformCountry(code);
    if (!platform) {
      return { ok: false, errors: { countryCode: 'This country is not configured yet.' } };
    }
    try {
      country = await prisma.country.upsert({
        where: { code },
        update: {},
        create: {
          code: platform.code,
          name: platform.name,
          currency: platform.currency,
          locale: platform.locale,
          timezone: platform.timezone,
          active: platform.active,
        },
      });
    } catch (error) {
      // The row could not be persisted; the static metadata is still enough to
      // validate the form, and the profile write below will surface a real error.
      console.error('Location validation: country upsert failed', error);
      country = platform;
    }
  }

  if (!country.active) {
    return { ok: false, errors: { countryCode: `${country.name} is not yet available on PropatiBox.` } };
  }

  if (!input.jurisdictionId && !input.jurisdictionCode) {
    return { ok: false, errors: { jurisdictionId: 'Select a state or region.' } };
  }

  let jurisdiction: ResolvedJurisdiction | null = null;
  try {
    jurisdiction = await resolveJurisdiction(code, input);
  } catch (error) {
    console.error('Location validation: jurisdiction lookup failed', error);
  }

  if (!jurisdiction) {
    return { ok: false, errors: { jurisdictionId: 'Select a valid state or region.' } };
  }

  const city = input.city?.trim() ?? '';
  if (city.length < 2) {
    errors.city = 'Enter a city.';
  } else if (city.length > 100) {
    errors.city = 'City name is too long.';
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    countryCode: code,
    jurisdictionId: jurisdiction.id,
    jurisdictionCode: jurisdiction.code,
    jurisdictionName: jurisdiction.name,
  };
}

/** Exposed for tests and the seed: the canonical Nigerian state list. */
export const NIGERIAN_JURISDICTIONS = NIGERIAN_STATES;
