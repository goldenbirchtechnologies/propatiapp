"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

export default function LoginPage() {
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      router.replace('/dashboard');
    } else {
      router.replace('/sign-in');
    }
  }, [router, user]);

  return null;
}
