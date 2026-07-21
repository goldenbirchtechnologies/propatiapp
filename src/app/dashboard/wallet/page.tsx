'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

export default function WalletPage() {
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    router.replace('/dashboard/tenant/payments');
  }, [router]);

  return null;
}
