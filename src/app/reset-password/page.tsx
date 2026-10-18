'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to reset password');
      }

      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b] px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-[#10b981]/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-[#10b981]" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Password reset successful</h2>
          <p className="text-zinc-400 mb-6">Your password has been updated. You can now sign in with your new password.</p>
          <button
            type="button"
            onClick={() => router.push('/sign-in')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#10b981] hover:bg-[#006c49] text-white font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">
            Propati<span className="text-[#10b981]">Box</span>
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Reset your password</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-zinc-400 mb-2">
              New password
            </label>
            <div className="relative">
              <input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                required
                minLength={8}
                className="w-full pl-4 pr-12 py-3 rounded-xl bg-[#18181b] border border-white/[0.07] text-white placeholder-zinc-600 focus:outline-none focus:border-[#10b981]/50 focus:ring-1 focus:ring-[#10b981]/50 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirm-new-password" className="block text-sm font-medium text-zinc-400 mb-2">
              Confirm new password
            </label>
            <input
              id="confirm-new-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              className="w-full px-4 py-3 rounded-xl bg-[#18181b] border border-white/[0.07] text-white placeholder-zinc-600 focus:outline-none focus:border-[#10b981]/50 focus:ring-1 focus:ring-[#10b981]/50 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#10b981] hover:bg-[#006c49] text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Reset Password'
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
    </div>
  );
}
