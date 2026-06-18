import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import OnboardingClient from './OnboardingClient';

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const user = await getCurrentUserWithProfile();
  if (!user) redirect('/sign-in');

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
