'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateSize = () => setIsMobile(window.innerWidth < 640);
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const maxWidth = isMobile ? '100%' : '640px';

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
      <div style={{ maxWidth, width: '100%', textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '72px',
            height: '72px',
            borderRadius: '9999px',
            background: 'rgba(255,255,255,0.08)',
            marginBottom: '1.5rem',
            animation: 'propLogoPop 2.4s ease-in-out infinite',
          }}
        >
          <span
            aria-hidden
            style={{
              fontSize: '32px',
              lineHeight: 1,
              color: '#2563eb',
            }}
          >
            ⚠️
          </span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
            fontWeight: 800,
            color: '#e6ebf1',
            marginBottom: '0.8rem',
          }}
        >
          Something went wrong
        </h1>

        <p
          style={{
            color: '#9fb3c8',
            fontSize: '0.95rem',
            lineHeight: 1.5,
            marginBottom: '1.75rem',
          }}
        >
          {(error?.message || 'An unexpected error occurred.').slice(0, 220)}
        </p>

        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Button
            onClick={reset}
            style={{
              background: '#2563eb',
              color: '#fff',
              borderRadius: '9999px',
              padding: '0.75rem 1.5rem',
            }}
          >
            <RefreshCw style={{ width: '18px', height: '18px', marginRight: '8px' }} />
            Try again
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              window.location.href = '/';
            }}
            style={{
              borderRadius: '9999px',
              padding: '0.75rem 1.5rem',
              color: '#e6ebf1',
              borderColor: 'rgba(255,255,255,0.18)',
            }}
          >
            <Home style={{ width: '18px', height: '18px', marginRight: '8px' }} />
            Back home
          </Button>
        </div>

        {error?.digest ? (
          <p style={{ color: '#7e8aa0', fontSize: '0.75rem', marginTop: '1.5rem' }}>
            Ref: {error.digest}
          </p>
        ) : null}
      </div>

      <style>{`
        @keyframes propLogoPop {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        @media (prefers-reduced-motion: reduce) {
          div[style][aria-hidden='true'] {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
