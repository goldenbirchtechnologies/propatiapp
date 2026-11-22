'use client';

import { SignIn } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
import { AuthCard, AuthFrame } from '@/components/auth/AuthExperience';
import { useTheme } from '@/components/providers/ThemeProvider';

export default function SignInPage() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url') || '/dashboard';
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return <AuthFrame>
    <AuthCard>
      <SignIn
        appearance={{
          elements: {
            rootBox: 'w-full', card: 'w-full max-w-none bg-transparent shadow-none border-none p-0',
            headerTitle: 'text-[2rem] leading-tight font-semibold text-[#16251f] dark:text-[#eef7f1] tracking-[-0.04em] mb-2', headerSubtitle: 'text-[#607168] dark:text-[#a8beb0] text-base leading-6 mb-8',
            socialButtonsBlockButton: 'h-12 rounded-lg bg-[#fbfdfb] hover:bg-[#f5faf7] dark:bg-[#172d22] dark:hover:bg-[#1d392b] border border-[#d8e4dd] dark:border-[#315440] text-sm font-semibold text-[#1b2c24] dark:text-[#eef7f1] transition-all mb-3 flex items-center justify-center gap-3 w-full shadow-none', socialButtonsBlockButtonText: 'font-semibold text-sm',
            dividerLine: 'bg-[#dce7e1] dark:bg-[#315440]', dividerText: 'bg-white dark:bg-[#11231a] px-3 text-[11px] uppercase tracking-wider text-[#718079] dark:text-[#91a99a] font-semibold',
            formFieldInput: 'h-12 rounded-lg bg-[#fbfdfb] dark:bg-[#172d22] border border-[#d8e4dd] dark:border-[#315440] text-[#1b2c24] dark:text-[#eef7f1] text-base placeholder:text-[#9aa9a1] dark:placeholder:text-[#769184] focus:outline-none focus:ring-2 focus:ring-[#006c49]/20 focus:border-[#006c49] transition-all w-full px-4', formFieldLabel: 'block text-xs uppercase tracking-[0.12em] text-[#50645a] dark:text-[#a8beb0] mb-2 font-semibold',
            formButtonPrimary: 'w-full h-12 rounded-lg bg-[#006c49] hover:bg-[#005539] text-white text-sm font-semibold shadow-none transition-all duration-200 flex items-center justify-center gap-2 mt-6 active:scale-[0.99] disabled:opacity-50', formFieldAction: 'text-xs text-[#006c49] hover:underline font-medium',
            footer: 'text-center text-sm text-[#607168] dark:text-[#a8beb0] mt-6', footerActionLink: 'text-[#006c49] dark:text-[#8ff2c2] font-semibold hover:underline transition-colors', footerActionText: 'text-[#607168] dark:text-[#a8beb0] text-sm', formFieldInputShowPasswordButton: 'text-[#718079] dark:text-[#91a99a] hover:text-[#1b2c24] dark:hover:text-white transition-colors', identityPreviewText: 'text-[#607168] dark:text-[#a8beb0]', identityPreviewEditButton: 'text-[#006c49] dark:text-[#8ff2c2]', alert: 'text-red-700 dark:text-red-300 text-sm', formFieldWarningText: 'text-amber-700 dark:text-amber-300 text-xs', formFieldErrorText: 'text-red-700 dark:text-red-300 text-xs mt-1',
          },
          variables: { colorPrimary: '#006c49', colorTextOnPrimaryBackground: '#ffffff', colorText: isDark ? '#eef7f1' : '#16251f', colorTextSecondary: isDark ? '#a8beb0' : '#607168', colorBackground: isDark ? '#11231a' : '#ffffff' },
        }}
        routing="path" path="/sign-in" signUpUrl={`/sign-up?redirect_url=${encodeURIComponent(redirectUrl)}`} fallbackRedirectUrl={redirectUrl} forceRedirectUrl={redirectUrl}
      />
    </AuthCard>
  </AuthFrame>;
}
