'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SignIn } from '@clerk/nextjs';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Star, Quote } from 'lucide-react';

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Invalid email or password');
      }

      router.push(redirectUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#09090b]">
      {/* Left Panel - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 lg:px-20 xl:px-32 py-12">
        <div className="w-full max-w-md mx-auto">
          {/* Logo */}
          <div className="mb-10">
            <h1 className="text-2xl font-bold text-white">
              Propati<span className="text-[#10b981]">Box</span>
            </h1>
            <p className="text-zinc-500 text-sm mt-1">Sign in to your account</p>
          </div>

          {/* Social Buttons */}
          <div className="space-y-3 mb-8">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-white/[0.07] bg-[#18181b] text-white hover:bg-[#27272a] transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-white/[0.07] bg-[#18181b] text-white hover:bg-[#27272a] transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16.365 1.43c0 1.14-.46 2.2-1.21 3.02-.79.86-2.08 1.52-3.15 1.44-.13-1.1.42-2.27 1.15-3.07.81-.89 2.16-1.5 3.21-1.39zM20.94 17.1c-.57 1.3-.84 1.88-1.57 3.03-1.02 1.6-2.46 3.6-4.25 3.61-1.59.02-2-.99-4.16-.98-2.16.01-2.61 1-4.2.98-1.79-.02-3.16-1.82-4.18-3.42C.72 17.36.03 13.66.87 11.2c.59-1.73 1.93-2.85 3.39-2.85 1.49 0 2.42.99 3.64.99 1.18 0 1.86-.99 3.62-.99 1.29 0 2.68.71 3.62 1.95-3.19 1.73-2.67 6.27.98 7.8z" />
              </svg>
              Continue with Apple
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-white/[0.07]" />
            <span className="text-zinc-500 text-xs uppercase tracking-wider">or continue with email</span>
            <div className="flex-1 h-px bg-white/[0.07]" />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-400 mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#18181b] border border-white/[0.07] text-white placeholder-zinc-600 focus:outline-none focus:border-[#10b981]/50 focus:ring-1 focus:ring-[#10b981]/50 transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-400 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-11 pr-12 py-3 rounded-xl bg-[#18181b] border border-white/[0.07] text-white placeholder-zinc-600 focus:outline-none focus:border-[#10b981]/50 focus:ring-1 focus:ring-[#10b981]/50 transition-colors"
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

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-white/[0.07] bg-[#18181b] text-[#10b981] focus:ring-[#10b981]/50"
                />
                <span className="text-sm text-zinc-400">Remember me</span>
              </label>
              <a href="/forgot-password" className="text-sm text-[#10b981] hover:text-[#006c49] transition-colors">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#10b981] hover:bg-[#006c49] text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Clerk SignIn as fallback/alternative */}
          <div className="mt-6">
            <SignIn
              appearance={{
                elements: {
                  formButtonPrimary: 'bg-[#10b981] hover:bg-[#006c49] text-white rounded-xl',
                  card: 'bg-transparent shadow-none border-none',
                  headerTitle: 'hidden',
                  headerSubtitle: 'hidden',
                  socialButtonsBlockButton: 'hidden',
                  dividerLine: 'hidden',
                  dividerText: 'hidden',
                  formFieldInput: 'bg-[#18181b] border border-white/[0.07] text-white rounded-xl',
                  footerActionLink: 'text-[#10b981]',
                },
              }}
              routing="path"
              path="/sign-in"
              fallbackRedirectUrl={redirectUrl}
            />
          </div>

          {/* Sign Up Link */}
          <p className="mt-8 text-center text-sm text-zinc-500">
            Don&apos;t have an account?{' '}
            <a href="/sign-up" className="text-[#10b981] hover:text-[#006c49] font-medium transition-colors">
              Create one
            </a>
          </p>
        </div>
      </div>

      {/* Right Panel - Lagos Skyline */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background gradient simulating Lagos skyline */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#0d2847] to-[#09090b]" />
        
        {/* Skyline silhouette */}
        <div className="absolute bottom-0 left-0 right-0 h-2/3">
          <div className="absolute bottom-0 left-[5%] w-16 h-64 bg-[#0f1d31] rounded-t-sm" />
          <div className="absolute bottom-0 left-[12%] w-12 h-48 bg-[#111f35] rounded-t-sm" />
          <div className="absolute bottom-0 left-[18%] w-20 h-80 bg-[#0e1c30] rounded-t-sm" />
          <div className="absolute bottom-0 left-[26%] w-14 h-56 bg-[#122238] rounded-t-sm" />
          <div className="absolute bottom-0 left-[32%] w-24 h-96 bg-[#0d1a2e] rounded-t-sm" />
          <div className="absolute bottom-0 left-[42%] w-16 h-72 bg-[#101f36] rounded-t-sm" />
          <div className="absolute bottom-0 left-[50%] w-12 h-44 bg-[#132440] rounded-t-sm" />
          <div className="absolute bottom-0 left-[56%] w-20 h-88 bg-[#0e1d33] rounded-t-sm" />
          <div className="absolute bottom-0 left-[64%] w-14 h-60 bg-[#11203a] rounded-t-sm" />
          <div className="absolute bottom-0 left-[70%] w-24 h-76 bg-[#0d1b31] rounded-t-sm" />
          <div className="absolute bottom-0 left-[78%] w-16 h-52 bg-[#122239] rounded-t-sm" />
          <div className="absolute bottom-0 left-[85%] w-12 h-68 bg-[#0f1e35] rounded-t-sm" />
          <div className="absolute bottom-0 left-[91%] w-20 h-84 bg-[#0e1c32] rounded-t-sm" />
          {/* Water reflection */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#09090b] to-transparent" />
        </div>

        {/* Ambient glow */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#10b981]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 left-1/3 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px]" />

        {/* Content overlay */}
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 h-full">
          {/* Quote icon */}
          <div>
            <Quote className="w-10 h-10 text-[#10b981]/40 mb-6" />
            <blockquote className="text-2xl xl:text-3xl font-medium text-white leading-relaxed max-w-lg">
              &ldquo;PropatiBox transformed how I manage my properties. The verification system gives me peace of mind.&rdquo;
            </blockquote>
          </div>

          {/* Testimonial Card */}
          <div className="bg-[#18181b]/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-6 max-w-sm">
            <div className="flex items-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-[#f59e0b] text-[#f59e0b]" />
              ))}
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed mb-4">
              The most reliable property platform in Nigeria. Every transaction feels secure and verified.
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#10b981] to-[#006c49] flex items-center justify-center text-white font-semibold text-sm">
                AO
              </div>
              <div>
                <p className="text-white text-sm font-medium">Adeola Ogunlesi</p>
                <p className="text-zinc-500 text-xs">Property Landlord, Lekki</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
