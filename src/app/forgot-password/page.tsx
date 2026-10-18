'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, ArrowLeft, CheckCircle, Key } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to send reset link');
      }

      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">
            Propati<span className="text-[#10b981]">Box</span>
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Reset your password</p>
        </div>

        {isSuccess ? (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-[#10b981]/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-[#10b981]" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
            <p className="text-zinc-400 mb-6">
              If an account exists for <span className="text-white font-medium">{email}</span>, we&apos;ve sent
              password reset instructions.
            </p>
            <button
              type="button"
              onClick={() => router.push('/sign-in')}
              className="inline-flex items-center gap-2 text-[#10b981] hover:text-[#006c49] font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to sign in
            </button>
          </div>
        ) : (
          <div>
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-[#10b981]/20 flex items-center justify-center mx-auto mb-6">
                <Key className="w-8 h-8 text-[#10b981]" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Forgot your password?</h2>
              <p className="text-zinc-400 text-sm">
                Enter your email and we&apos;ll send you a link to reset your password.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="reset-email" className="block text-sm font-medium text-zinc-400 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500" />
                  <input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#18181b] border border-white/[0.07] text-white placeholder-zinc-600 focus:outline-none focus:border-[#10b981]/50 focus:ring-1 focus:ring-[#10b981]/50 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#10b981] hover:bg-[#006c49] text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-zinc-500">
              Remember your password?{' '}
              <a href="/sign-in" className="text-[#10b981] hover:text-[#006c49] font-medium transition-colors">
                Sign in
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
