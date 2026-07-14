import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import '@/styles/globals.css';
import './globals.css';
import { Providers } from '@/components/providers';
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from '@/components/ui/toaster';
import { IBM_Plex_Sans, Source_Sans_3 } from "next/font/google";
import { cn } from "@/lib/utils";

const sourceSans3Heading = Source_Sans_3({subsets:['latin'],variable:'--font-heading'});

const ibmPlexSans = IBM_Plex_Sans({subsets:['latin'],variable:'--font-sans'});

const inter = localFont({
  src: [
    { path: './fonts/inter-latin-400-normal.27ae72da.woff2', weight: '400', style: 'normal' },
    { path: './fonts/inter-latin-600-normal.87d718a2.woff2', weight: '600', style: 'normal' },
    { path: './fonts/inter-latin-ext-400-normal.5b02c69a.woff2', weight: '400', style: 'normal' },
    { path: './fonts/inter-latin-ext-600-normal.88feb9e4.woff2', weight: '600', style: 'normal' },
  ],
  variable: '--font-inter',
  display: 'swap',
  fallback: ['system-ui', 'ui-sans-serif', 'sans-serif'],
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
    { media: '(prefers-color-scheme: light)', color: 'background' },
    { media: '(prefers-color-scheme: dark)', color: 'foreground' },
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
    <html
      lang="en"
      className={cn("antialiased", inter.variable, "font-sans", ibmPlexSans.variable, sourceSans3Heading.variable)}
      suppressHydrationWarning
    >
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&display=swap" rel="stylesheet" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
        <link rel="manifest" href="/manifest" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icon-192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icon-512.png" />
        <meta name="description" content="PROPATI - Nigeria's Most Trusted Property Marketplace" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="PROPATI" />
      </head>
      <body className="bg-background text-foreground min-h-screen flex flex-col antialiased tracking-body-md">
        <TooltipProvider>
        <Providers>
          {children}
          <Toaster />
          <script src="/push.js" defer strategy="afterInteractive" />
        </Providers>
        </TooltipProvider>
      </body>
    </html>
  );
}
