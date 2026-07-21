import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile, syncClerkUser } from '@/lib/auth';
import OnboardingClient from './OnboardingClient';
import PublicOnboardingClient from './PublicOnboardingClient';

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) {
    return <PublicOnboardingClient />;
  }

  // Try to get user from database
  let user = await getCurrentUserWithProfile();

  // If user doesn't exist yet, sync from Clerk
  // This handles the case where the webhook hasn't fired yet
  if (!user) {
    const clerkUser = await currentUser();
    if (!clerkUser) redirect('/sign-in');

    // Sync user from Clerk to database
    user = (await syncClerkUser(clerkUser)) as unknown;
    if (!user) redirect('/sign-in');
  }

  if (user.profileCompleted) {
    const paths: Record<string, string> = {
      admin: '/admin',
      agent: '/dashboard/agent',
      estate_manager: '/dashboard/estate-manager',
      landlord: '/dashboard/landlord',
      tenant: '/dashboard/tenant',
      };
    redirect(paths[user.role] ?? '/dashboard/tenant');
  }

  return (
    <OnboardingClient
      userId={user.id}
      initialRole={user.role}
      initialName={user.fullName}
    />
  );
}
