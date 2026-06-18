'use client';

import { useRouter } from 'next/navigation';

export default function LandlordMessagesClient({ userId, userName }: { userId: string; userName: string }) {
  const router = useRouter();

  // Redirect to the new dynamic route
  if (typeof window !== 'undefined') {
    router.replace('/dashboard/landlord/messages');
  }

  return null;
}
