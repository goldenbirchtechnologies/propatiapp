'use client';

import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex bg-[#09090b] text-white">
      {/* Left Panel - Clerk SignIn */}
      <div className="w-full lg:w-[48%] xl:w-[44%] 2xl:w-[40%] flex flex-col justify-between px-6 sm:px-12 md:px-16 py-8 lg:py-12 border-r border-white/[0.07]">
        {/* Top Brand Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-[#006c49] flex items-center justify-center shadow-lg shadow-[#006c49]/20">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3zm0 2.84L18 11v7h-2v-6H8v6H6v-7l6-5.16z" />
              </svg>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight">PROPATIBOX</span>
              <span className="bg-[#006c49]/20 text-[#6ffbbe] border border-[#006c49]/30 text-[11px] px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">NG</span>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-zinc-400 text-sm">
            <span className="inline-block h-2 w-2 rounded-full bg-[#006c49]" />
            <span>Portal Access</span>
          </div>
        </div>

        {/* Clerk SignIn — handles social + email + remember me + forgot password */}
        <div className="max-w-md mx-auto w-full my-auto py-8">
          <SignIn
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'bg-transparent shadow-none border-none p-0',
                headerTitle: 'text-3xl font-bold text-white tracking-tight mb-2',
                headerSubtitle: 'text-zinc-400 text-base mb-8',
                socialButtonsBlockButton: 'h-12 rounded-xl bg-[#18181b] hover:bg-[#27272a] border border-white/[0.1] text-sm font-medium text-white transition-all duration-200 hover:border-white/20 active:scale-[0.99] mb-3 flex items-center justify-center gap-3 w-full',
                socialButtonsBlockButtonText: 'font-medium text-sm',
                dividerLine: 'bg-white/[0.1]',
                dividerText: 'bg-[#09090b] px-3 text-[11px] uppercase tracking-wider text-zinc-500 font-semibold',
                formFieldInput: 'h-12 rounded-xl bg-[#18181b]/90 border border-white/[0.12] text-white text-base placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#006c49] focus:border-transparent transition-all w-full px-4',
                formFieldLabel: 'block text-[11px] uppercase tracking-wider text-zinc-300 mb-2 font-semibold',
                formButtonPrimary: 'w-full h-12 rounded-xl bg-[#006c49] hover:bg-[#006c49] text-white text-sm font-semibold shadow-lg shadow-[#09090b]/40 transition-all duration-200 flex items-center justify-center gap-2 mt-6 active:scale-[0.99] disabled:opacity-50',
                formFieldAction: 'text-[11px] text-[#006c49] hover:text-[#6ffbbe] hover:underline font-medium',
                footer: 'text-center text-base text-zinc-400 mt-6',
                footerActionLink: 'text-[#006c49] font-semibold hover:underline transition-colors',
                footerActionText: 'text-zinc-400 text-base',
                formFieldRow: 'flex items-center gap-2.5',
                formFieldInputShowPasswordButton: 'text-zinc-400 hover:text-white transition-colors',
                identityPreviewText: 'text-zinc-400',
                identityPreviewEditButton: 'text-[#006c49]',
                alert: 'text-red-400 text-sm',
                formFieldWarningText: 'text-amber-400 text-xs',
                formFieldErrorText: 'text-red-400 text-xs mt-1',
              },
              variables: {
                colorPrimary: '#006c49',
                colorTextOnPrimaryBackground: '#ffffff',
                colorTextSecondary: '#a1a1aa',
              },
            }}
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            fallbackRedirectUrl="/dashboard"
            forceRedirectUrl="/dashboard"
          />
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-white/[0.05] text-xs text-zinc-500 text-center lg:text-left">
          By submitting, I accept PROPATIBOX&apos;s{' '}
          <a href="/privacy-policy" className="text-[#006c49] hover:underline">Terms of Use</a>
          {' '}and{' '}
          <a href="/privacy-policy" className="text-[#006c49] hover:underline">Privacy Policy</a>.
        </div>
      </div>

      {/* Right Panel - Brand Panel + Testimonial */}
      <div className="hidden lg:block lg:flex-1 relative overflow-hidden bg-black">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0, 108, 73,0.18),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(21,101,192,0.16),transparent_55%)]" />
        {/* Gradient Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/30" />

        {/* Institutional Badges */}
        <div className="absolute top-8 right-8 flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-white/[0.12] bg-[#18181b]/80 backdrop-blur-md px-4 py-2">
            <svg className="w-4 h-4 text-[#006c49]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
            </svg>
            <span className="text-[11px] font-semibold tracking-wider text-zinc-200 uppercase">CAC / RC Verified</span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/[0.12] bg-[#18181b]/80 backdrop-blur-md px-4 py-2">
            <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
            </svg>
            <span className="text-[11px] font-semibold tracking-wider text-zinc-200 uppercase">Zero-Omonile Guarantee</span>
          </div>
        </div>

        {/* Floating Testimonial */}
        <div className="absolute bottom-12 left-8 right-8 xl:left-12 xl:right-12 flex flex-col gap-4">
          <div className="flex items-center gap-2.5 rounded-full border border-white/[0.12] bg-[#18181b]/80 backdrop-blur-md px-4 py-2 w-fit">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4edea3] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-200">Over 25,000+ Happy Homeowners</span>
          </div>

          {/* Glassmorphic Card */}
          <div className="bg-black/80 backdrop-blur-xl rounded-2xl p-6 sm:p-7 border border-white/[0.12] shadow-2xl">
            <div className="flex items-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="text-xs text-amber-300 ml-1.5 font-bold">5.0 / 5.0</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Find a place you&apos;ll love living in.</h2>
            <p className="text-zinc-300 text-base leading-relaxed mb-5">
              Join over 25,000+ happy homeowners, institutional investors, and diaspora buyers securing verified, zero-omonile properties across Nigeria.
            </p>
            <div className="flex items-center justify-between border-t border-white/[0.1] pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-teal-400 flex items-center justify-center text-white text-sm font-semibold ring-2 ring-white/10">
                  AO
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Adewale Osinbajo</p>
                  <p className="text-xs text-zinc-400">Landmark Sovereign Trust • Lagos Island</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
