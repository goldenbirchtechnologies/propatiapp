'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function GlobalError({ error, reset }: { error?: Error & { digest?: string }; reset?: () => void }) {
  useEffect(() => {
    console.error('Global error boundary caught an issue:', error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-950 p-8 text-center shadow-lg">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
          <svg
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-white">Something went wrong</h1>
          <p className="mx-auto max-w-md text-sm leading-6 text-zinc-400">
            This page hit an unexpected error. Try again or return to the dashboard to continue safely.
          </p>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button onClick={reset} className="gap-2">
            Try again
          </Button>
          <Button asChild variant="secondary">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
