import type { Config } from 'tailwindcss';
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1280px',
      },
    },
    extend: {
      colors: {
        // Shadcn compatibility (CSS variable based)
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        verification: {
          basic: 'hsl(var(--verification-basic))',
          verified: 'hsl(var(--verification-verified))',
          inspected: 'hsl(var(--verification-inspected))',
          certified: 'hsl(var(--verification-certified))',
        },
        success: 'hsl(var(--success))',
        warning: 'hsl(var(--warning))',

        // Stitch Design Tokens - Surface Colors
        surface: {
          DEFAULT: '#f9f9ff',
          dim: '#cfdaf2',
          bright: '#f9f9ff',
          container: {
            lowest: '#ffffff',
            low: '#f0f3ff',
            DEFAULT: '#e7eeff',
            high: '#dee8ff',
            highest: '#d8e3fb',
          },
          variant: '#d8e3fb',
          tint: '#006b5b',
        },
        'on-surface': {
          DEFAULT: '#111c2d',
          variant: '#3e4946',
        },
        'inverse-surface': '#263143',
        'inverse-on-surface': '#ecf1ff',

        // Stitch Design Tokens - Primary (Residential Teal)
        'residential-teal': {
          DEFAULT: '#0e7c6a',
          soft: 'rgba(14, 124, 106, 0.1)',
          container: '#0e7c6a',
          'on-container': '#bdffed',
          fixed: '#98f4dd',
          'fixed-dim': '#7bd7c2',
          'on-fixed': '#00201a',
          'on-fixed-variant': '#005144',
        },
        'inverse-primary': '#7bd7c2',

        // Stitch Design Tokens - Commercial Gold
        'commercial-gold': {
          DEFAULT: '#c9952a',
          soft: 'rgba(201, 149, 42, 0.1)',
          container: '#fcc355',
          'on-container': '#725000',
          fixed: '#ffdea8',
          'fixed-dim': '#f6bd50',
          'on-fixed': '#271900',
          'on-fixed-variant': '#5e4200',
        },

        // Stitch Design Tokens - Tertiary
        tertiary: {
          DEFAULT: '#88412f',
          'on-tertiary': '#ffffff',
          container: '#a65845',
          'on-container': '#ffeeea',
          fixed: '#ffdad2',
          'fixed-dim': '#ffb4a2',
          'on-fixed': '#3c0801',
          'on-fixed-variant': '#753222',
        },

        // Stitch Design Tokens - Error
        error: {
          DEFAULT: '#ba1a1a',
          'on-error': '#ffffff',
          container: '#ffdad6',
          'on-container': '#93000a',
        },

        // Stitch Design Tokens - Listing Types
        'type-rent': '#3b82f6',
        'type-lease': '#8b5cf6',
        'type-sale': '#10b981',
        'type-shortlet': '#f59e0b',
        'type-roomshare': '#ec4899',

        // Outline
        outline: {
          DEFAULT: '#6e7a76',
          variant: '#bdc9c4',
        },
      },
      borderRadius: {
        sm: '0.125rem',
        DEFAULT: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
      },
      fontFamily: {
        sans: ['var(--font-hanken-grotesk)', 'Hanken Grotesk', 'system-ui', 'sans-serif'],
        display: ['var(--font-hanken-grotesk)', 'Hanken Grotesk', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'display-lg': ['48px', { lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-lg': ['32px', { lineHeight: '40px', fontWeight: '600' }],
        'headline-lg-mobile': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'title-md': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'label-caps': ['12px', { lineHeight: '16px', letterSpacing: '0.05em', fontWeight: '500' }],
      },
      spacing: {
        'gutter': '24px',
        'margin-desktop': '48px',
        'margin-mobile': '16px',
      },
      maxWidth: {
        'container': '1280px',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'slide-in-from-top': {
          from: { transform: 'translateY(-100%)' },
          to: { transform: 'translateY(0)' },
        },
        'slide-in-from-bottom': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-out': {
          from: { opacity: '1' },
          to: { opacity: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'slide-in-from-top': 'slide-in-from-top 0.3s ease-out',
        'slide-in-from-bottom': 'slide-in-from-bottom 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'fade-out': 'fade-out 0.2s ease-out',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'elevated': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      },
    },
  },
  plugins: [forms, typography, require('tailwindcss-animate')],
};

export default config;
