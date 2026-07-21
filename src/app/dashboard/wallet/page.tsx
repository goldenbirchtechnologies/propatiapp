'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

export default function WalletPage() {
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    const role = user?.publicMetadata?.role as string | undefined;
    const map: Record<string, string> = {
      landlord: '/dashboard/landlord/financials',
      tenant: '/dashboard/tenant/payments',
      agent: '/dashboard/agent/payments',
      admin: '/dashboard/admin/payments',
      estate_manager: '/dashboard/estate-manager/financials',
      accountant: '/dashboard/accountant/payments',
    };
    router.replace(map[role || ''] || '/dashboard');
  }, [router, user]);

  return null;
}
