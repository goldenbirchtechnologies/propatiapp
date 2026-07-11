import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { REALTOR_NAVIGATION } from '@/lib/navigation';
import UnifiedMessagesClient from '@/components/messaging/UnifiedMessagesClient';

export default async function RealtorMessagesPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'realtor') redirect('/dashboard');

  return (
    <DashboardShell
      navigation={REALTOR_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <UnifiedMessagesClient userId={user.id} userName={user.fullName} userRole={user.role} />
    </DashboardShell>
  );
}
