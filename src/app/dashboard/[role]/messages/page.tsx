import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import UnifiedMessagesClient from '@/components/messaging/UnifiedMessagesClient';

export default async function MessagesPage({ params }: { params: Promise<{ role: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const user = await getCurrentUserWithProfile();
  const { role } = await params;
  if (!user || user.role !== role) redirect('/dashboard');

  return <UnifiedMessagesClient userId={user.id} userName={user.fullName} userRole={user.role} />;
}