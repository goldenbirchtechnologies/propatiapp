'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardLandingClient() {
  const router = useRouter();
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const delays = [1500, 3000, 6000];
    const delay = delays[Math.min(attempt, delays.length - 1)];

    const timer = setTimeout(async () => {
      if (cancelled) return;
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        const json = await res.json().catch(() => null);
        if (cancelled) return;
        if (json?.user?.role) {
          const role = json.user.role;
          const map: Record<string, string> = {
            landlord: '/dashboard/landlord',
            tenant: '/dashboard/tenant',
            agent: '/dashboard/agent',
            admin: '/dashboard/admin',
            estate_manager: '/dashboard/estate-manager',
          };
          router.push(map[role] ?? '/onboarding');
          return;
        }
        if (attempt >= 2) setFailed(true);
        else setAttempt((a) => a + 1);
      } catch {
        if (!cancelled) setFailed(true);
      }
    }, delay);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [attempt, router]);

  if (failed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="w-12 h-12 rounded-full bg-amber-500/15 text-amber-500 flex items-center justify-center mb-4">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h1 className="text-lg font-semibold">We are setting up your account</h1>
        <p className="text-sm text-zinc-500 mt-2 max-w-sm">
          We could not finish provisioning your dashboard. It usually resolves in
          a moment — try refreshing, or sign in again.
        </p>
        <div className="flex gap-3 mt-6">
          <Button onClick={() => window.location.reload()}>Try again</Button>
          <Button variant="outline" asChild>
            <Link href="/sign-in">Back to sign in</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-[#10b981] mb-4" />
      <p className="text-sm text-zinc-600">Setting up your dashboard…</p>
    </div>
  );
}
