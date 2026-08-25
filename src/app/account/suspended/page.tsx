import Link from 'next/link';
import { Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Account Suspended — PROPATI',
};

export default function AccountSuspendedPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Shield size={28} className="text-amber-400" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">Account Suspended</h1>
        <p className="text-zinc-500 mb-6 max-w-sm mx-auto">
          Your account has been temporarily suspended. This may be due to a policy violation or pending verification.
        </p>

        <div className="glass-card p-5 text-left mb-6">
          <p className="text-xs text-zinc-500 mb-3 uppercase tracking-wider font-semibold">What to do next</p>
          {[
            'Check your email for details',
            'Contact support at support@propati.ng',
            'Complete identity verification if requested',
          ].map((step) => (
            <div key={step} className="flex items-center gap-2.5 text-sm text-zinc-400 py-1.5">
              <div className="w-4 h-4 rounded-full border border-zinc-700 flex-shrink-0" />
              {step}
            </div>
          ))}
        </div>

        <a
          href="mailto:support@propati.ng"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 text-white text-sm rounded-xl hover:bg-white/10 transition-colors"
        >
          Contact Support
        </a>

        <div className="mt-6">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white transition-colors">
            <ArrowRight size={13} className="rotate-180" />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
