import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile, getRoleRedirectPath } from '@/lib/auth';
import type { UserRole } from '@prisma/client';

// URL slug -> UserRole enum. The dashboard URL for estate_manager is
// hyphenated, so slugs are not interchangeable with enum values.
const SLUG_TO_ROLE: Record<string, UserRole> = {
  landlord: 'landlord',
  tenant: 'tenant',
  agent: 'agent',
  admin: 'admin',
  'estate-manager': 'estate_manager',
};

export default async function RoleDashboardPage({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const user = await getCurrentUserWithProfile();
  if (!user) {
    redirect('/sign-in');
  }

  const { role } = await params;
  const requestedRole = SLUG_TO_ROLE[role.toLowerCase()];

  // Resolve targets through getRoleRedirectPath so there is ONE source of truth
  // for role -> path. An unknown slug, or a slug for a role the caller does not
  // hold, falls back to the caller's own dashboard.
  const target =
    requestedRole && requestedRole === user.role
      ? getRoleRedirectPath(requestedRole)
      : getRoleRedirectPath(user.role);

  redirect(target);
}
