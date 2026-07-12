'use client';

import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#06203d',
        padding: '1.5rem',
      }}
    >
      <div style={{ maxWidth: '640px', width: '100%', textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '96px',
            height: '96px',
            borderRadius: '9999px',
            background: 'rgba(255,255,255,0.08)',
            marginBottom: '1.5rem',
            animation: 'propLogoPop 2.4s ease-in-out infinite',
          }}
        >
          <span
            aria-hidden
            style={{
              fontSize: '40px',
              lineHeight: 1,
              color: '#2563eb',
            }}
          >
            🔍
          </span>
        </div>

        <p
          style={{
            color: '#2563eb',
            fontWeight: 700,
            fontSize: '0.85rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '0.5rem',
          }}
        >
          404
        </p>

        <h1
          style={{
            fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
            fontWeight: 800,
            color: '#e6ebf1',
            marginBottom: '0.75rem',
          }}
        >
          Page not found
        </h1>

        <p
          style={{
            color: '#9fb3c8',
            fontSize: '0.95rem',
            lineHeight: 1.5,
            marginBottom: '2rem',
          }}
        >
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#2563eb',
            color: '#fff',
            fontWeight: 600,
            padding: '0.75rem 1.5rem',
            borderRadius: '9999px',
            textDecoration: 'none',
          }}
        >
          <Home style={{ width: '18px', height: '18px' }} />
          Back home
        </Link>

        <style>{`
          @keyframes propLogoPop {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.08); }
          }
          @media (prefers-reduced-motion: reduce) {
            div[aria-hidden='true'] {
              animation: none !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
