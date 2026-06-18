'use client';

import { SignIn } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { useSearchParams } from 'next/navigation';

export default function SignInPage() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url') || '/dashboard';

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
          <p style={{ color: 'var(--muted)' }}>
            Sign in to your account to continue
          </p>
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

import Link from 'next/link';