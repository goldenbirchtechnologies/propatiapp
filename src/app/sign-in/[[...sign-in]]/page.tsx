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
          <h1 className="font-heading font-bold text-2xl mb-1" style={{ color: 'var(--text)' }}>
            Sign in to PROPATI
          </h1>
          <p className="text-sm" style={{ color: 'var(--text)', opacity: 0.75 }}>
            Welcome back! Please enter your details.
          </p>
        </div>

        <div className="card border border-border/80 bg-[var(--surface)]/95 backdrop-blur p-1">
          <SignIn
            appearance={{
              baseTheme: 'dark',
              elements: {
                formButtonPrimary: 'bg-primary text-primary-foreground hover:bg-primary/90',
                card: 'shadow-none border-0 rounded-xl bg-transparent',
                headerTitle: 'font-bold text-xl text-[var(--text)]',
                headerSubtitle: 'text-slate-400',
                footerActionText: 'text-slate-300',
                footerActionLink: 'text-emerald-400 hover:text-emerald-300 underline-offset-2',
                formFieldAction: 'text-emerald-400',
              },
              variables: {
                colorBackground: 'transparent',
                colorInputBackground: 'var(--surface-elevated)',
                colorInputText: 'var(--text)',
                colorText: 'var(--text)',
                colorTextSecondary: 'var(--muted)',
                colorNeutral: 'var(--muted)',
                colorDanger: '#ef4444',
              },
            }}
            routing="path"
            path="/sign-in"
            fallbackRedirectUrl="/dashboard"
          />
        </div>
      </div>
    </div>
  );
}