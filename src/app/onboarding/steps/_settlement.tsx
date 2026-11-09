'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import { DCallout } from '@/components/onboarding/dossier/primitives';

/**
 * Shared plumbing for the three settlement steps.
 *
 * The bank picker and the account-name preview were the missing half of the
 * Paystack/Dojah wiring: the server resolved and name-matched accounts, but
 * every step still asked the user to type a bank name by hand and never told
 * them what the bank thought the account was called. These hooks call the two
 * endpoints the server already exposes so the form shows the same answer the
 * save route will reach.
 *
 * Nothing here is trusted: `/api/onboarding/settlement/verify` writes no rows,
 * and the save endpoints re-run the check before persisting or creating a
 * subaccount.
 */

export interface SettlementBank {
  code: string;
  name: string;
}

export type PreviewState =
  | 'verified'
  | 'pending'
  | 'mismatch'
  | 'unresolved'
  | 'no_identity'
  | 'not_configured';

export interface SettlementPreview {
  state: PreviewState;
  bankName?: string;
  bankCode?: string;
  resolvedName?: string;
  matchesIdentity?: boolean;
  message?: string;
}

/**
 * The settlement bank directory.
 *
 * The route falls back to a static list when Paystack is unreachable, so a
 * failure here means the request itself failed rather than the key being
 * absent — the picker is still usable because the server-side save resolves by
 * name, but we surface the error so the user knows why it is empty.
 */
export function useBankDirectory() {
  const [banks, setBanks] = useState<SettlementBank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch('/api/paystack/banks');
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json?.success) {
          throw new Error(json?.error || 'Could not load the bank list.');
        }
        if (!cancelled) setBanks((json.data?.banks ?? []) as SettlementBank[]);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Could not load the bank list.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { banks, loading, error };
}

/** Look a bank up by code so the step can still send the human-readable name. */
export function bankNameForCode(banks: SettlementBank[], code: string): string {
  return banks.find((b) => b.code === code)?.name ?? '';
}

/**
 * Resolve the account name as the user types.
 *
 * Debounced, and guarded by a request counter so a slow response for an old
 * account number cannot overwrite the preview for the current one.
 */
export function useAccountResolution(
  accountNumber: string,
  bankCode: string,
  opts?: { enabled?: boolean; onResolved?: (resolvedName: string) => void }
) {
  const [preview, setPreview] = useState<SettlementPreview | null>(null);
  const [checking, setChecking] = useState(false);
  const requestId = useRef(0);
  const enabled = opts?.enabled ?? true;

  // Held in a ref so an inline arrow does not restart the effect every render.
  const onResolved = useRef(opts?.onResolved);
  onResolved.current = opts?.onResolved;

  useEffect(() => {
    const digits = accountNumber.replace(/\D/g, '');

    if (!enabled || digits.length < 10 || !bankCode) {
      setPreview(null);
      setChecking(false);
      return;
    }

    const id = ++requestId.current;
    setChecking(true);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/onboarding/settlement/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accountNumber: digits, bankCode }),
        });
        const json = await res.json().catch(() => ({}));

        if (id !== requestId.current) return;

        const next: SettlementPreview =
          res.ok && json?.success
            ? (json.data as SettlementPreview)
            : {
                state: 'unresolved',
                message: json?.error || 'Could not check that account.',
              };

        setPreview(next);
        if (next.resolvedName) onResolved.current?.(next.resolvedName);
      } catch {
        if (id === requestId.current) {
          setPreview({ state: 'unresolved', message: 'Could not reach the bank lookup.' });
        }
      } finally {
        if (id === requestId.current) setChecking(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [accountNumber, bankCode, enabled]);

  return { preview, checking };
}

const NOTE: Record<
  PreviewState,
  { tone: 'mint' | 'neutral' | 'danger'; icon: React.ReactNode; title: string }
> = {
  verified: {
    tone: 'mint',
    icon: <CheckCircle2 className="h-4 w-4" />,
    title: 'Account name matches your verified identity',
  },
  pending: {
    tone: 'neutral',
    icon: <ShieldCheck className="h-4 w-4" />,
    title: 'Resolved, but not yet name-matched',
  },
  mismatch: {
    tone: 'danger',
    icon: <AlertTriangle className="h-4 w-4" />,
    title: 'This account belongs to someone else',
  },
  unresolved: {
    tone: 'danger',
    icon: <AlertTriangle className="h-4 w-4" />,
    title: 'That account could not be resolved',
  },
  no_identity: {
    tone: 'neutral',
    icon: <ShieldCheck className="h-4 w-4" />,
    title: 'Verify your identity first',
  },
  not_configured: {
    tone: 'neutral',
    icon: <ShieldCheck className="h-4 w-4" />,
    title: 'Bank lookup is unavailable',
  },
};

/**
 * What the bank says the account is called.
 *
 * Renders nothing until there is something worth saying, so an untouched form
 * stays as quiet as it was before.
 */
export function SettlementAccountNote({
  preview,
  checking,
}: {
  preview: SettlementPreview | null;
  checking: boolean;
}) {
  if (checking) {
    return (
      <DCallout
        icon={<Loader2 className="h-4 w-4 animate-spin" />}
        title="Checking this account with the bank"
        tone="neutral"
        className="mt-4"
      >
        Asking Paystack for the account name on file.
      </DCallout>
    );
  }

  if (!preview) return null;

  const note = NOTE[preview.state] ?? NOTE.pending;
  const body =
    preview.message ||
    (preview.resolvedName
      ? `The bank has this account registered as “${preview.resolvedName}”.`
      : 'No account name came back from the bank for this NUBAN.');

  return (
    <DCallout icon={note.icon} title={note.title} tone={note.tone} className="mt-4">
      {body}
    </DCallout>
  );
}
