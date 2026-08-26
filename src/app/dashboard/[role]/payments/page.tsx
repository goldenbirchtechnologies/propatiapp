import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import TransactionsListClient from './TransactionsListClient';

interface PageProps {
  params: Promise<{ role: string }>;
}

export default async function PaymentsPage({ params }: PageProps) {
  const user = await getCurrentUserWithProfile();
  if (!user) redirect('/dashboard');

  const { role } = await params;
  if (!user || user.role !== role) redirect('/dashboard');

  return <TransactionsListClient user={user} />;
}