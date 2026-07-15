import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import ReferralsClient from './ReferralsClient';

export default async function RealtorReferralsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/login');

  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'realtor') redirect('/dashboard');

  return <ReferralsClient />;
}
