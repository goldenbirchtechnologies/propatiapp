'use client';

import { useEffect, useState } from 'react';
import { SignUp } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
import { AuthFrame, AuthProgress, AUTH_ROLES, BackButton, ContinueButton, RoleCard, type AuthRole } from '@/components/auth/AuthExperience';

export default function SignUpPage() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url') || '/onboarding';
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedRole, setSelectedRole] = useState<AuthRole | null>(null);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('role') as AuthRole | null;
    if (requested && AUTH_ROLES.some((role) => role.id === requested)) setSelectedRole(requested);
  }, []);

  const role = AUTH_ROLES.find((item) => item.id === selectedRole);

  return <AuthFrame signUp>
    <AuthProgress step={step} onStepOne={() => setStep(1)} />
    {step === 1 ? <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#006c49]">Create your place in the ecosystem</p>
      <h1 className="text-[2rem] font-semibold leading-tight tracking-[-0.04em] text-[#16251f]">Choose your account type.</h1>
      <p className="mt-3 max-w-[40rem] text-base leading-6 text-[#607168]">Select how you intend to use PropatiBox. Whether you&apos;re finding a home, managing properties or listing accommodation, we&apos;ll help you get started with the right tools.</p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">{AUTH_ROLES.map((item) => <RoleCard key={item.id} role={item} selected={selectedRole === item.id} onSelect={() => setSelectedRole(item.id)} />)}</div>
      <label className="mt-7 flex cursor-pointer items-start gap-3 text-sm leading-5 text-[#607168]"><input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} className="mt-1 h-4 w-4 accent-[#006c49]" /><span>I agree to the <a href="/terms-of-agreement" className="font-medium text-[#006c49] hover:underline">Terms &amp; Conditions</a>, <a href="/privacy-policy" className="font-medium text-[#006c49] hover:underline">Privacy Policy</a> and <a href="/cookies" className="font-medium text-[#006c49] hover:underline">Cookie Policy</a>.</span></label>
      <div className="mt-7"><ContinueButton disabled={!selectedRole || !agreed} onClick={() => selectedRole && agreed && setStep(2)}>Continue with {role?.title ?? 'your account'}</ContinueButton></div>
    </div> : <div>
      <BackButton onClick={() => setStep(1)} />
      <div className="mt-8"><p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#006c49]">Step 2 of 2</p><h1 className="text-[2rem] font-semibold leading-tight tracking-[-0.04em] text-[#16251f]">Create your PropatiBox account.</h1><p className="mt-3 text-base leading-6 text-[#607168]">You&apos;re one step closer to managing your property journey.</p><p className="mt-5 inline-flex rounded-full bg-[#eaf7f0] px-3 py-1.5 text-xs font-medium text-[#006c49]">Creating account as {role?.title}</p></div>
      <div className="mt-7"><SignUp appearance={{ elements: { rootBox: 'w-full', card: 'w-full max-w-none bg-transparent shadow-none border-none p-0', headerTitle: 'hidden', headerSubtitle: 'hidden', socialButtonsBlockButton: 'h-12 rounded-lg bg-white hover:bg-[#f5faf7] border border-[#d8e4dd] text-sm font-semibold text-[#1b2c24] transition-all mb-3 flex items-center justify-center gap-3 w-full shadow-none', socialButtonsBlockButtonText: 'font-semibold text-sm', dividerLine: 'bg-[#dce7e1]', dividerText: 'bg-[#f7faf8] px-3 text-[11px] uppercase tracking-wider text-[#718079] font-semibold', formFieldInput: 'h-12 rounded-lg bg-white border border-[#d8e4dd] text-[#1b2c24] text-base placeholder:text-[#9aa9a1] focus:outline-none focus:ring-2 focus:ring-[#006c49]/20 focus:border-[#006c49] transition-all w-full px-4', formFieldLabel: 'block text-xs uppercase tracking-[0.12em] text-[#50645a] mb-2 font-semibold', formButtonPrimary: 'w-full h-12 rounded-lg bg-[#006c49] hover:bg-[#005539] text-white text-sm font-semibold shadow-none transition-all duration-200 flex items-center justify-center gap-2 mt-6 active:scale-[0.99] disabled:opacity-50', formFieldAction: 'text-xs text-[#006c49] hover:underline font-medium', footer: 'hidden', formFieldErrorText: 'text-red-700 text-xs mt-1', alert: 'text-red-700 text-sm' }, variables: { colorPrimary: '#006c49', colorTextOnPrimaryBackground: '#ffffff', colorText: '#16251f', colorTextSecondary: '#607168', colorBackground: '#ffffff' } }} routing="path" path="/sign-up" signInUrl={`/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`} fallbackRedirectUrl={redirectUrl} forceRedirectUrl={`${redirectUrl}${redirectUrl.includes('?') ? '&' : '?'}role=${encodeURIComponent(selectedRole ?? 'tenant')}`} /></div>
    </div>}
  </AuthFrame>;
}
