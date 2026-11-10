import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { getOnboardingSnapshot } from '@/lib/onboarding/status';
import { prisma } from '@/lib/prisma';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { ShieldAlert } from 'lucide-react';
import AddPropertyClient from './AddPropertyClient';

export const metadata = {
  title: 'Add Property – Landlord',
  description: 'Create a new building and its units',
};

export default async function AddPropertyPage() {
  // Auth check outside try/catch — redirect() throws NEXT_REDIRECT which must
  // not be swallowed by a catch block (see AGENTS.md critical rules).
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'landlord') {
    redirect('/dashboard');
  }

  // Drafts are open to every landlord: POST /api/listings gates only publishing
  // (status: 'active') on a completed dossier, so the building and its units can
  // be registered now and go live once onboarding is done. This page therefore
  // shows what is still locked above the form rather than standing in for it.
  const snapshot = await getOnboardingSnapshot(user.id);
  const onboardingBlocked = Boolean(
    snapshot?.required && snapshot.status !== 'completed'
  );

  // Units are created inside an organisation, and each organisation has a unit
  // cap. Handing the client the first owned org blindly meant every unit write
  // failed with "Unit limit reached" on an already-full portfolio, leaving the
  // property saved with no units. Pick one with room; null lets the client
  // provision a fresh organisation.
  const organisations = await prisma.organisation.findMany({
    where: { members: { some: { userId: user.id, status: 'active' } } },
    select: { id: true, maxUnits: true, _count: { select: { units: true } } },
    orderBy: { createdAt: 'asc' },
  });

  // maxUnits <= 0 means unlimited on this schema.
  const orgId =
    organisations.find((org) => org.maxUnits <= 0 || org._count.units < org.maxUnits)
      ?.id ?? null;

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
              Your building and units are saved straight away, and stay off the
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
      <AddPropertyClient orgId={orgId} />
    </ErrorBoundary>
  );
}
