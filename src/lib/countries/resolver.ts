import type { CountryModule } from './registry';
import { getCountryModule } from './registry';
import { isSupportedCountry, getCountryByCode, type CountryCode } from '../countries';

export function resolveCountryModule(countryCode: string | undefined | null): CountryModule | null {
  if (!countryCode) return null;
  const code = countryCode.toUpperCase();
  if (!isSupportedCountry(code)) return null;
  return getCountryModule(code);
}

export function resolveCountryCode(countryCode: string | undefined | null): CountryCode | null {
  if (!countryCode) return null;
  const code = countryCode.toUpperCase();
  if (!isSupportedCountry(code)) return null;
  const country = getCountryByCode(code);
  return country ? code : null;
}
