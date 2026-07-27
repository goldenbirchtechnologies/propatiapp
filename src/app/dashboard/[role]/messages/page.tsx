import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import UnifiedMessagesClient from '@/components/messaging/UnifiedMessagesClient';

export default async function MessagesPage({ params }: { params: Promise<{ role: string }> }) {
  const user = await getCurrentUserWithProfile();
  if (!user) redirect('/sign-in');

  const { role } = await params;
  if (user.role !== role) redirect('/dashboard');

  return <UnifiedMessagesClient userId={user.id} userName={user.fullName} userRole={user.role} />;
}