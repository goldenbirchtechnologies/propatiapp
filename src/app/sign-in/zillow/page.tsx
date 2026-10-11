'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, SignIn } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

const socialProviders = [
  { name: 'Google', icon: 'G', color: 'border-zinc-300 hover:bg-zinc-50 text-zinc-800' },
  { name: 'Apple', icon: '🍎', color: 'border-zinc-300 hover:bg-zinc-50 text-zinc-800' },
  { name: 'Facebook', icon: 'f', color: 'border-blue-600 hover:bg-blue-50 text-blue-600' },
];

export default function ZillowStyleSignInPage() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && userId) {
      router.replace('/dashboard');
    }
  }, [isLoaded, userId, router]);

  if (!isLoaded) {
    return null;
  }

  if (userId) {
    return null;
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await fetch('/api/auth/email-signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, redirectUrl: '/dashboard' }),
      });
    } catch {
      setError('Unable to send sign-in link. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white text-zinc-900">
      {/* Left side — form */}
      <div className="w-full max-w-md flex flex-col justify-center px-8 py-12 mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mb-10">
          <div className="w-9 h-9 rounded-lg bg-[#10b981] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <span className="font-bold text-xl text-emerald-600">PROPATI</span>
        </Link>

        <h1 className="text-2xl font-bold mb-2">Sign In</h1>

      {error && (
        <p className="text-sm text-red-500 text-center">{error}</p>
      )}

      <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Email Address *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 h-12 text-base border-zinc-300 focus:border-emerald-500 focus:ring-emerald-500/20"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
            disabled={isSubmitting || !email}
          >
            {isSubmitting ? 'Sending...' : 'Continue'}
          </Button>
        </form>

        <div className="my-6 flex items-center">
          <Separator className="flex-1" />
          <span className="px-4 text-sm text-zinc-500">OR</span>
          <Separator className="flex-1" />
        </div>

        <div className="space-y-2.5">
          {socialProviders.map((provider) => (
            <button
              key={provider.name}
              type="button"
              className={`w-full h-12 rounded-lg border-2 flex items-center justify-center gap-3 text-sm font-medium transition-colors ${provider.color}`}
            >
              <span className="w-4 h-4 flex items-center justify-center text-xs font-bold">
                {provider.icon === 'G' ? (
                  <svg width="14" height="14" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.76h5.92c-.26 1.34-.66 2.56-1.17 3.63.84.65 1.9 1.18 3.07 1.45.8.15 1.62.24 2.43.24v.01C20.18 19.73 22.56 17.5 22.56 14.25c0-.25-.01-.5-.02-.75z" />
                    <path fill="#34A853" d="M12 23.5c2.7 0 4.96-.89 6.63-2.41l-.87-.7 1.7-1.34c2.1.75 4.44 1.19 6.89.49C21.24 21.65 18.5 23.5 12 23.5z" />
                    <path fill="#4285F4" d="M7.75 17.18A10.64 10.64 0 0 1 5.45 16l-2.66 1.7c1.65 3.03 5.05 5.06 8.96 5.06 2.21 0 4.2-.74 5.86-1.98l.01-.01c-.22-.18-.42-.38-.65-.58z" />
                    <path fill="#FBBC05" d="M20.77 6.84c-.74.67-1.57 1.22-2.53 1.61.68.54 1.27 1.18 1.78 1.91.51-.01.99-.01 1.46-.01.3-.01.6-.02.91-.04.7-2.76 1.14-5.63-.75-8.17z" />
                    <path fill="#EA4335" d="M15.57 10.81c-.06-.95-.29-1.88-.64-2.76.67-1.37 1.5-2.55 2.48-3.54-1.1-.38-2.4-.6-3.64-.6-2.66.01-4.99 1.77-5.81 4.3l-1.66 3.5A10.61 10.61 0 0 1 8.74 19.21c.52.09 1.05.13 1.6.13.88 0 1.71-.11 2.5--.3l-.01-.01c-.85-1.42-.99-2.95-.42-4.42z" />
                  </svg>
                ) : provider.icon === '🍎' ? (
                  <AppleLogo className="w-4 h-4" />
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M22.675 0h-21.35C.583 0 0 .617 0 1.386v21.228C0 23.383.584 24 1.325 24H11.5v-9.294H8.475V10.9h3.025V8.414c0-3 .18-6.86 2.013-6.86 1.15 0 2.132.085 2.37.195v2.7h-1.6c-1.3 0-1.55.335-1.55 1.515v2.096h3.08l-.4 3.115h-2.68V24H22.675c.74 0 1.325-.617 1.325-1.386V1.386C24 .617 23.417 0 22.675 0z" />
                  </svg>
                )}</span>
              {provider.name}
            </button>
          ))}
        </div>

        <p className="mt-8 text-xs text-zinc-500 text-center">
          By submitting, I accept Zillow's terms of use.
        </p>

        {/* Clincher / divider to native Clerk flow */}
        <div className="mt-4 text-center">
          <SignIn
            appearance={{
              baseTheme: undefined,
              elements: {
                root: 'hidden',
              },
            }}
            routing="path"
            path="/sign-in"
            redirectUrl="/dashboard"
            fallbackRedirectUrl="/dashboard"
          />
        </div>
      </div>

      {/* Right side — hero image with overlay */}
      <div className="hidden md:flex flex-1 relative items-center justify-center bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1613490499028-4f6d2fddc3ec?w=1600&auto=format&fit=crop&q=80)' }}>
        {/* Dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        {/* Overlay text from screenshot */}
        <div className="absolute top-12 right-12 bg-black/40 text-white px-4 py-2 rounded-lg text-sm font-medium">
          To exit full screen, press and hold Esc
        </div>
        {/* Hero content */}
        <div className="relative text-center text-white px-8">
          <h2 className="text-3xl font-bold mb-4 drop-shadow-lg">
            Find your perfect home
          </h2>
          <p className="text-lg drop-shadow-md">
            Verified rental properties across Lagos
          </p>
        </div>
      </div>
    </div>
  );
}

function AppleLogo({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="18" viewBox="0 0 384 512" fill="currentColor">
      <path d="M318.7 268c0-110.6-89.4-148.6-89.4-148.6-42.5-90.5-82.4-88.5-82.4-88.5-61.7-10.5-94.5 5.4-94.5 5.4-66.5 36-62.9 74.5-62.9 74.5-35.5 79.5-33.5 112.8-33.5 112.8-6.5 88.5 14 143.6 14 143.6 61.8 91.5 87.9 115 138.5 101.6 32.8-8.5 75.4-48 114.5-46.6 25.3 1.4 47-.8 66.7-27.7-28-9.5-58.3-14-87.2-17 22.4-6.5 48.5-20.8 68-43z" />
    </svg>
  );
}
