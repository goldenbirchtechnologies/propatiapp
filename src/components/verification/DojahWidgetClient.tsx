'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

export interface DojahWidgetClientProps {
  type?: 'custom' | 'verification' | 'identification' | 'liveness';
  widgetId?: string;
  referenceId?: string;
  userData?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  triggerLabel?: string;
  onComplete?: (verification: {
    success: boolean;
    referenceId?: string;
    data?: Record<string, unknown>;
    error?: string;
  }) => void;
}

export default function DojahWidgetClient({
  type = 'custom',
  widgetId,
  referenceId: controlledReferenceId,
  userData,
  metadata,
  triggerLabel,
  onComplete,
}: DojahWidgetClientProps) {
  const [statusState, setStatusState] = useState<'idle' | 'launching' | 'open' | 'completed' | 'failed'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [scriptError, setScriptError] = useState<string | null>(null);
  const connectRef = useRef<unknown>(null);
  const referenceIdRef = useRef<string | null>(controlledReferenceId || null);

  const resolvedWidgetId = widgetId || process.env.NEXT_PUBLIC_DOJAH_WIDGET_ID;
  const appId = process.env.NEXT_PUBLIC_DOJAH_APP_ID;
  const publicKey = process.env.NEXT_PUBLIC_DOJAH_PUBLIC_KEY;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const w = window as unknown as Record<string, unknown>;
    if (w.Connect) {
      setScriptReady(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://widget.dojah.io/widget.js';
    script.async = false;
    script.defer = false;
    const onLoad = () => setScriptReady(true);
    const onError = () => setScriptError('Failed to load Dojah widget');
    script.addEventListener('load', onLoad);
    script.addEventListener('error', onError);
    document.body.appendChild(script);

    return () => {
      script.removeEventListener('load', onLoad);
      script.removeEventListener('error', onError);
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  const createConnectInstance = () => {
    const w = window as unknown as Record<string, unknown>;
    const Connect = w.Connect as { new (options: Record<string, unknown>): unknown } | undefined;
    if (!Connect || !resolvedWidgetId || !appId || !publicKey || !referenceIdRef.current) return;

    connectRef.current = new Connect({
      app_id: appId,
      p_key: publicKey,
      type,
      reference_id: referenceIdRef.current,
      widget_id: resolvedWidgetId,
      user_data: userData || {},
      metadata: {
        ...metadata,
        user_id: referenceIdRef.current,
      },
      embed: false,
      onSuccess: (response: Record<string, unknown>) => {
        setStatusState('completed');
        onComplete?.({ success: true, referenceId: referenceIdRef.current ?? undefined, data: response as Record<string, unknown> });
      },
      onError: (err: Record<string, unknown>) => {
        setStatusState('failed');
        const message =
          (err && typeof err === 'object' && 'message' in err && typeof (err as Record<string, unknown>).message === 'string')
            ? ((err as Record<string, unknown>).message as string)
            : 'Widget error';
        setError(message);
        onComplete?.({ success: false, error: message, referenceId: referenceIdRef.current ?? undefined });
      },
      onClose: () => {
        setStatusState('idle');
        onComplete?.({ success: false, error: 'Widget closed' });
      },
    });
  };

  useEffect(() => {
    if (!scriptReady) return;
    createConnectInstance();
  }, [scriptReady]);

  const startVerification = async () => {
    setStatusState('launching');
    setError(null);

    try {
      const res = await fetch('/api/verification/dojah/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, widgetId: resolvedWidgetId, referenceId: controlledReferenceId, userData, metadata }),
      });

      const result = (await res.json().catch(() => ({ success: false }))) as {
        success: boolean;
        data?: { referenceId?: string };
        error?: string;
      };

      if (!result.success) {
        throw new Error(result.error || 'Failed to start verification');
      }

      if (result.data?.referenceId) {
        referenceIdRef.current = result.data.referenceId;
      }

      if (!referenceIdRef.current) {
        throw new Error('Missing reference ID');
      }

      if (!connectRef.current) {
        createConnectInstance();
      }

      const connect = connectRef.current as { setup: () => void; open: () => void } | undefined;
      if (!connect) {
        throw new Error('Widget not ready');
      }

      connect.setup();
      connect.open();
      setStatusState('open');
    } catch (err) {
      setStatusState('failed');
      const message = err instanceof Error ? err.message : 'Network error while starting verification';
      setError(message);
      onComplete?.({ success: false, error: message });
    }
  };

  if (scriptError) {
    return <p className="text-xs text-red-400">{scriptError}</p>;
  }

  return (
    <div className="space-y-3">
      <div className="text-xs text-muted-foreground">
        Status: <span className="font-mono">{statusState}</span>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {statusState !== 'open' && statusState !== 'completed' && (
        <Button
          onClick={startVerification}
          disabled={!scriptReady || statusState === 'launching'}
          type="button"
        >
          {statusState === 'launching' ? 'Launching...' : triggerLabel || 'Start Instant Verification'}
        </Button>
      )}

      {statusState === 'open' && (
        <p className="text-xs text-slate-400">Complete verification in the Dojah widget popup.</p>
      )}

      {statusState === 'completed' && (
        <p className="text-xs text-emerald-400">Verification submitted. We will update your status shortly.</p>
      )}
    </div>
  );
}
