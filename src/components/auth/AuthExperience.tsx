'use client';

import type { ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Building2, Check, House, Handshake, Search, ShieldCheck } from 'lucide-react';

export const AUTH_ROLES = [
  { id: 'landlord', title: 'Landlord', description: 'List and manage your properties for sale, long-term rent and shortlet stays.', icon: Building2 },
  { id: 'tenant', title: 'Tenant', description: 'Find homes to rent, discover shortlet accommodation and manage your reservations.', icon: Search },
  { id: 'agent', title: 'Agent', description: 'Represent clients, list properties and manage sales, rentals and shortlet enquiries.', icon: Handshake },
  { id: 'estate_manager', title: 'Estate Manager', description: 'Manage property portfolios, tenants, maintenance and shortlet operations.', icon: House },
] as const;

export type AuthRole = (typeof AUTH_ROLES)[number]['id'];

export function AuthLogo({ compact = false }: { compact?: boolean }) {
  return <img src="/brand/propatibox-logo.svg" alt="PropatiBox" className={compact ? 'h-8 w-auto' : 'h-9 w-auto'} />;
}

export function AuthShowcase({ signUp = false }: { signUp?: boolean }) {
  return (
    <aside className="relative hidden min-h-[100dvh] overflow-hidden bg-[#07251b] text-white lg:flex lg:w-[53%] lg:flex-col lg:justify-between lg:p-10 xl:p-14">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_86%_12%,rgba(91,222,166,.28),transparent_30%),linear-gradient(135deg,#0a3b2b_0%,#07251b_58%,#041711_100%)]" />
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:44px_44px]" />
      <div className="relative z-10 flex items-start justify-between">
        <div className="rounded-xl bg-white px-3 py-2"><AuthLogo compact /></div>
        <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-2 text-xs text-white/75 backdrop-blur-sm">
          <ShieldCheck className="h-4 w-4 text-[#8ff2c2]" /> Built for property journeys
        </div>
      </div>

      <div className="relative z-10 max-w-xl py-12">
        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-[#8ff2c2]">Property, made clearer</p>
        <h2 className="max-w-[11ch] text-4xl font-semibold leading-[1.04] tracking-[-0.045em] xl:text-6xl">Every property journey. One place.</h2>
        <p className="mt-6 max-w-lg text-base leading-7 text-white/70">{signUp ? 'Buy, rent, list, manage or book shortlet accommodation with PropatiBox.' : 'Find your next home, discover property opportunities, list with confidence and keep your property affairs organised with PropatiBox.'}</p>

        <div className="mt-10 grid max-w-md grid-cols-2 gap-x-8 gap-y-5 border-t border-white/15 pt-6 text-sm text-white/80">
          {['Discover properties', 'Buy and rent', 'Book shortlets', 'List and manage'].map((item) => <div key={item} className="flex items-center gap-2"><span className="grid h-5 w-5 place-items-center rounded-full bg-[#8ff2c2]/15 text-[#8ff2c2]"><Check className="h-3 w-3" /></span>{item}</div>)}
        </div>
      </div>

      <div className="relative z-10 overflow-hidden rounded-2xl border border-white/15 bg-white/10 shadow-2xl backdrop-blur-sm">
        <img src="/images/stitch-tenant-my-home.png" alt="PropatiBox home management view" className="h-44 w-full object-cover object-top opacity-90 xl:h-52" />
        <div className="flex items-center justify-between px-5 py-4 text-xs text-white/65"><span>One account for your property life</span><span className="text-[#8ff2c2]">PropatiBox</span></div>
      </div>
    </aside>
  );
}

export function AuthFrame({ children, signUp = false }: { children: ReactNode; signUp?: boolean }) {
  return <main className="min-h-[100dvh] bg-[#f7faf8] text-[#16251f]"><div className="grid min-h-[100dvh] lg:grid-cols-[47%_53%]"><section className="flex min-h-[100dvh] flex-col px-5 py-6 sm:px-10 sm:py-8 xl:px-16"><header className="flex items-center justify-between"><AuthLogo /><a href={signUp ? '/sign-in' : '/sign-up'} className="text-sm text-[#50645a] transition-colors hover:text-[#006c49]">{signUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}</a></header><div className="flex flex-1 items-center justify-center py-10"><div className="w-full max-w-[440px]">{children}</div></div><footer className="border-t border-[#dce7e1] pt-4 text-xs leading-5 text-[#718079]">By continuing, you agree to PropatiBox&apos;s <a href="/terms-of-agreement" className="text-[#006c49] hover:underline">Terms &amp; Conditions</a> and <a href="/privacy-policy" className="text-[#006c49] hover:underline">Privacy Policy</a>.</footer></section><AuthShowcase signUp={signUp} /></div></main>;
}

export function AuthProgress({ step, onStepOne }: { step: 1 | 2; onStepOne: () => void }) {
  return <div className="mb-9 flex items-center gap-3 text-sm"><button type="button" onClick={onStepOne} className={`flex items-center gap-2 ${step === 1 ? 'font-semibold text-[#006c49]' : 'text-[#718079]'}`}><span className={`grid h-7 w-7 place-items-center rounded-full border text-xs ${step === 1 ? 'border-[#006c49] bg-[#006c49] text-white' : 'border-[#c9d8d0]'}`}>{step === 1 ? '1' : <Check className="h-3.5 w-3.5" />}</span>Choose your account type</button><span className="h-px flex-1 bg-[#dce7e1]" /><span className={`flex items-center gap-2 ${step === 2 ? 'font-semibold text-[#006c49]' : 'text-[#718079]'}`}><span className={`grid h-7 w-7 place-items-center rounded-full border text-xs ${step === 2 ? 'border-[#006c49] bg-[#006c49] text-white' : 'border-[#c9d8d0]'}`}>2</span>Create your account</span></div>;
}

export function RoleCard({ role, selected, onSelect }: { role: (typeof AUTH_ROLES)[number]; selected: boolean; onSelect: () => void }) {
  const Icon = role.icon;
  return <button type="button" onClick={onSelect} aria-pressed={selected} className={`relative flex min-h-[176px] flex-col rounded-xl border p-5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] focus-visible:ring-offset-2 ${selected ? 'border-[#006c49] bg-[#eaf7f0] shadow-[0_0_0_1px_#006c49]' : 'border-[#d8e4dd] bg-white hover:-translate-y-0.5 hover:border-[#8fbaa5] hover:shadow-[0_10px_24px_rgba(0,50,30,.07)]'}`}><span className={`mb-6 grid h-10 w-10 place-items-center rounded-lg ${selected ? 'bg-[#006c49] text-white' : 'bg-[#edf4ef] text-[#006c49]'}`}><Icon className="h-5 w-5" /></span><span className="pr-6 text-[15px] font-semibold text-[#1b2c24]">{role.title}</span><span className="mt-2 text-sm leading-5 text-[#607168]">{role.description}</span>{selected && <span className="absolute right-4 top-4 grid h-6 w-6 place-items-center rounded-full bg-[#006c49] text-white"><Check className="h-3.5 w-3.5" /></span>}</button>;
}

export function ContinueButton({ children, disabled, onClick }: { children: ReactNode; disabled?: boolean; onClick?: () => void }) {
  return <button type="button" onClick={onClick} disabled={disabled} className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#006c49] px-5 text-sm font-semibold text-white transition-all hover:bg-[#005539] active:scale-[.99] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] focus-visible:ring-offset-2">{children}<ArrowRight className="h-4 w-4" /></button>;
}

export function BackButton({ onClick }: { onClick: () => void }) {
  return <button type="button" onClick={onClick} className="inline-flex items-center gap-2 text-sm text-[#607168] hover:text-[#006c49]"><ArrowLeft className="h-4 w-4" /> Back to account type</button>;
}
