import { redirect } from 'next/navigation';
import { getCurrentUser, getRoleRedirectPath } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import { getOnboardingSnapshot } from '@/lib/onboarding/status';

export const dynamic = 'force-dynamic';

/**
 * `/onboarding` is no longer a page of its own.
 *
 * The dossier is now a blurred overlay on the role dashboard, so every entry
 * point that still points here (Clerk's post-sign-up redirect, old bookmarks)
 * lands the user on their dashboard where `OnboardingOverlay` picks up the
 * incomplete snapshot and opens the wizard.
 */
export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: { role?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in');

  // The signup screen carries the user's selected, non-privileged role through
  // the redirect URL. It is validated here on the server; Clerk metadata is
  // never trusted for authorization.
  const allowedRoles: UserRole[] = ['landlord', 'tenant', 'agent', 'estate_manager'];
  const requestedRole = searchParams.role as UserRole | undefined;
  if (
    requestedRole &&
    allowedRoles.includes(requestedRole) &&
    user.onboardingStatus === 'not_started' &&
    user.role === 'tenant'
  ) {
    await prisma.user.update({ where: { id: user.id }, data: { role: requestedRole } });
    user.role = requestedRole;
  }

  const snapshot = await getOnboardingSnapshot(user.id);
  if (!snapshot) redirect('/sign-in');

  redirect(getRoleRedirectPath(user.role));
}
