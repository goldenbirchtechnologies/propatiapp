import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';

/** Registered assets now use the canonical property workspace. */
export default async function RegisteredPropertyAlias({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'landlord') redirect('/dashboard');
  const { id } = await params;
  redirect(`/dashboard/landlord/properties/${id}`);
}
