import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './styles/globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from '@/components/ui/toaster';
import { useState } from 'react';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'PROPATI - Nigeria\'s Most Trusted Property Marketplace',
  description: 'Find verified properties for rent and sale in Nigeria. Secure transactions, escrow payments, and 5-layer verification.',
  keywords: ['property', 'real estate', 'Nigeria', 'Lagos', 'rent', 'sale', 'verified listings'],
  authors: [{ name: 'PROPATI' }],
  creator: 'PROPATI',
  publisher: 'PROPATI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: '/',
    siteName: 'PROPATI',
    title: 'PROPATI - Nigeria\'s Most Trusted Property Marketplace',
    description: 'Find verified properties for rent and sale in Nigeria. Secure transactions, escrow payments, and 5-layer verification.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PROPATI - Trusted Property Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PROPATI - Nigeria\'s Most Trusted Property Marketplace',
    description: 'Find verified properties for rent and sale in Nigeria.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

function getQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(getQueryClient);

  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      afterSignInUrl={process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL}
      afterSignUpUrl={process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL}
      signInUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL}
      signUpUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL}
    >
      <QueryClientProvider client={queryClient}>
        <html lang="en" className={`${inter.variable} antialiased`} suppressHydrationWarning>
          <head>
            <link rel="preconnect" href="https://res.cloudinary.com" />
            <link rel="preconnect" href="https://api.paystack.co" />
            <link rel="preconnect" href="https://api.ng.termii.com" />
          </head>
          <body className="bg-background text-foreground min-h-screen flex flex-col">
            {children}
            <Toaster />
            <ReactQueryDevtools initialIsOpen={false} />
          </body>
        </html>
      </QueryClientProvider>
    </ClerkProvider>
  );
}