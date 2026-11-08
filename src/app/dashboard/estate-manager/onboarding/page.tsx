import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile, getRoleRedirectPath } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * Onboarding has exactly one presentation: the dossier overlay that
 * `DashboardShell` mounts on every role dashboard. This route survives as an
 * entry point (old links, bookmarks) and forwards into that overlay with
 * `?onboarding=1` rather than rendering a second, page-shaped onboarding.
 */
export default async function EstateManagerOnboardingRoute() {
  const user = await getCurrentUserWithProfile();
  if (!user) redirect('/sign-in');
  redirect(`${getRoleRedirectPath(user.role)}?onboarding=1`);
}
