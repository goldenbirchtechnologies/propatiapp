import { prisma } from '@/lib/prisma';
import { isSupportedCountry } from '@/lib/countries';
import { findNigerianStateByCode } from './nigeria-states';

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

/**
 * Validates a location against the countries/jurisdictions tables.
 *
 * The database is authoritative, but it may legitimately be empty on a fresh
 * environment — `prisma/seed.ts` does not seed countries or jurisdictions.
 * Rather than making onboarding un-completable in that case, fall back to the
 * static Nigerian state list when the country is NG.
 */
export async function validateLocation(input: LocationInput): Promise<LocationValidation> {
  const errors: Record<string, string> = {};
  const code = input.countryCode?.trim().toUpperCase();

  if (!code || !isSupportedCountry(code)) {
    return { ok: false, errors: { countryCode: 'Select a valid country.' } };
  }

  const country = await prisma.country.findUnique({ where: { code } });
  if (!country) {
    return { ok: false, errors: { countryCode: 'This country is not configured yet.' } };
  }
  if (!country.active) {
    return { ok: false, errors: { countryCode: `${country.name} is not yet available on PropatiBox.` } };
  }

  let jurisdictionId: string | null = null;
  let jurisdictionCode: string | null = null;
  let jurisdictionName: string | null = null;

  if (input.jurisdictionId) {
    const jurisdiction = await prisma.jurisdiction.findFirst({
      where: { id: input.jurisdictionId, countryId: code, active: true },
      select: { id: true, name: true, code: true },
    });
    if (!jurisdiction) {
      return { ok: false, errors: { jurisdictionId: 'Select a valid state or region.' } };
    }
    jurisdictionId = jurisdiction.id;
    jurisdictionCode = jurisdiction.code;
    jurisdictionName = jurisdiction.name;
  } else if (input.jurisdictionCode) {
    const fallback = code === 'NG' ? findNigerianStateByCode(input.jurisdictionCode) : undefined;
    if (!fallback) {
      return { ok: false, errors: { jurisdictionId: 'Select a valid state or region.' } };
    }
    const jurisdiction = await prisma.jurisdiction.findFirst({
      where: { countryId: code, code: fallback.code, active: true },
      select: { id: true, name: true, code: true },
    });
    jurisdictionId = jurisdiction?.id ?? null;
    jurisdictionCode = jurisdiction?.code ?? fallback.code;
    jurisdictionName = jurisdiction?.name ?? fallback.name;
  } else {
    return { ok: false, errors: { jurisdictionId: 'Select a state or region.' } };
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

  return { ok: true, countryCode: code, jurisdictionId, jurisdictionCode, jurisdictionName };
}
