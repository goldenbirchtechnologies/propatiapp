import { getCurrentUserWithProfile } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function VerificationStep2IdentityPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getCurrentUserWithProfile();
  if (!user) {
    redirect('/sign-in');
  }

  const sp = await searchParams;
  const listingId = sp.listingId as string | undefined;

  if (!listingId) {
    redirect('/dashboard/verification/dojah-kyc');
  }

  redirect(`/dashboard/verification/dojah-kyc?listingId=${encodeURIComponent(listingId)}`);
}
