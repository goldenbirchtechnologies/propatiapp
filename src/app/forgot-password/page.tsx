'use client';

import { useState } from 'react';
import { useSignIn } from '@clerk/nextjs';
import { ArrowLeft, CheckCircle, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { isLoaded, signIn } = useSignIn();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signIn) return;
    setIsLoading(true);
    setError(null);

    try {
      // Use Clerk's native reset via signIn resource
      const result = await (signIn as any).createPasswordReset?.({ email });

      if (result?.status === 'missing_address') {
        setError('Email address is required.');
      } else if (result?.status === 'not_found') {
        setError('No account found with that email address.');
      } else {
        setIsSuccess(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back */}
        <a
          href="/sign-in"
          className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sign In
        </a>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#006c49]/15 flex items-center justify-center text-[#006c49]">
            <Mail className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Reset your password</h1>
            <p className="text-zinc-400 text-sm mt-1">
              Enter your email and we&apos;ll send you a reset link.
            </p>
          </div>
        </div>

        {isSuccess ? (
          <div className="rounded-xl bg-[#006c49]/10 border border-[#006c49]/20 p-6 text-center">
            <CheckCircle className="h-10 w-10 text-[#006c49] mx-auto mb-3" />
            <h2 className="text-lg font-semibold mb-2">Check your email</h2>
            <p className="text-zinc-400 text-sm">
              If an account exists for <strong className="text-white">{email}</strong>, we&apos;ve sent a password reset link.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-400 mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 rounded-xl bg-[#18181b] border border-white/[0.07] text-white placeholder-zinc-600 focus:outline-none focus:border-[#006c49]/50 focus:ring-1 focus:ring-[#006c49]/50 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !isLoaded}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#006c49] hover:bg-[#006c49] text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Send Reset Link
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
