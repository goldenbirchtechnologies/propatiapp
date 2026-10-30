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
    if (w.Connect || w.Dojah) {
      setScriptReady(true);
      return;
    }

    const existing = document.querySelector('script[src="https://widget.dojah.io/widget.js"]') as HTMLScriptElement | null;
    if (existing) {
      if ((existing as any)._dojahLoaded) { setScriptReady(true); return; }
      const onLoad = () => { (existing as any)._dojahLoaded = true; setScriptReady(true); };
      const onError = () => setScriptError('Failed to load Dojah widget — check network/CSP');
      existing.addEventListener('load', onLoad);
      existing.addEventListener('error', onError);
      return () => {
        existing.removeEventListener('load', onLoad);
        existing.removeEventListener('error', onError);
      };
    }

    const script = document.createElement('script');
    script.src = 'https://widget.dojah.io/widget.js';
    script.async = true;
    const onLoad = () => { (script as any)._dojahLoaded = true; setScriptReady(true); };
    const onError = () => setScriptError('Failed to load Dojah widget — check network/CSP');
    script.addEventListener('load', onLoad);
    script.addEventListener('error', onError);
    document.body.appendChild(script);

    return () => {
      script.removeEventListener('load', onLoad);
      script.removeEventListener('error', onError);
    };
  }, []);

  const createConnectInstance = () => {
    const w = window as unknown as Record<string, unknown>;
    const Connect = (w.Connect || w.Dojah) as { new (options: Record<string, unknown>): unknown } | undefined;
    if (!Connect) {
      setScriptError('Dojah widget not available — refresh and try again');
      return;
    }
    if (!resolvedWidgetId || !appId || !publicKey || !referenceIdRef.current) return;

    try {
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
        config: {
          widget_id: resolvedWidgetId,
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
              : 'Widget error — please retry';
          setError(message);
          onComplete?.({ success: false, error: message, referenceId: referenceIdRef.current ?? undefined });
        },
        onClose: () => {
          if (statusState === 'completed') return;
          setStatusState('idle');
        },
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to initialize widget');
    }
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
      {error && <p className="text-xs text-red-400 border border-red-500/20 bg-red-500/10 rounded-lg p-2">{error}</p>}
      {scriptError && <p className="text-xs text-amber-400 border border-amber-500/20 bg-amber-500/10 rounded-lg p-2">{scriptError}</p>}

      {statusState !== 'open' && statusState !== 'completed' && (
        <Button
          onClick={startVerification}
          disabled={!scriptReady || statusState === 'launching'}
          type="button"
          className="bg-primary hover:bg-primary text-white"
        >
          {statusState === 'launching' ? 'Launching…' : triggerLabel || 'Verify with Dojah'}
        </Button>
      )}

      {statusState === 'open' && (
        <p className="text-xs text-zinc-400 border border-zinc-800 bg-zinc-900 rounded-lg p-3">Dojah is open — complete the steps in the popup. You can close and resume anytime.</p>
      )}

      {statusState === 'completed' && (
        <div className="rounded-lg border border-primary/20 bg-primary/10 p-3">
          <p className="text-xs font-medium text-[#4edea3]">Verification submitted</p>
          <p className="text-xs text-zinc-400 mt-1">We’ll update your status via webhook shortly. Refresh status in a moment.</p>
        </div>
      )}
    </div>
  );
}
