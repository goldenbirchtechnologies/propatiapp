import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://api.paystack.co" />
        <link rel="preconnect" href="https://api.ng.termii.com" />
      </head>
      <body className="bg-surface text-on-surface font-body min-h-screen flex flex-col antialiased">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
