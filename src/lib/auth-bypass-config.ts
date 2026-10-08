// Edge-safe auth-bypass configuration. NO prisma / next/headers imports here —
// this module is imported by src/middleware.ts (edge runtime).
//
// Safety: the bypass is a LOCAL DEV ONLY switch. It is hard-disabled whenever
// NODE_ENV === 'production', so it can never activate on Vercel even if
// AUTH_BYPASS were mistakenly set in production env vars.

export const BYPASS_VALID_ROLES = [
  'landlord',
  'tenant',
  'agent',
  'admin',
  'estate_manager',
] as const;

export type BypassRole = (typeof BYPASS_VALID_ROLES)[number];

export function isAuthBypassEnabled(): boolean {
  if (process.env.NODE_ENV === 'production') return false;
  const flag = process.env.AUTH_BYPASS;
  return flag === '1' || flag === 'true';
}

export function isValidBypassRole(value: unknown): value is BypassRole {
  return (
    typeof value === 'string' &&
    (BYPASS_VALID_ROLES as readonly string[]).includes(value)
  );
}
