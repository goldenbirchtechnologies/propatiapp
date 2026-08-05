import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import TransactionsListClient from './TransactionsListClient';

export default async function PaymentsPage({ params }: PageProps) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const user = await getCurrentUserWithProfile();
  if (!user) redirect('/dashboard');

  const { role } = await params;
  if (!user || user.role !== role) redirect('/dashboard');

  return <TransactionsListClient user={user} />;
}