'use client';

import { SignIn } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
import { AuthCard, AuthFrame } from '@/components/auth/AuthExperience';

export default function SignInPage() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url') || '/dashboard';

  return <AuthFrame>
    <AuthCard>
      <SignIn
        appearance={{
          elements: {
            rootBox: 'w-full', card: 'w-full max-w-none bg-transparent shadow-none border-none p-0',
            headerTitle: 'text-[2rem] leading-tight font-semibold text-[#16251f] tracking-[-0.04em] mb-2', headerSubtitle: 'text-[#607168] text-base leading-6 mb-8',
            socialButtonsBlockButton: 'h-12 rounded-lg bg-[#fbfdfb] hover:bg-[#f5faf7] border border-[#d8e4dd] text-sm font-semibold text-[#1b2c24] transition-all mb-3 flex items-center justify-center gap-3 w-full shadow-none', socialButtonsBlockButtonText: 'font-semibold text-sm',
            dividerLine: 'bg-[#dce7e1]', dividerText: 'bg-white px-3 text-[11px] uppercase tracking-wider text-[#718079] font-semibold',
            formFieldInput: 'h-12 rounded-lg bg-[#fbfdfb] border border-[#d8e4dd] text-[#1b2c24] text-base placeholder:text-[#9aa9a1] focus:outline-none focus:ring-2 focus:ring-[#006c49]/20 focus:border-[#006c49] transition-all w-full px-4', formFieldLabel: 'block text-xs uppercase tracking-[0.12em] text-[#50645a] mb-2 font-semibold',
            formButtonPrimary: 'w-full h-12 rounded-lg bg-[#006c49] hover:bg-[#005539] text-white text-sm font-semibold shadow-none transition-all duration-200 flex items-center justify-center gap-2 mt-6 active:scale-[0.99] disabled:opacity-50', formFieldAction: 'text-xs text-[#006c49] hover:underline font-medium',
            footer: 'text-center text-sm text-[#607168] mt-6', footerActionLink: 'text-[#006c49] font-semibold hover:underline transition-colors', footerActionText: 'text-[#607168] text-sm', formFieldInputShowPasswordButton: 'text-[#718079] hover:text-[#1b2c24] transition-colors', identityPreviewText: 'text-[#607168]', identityPreviewEditButton: 'text-[#006c49]', alert: 'text-red-700 text-sm', formFieldWarningText: 'text-amber-700 text-xs', formFieldErrorText: 'text-red-700 text-xs mt-1',
          },
          variables: { colorPrimary: '#006c49', colorTextOnPrimaryBackground: '#ffffff', colorText: '#16251f', colorTextSecondary: '#607168', colorBackground: '#ffffff' },
        }}
        routing="path" path="/sign-in" signUpUrl={`/sign-up?redirect_url=${encodeURIComponent(redirectUrl)}`} fallbackRedirectUrl={redirectUrl} forceRedirectUrl={redirectUrl}
      />
    </AuthCard>
  </AuthFrame>;
}
