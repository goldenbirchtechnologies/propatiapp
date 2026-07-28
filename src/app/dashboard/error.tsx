'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function DashboardError({
  error,
  reset,
}: {
  error?: Error & { digest?: string };
  reset?: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard route error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6 py-16">
      <div className="w-full max-w-2xl rounded-3xl border border-outline-variant bg-surface-container-lowest p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">Dashboard error</p>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">We could not load this page</h1>
          </div>
        </div>

        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          The dashboard hit an unexpected error. Your navigation is still available, and you can retry this page or go back to the main dashboard.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          {reset && (
            <Button onClick={reset} className="gap-2">
              Try again
            </Button>
          )}
          <Button asChild variant="secondary">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
