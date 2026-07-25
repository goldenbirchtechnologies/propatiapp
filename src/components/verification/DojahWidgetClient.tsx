'use client';

import { useState, useEffect } from 'react';
import Dojah from 'dojah-kyc-sdk-react';

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
  widgetId,
  referenceId,
  userData,
  metadata,
  onComplete,
}: DojahWidgetClientProps) {
  const [enabled, setEnabled] = useState(false);
  const [statusState, setStatusState] = useState<'idle' | 'started' | 'completed' | 'failed'>('idle');

  useEffect(() => {
    setEnabled(true);
  }, []);

  const resolvedWidgetId = widgetId || process.env.NEXT_PUBLIC_DOJAH_WIDGET_ID;
  const resolvedAppId = process.env.NEXT_PUBLIC_DOJAH_APP_ID;
  const resolvedPublicKey = process.env.NEXT_PUBLIC_DOJAH_PUBLIC_KEY;

  if (!resolvedWidgetId || !resolvedAppId || !resolvedPublicKey) {
    return (
      <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 text-amber-200">
        Dojah verification is not configured yet. Please add your widget credentials.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-xs text-muted-foreground">
        Status: <span className="font-mono">{statusState}</span>
      </div>

      {enabled && (
        <Dojah
          response={(event, data) => {
            if (event === 'begin') {
              setStatusState('started');
            } else if (event === 'success') {
              setStatusState('completed');
              onComplete?.({ success: true, referenceId: referenceId || `widget-${Date.now()}`, data: typeof data === 'object' ? (data as Record<string, unknown>) : undefined });
            } else if (event === 'error') {
              setStatusState('failed');
              onComplete?.({ success: false, error: typeof data === 'string' ? data : 'Widget verification failed', data: typeof data === 'object' ? (data as Record<string, unknown>) : undefined });
            } else if (event === 'close') {
              setStatusState('idle');
            }
          }}
          appID={resolvedAppId}
          publicKey={resolvedPublicKey}
          type={type}
          config={{ widget_id: resolvedWidgetId }}
          referenceId={referenceId || `dojah-${Math.random().toString(36).slice(2, 12)}`}
          userData={userData}
          metadata={metadata}
        />
      )}
    </div>
  );
}
