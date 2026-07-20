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
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        verification: {
          basic: 'var(--verification-basic)',
          verified: 'var(--verification-verified)',
          inspected: 'var(--verification-inspected)',
          certified: 'var(--verification-certified)',
        },
        'success-bright': '#71fbc0',
        success: {
          DEFAULT: 'var(--success)',
          bright: '#50dea5',
        },
        warning: 'var(--warning)',
        frozen: {
          DEFAULT: 'var(--frozen)',
          foreground: 'var(--on-frozen)',
        },

        // Legacy surface tokens - now theme-driven via CSS variables
        'surface-variant': 'var(--surface-variant)',
        surface: {
          DEFAULT: 'var(--surface)',
          dim: 'var(--surface-dim)',
          bright: 'var(--surface-bright)',
          container: {
            lowest: 'var(--surface-container-lowest)',
            low: 'var(--surface-container-low)',
            DEFAULT: 'var(--surface-container)',
            high: 'var(--surface-container-high)',
            highest: 'var(--surface-container-highest)',
          },
          variant: 'var(--surface-variant)',
          tint: 'var(--surface-tint)',
        },
        'on-surface': {
          DEFAULT: 'var(--on-surface)',
          variant: 'var(--on-surface-variant)',
        },
        'inverse-surface': 'var(--inverse-surface)',
        'inverse-on-surface': 'var(--inverse-on-surface)',

        // Reference primary / dark shell
        'primary-dark': '#000f22',
        'primary-container': '#0a2540',

        // Reference indicator / gold
        'secondary-amber': '#F5A623',
        'secondary-container': '#feae2c',
        'on-secondary-container': '#725000',

        // Legacy role colors (kept for backward compat during migration)
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
        // Dark-mode extended palette
        blackCanvas: '#0a0a0a',
        cardDark: '#121214',
        cardDarker: '#0a0a0b',
        grayMuted: '#6b7280',
        accentGreen: '#22c55e',
        accentBlue: '#3b82f6',
        'inverse-primary': '#7bd7c2',

        // Commercial gold
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

        // Listing types
        'type-rent': '#3b82f6',
        'type-lease': '#8b5cf6',
        'type-sale': '#10b981',
        'type-shortlet': '#f59e0b',
        'type-roomshare': '#ec4899',

        // Outline
        outline: {
          DEFAULT: 'var(--outline)',
          variant: 'var(--outline-variant)',
        },

        // Semantic feedback colors
        error: {
          DEFAULT: '#ef4444',
          container: '#fef2f2',
          'on-container': '#991b1b',
        },

        // Extended secondary/tertiary fixed tokens
        'secondary-fixed': '#F5A623',
        'secondary-fixed-dim': '#835500',
        tertiary: {
          DEFAULT: '#001209',
          'on-tertiary': '#ffffff',
          container: '#002a1b',
          'on-container': '#009e6f',
          fixed: '#98f4dd',
          'fixed-dim': '#7bd7c2',
          'on-fixed': '#00201a',
          'on-fixed-variant': '#005144',
        },
      },
      borderRadius: {
        tag: 'var(--radius-tag)',
        sm: 'var(--radius-sm)',
        btn: 'var(--radius-btn)',
        btnSm: 'var(--radius-btn-sm)',
        DEFAULT: 'var(--radius-card)',
        lg: 'var(--radius-card-lg)',
        modal: 'var(--radius-modal)',
        xl: 'var(--radius-modal-mobile)',
        full: 'var(--radius-full)',
        inherit: 'inherit',
      },
      // Custom typography tokens
      'font-body': 'var(--font-body), system-ui, sans-serif',
      'font-display': 'var(--font-heading), var(--font-body), system-ui, sans-serif',
      'font-mono': 'var(--font-mono), ui-monospace, monospace',
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-heading)', 'var(--font-body-fallback)', 'system-ui', 'sans-serif'],
        headline: ['var(--font-heading)', 'var(--font-body-fallback)', 'system-ui', 'sans-serif'],
        'headline-sm': ['var(--font-heading)', 'var(--font-body-fallback)', 'system-ui', 'sans-serif'],
        label: ['var(--font-body)', 'system-ui', 'sans-serif'],
        'label-sm': ['var(--font-body)', 'system-ui', 'sans-serif'],
        'label-md': ['var(--font-body)', 'system-ui', 'sans-serif'],
        display: ['var(--font-heading)', 'var(--font-body-fallback)', 'system-ui', 'sans-serif'],
        inter: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['48px', { lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '800' }],
        'headline-xl': ['36px', { lineHeight: '44px', letterSpacing: '-0.01em', fontWeight: '700' }],
        'headline-lg': ['32px', { lineHeight: '40px', fontWeight: '700' }],
        'headline-lg-mobile': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'title-md': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'body-lg-mono': ['14px', { lineHeight: '20px', fontWeight: '500', letterSpacing: '0.02em' }],
        'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'label-caps': ['12px', { lineHeight: '16px', letterSpacing: '0.05em', fontWeight: '500' }],
        'label-sm': ['12px', { lineHeight: '16px', fontWeight: '500' }],
        'label-md': ['14px', { lineHeight: '20px', fontWeight: '500' }],
        'headline-sm': ['20px', { lineHeight: '28px', fontWeight: '600' }],
      },
      spacing: {
        gutter: '24px',
        'margin-desktop': '64px',
        'margin-mobile': '16px',
        tight: 'var(--space-tight)',
        vs: 'var(--space-vs)',
        'sm-gap': 'var(--space-sm-gap)',
        sm: 'var(--space-sm)',
        base: 'var(--space-base)',
        'base-sm': 'var(--space-base-sm)',
        'md-sm': 'var(--space-md-sm)',
        md: 'var(--space-md)',
        'md-lg': 'var(--space-md-lg)',
        lg: 'var(--space-lg)',
        xl: 'var(--space-xl)',
        xxl: 'var(--space-xxl)',
        section: 'var(--space-section)',
        hero: 'var(--space-hero)',
      },
      maxWidth: {
        container: '1280px',
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
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'slide-in-from-top': 'slide-in-from-top 0.3s ease-out',
        'slide-in-from-bottom': 'slide-in-from-bottom 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'fade-out': 'fade-out 0.2s ease-out',
        shimmer: 'shimmer 2s infinite linear',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        'elevated': 'var(--shadow-elevated)',
        '1': 'var(--shadow-sm)',
        '2': 'var(--shadow-md)',
        '3': 'var(--shadow-lg)',
      },
    },
  },
  plugins: [forms, typography, require('tailwindcss-animate')],
};

export default config;
