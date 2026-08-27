import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import Home from '@/components/ui/chat-template';
import { SidebarProvider } from '@/components/blocks/sidebar';

export default async function MessagesPage({ params }: { params: Promise<{ role: string }> }) {
  const user = await getCurrentUserWithProfile();
  if (!user) redirect('/sign-in');

  const { role } = await params;
  if (user.role !== role) redirect('/dashboard');

  return (
    <SidebarProvider>
      <Home />
    </SidebarProvider>
  );
}
