import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import TransactionDetailClient from './TransactionDetailClient';

export default async function TransactionDetailPage({ params }: PageProps) {
  const user = await getCurrentUserWithProfile();
  if (!user) redirect('/dashboard');

  const { id } = await params;

  return <TransactionDetailClient transactionId={id} user={user} />;
}