import { redirect } from 'next/navigation';
import { getCurrentUser, getRoleRedirectPath } from '@/lib/auth';
import { getOnboardingSnapshot } from '@/lib/onboarding/status';
import OnboardingWizard from './OnboardingWizard';

export const dynamic = 'force-dynamic';

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in');

  const snapshot = await getOnboardingSnapshot(user.id);
  if (!snapshot) redirect('/sign-in');

  // Roles without an onboarding flow (admin, unknown) have nowhere to be here.
  if (snapshot.steps.length === 0) {
    redirect(getRoleRedirectPath(user.role));
  }

  // The wizard paints its own `.dossier-theme` canvas: `/onboarding` is the one
  // surface designed from the light "Sovereign Estate" references, not the
  // dark dashboard shell.
  return <OnboardingWizard initialStatus={snapshot} />;
}
