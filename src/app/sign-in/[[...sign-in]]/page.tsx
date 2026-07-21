'use client';

import Link from 'next/link';
import { SignIn } from '@clerk/nextjs';
import { useState } from 'react';

export default function SignInPage() {
  const [flowReady, setFlowReady] = useState(false);

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
              baseTheme: 'dark',
              elements: {
                formButtonPrimary: 'bg-primary text-primary-foreground hover:bg-primary/90',
                card: 'shadow-lg border border-border rounded-xl',
                headerTitle: 'font-bold text-xl text-foreground',
                headerSubtitle: 'text-muted-foreground',
              },
              variables: {
                colorBackground: 'var(--surface)',
                colorInputBackground: 'var(--surface)',
                colorInputText: 'var(--text)',
              },
            }}
            routing="path"
            path="/sign-in"
            fallbackRedirectUrl="/dashboard"
          />
        </div>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--muted)' }}>
          Don't have an account?{' '}
          <Link href="/signup" className="font-medium" style={{ color: 'var(--accent)' }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}