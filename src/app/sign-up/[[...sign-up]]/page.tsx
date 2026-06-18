'use client';

import { SignUp } from '@clerk/nextjs';
import Link from 'next/link';

export default function SignUpPage() {
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
            Create Your Account
          </h1>
          <p style={{ color: 'var(--muted)' }}>
            Join thousands of property professionals
          </p>
        </div>

        <div className="card p-6">
          <SignUp
            appearance={{
              elements: {
                formButtonPrimary: 'btn btn-primary w-full py-3',
                card: 'shadow-none border-0 p-0',
                headerTitle: 'font-heading font-bold text-xl',
                headerSubtitle: 'text-[var(--muted)]',
              },
            }}
            routing="path"
            path="/sign-up"
            redirectUrl="/onboarding"
          />
        </div>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--muted)' }}>
          Already have an account?{' '}
          <Link href="/sign-in" className="font-medium" style={{ color: 'var(--accent)' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}