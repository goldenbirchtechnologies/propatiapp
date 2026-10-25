import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import LandlordAgreementsClient from './LandlordAgreementsClient';

export default async function LandlordAgreementsPage() {
  const user = await getCurrentUserWithProfile();

  if (!user || user.role !== 'landlord') {
    redirect('/dashboard');
  }

  return <LandlordAgreementsClient />;
}
