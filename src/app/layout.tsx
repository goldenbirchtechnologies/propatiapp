import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import '@/styles/animations.css';
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
      <body className="bg-surface text-on-surface font-body min-h-screen flex flex-col antialiased">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
