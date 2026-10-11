'use client';

import Link from 'next/link';
import { SignIn } from '@clerk/nextjs';
import PropatiBoxLogo from '@/components/brand/PropatiBoxLogo';

export default function SignInPage() {
  return (
    <main className="min-h-screen w-full flex flex-col lg:flex-row bg-[#09090b] text-white selection:bg-emerald-500/20 selection:text-emerald-400">
      {/* Left Authentication Section (Bichrome dark panel) */}
      <section className="w-full lg:w-[48%] xl:w-[44%] 2xl:w-[40%] flex flex-col justify-between px-6 sm:px-12 md:px-16 lg:px-12 xl:px-16 py-8 lg:py-12 bg-[#09090b] border-r border-white/[0.07] z-10 overflow-y-auto">
        {/* Top Brand Logo Area */}
        <header className="w-full">
          <Link
            href="/"
            aria-label="PROPATIBOX Home"
            className="inline-block transition-transform active:scale-95 duration-150"
          >
            <PropatiBoxLogo size="md" href={null} />
          </Link>
        </header>

        {/* Center Authentication Form Block */}
        <div className="my-auto py-8 w-full max-w-md mx-auto lg:max-w-none">
          <div className="mb-6">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Sign in
            </h1>
            <p className="mt-2 text-sm sm:text-base text-zinc-400 font-medium">
              Welcome back to your property journey
            </p>
          </div>

          <div className="w-full">
            <SignIn
              appearance={{
                baseTheme: 'dark',
                elements: {
                  rootBox: 'w-full',
                  card: 'shadow-none border-0 rounded-none bg-transparent p-0 w-full',
                  header: 'hidden',
                  headerTitle: 'hidden',
                  headerSubtitle: 'hidden',
                  formButtonPrimary:
                    'w-full h-12 flex items-center justify-center rounded-xl bg-[#10b981] hover:bg-[#059669] active:bg-[#047857] text-white font-semibold text-base shadow-sm hover:shadow-emerald-500/20 transition-all duration-150 ease-in-out cursor-pointer tracking-wide normal-case',
                  socialButtonsBlockButton:
                    'w-full h-12 px-4 flex items-center justify-center gap-3 rounded-xl border border-white/[0.1] bg-zinc-900/80 hover:bg-zinc-800 active:bg-zinc-800/90 text-zinc-200 hover:text-white text-sm font-semibold transition-colors duration-150 shadow-sm',
                  socialButtonsBlockButtonText: 'text-zinc-200 font-semibold text-sm',
                  socialButtonsProviderIcon: 'w-5 h-5 flex-shrink-0',
                  dividerRow: 'my-6',
                  dividerLine: 'border-white/[0.08]',
                  dividerText:
                    'bg-[#09090b] px-4 text-xs font-semibold tracking-widest text-zinc-500 uppercase',
                  formFieldLabel:
                    'block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5',
                  formFieldInput:
                    'w-full h-12 px-4 rounded-xl border border-white/[0.12] bg-zinc-900/90 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-[#10b981] shadow-sm transition duration-150 text-base',
                  footer: 'mt-6 pt-0 border-0',
                  footerAction: 'flex justify-center text-sm text-zinc-400',
                  footerActionText: 'text-zinc-400 text-sm',
                  footerActionLink:
                    'font-bold text-[#10b981] hover:text-[#34d399] hover:underline transition-colors ml-1 inline-block',
                  formFieldAction: 'text-sm font-semibold text-[#10b981] hover:underline',
                  identityPreviewText: 'text-zinc-200 font-medium',
                  identityPreviewEditButtonIcon: 'text-[#10b981]',
                  otpCodeFieldInput:
                    'h-12 border border-white/[0.12] bg-zinc-900 text-white font-bold focus:border-[#10b981] focus:ring-[#10b981]',
                  formResendCodeLink:
                    'text-sm font-semibold text-[#10b981] hover:underline',
                },
                variables: {
                  colorPrimary: '#10b981',
                  colorBackground: 'transparent',
                  colorInputBackground: '#18181b',
                  colorInputText: '#ffffff',
                  colorText: '#ffffff',
                  colorTextSecondary: '#a1a1aa',
                  colorNeutral: '#a1a1aa',
                  colorDanger: '#ef4444',
                  borderRadius: '0.75rem',
                },
              }}
              routing="path"
              path="/sign-in"
              redirectUrl="/dashboard"
              fallbackRedirectUrl="/dashboard"
              signUpUrl="/sign-up"
            />
          </div>
        </div>

        {/* Legal Disclaimer Footer */}
        <footer className="pt-6 border-t border-white/[0.07] text-xs text-zinc-500 text-center lg:text-left leading-relaxed">
          By submitting, I accept PROPATIBOX’s{' '}
          <Link
            href="/terms-of-agreement"
            className="text-[#10b981] hover:text-[#34d399] underline font-medium"
          >
            Terms of Use
          </Link>{' '}
          and{' '}
          <Link
            href="/privacy-policy"
            className="text-[#10b981] hover:text-[#34d399] underline font-medium"
          >
            Privacy Policy
          </Link>
          .
        </footer>
      </section>

      {/* Right Hero Image Section */}
      <section
        className="hidden lg:relative lg:flex lg:w-[52%] xl:w-[56%] 2xl:w-[60%] min-h-screen overflow-hidden bg-black"
        data-purpose="hero-visual"
      >
        {/* Full Bleed Background Photographic Asset */}
        <img
          alt="Authentic lifestyle photograph of an African family gathered on the sunny patio of their contemporary home"
          className="absolute inset-0 w-full h-full object-cover object-center transform scale-105 hover:scale-100 transition-transform duration-1000 ease-out opacity-90"
          src="https://lh3.googleusercontent.com/aida/AEtjO1WBQYYgmvvmvXz8JfVY6ILF1oXrzh5WyiKb8gKTFcFsNXROWeVXtRMJKy8g-vQvJdn4eW96Xst6f6S6riMpSZIqVD2XlqcofoTVVJQ3eOITojWwGPSTKQ1wZikedjIqZ1_e8FOzrhn7QnZfBnmuueeSa7tgDqwnE7x9coPv1J07XZIpSRgY3filSAKltSAtjRj5TaR0iJx7ri8EMukt0WktZ4Zrt1M1N3V5kkT9SXk3XGSCr066v3LBMw"
        />

        {/* Balanced Gradient Scrim for Contrast & Legibility */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30 pointer-events-none"
        />

        {/* Floating Stat / Testimonial Bichrome Dark Card */}
        <div className="absolute bottom-12 left-8 right-8 xl:left-12 xl:right-12 z-20 flex flex-col xl:flex-row items-start xl:items-end justify-between gap-6 pointer-events-auto">
          <div
            className="rounded-2xl p-6 shadow-2xl border border-white/[0.12] max-w-xl text-left bg-black/75 backdrop-blur-xl"
          >
            <div aria-label="5 out of 5 stars" className="flex items-center gap-1.5 text-emerald-400 mb-2">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              &ldquo;Find a place you&apos;ll love living in.&rdquo;
            </h2>
            <p className="text-sm text-zinc-300 mt-1 font-medium">
              Join over 25,000+ happy homeowners discovering transparent real estate listings every day.
            </p>
          </div>

          {/* Trust Indicator Tag */}
          <div
            className="px-5 py-3 rounded-full flex items-center gap-3 border border-white/[0.12] shadow-xl shrink-0 bg-black/75 backdrop-blur-xl"
          >
            <span className="inline-flex relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
            <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
              Over 25,000+ Happy Homeowners
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}

