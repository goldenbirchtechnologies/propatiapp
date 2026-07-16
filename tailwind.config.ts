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
        'success-bright': '#71fbc0',
        success: {
          DEFAULT: 'hsl(var(--success))',
          bright: '#50dea5',
        },
        warning: 'hsl(var(--warning))',
        frozen: {
          DEFAULT: 'hsl(var(--frozen))',
          foreground: 'hsl(var(--on-frozen))',
        },

        // Reference surface tokens (RGB values match ui_design_reference)
        'surface-variant': '#d2e4ff',
        surface: {
          DEFAULT: '#f9f9ff',
          dim: '#cfdaf2',
          bright: '#f9f9ff',
          container: {
            lowest: '#ffffff',
            low: '#f1f3ff',
            DEFAULT: '#e8eeff',
            high: '#e3e8f9',
            highest: '#dde2f3',
          },
          variant: '#dde2f3',
          tint: '#006b5b',
        },
        'on-surface': {
          DEFAULT: '#161c27',
          variant: '#43474d',
        },
        'inverse-surface': '#263143',
        'inverse-on-surface': '#ecf1ff',

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
          DEFAULT: '#74777e',
          variant: '#c4c6ce',
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
