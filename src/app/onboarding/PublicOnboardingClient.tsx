'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type Role = 'landlord' | 'tenant' | 'agent' | 'estate_manager';

const roleOptions: { id: Role; label: string; subtitle: string; Icon: React.ElementType }[] = [
  { id: 'landlord', label: 'Landlord', subtitle: 'I own properties', Icon: null },
  { id: 'tenant', label: 'Tenant', subtitle: "I'm looking for a home", Icon: null },
  { id: 'agent', label: 'Agent', subtitle: 'I help people find homes', Icon: null },
  { id: 'estate_manager', label: 'Estate Manager', subtitle: 'I manage property portfolios', Icon: null }
];

export default function PublicOnboardingClient() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const handleContinue = () => {
    if (!selectedRole) return;
    router.push(`/sign-up?role=${selectedRole}`);
  };

  const getIcon = (role: Role): string => {
    switch (role) {
      case 'landlord':
        return 'home_work';
      case 'tenant':
        return 'person_search';
      case 'agent':
        return 'handshake';
      case 'estate_manager':
        return 'corporate_fare';
      case 'realtor':
        return 'real_estate_agent';
      default:
        return 'person';
    }
  };

  return (
    <div className="min-h-screen bg-background antialiased">
      {/* Minimal header */}
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-extrabold tracking-tight text-primary">
            PROPATI
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
          {/* Top label */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-tertiary-fixed/15 text-on-tertiary-container px-3 py-1 rounded-full mb-4">
              <MaterialIcon name="verified" className="material-symbols-outlined" />
              <span className="text-xs font-medium tracking-wide uppercase">Secure Registration</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-primary mb-3">
              Choose your role
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Join 12,000+ verified users securing their property future today.
            </p>
          </div>

          {/* Role Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {roleOptions.map(({ id, label, subtitle }) => {
              const isSelected = selectedRole === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelectedRole(id)}
                  className={[
                    'relative flex items-start gap-4 rounded-xl border-2 p-5 text-left transition-all duration-200',
                    isSelected
                      ? 'border-secondary-container bg-secondary-container/10 shadow-md'
                      : 'border-border bg-background hover:border-secondary-container/60',
                  ].join(' ')}
                >
                  {isSelected && (
                    <MaterialIcon  className="material-symbols-outlined" />
                  )}
                  <div className="mt-0.5 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <MaterialIcon name={getIcon(id)} className="material-symbols-outlined" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-primary mb-0.5">{label}</p>
                    <p className="text-xs text-muted-foreground leading-snug">{subtitle}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Continue CTA */}
          <div className="flex flex-col items-center gap-4">
            <Button
              size="lg"
              onClick={handleContinue}
              disabled={!selectedRole}
              className="w-full max-w-sm h-12 text-base font-semibold shadow-lg"
            >
              Continue to Registration
            </Button>
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="flex -space-x-2">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAzF5m6JIL0WB8mTjPR_zLUfhfAjdqaCavPCEZ1Hjx6lotIDwyLpXcn8LMOqhBVetQgtWwgtSfyq585w6-MWoJv4MHC64yeMSepmtP_g1GxWIkYdr6HiEqvBj1r-fHq9n-2L0iw3PfAXGMiedmERrp1KxtxtZTkec8ur2HrCIepB20v6pKxgBVrZhfo4tJYFQGR1uOMhIpsI68GOp74wS1Fk0ByALYZBOhH7fvavMZJMNQTQXlobs7hx2i6NwK-AlAvJ9QSFZC05Pw"
                  alt="User"
                  className="w-8 h-8 rounded-full border-2 border-white object-cover"
                />
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBaODuSh1HwqtXK50mjhDdbm7TeasEakvihW4pN5tVVMZ4_TbFT9gbeaFzCuQ0s3QN8buDjJ_xE42xX_MzJ-Tu5jLp-HCe4U_Vdo_LSxGQqlDqdIgEjjzPL5O5NjMDaPwBmhlIwqPXRQ0Jz1ib5E6DmKxUg_T9hoYY6UZZlHbUgL9YhU6Ec0u7wF1_I3nSl8hae2jaAr_F93-aHbk6dwIR4WOKgiFuhkHE_1n1VliKIXULlPEL0xud9Iu0YTx3qJ3xJdaIMO9_IqCI"
                  alt="User"
                  className="w-8 h-8 rounded-full border-2 border-white object-cover"
                />
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5Ml9b9aBblvXv56tJv5rwPP-U0YSg3y3I8cKTaEYR8XWLEeG4547M0C5W2okfelxUBgEmVTY-Lml-rqh037_XUyu180uzWd2vTk5GXIytucZgyjxwJhhX9yYh8PfJ589oPA8o1mBBvoX-pokPvsIg5N3UM2Fnx7D-Pyu_cGM5UNsKr1WP5fKq2l4eMwcJRDx83p5b50Cx4QueDD2ATysCO1r0_ejmsqkC6WL8qMsW29dFioHStKntX3FsMzcnBJftu6s1-YgAo_0"
                  alt="User"
                  className="w-8 h-8 rounded-full border-2 border-white object-cover"
                />
              </div>
              <span className="text-xs font-medium">Join the 12,000+ verified network</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground max-w-xs">
                Nigeria's most trusted property marketplace. Verified listings, secure payments, happy homes.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about-us" className="hover:text-foreground transition-colors">About Us</Link></li>
                <li><Link href="/careers" className="hover:text-foreground transition-colors">Careers</Link></li>
                <li><Link href="/contact-us" className="hover:text-foreground transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy</Link></li>
                <li><Link href="/terms-of-service" className="hover:text-foreground transition-colors">Terms</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/help-center" className="hover:text-foreground transition-colors">Help Center</Link></li>
                <li><Link href="/support" className="hover:text-foreground transition-colors">Support</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t pt-6 text-sm text-muted-foreground">
            © {new Date().getFullYear()} PROPATI. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Material Symbols */}
      <style jsx global>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      `}</style>
    </div>
  );
}
