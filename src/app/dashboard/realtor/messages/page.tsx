import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import UnifiedMessagesClient from '@/components/messaging/UnifiedMessagesClient';

export default async function RealtorMessagesPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'realtor') redirect('/dashboard');

  return (
    <UnifiedMessagesClient userId={user.id} userName={user.fullName} userRole={user.role} />
  );
}
