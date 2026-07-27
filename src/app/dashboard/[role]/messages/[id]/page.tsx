import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import ChatInitializer from './ChatInitializer';

export default async function ChatPage({ params }: { params: Promise<{ role: string; id: string }> }) {
  const user = await getCurrentUserWithProfile();
  if (!user) redirect('/sign-in');

  const { role, id } = await params;
  if (user.role !== role) redirect('/dashboard');

  return <ChatInitializer conversationId={id} />;
}