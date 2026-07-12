'use client';

import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
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
                width: '88px',
                height: '88px',
                borderRadius: '9999px',
                background: 'rgba(255,255,255,0.08)',
                marginBottom: '1.5rem',
                animation: 'propLogoPop 2.4s ease-in-out infinite',
              }}
            >
              <span
                aria-hidden
                style={{
                  fontSize: '36px',
                  lineHeight: 1,
                  color: '#2563eb',
                }}
              >
                ⚡
              </span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
                fontWeight: 800,
                color: '#e6ebf1',
                marginBottom: '0.75rem',
              }}
            >
              System error
            </h1>

            <p
              style={{
                color: '#9fb3c8',
                fontSize: '0.95rem',
                lineHeight: 1.5,
                marginBottom: '1.75rem',
              }}
            >
              {error?.message || 'Something went wrong.'}
            </p>

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
              Reload
            </Button>

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
              div[aria-hidden='true'] {
                animation: none !important;
              }
            }
          `}</style>
        </div>
      </body>
    </html>
  );
}
