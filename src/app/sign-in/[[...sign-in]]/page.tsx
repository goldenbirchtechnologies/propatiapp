'use client';

import Link from 'next/link';
import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#10b981] flex items-center justify-center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <span className="text-white font-bold text-lg">PROPATI</span>
          </Link>
        </div>

        <div className="bg-zinc-950 border border-white/[0.08] p-8 rounded-2xl">
          <div className="text-center mb-8">
            <h1 className="text-xl font-bold text-white mb-1">Welcome back</h1>
            <p className="text-sm text-zinc-500">Sign in to your PROPATI account</p>
          </div>

          <SignIn
            appearance={{
              baseTheme: 'dark',
              elements: {
                card: 'shadow-none border-0 rounded-xl bg-transparent',
                headerTitle: 'font-bold text-xl text-white',
                headerSubtitle: 'text-zinc-400',
                socialButtonsBlockButton:
                  'bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white',
                socialButtonsBlockButtonText: 'text-white font-medium',
                formFieldLabel: 'text-zinc-300 font-medium',
                formFieldInput:
                  'bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:border-[#10b981]',
                formButtonPrimary:
                  'bg-[#10b981] hover:bg-[#10b981]/90 text-white font-semibold',
                footerActionText: 'text-zinc-400',
                footerActionLink:
                  'text-[#10b981] hover:text-[#10b981]/80 underline-offset-2 font-semibold',
                formFieldAction: 'text-[#10b981]',
                otpCodeFieldInput:
                  'bg-zinc-900 border border-zinc-800 text-white text-lg font-bold tracking-widest',
                formResendCodeLink:
                  'text-zinc-400 hover:text-[#10b981] font-medium',
                identityPreviewText: 'text-zinc-300 font-semibold',
                identityPreviewEditButtonIcon:
                  'text-[#10b981] hover:text-[#10b981]/80',
              },
              variables: {
                colorBackground: 'transparent',
                colorInputBackground: '#18181b',
                colorInputText: '#ffffff',
                colorText: '#ffffff',
                colorTextSecondary: '#a1a1aa',
                colorNeutral: '#a1a1aa',
                colorDanger: '#ef4444',
              },
            }}
            routing="path"
            path="/sign-in"
            redirectUrl="/dashboard"
            fallbackRedirectUrl="/dashboard"
          />
        </div>
      </div>
    </div>
  );
}
