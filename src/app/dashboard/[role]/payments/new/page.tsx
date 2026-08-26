import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import PaymentInitiationClient from './PaymentInitiationClient';

interface PageProps {
  params: Promise<{ role: string }>;
}

export default async function PaymentInitiationPage({ params }: PageProps) {
  const user = await getCurrentUserWithProfile();
  if (!user) redirect('/dashboard');

  const { role } = await params;
  if (!user || user.role !== role) redirect('/dashboard');

  return <PaymentInitiationClient user={user} />;
}