'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardLandingClient() {
  const router = useRouter();
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const sawAuthFailureRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const delays = [1500, 3000, 6000];
    const delay = attempt === 0 ? 600 : delays[Math.min(attempt - 1, delays.length - 1)];

    const timer = setTimeout(async () => {
      if (cancelled) return;
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        if (cancelled) return;
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            // Not actually signed in, or account disabled. Stop polling;
            // stay on this screen instead of pushing back to /sign-in and
            // creating a frictionless infinite loop.
            sawAuthFailureRef.current = true;
            if (res.status === 403) {
              const body = await res.json().catch(() => null);
              setErrorMessage(body?.error === 'ACCOUNT_DISABLED'
                ? 'This account has been disabled. Contact support.'
                : body?.error ?? 'Access not available for this account.');
            } else {
              setErrorMessage('Your sign-in could not be confirmed. Try signing in again — if it persists, check that the browser is allowing third-party cookies for Clerk.');
            }
            setFailed(true);
            return;
          }
          if (res.status === 503) {
            // Transient: database temporarily unavailable. Keep polling briefly.
            const body = await res.json().catch(() => null);
            const code = body?.error;
            if (code === 'DATABASE_UNAVAILABLE' || code === 'AUTH_UNAVAILABLE') {
              setErrorMessage('The database is temporarily unavailable. This will self-retry for a moment.');
              if (attempt >= 4) setFailed(true);
              else setAttempt((a) => a + 1);
              return;
            }
            setFailed(true);
            return;
          }
          if (attempt >= 3) setFailed(true);
          else setAttempt((a) => a + 1);
          return;
        }
        const json = await res.json().catch(() => null);
        if (cancelled) return;
        const role = json?.user?.role;
        if (role) {
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
        // 200 but no user payload — webhook / lazy provisioning may not have
        // completed yet. Keep polling a little longer.
        if (attempt >= 4) setFailed(true);
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
        <h1 className="text-lg font-semibold">We could not finish setting up your dashboard</h1>
        <p className="text-sm text-zinc-500 mt-2 max-w-sm">
          {errorMessage ??
            'Your sign-in went through, but the account could not be provisioned. ' +
              'The most common cause is the Clerk webhook or the database not being reachable — see below.'}
        </p>
        {!sawAuthFailureRef.current && (
          <p className="text-xs text-zinc-400 mt-3 max-w-sm">
            Check: 1) <code className="text-zinc-600">CLERK_WEBHOOK_SECRET</code> is set in production
            and Clerk → Webhooks → that endpoint shows <code className="text-zinc-600">200</code> for{' '}
            <code className="text-zinc-600">user.created</code>; 2){' '}
            <code className="text-zinc-600">DATABASE_URL</code> is the pooled host (
            <code className="text-zinc-600">:6543</code>) and{' '}
            <code className="text-zinc-600">DIRECT_URL</code> is the direct host
            (<code className="text-zinc-600">db.YOUR_REF.supabase.co:5432</code>); 3) the onboarding
            migration has been applied.
          </p>
        )}
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
      {errorMessage && <p className="text-xs text-zinc-500 mt-2 max-w-sm">{errorMessage}</p>}
    </div>
  );
}
