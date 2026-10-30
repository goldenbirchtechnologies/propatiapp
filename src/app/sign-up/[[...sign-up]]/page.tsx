'use client';

import { useState, useEffect } from 'react';
import { SignUp } from '@clerk/nextjs';
import { ArrowLeft, ArrowRight, Building2, Search, Handshake, Home } from 'lucide-react';

const ROLES = [
  {
    id: 'landlord',
    title: 'Landlord',
    description: 'List & manage properties, track institutional rent and deeds',
    tag: 'Deed Holder',
    icon: <Building2 className="h-5 w-5" />,
  },
  {
    id: 'tenant',
    title: 'Tenant',
    description: 'Find verified homes, schedule tours, execute bonded leases',
    tag: 'Bonded Tenant',
    icon: <Search className="h-5 w-5" />,
  },
  {
    id: 'agent',
    title: 'Agent',
    description: 'LASRERA licensed broker, co-broker deals & earn payouts',
    tag: 'LASRERA Broker',
    icon: <Handshake className="h-5 w-5" />,
  },
  {
    id: 'estate_manager',
    title: 'Estate Manager',
    description: 'Facility operations, service charges & tenant records',
    tag: 'Facility Ops',
    icon: <Home className="h-5 w-5" />,
  },
];

export default function SignUpPage() {
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);

  // Deep links such as /sign-up?role=landlord preselect the role card.
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('role');
    if (requested && ROLES.some((r) => r.id === requested)) {
      setSelectedRole(requested);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center p-4 sm:p-8">
      {/* Ambient Glow */}
      <div className="fixed -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#006c49]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Stepper */}
      <div className="w-full max-w-2xl mb-8">
        <div className="inline-flex items-center gap-2 p-1 rounded-full bg-[#27272a]/20 backdrop-blur-md shadow-sm mx-auto">
          <button
            onClick={() => setStep(1)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
              step === 1 ? 'bg-[#006c49] text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
              step === 1 ? 'bg-white/20 text-white' : 'bg-[#e4e1e6]/20 text-zinc-500'
            }`}>1</span>
            <span>Role Selection</span>
          </button>
          <div className="w-6 h-px bg-zinc-600/30" />
          <button
            onClick={() => selectedRole && setStep(2)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
              step === 2 ? 'bg-[#006c49] text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
              step === 2 ? 'bg-white/20 text-white' : 'bg-[#e4e1e6]/20 text-zinc-500'
            }`}>2</span>
            <span>Account Credentials</span>
          </button>
        </div>
      </div>

      {/* PHASE 1: Role Selection */}
      {step === 1 && (
        <div className="w-full max-w-2xl flex flex-col transition-all duration-300">
          {/* Branding */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#006c49] flex items-center justify-center shadow-lg shadow-[#006c49]/25 transition-transform duration-300 hover:scale-105">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3zm0 2.84L18 11v7h-2v-6H8v6H6v-7l6-5.16z" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight">PropatiBox</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#006c49]/15 text-[#6ffbbe] text-[11px] tracking-wide uppercase">
              <Building2 className="h-3.5 w-3.5" />
              <span>Join PropatiBox</span>
            </div>
            <h1 className="text-3xl font-bold mt-4 tracking-tight">Join as a...</h1>
            <p className="text-zinc-500 max-w-lg mt-2">
              Select your operating capacity to get started with tailored cadastral and transaction features.
            </p>
          </div>

          {/* Role Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {ROLES.map((role) => {
              const isSelected = selectedRole === role.id;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRole(role.id)}
                  className={`group relative flex flex-col p-4 rounded-xl transition-all duration-200 text-left ${
                    isSelected
                      ? 'bg-[#27272a]/25 ring-2 ring-[#006c49]'
                      : 'bg-[#27272a]/10 hover:bg-[#27272a]/20'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 text-[#6ffbbe]">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                    </div>
                  )}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors duration-200 ${
                    isSelected ? 'bg-[#006c49] text-white' : 'bg-[#e4e1e6]/20 text-zinc-500'
                  }`}>
                    {role.icon}
                  </div>
                  <span className="text-sm font-semibold text-white">{role.title}</span>
                  <p className="text-xs text-zinc-500 mt-2 line-clamp-3 leading-relaxed">
                    {role.description}
                  </p>
                  <span className={`mt-auto pt-2 text-[11px] uppercase tracking-wider ${
                    isSelected ? 'text-[#6ffbbe]' : 'text-zinc-500'
                  }`}>
                    {role.tag}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Terms */}
          <div className="flex items-start gap-3 px-1 py-3 mb-4">
            <label className="relative flex items-center cursor-pointer mt-0.5">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="peer sr-only"
              />
              <div className="w-5 h-5 rounded bg-[#27272a]/30 peer-checked:bg-[#006c49] flex items-center justify-center transition-colors">
                <svg className={`w-4 h-4 text-white transition-opacity ${agreed ? 'opacity-100' : 'opacity-0'}`} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
              </div>
            </label>
            <div className="text-xs text-zinc-500 leading-relaxed">
              I agree to the{' '}
              <a href="/terms" className="text-[#6ffbbe] hover:underline font-medium">Terms &amp; Conditions</a>,
              cadastral verification rules, and{' '}
              <a href="/privacy" className="text-[#6ffbbe] hover:underline font-medium">Cookies Policy</a>.
            </div>
          </div>

          {/* Continue Button */}
          <button
            onClick={() => selectedRole && agreed && setStep(2)}
            disabled={!selectedRole || !agreed}
            className="w-full rounded-xl py-4 text-base font-semibold bg-[#006c49] hover:bg-[#005236] text-white transition-all duration-200 shadow-lg shadow-[#006c49]/20 flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue with {selectedRole ? ROLES.find((r) => r.id === selectedRole)?.title : '...'}
            <ArrowRight className="h-5 w-5" />
          </button>

          {/* Sign In Link */}
          <div className="text-center mt-6">
            <p className="text-xs text-zinc-500">
              Already have an account?{' '}
              <a href="/sign-in" className="text-[#6ffbbe] font-medium hover:underline inline-flex items-center gap-0.5">
                Sign in
                <span>→</span>
              </a>
            </p>
          </div>
        </div>
      )}

      {/* PHASE 2: Clerk SignUp — handles social + email + password natively */}
      {step === 2 && (
        <div className="w-full max-w-md flex flex-col transition-all duration-300">
          {/* Back + Role Chip */}
          <div className="flex items-center justify-between mb-6 px-1">
            <button
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Role Selection
            </button>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#006c49]/15 text-[#6ffbbe] text-[11px]">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              Role: {ROLES.find((r) => r.id === selectedRole)?.title}
            </div>
          </div>

          {/* Glass Card with Clerk SignUp */}
          <div className="w-full p-6 sm:p-8 rounded-2xl bg-[#27272a]/15 backdrop-blur-2xl shadow-2xl flex flex-col">
            <div className="text-center mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#006c49] flex items-center justify-center shadow-md mx-auto mb-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3zm0 2.84L18 11v7h-2v-6H8v6H6v-7l6-5.16z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold tracking-tight">Create your account</h2>
              <p className="text-xs text-zinc-500 mt-1">
                Complete enrollment to access your sovereign portal
              </p>
            </div>

            <SignUp
              unsafeMetadata={{ role: selectedRole }}
              appearance={{
                elements: {
                  rootBox: 'w-full',
                  card: 'bg-transparent shadow-none border-none p-0',
                  headerTitle: 'hidden',
                  headerSubtitle: 'hidden',
                  socialButtonsBlockButton: 'flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-[#e4e1e6]/20 hover:bg-[#e4e1e6]/30 text-white text-sm font-semibold transition-colors shadow-sm w-full mb-2',
                  socialButtonsBlockButtonText: 'font-semibold text-sm',
                  dividerLine: 'bg-zinc-600/20 w-full h-px',
                  dividerText: 'bg-[#09090b] px-3 text-[11px] uppercase tracking-wider text-zinc-500',
                  formFieldInput: 'h-10 px-3 rounded-lg bg-[#27272a]/20 text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:bg-[#27272a]/30 transition-all w-full',
                  formFieldLabel: 'text-sm text-white font-medium',
                  formButtonPrimary: 'w-full mt-2 rounded-xl py-3.5 text-base font-semibold bg-[#006c49] hover:bg-[#006c49] text-white transition-all duration-200 shadow-lg shadow-[#006c49]/20 flex items-center justify-center gap-2 active:scale-[0.99]',
                  formFieldAction: 'text-[#6ffbbe] text-xs hover:underline',
                  footer: 'hidden',
                },
                variables: {
                  colorPrimary: '#006c49',
                  colorTextOnPrimaryBackground: '#ffffff',
                },
              }}
              routing="path"
              path="/sign-up"
              signInUrl="/sign-in"
              fallbackRedirectUrl="/onboarding"
              forceRedirectUrl="/onboarding"
            />

            {/* Verification Tip */}
            <div className="p-3 rounded-lg bg-[#e4e1e6]/15 flex items-start gap-2 mt-4">
              <svg className="w-4 h-4 text-[#6ffbbe] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
              </svg>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Identity verification follows step 2. Have your CAC number or NIN handy for instant cadastral binding.
              </p>
            </div>
          </div>

          {/* Trust Footer */}
          <div className="mt-4 p-3 rounded-xl bg-[#27272a]/10 flex items-center justify-center gap-4 text-center">
            <div className="flex items-center gap-1 text-xs text-zinc-500">
              <svg className="w-3.5 h-3.5 text-[#6ffbbe]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
              </svg>
              256-Bit SSL
            </div>
            <div className="w-1 h-1 rounded-full bg-zinc-600/40" />
            <div className="flex items-center gap-1 text-xs text-zinc-500">
              <svg className="w-3.5 h-3.5 text-[#6ffbbe]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
              </svg>
              LASRERA Bonded Gateway
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
