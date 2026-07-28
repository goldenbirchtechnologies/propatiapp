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
        background: 'linear-gradient(180deg, #08253f 0%, #061b2f 100%)',
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          maxWidth: '640px',
          width: '100%',
          textAlign: 'center',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '28px',
          padding: '2rem',
          boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '96px',
            height: '96px',
            borderRadius: '9999px',
            background: 'rgba(16,185,129,0.16)',
            marginBottom: '1.5rem',
            animation: 'propLogoPop 2.4s ease-in-out infinite',
          }}
        >
          <span
            aria-hidden
            style={{
              fontSize: '40px',
              lineHeight: 1,
              color: '#10b981',
            }}
          >
            ?
          </span>
        </div>

        <p
          style={{
            color: '#10b981',
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
            color: '#f4faf6',
            marginBottom: '0.75rem',
          }}
        >
          Page not found
        </h1>

        <p
          style={{
            color: 'rgba(255,255,255,0.72)',
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
            background: '#10b981',
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
