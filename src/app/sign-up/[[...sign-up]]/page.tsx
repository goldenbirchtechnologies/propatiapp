import Link from 'next/link';
import { SignUp } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Building2, Search, Building, CheckCircle2, Handshake } from 'lucide-react';

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

export default async function SignUpPage() {
  const { userId } = await auth();
  if (userId) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-3xl font-bold tracking-tight text-primary">PROPATI</span>
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">Join as a...</h1>
          <p className="text-muted-foreground text-base">Select your role to get started</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {roles.map(({ id, label, subtitle, Icon }) => (
            <div
              key={id}
              className="relative flex flex-col items-center gap-3 rounded-2xl border-2 border-border bg-card p-5 text-center"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Icon size={28} />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{subtitle}</p>
              </div>
            </div>
          ))}
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
        />

        <p className="text-center text-sm mt-6 text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
