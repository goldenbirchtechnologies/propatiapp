// Local dev auth bypass — server-side half. See auth-bypass-config.ts for the
// safety contract (never active in production).
//
// When AUTH_BYPASS=1 and there is no signed-in Clerk session, getCurrentUser()
// / getCurrentUserWithProfile() / withAuth() resolve to a dedicated dev user
// instead of null, so dashboards render without a login.
//
// Role selection precedence:
//   1. explicit override (from the request cookie, set by middleware)
//   2. `bypass_role` cookie (set via /any-url?as=<role>)
//   3. AUTH_BYPASS_ROLE env var
//   4. 'admin'
import { auth } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';
import { prisma } from './prisma';
import { UserRole } from '@prisma/client';
import {
  isAuthBypassEnabled,
  isValidBypassRole,
  type BypassRole,
} from './auth-bypass-config';

export { isAuthBypassEnabled };

const PROFILE_INCLUDE = {
  ownedOrganisations: true,
  orgMemberships: {
    where: { status: 'active' as const },
    include: { org: true },
  },
};

export async function resolveBypassRole(
  explicit?: string | null
): Promise<BypassRole> {
  // Accept both URL slugs (estate-manager) and enum values (estate_manager).
  const normalize = (v: unknown) =>
    typeof v === 'string' ? (v.replace(/-/g, '_') as BypassRole) : v;

  const normExplicit = normalize(explicit);
  if (isValidBypassRole(normExplicit)) return normExplicit;

  try {
    const jar = await cookies();
    const fromCookie = normalize(jar.get('bypass_role')?.value);
    if (isValidBypassRole(fromCookie)) return fromCookie;
  } catch {
    // cookies() unavailable in this context — fall through
  }

  const fromEnv = normalize(process.env.AUTH_BYPASS_ROLE);
  if (isValidBypassRole(fromEnv)) return fromEnv;

  return 'admin';
}

/**
 * Returns the dev bypass user for the selected role, or null when the bypass
 * is disabled. Idempotent: finds-or-creates one stable user per role.
 */
export async function getBypassUser(explicitRole?: string | null) {
  if (!isAuthBypassEnabled()) return null;

  try {
    const role = await resolveBypassRole(explicitRole);
    const clerkId = `bypass_${role}`;

    const find = () =>
      prisma.user.findUnique({
        where: { clerkId },
        include: PROFILE_INCLUDE,
      });

    let existing = await find();

    if (!existing) {
      try {
        existing = await prisma.user.create({
          data: {
            clerkId,
            email: `bypass+${role}@propati.local`,
            fullName: `Dev ${role.replace('_', ' ')}`,
            role: role as UserRole,
            isActive: true,
            isBanned: false,
          },
          include: PROFILE_INCLUDE,
        });
      } catch (createError: unknown) {
        // Concurrent request won the create race — re-read the row it made.
        const code = (createError as { code?: string })?.code;
        if (code !== 'P2002') throw createError;
        existing = await find();
        if (!existing) throw createError;
      }
    }

    if (existing.role === role && existing.isActive && !existing.isBanned) {
      return existing;
    }
    return prisma.user.update({
      where: { id: existing.id },
      data: { role: role as UserRole, isActive: true, isBanned: false },
      include: PROFILE_INCLUDE,
    });
  } catch (error) {
    console.error('[auth-bypass] failed to resolve dev user:', error);
    return null;
  }
}

/**
 * Drop-in replacement for `const { userId } = await auth()`.
 *
 * When the bypass is enabled it ALWAYS wins (even over a real Clerk session)
 * so that ?as=<role> switching is deterministic — set AUTH_BYPASS=0 to test
 * real logins. The returned id is the bypass user's `clerkId`, so downstream
 * `prisma.user.findUnique({ where: { clerkId: userId } })` lookups resolve to
 * the dev user with zero further changes.
 *
 * Never throws: Clerk failures degrade to null exactly like `auth()` would
 * after a failed lookup.
 */
export async function resolveAuthUserId(): Promise<string | null> {
  if (isAuthBypassEnabled()) {
    try {
      const bypassUser = await getBypassUser();
      if (bypassUser) return bypassUser.clerkId;
    } catch (error) {
      console.error('[auth-bypass] resolveAuthUserId failed:', error);
    }
    // Bypass on but DB unreachable → fall through to real auth below.
  }

  try {
    const { userId } = await auth();
    return userId;
  } catch {
    return null;
  }
}
