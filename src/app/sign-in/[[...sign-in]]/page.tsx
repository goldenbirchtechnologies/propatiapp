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
                card: 'shadow-none border-0 rounded-xl bg-transparent',
                headerTitle: 'font-bold text-xl text-white',
                headerSubtitle: 'text-slate-400',
                socialButtonsBlockButton:
                  'bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white',
                socialButtonsBlockButtonText: 'text-white font-medium',
                formFieldLabel: 'text-slate-200 font-medium',
                formFieldInput:
                  'bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500',
                formButtonPrimary:
                  'bg-emerald-600 hover:bg-emerald-500 text-white font-semibold',
                footerActionText: 'text-slate-300',
                footerActionLink:
                  'text-emerald-400 hover:text-emerald-300 underline-offset-2 font-semibold',
                formFieldAction: 'text-emerald-400',
                otpCodeFieldInput:
                  'bg-slate-900 border border-slate-700 text-white text-lg font-bold tracking-widest',
                formResendCodeLink:
                  'text-slate-300 hover:text-emerald-400 font-medium',
                identityPreviewText: 'text-slate-200 font-semibold',
                identityPreviewEditButtonIcon:
                  'text-emerald-400 hover:text-emerald-300',
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