import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import MessagePage from "@/components/ui/message-page";
import { SidebarProvider } from '@/components/blocks/sidebar';

export default async function MessagesPage({ params }: { params: Promise<{ role: string }> }) {
  const user = await getCurrentUserWithProfile();
  if (!user) redirect('/sign-in');

  const { role } = await params;
  if (user.role !== role) redirect('/dashboard');

  return (
    <SidebarProvider>
      <MessagePage userId={user.id} userName={user.fullName} userRole={user.role} />
    </SidebarProvider>
  );
}
