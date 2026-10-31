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

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <div className="mx-auto w-full max-w-5xl px-6 py-10">
        <div className="mb-8 flex items-baseline gap-2">
          <span className="text-sm font-semibold tracking-tight text-white">Propati</span>
          <span className="text-xs text-zinc-500">Account setup</span>
        </div>
        <OnboardingWizard initialStatus={snapshot} />
      </div>
    </div>
  );
}
