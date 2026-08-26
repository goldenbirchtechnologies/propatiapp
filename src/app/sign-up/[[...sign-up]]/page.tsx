'use client';

import { useState, useEffect } from 'react';
import { SignUp, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, Search, Building, Handshake, CheckCircle2 } from 'lucide-react';
import { SectionLabel } from '@/components/ui/section-label';

type Role = 'landlord' | 'tenant' | 'agent' | 'estate_manager';

const roles: {
  id: Role;
  label: string;
  subtitle: string;
  Icon: React.ElementType;
}[] = [
  { id: 'landlord', label: 'Landlord', subtitle: 'I own properties', Icon: Building2 },
  { id: 'tenant', label: 'Tenant', subtitle: "I'm looking for a home", Icon: Search },
  { id: 'agent', label: 'Agent', subtitle: 'I help people find homes', Icon: Handshake },
  { id: 'estate_manager', label: 'Estate Manager', subtitle: 'I manage property portfolios', Icon: Building },
];

export default function SignUpPage() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showClerk, setShowClerk] = useState(false);
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace('/dashboard');
    }
  }, [isLoaded, isSignedIn, router]);

  function handleContinue() {
    if (!selectedRole) return;
    sessionStorage.setItem('propati_pending_role', selectedRole);
    setShowClerk(true);
  }

  if (showClerk) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="flex justify-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#10b981] flex items-center justify-center">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <span className="text-white font-bold text-lg">PROPATI</span>
            </Link>
          </div>

          <div className="glass-card p-8">
            <SignUp
              appearance={{
                elements: {
                  formButtonPrimary: 'bg-[#10b981] hover:bg-[#10b981]/90 text-white font-semibold rounded-lg',
                  card: 'shadow-none border-0 bg-transparent',
                  headerTitle: 'font-bold text-xl text-white',
                  headerSubtitle: 'text-zinc-400',
                },
              }}
              routing="path"
              path="/sign-up"
              redirectUrl="/onboarding"
              fallbackRedirectUrl="/onboarding"
              unsafeMetadata={{ role: selectedRole }}
            />
          </div>

          <p className="text-center text-sm mt-6 text-zinc-500">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-[#10b981] hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="flex justify-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#10b981] flex items-center justify-center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <span className="text-white font-bold text-lg">PROPATI</span>
          </Link>
        </div>

        <div className="text-center mb-10">
          <SectionLabel>
            <Building2 size={11} className="text-emerald-400" />
            Join PROPATI
          </SectionLabel>
          <h1 className="text-3xl font-bold text-white mt-4 mb-2">Join as a...</h1>
          <p className="text-zinc-500 text-base">Select your role to get started</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {roles.map(({ id, label, subtitle, Icon }) => {
            const isSelected = selectedRole === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedRole(id)}
                className={[
                  'relative flex flex-col items-center gap-3 rounded-2xl border p-5 text-center transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
                  isSelected
                    ? 'border-emerald-500 bg-emerald-500/10 shadow-none'
                    : 'border-white/[0.08] bg-zinc-950 hover:border-emerald-500/40',
                ].join(' ')}
              >
                {isSelected && (
                  <CheckCircle2 size={18} className="absolute top-3 right-3 text-emerald-400" />
                )}
                <div
                  className={[
                    'flex h-14 w-14 items-center justify-center rounded-xl transition-colors',
                    isSelected
                      ? 'bg-emerald-500 text-white'
                      : 'bg-zinc-900 text-zinc-500',
                  ].join(' ')}
                >
                  <Icon size={28} />
                </div>
                <div>
                  <p className={['font-semibold text-sm', isSelected ? 'text-emerald-400' : 'text-white'].join(' ')}>
                    {label}
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5 leading-snug">{subtitle}</p>
                </div>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleContinue}
          disabled={!selectedRole}
          className={[
            'w-full rounded-xl py-4 text-base font-semibold transition-all duration-200',
            selectedRole
              ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-none hover:shadow-none'
              : 'bg-zinc-900 text-zinc-600 cursor-not-allowed',
          ].join(' ')}
        >
          Continue
        </button>

        <p className="text-center text-sm mt-6 text-zinc-500">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-emerald-400 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
