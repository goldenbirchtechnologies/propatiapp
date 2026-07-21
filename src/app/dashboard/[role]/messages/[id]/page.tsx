import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import ChatInitializer from './ChatInitializer';

export default async function ChatPage({ params }: { params: Promise<{ role: string; id: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const user = await getCurrentUserWithProfile();
  const { role, id } = await params;
  if (!user || user.role !== role) redirect('/dashboard');

  return <ChatInitializer conversationId={id} />;
}