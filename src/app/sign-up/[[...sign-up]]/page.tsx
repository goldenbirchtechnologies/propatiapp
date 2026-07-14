'use client';

import { useState } from 'react';
import { SignUp } from '@clerk/nextjs';
import Link from 'next/link';
import { Building2, Search, Handshake, Building, CheckCircle2 } from 'lucide-react';

type Role = 'landlord' | 'tenant' | 'agent' | 'estate_manager';

const roles: {
  id: Role;
  label: string;
  subtitle: string;
  Icon: React.ElementType;
}[] = [
  {
    id: 'landlord',
    label: 'Landlord',
    subtitle: 'I own properties',
    Icon: Building2,
  },
  {
    id: 'tenant',
    label: 'Tenant',
    subtitle: "I'm looking for a home",
    Icon: Search,
  },
  {
    id: 'agent',
    label: 'Agent',
    subtitle: 'I help people find homes',
    Icon: Handshake,
  },
  {
    id: 'estate_manager',
    label: 'Estate Manager',
    subtitle: 'I manage property portfolios',
    Icon: Building,
  },
  {
    id: 'realtor',
    label: 'Realtor',
    subtitle: 'I buy and sell properties',
    Icon: Handshake,
  },
];

export default function SignUpPage() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showClerk, setShowClerk] = useState(false);

  function handleContinue() {
    if (!selectedRole) return;
    sessionStorage.setItem('propati_pending_role', selectedRole);
    setShowClerk(true);
  }

  if (showClerk) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <span className="text-3xl font-bold tracking-tight text-primary">
                PROPATI
              </span>
            </Link>
          </div>
          <SignUp
            appearance={{
              elements: {
                formButtonPrimary: 'btn-primary',
                card: 'shadow-lg border border-border rounded-xl p-6',
                headerTitle: 'font-bold text-xl text-foreground',
                headerSubtitle: 'text-muted-foreground',
              },
            }}
            routing="path"
            path="/sign-up"
            fallbackRedirectUrl="/onboarding"
            unsafeMetadata={{
              role: selectedRole,
            }}
          />
          <p className="text-center text-sm mt-6 text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-3xl font-bold tracking-tight text-primary">
              PROPATI
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">Join as a...</h1>
          <p className="text-muted-foreground text-base">
            Select your role to get started
          </p>
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
                  'relative flex flex-col items-center gap-3 rounded-2xl border-2 p-5 text-center transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-border bg-card hover:border-primary/40 hover:shadow-sm',
                ].join(' ')}
              >
                {isSelected && (
                  <CheckCircle2
                    size={18}
                    className="absolute top-3 right-3 text-primary"
                  />
                )}
                <div
                  className={[
                    'flex h-14 w-14 items-center justify-center rounded-xl transition-colors',
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground',
                  ].join(' ')}
                >
                  <Icon size={28} />
                </div>
                <div>
                  <p
                    className={[
                      'font-semibold text-sm',
                      isSelected ? 'text-primary' : 'text-foreground',
                    ].join(' ')}
                  >
                    {label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                    {subtitle}
                  </p>
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
              ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg'
              : 'bg-muted text-muted-foreground cursor-not-allowed',
          ].join(' ')}
        >
          Continue
        </button>

        <p className="text-center text-sm mt-6 text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
