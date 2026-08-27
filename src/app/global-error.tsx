'use client';

import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { InteractiveHoverButton } from '@/components/ui';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <html lang="en">
      <body className="bg-black min-h-screen flex items-center justify-center p-6 antialiased">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle size={28} className="text-red-400" />
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">System error</h1>
          <p className="text-zinc-500 text-sm mb-6">
            Something went wrong. Please try reloading or go back home.
          </p>

          {error?.digest && (
            <p className="text-xs text-zinc-600 mb-6 font-mono">Ref: {error.digest}</p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <InteractiveHoverButton
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <RefreshCw size={14} />
              Reload
            </InteractiveHoverButton>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-white/[0.08] text-zinc-300 text-sm rounded-lg hover:text-white hover:border-zinc-600 transition-colors"
            >
              <Home size={14} />
              Back home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
