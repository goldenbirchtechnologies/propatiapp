import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import ReceiptPageClient from './ReceiptPageClient';

interface PageProps {
  params: Promise<{ id: string; role: string }>;
}

export default async function ReceiptPage({ params }: PageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await getCurrentUserWithProfile();

  if (!user) {
    redirect('/dashboard');
  }

  const { id } = await params;

  return <ReceiptPageClient transactionId={id} />;
}
