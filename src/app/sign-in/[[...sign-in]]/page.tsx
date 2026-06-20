'use client';

import Link from 'next/link';
import { SignIn } from '@clerk/nextjs';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SignInPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirectUrl = searchParams.get('redirect_url') || '/dashboard';
  const [flowReady, setFlowReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function resolveRoleRoute() {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        if (!res.ok) {
          if (!cancelled) setFlowReady(true);
          return;
        }
        const data = await res.json();
        const role = data?.user?.role;
        if (!cancelled) setFlowReady(true);
        if (!role) return;
        const paths: Record<string, string> = {
          landlord: '/dashboard/landlord',
          tenant: '/dashboard/tenant',
          agent: '/dashboard/agent',
          admin: '/admin',
          estate_manager: '/dashboard/estate-manager',
        };
        const mapped = paths[role] || '/dashboard/tenant';
        if (window.location.pathname === '/sign-in') {
          router.replace(mapped);
        }
      } catch (_e) {
        if (!cancelled) setFlowReady(true);
      }
    }

    resolveRoleRoute();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!flowReady) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 theme-landing">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <span className="text-3xl font-heading font-bold" style={{ color: 'var(--accent)' }}>
                PROPATI
              </span>
            </Link>
            <h1 className="font-heading font-bold text-2xl mb-2" style={{ color: 'var(--text)' }}>
              Welcome Back
            </h1>
            <p style={{ color: 'var(--muted)' }}>Checking your account...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 theme-landing">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-3xl font-heading font-bold" style={{ color: 'var(--accent)' }}>
              PROPATI
            </span>
          </Link>
          <h1 className="font-heading font-bold text-2xl mb-2" style={{ color: 'var(--text)' }}>
            Welcome Back
          </h1>
          <p style={{ color: 'var(--muted)' }}>Sign in to your account to continue</p>
        </div>

        <div className="card p-6">
          <SignIn
            appearance={{
              elements: {
                formButtonPrimary: 'btn btn-primary w-full py-3',
                card: 'shadow-none border-0 p-0',
                headerTitle: 'font-heading font-bold text-xl',
                headerSubtitle: 'text-[var(--muted)]',
              },
            }}
            routing="path"
            path="/sign-in"
            redirectUrl={redirectUrl}
          />
        </div>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--muted)' }}>
          Don't have an account?{' '}
          <Link href="/sign-up" className="font-medium" style={{ color: 'var(--accent)' }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}