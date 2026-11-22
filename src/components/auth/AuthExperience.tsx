'use client';

import type { ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Building2, Check, House, Handshake, Search, ShieldCheck } from 'lucide-react';
import { StitchFooter, StitchHeader } from '@/components/layout/stitch-layout';

export const AUTH_ROLES = [
  { id: 'landlord', title: 'Landlord', description: 'List properties, manage tenants and oversee your rentals, sales and shortlet stays.', icon: Building2 },
  { id: 'tenant', title: 'Tenant', description: 'Find a home, manage your tenancy and book shortlet accommodation.', icon: Search },
  { id: 'agent', title: 'Agent', description: 'Represent clients, list properties, manage enquiries and handle property transactions.', icon: Handshake },
  { id: 'estate_manager', title: 'Estate Manager', description: 'Manage property portfolios, owners, tenants, maintenance and rental operations.', icon: House },
] as const;

export type AuthRole = (typeof AUTH_ROLES)[number]['id'];

export function AuthLogo({ compact = false }: { compact?: boolean }) {
  return <img src="/brand/propatibox-logo.svg" alt="Propatibox" className={compact ? 'h-8 w-auto' : 'h-9 w-auto'} />;
}

export function AuthShowcase({ signUp = false }: { signUp?: boolean }) {
  return <aside className="relative hidden min-h-[100dvh] overflow-hidden bg-[#07251b] text-white lg:flex lg:w-[44%] lg:flex-col lg:justify-between lg:p-10 xl:p-14">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_86%_12%,rgba(91,222,166,.28),transparent_30%),linear-gradient(135deg,#0a3b2b_0%,#07251b_58%,#041711_100%)]" />
    <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:44px_44px]" />
    <div className="relative z-10 flex items-center justify-between gap-4"><div className="rounded-xl bg-white px-3 py-2"><AuthLogo compact /></div><div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs text-white/75 backdrop-blur-sm"><ShieldCheck className="h-4 w-4 text-[#8ff2c2]" /> Built for property journeys</div></div>
    <div className="relative z-10 max-w-xl py-12"><p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-[#8ff2c2]">Property, made clearer</p><h2 className="max-w-[11ch] text-4xl font-semibold leading-[1.04] tracking-[-0.045em] xl:text-6xl">Every property journey. One place.</h2><p className="mt-6 max-w-lg text-base leading-7 text-white/70">{signUp ? 'Buy, rent, list, manage or book shortlet accommodation with Propatibox.' : 'Find your next home, discover property opportunities, list with confidence and keep your property affairs organised with Propatibox.'}</p><div className="mt-10 grid max-w-md grid-cols-2 gap-x-8 gap-y-5 border-t border-white/15 pt-6 text-sm text-white/80">{['Discover properties', 'Buy and rent', 'Book shortlets', 'List and manage'].map((item) => <div key={item} className="flex items-center gap-2"><span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#8ff2c2]/15 text-[#8ff2c2]"><Check className="h-3 w-3" /></span>{item}</div>)}</div></div>
    <div className="relative z-10 overflow-hidden rounded-2xl border border-white/15 bg-white/10 shadow-2xl backdrop-blur-sm"><img src="/images/stitch-tenant-my-home.png" alt="Propatibox home management view" className="h-44 w-full object-cover object-top opacity-90 xl:h-52" /><div className="flex items-center justify-between px-5 py-4 text-xs text-white/65"><span>One account for your property life</span><span className="text-[#8ff2c2]">Propatibox</span></div></div>
  </aside>;
}

export function AuthFrame({ children, signUp = false }: { children: ReactNode; signUp?: boolean }) {
  return <div className="app-layout theme-landing flex min-h-[100dvh] w-full flex-col overflow-x-hidden bg-background text-foreground"><StitchHeader /><main id="main-content" className="flex-1 bg-[#f7faf8] pt-[4.5rem] text-[#16251f]"><div className="grid min-h-[calc(100dvh-4.5rem)] w-full lg:grid-cols-[56%_44%]"><section className="flex min-h-full min-w-0 flex-col px-4 py-7 sm:px-8 sm:py-10 lg:px-12 xl:px-16"><div className="flex shrink-0 items-center justify-end"><p className="text-right text-sm text-[#50645a]">{signUp ? 'Already have an account?' : "Don't have an account?"}{' '}<a href={signUp ? '/sign-in' : '/sign-up'} className="font-semibold text-[#006c49] transition-colors hover:text-[#00422b] hover:underline">{signUp ? 'Sign in' : 'Sign up'}</a></p></div><div className="flex min-h-0 flex-1 items-center justify-center py-8 sm:py-10"><div className="w-full max-w-[480px] min-w-0">{children}</div></div><p className="shrink-0 pt-4 text-xs leading-5 text-[#718079]">By continuing, you agree to Propatibox&apos;s <a href="/terms-of-agreement" className="text-[#006c49] hover:underline">Terms &amp; Conditions</a> and <a href="/privacy-policy" className="text-[#006c49] hover:underline">Privacy Policy</a>.</p></section><AuthShowcase signUp={signUp} /></div></main><StitchFooter /></div>;
}

export function AuthCard({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl border border-[#d8e4dd] bg-white p-5 shadow-[0_18px_48px_rgba(16,59,39,.08)] sm:p-7">{children}</div>;
}

export function AuthProgress({ step, onStepOne }: { step: 1 | 2; onStepOne: () => void }) {
  return <div className="mb-7 flex items-center gap-2 text-xs sm:gap-3 sm:text-sm"><button type="button" onClick={onStepOne} className={`flex min-w-0 items-center gap-2 ${step === 1 ? 'font-semibold text-[#006c49]' : 'text-[#718079]'}`}><span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[11px] ${step === 1 ? 'border-[#006c49] bg-[#006c49] text-white' : 'border-[#c9d8d0]'}`}>{step === 1 ? '1' : <Check className="h-3 w-3" />}</span><span className="truncate">Choose your account type</span></button><span className="h-px min-w-4 flex-1 bg-[#dce7e1]" /><span className={`flex shrink-0 items-center gap-2 ${step === 2 ? 'font-semibold text-[#006c49]' : 'text-[#718079]'}`}><span className={`grid h-6 w-6 place-items-center rounded-full border text-[11px] ${step === 2 ? 'border-[#006c49] bg-[#006c49] text-white' : 'border-[#c9d8d0]'}`}>2</span><span className="hidden sm:inline">Create your account</span><span className="sm:hidden">Create account</span></span></div>;
}

export function RoleCard({ role, selected, onSelect }: { role: (typeof AUTH_ROLES)[number]; selected: boolean; onSelect: () => void }) {
  const Icon = role.icon;
  return <button type="button" onClick={onSelect} aria-pressed={selected} className={`relative flex min-h-[154px] min-w-0 flex-col rounded-xl border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] focus-visible:ring-offset-2 ${selected ? 'border-[#006c49] bg-[#eaf7f0] shadow-[0_0_0_1px_#006c49]' : 'border-[#d8e4dd] bg-white hover:-translate-y-0.5 hover:border-[#8fbaa5] hover:shadow-[0_10px_24px_rgba(0,50,30,.07)]'}`}><span className={`mb-5 grid h-9 w-9 place-items-center rounded-lg ${selected ? 'bg-[#006c49] text-white' : 'bg-[#edf4ef] text-[#006c49]'}`}><Icon className="h-4 w-4" /></span><span className="pr-7 text-[15px] font-semibold text-[#1b2c24]">{role.title}</span><span className="mt-1.5 text-[13px] leading-5 text-[#607168]">{role.description}</span>{selected && <span className="absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full bg-[#006c49] text-white"><Check className="h-3 w-3" /></span>}</button>;
}

export function ContinueButton({ children, disabled, onClick }: { children: ReactNode; disabled?: boolean; onClick?: () => void }) {
  return <button type="button" onClick={onClick} disabled={disabled} className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#006c49] px-5 text-sm font-semibold text-white transition-all hover:bg-[#005539] active:scale-[.99] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006c49] focus-visible:ring-offset-2">{children}<ArrowRight className="h-4 w-4" /></button>;
}

export function BackButton({ onClick }: { onClick: () => void }) {
  return <button type="button" onClick={onClick} className="inline-flex items-center gap-2 text-sm text-[#607168] hover:text-[#006c49]"><ArrowLeft className="h-4 w-4" /> Back to account type</button>;
}
