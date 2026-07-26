'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import KycVerificationCard, { KycStatus } from '@/components/verification/KycVerificationCard';

export interface DojahWidgetClientProps {
  type?: 'custom' | 'verification' | 'identification' | 'liveness';
  widgetId?: string;
  referenceId?: string;
  userData?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  onComplete?: (verification: { success: boolean; referenceId?: string; data?: Record<string, unknown>; error?: string }) => void;
}

export default function DojahWidgetClient({
  type = 'custom',
  onComplete,
}: DojahWidgetClientProps) {
  const [statusState, setStatusState] = useState<'idle' | 'starting' | 'pending' | 'completed' | 'failed'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (statusState === 'pending') {
      const interval = setInterval(() => {
        setStatusState('completed');
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [statusState]);

  const resolveEnv = (key: string) => process.env.NEXT_PUBLIC_DOJAH_WIDGET_ID || key;
  const resolvedWidgetId = resolveEnv(type === 'liveness' ? '' : '');

  const startVerification = async () => {
    setStatusState('starting');
    setError(null);

    try {
      const res = await fetch('/api/verification/dojah/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, metadata: {} }),
      });

      const result = (await res.json().catch(() => ({ success: false }))) as {
        success: boolean;
        data?: { redirectUrl?: string; referenceId?: string };
        error?: string;
      };

      if (result.success && result.data?.redirectUrl) {
        setStatusState('pending');
        onComplete?.({ success: true, referenceId: result.data.referenceId });
        window.open(result.data.redirectUrl, '_blank', 'noopener,noreferrer');
        return;
      }

      setStatusState('failed');
      setError(result.error || 'Unable to start verification right now.');
      onComplete?.({ success: false, error: result.error || 'Unable to start verification right now.' });
    } catch {
      setStatusState('failed');
      setError('Network error while starting Dojah verification.');
      onComplete?.({ success: false, error: 'Network error while starting Dojah verification.' });
    }
  };

  const statusLabel = statusState === 'starting' ? 'Starting verification...' : statusState;

  return (
    <div className="space-y-3">
      <div className="text-xs text-muted-foreground">
        Status: <span className="font-mono">{statusLabel}</span>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {statusState !== 'pending' && (
        <Button onClick={startVerification} disabled={statusState === 'starting'} type="button">
          {statusState === 'starting' ? 'Launching...' : 'Start Dojah Verification'}
        </Button>
      )}

      {statusState === 'pending' && (
        <p className="text-xs text-slate-400">Verification opened in a new window. Awaiting confirmation.</p>
      )}

      <KycVerificationCard status={statusState === 'pending' ? 'in_progress' : statusState === 'idle' ? 'not_started' : statusState} />
    </div>
  );
}
