/** Shared rules for clear, consistent user-facing product copy. */
export const UI_TERMS = {
  property: 'property',
  properties: 'properties',
  listing: 'listing',
  listings: 'listings',
  agreement: 'rental agreement',
  agreements: 'rental agreements',
  unavailable: 'is not available yet',
} as const;

export const CONTENT_RULES = [
  'Use clear, familiar English in user-facing copy.',
  'Show backend data or an honest empty state instead of invented records.',
  'Use verification or compliance terms only when they describe a real check or legal requirement.',
  'Do not present sample names, addresses, counts, timestamps, certificates, or performance figures as live data.',
] as const;
