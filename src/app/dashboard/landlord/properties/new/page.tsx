import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { getOnboardingSnapshot } from '@/lib/onboarding/status';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { ShieldAlert } from 'lucide-react';
import AddPropertyClient from './AddPropertyClient';

export const metadata = {
  title: 'Add Property – Landlord',
  description: 'Register a property asset and its space inventory',
};

export default async function AddPropertyPage() {
  // Auth check outside try/catch — redirect() throws NEXT_REDIRECT which must
  // not be swallowed by a catch block (see AGENTS.md critical rules).
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'landlord') {
    redirect('/dashboard');
  }

  // Draft registration is open to every landlord. Marketplace publication is
  // intentionally a separate workflow from asset registration.
  const snapshot = await getOnboardingSnapshot(user.id);
  const onboardingBlocked = Boolean(
    snapshot?.required && snapshot.status !== 'completed'
  );

  const shell = (children: React.ReactNode) => (
    <DashboardShell
      navigation={LANDLORD_NAVIGATION}
      userRole="landlord"
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      {children}
    </DashboardShell>
  );

  return shell(
    <ErrorBoundary>
      {onboardingBlocked ? (
        <div className="px-6 pt-6 sm:px-8">
          <div className="rounded-xl border border-amber-500/30 bg-amber-50 p-4 dark:bg-amber-500/10">
            <div className="mb-1 flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <ShieldAlert className="h-4 w-4" />
              <h2 className="text-sm font-semibold">Saved as a draft</h2>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              Your property and spaces are saved straight away, and stay off the
              marketplace until your onboarding dossier is complete.
              {snapshot?.currentStep ? ' The next step waiting on you is shown in the dossier.' : ''}
            </p>
            <Link
              href="/dashboard/landlord?onboarding=1"
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white"
            >
              Resume onboarding
            </Link>
          </div>
        </div>
      ) : null}
      <AddPropertyClient />
    </ErrorBoundary>
  );
}
