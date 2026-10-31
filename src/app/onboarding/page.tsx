import { redirect } from 'next/navigation';
import { getCurrentUser, getRoleRedirectPath } from '@/lib/auth';
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
export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in');

  const snapshot = await getOnboardingSnapshot(user.id);
  if (!snapshot) redirect('/sign-in');

  redirect(getRoleRedirectPath(user.role));
}
