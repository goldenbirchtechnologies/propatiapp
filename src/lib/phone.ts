import { COUNTRIES } from '@/lib/countries';

/**
 * Normalises a user-entered phone number to E.164 (+2348012345678).
 * Nigerian local formats (0801..., 234801...) are the common case.
 */
export function normalizePhone(input: string, defaultCountryCode = 'NG'): string | null {
  const raw = input.trim();
  if (!raw) return null;

  let digits = raw.replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) digits = digits.slice(1);
  if (digits.startsWith('00')) digits = digits.slice(2);

  const defaultPrefix =
    COUNTRIES.find((c) => c.code === defaultCountryCode)?.phonePrefix.replace('+', '') ?? '234';

  // Local Nigerian format: starts with 0 and has 10 digits (0801...).
  if (digits.startsWith('0') && digits.length === 11) {
    digits = defaultPrefix + digits.slice(1);
  } else if (digits.length === 10) {
    digits = defaultPrefix + digits;
  }

  if (digits.length < 10 || digits.length > 15) return null;
  return `+${digits}`;
}

/**
 * Converts to the format Termii expects: 234XXXXXXXXXX, no plus sign.
 */
export function toSmsFormat(phone: string): string {
  return phone.replace(/^\+/, '');
}
