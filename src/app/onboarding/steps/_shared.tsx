'use client';

import { useCallback, useState } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import type { ZodError } from 'zod';
import { DButton } from '@/components/onboarding/dossier/primitives';

/**
 * Shared step plumbing.
 *
 * Steps no longer talk to the wizard through the URL hash: each save posts to
 * its own endpoint, then reports upward so the pipeline and rail re-read the
 * server snapshot. Keeping that in one hook means every step fails, succeeds
 * and disables its button the same way.
 */

export function useStepSave(onSaved: () => void | Promise<void>) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const run = useCallback(
    async (url: string, payload: unknown): Promise<boolean> => {
      setSaving(true);
      setError(null);
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(json.message || json.error || 'Could not save this section.');
        }
        setSaved(true);
        await onSaved();
        return true;
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not save this section.');
        return false;
      } finally {
        setSaving(false);
      }
    },
    [onSaved]
  );

  return { saving, error, saved, run, setError };
}

/** Reduce a Zod error to one message per top-level field. */
export function issuesOf(error: ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.errors) {
    const key = issue.path[0];
    if (typeof key === 'string' && !out[key]) out[key] = issue.message;
  }
  return out;
}

/** First Zod message, used when no field can be highlighted. */
export function firstIssue(error: ZodError): string {
  return error.errors[0]?.message ?? 'Check the form and try again.';
}

export function StepActions({
  saving,
  error,
  saved,
  label,
  disabled,
  hint,
}: {
  saving: boolean;
  error: string | null;
  saved: boolean;
  label: string;
  disabled?: boolean;
  hint?: React.ReactNode;
}) {
  return (
    <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-[var(--surface-container-high)] pt-4">
      <DButton type="submit" disabled={saving || disabled}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {label}
      </DButton>

      {error ? (
        <p className="text-[12px] font-medium leading-4 text-[#ba1a1a]">{error}</p>
      ) : saved ? (
        <p className="inline-flex items-center gap-1.5 text-[12px] font-semibold leading-4 text-[var(--accent)]">
          <CheckCircle2 className="h-3.5 w-3.5" /> Saved — this section is complete.
        </p>
      ) : hint ? (
        <p className="text-[12px] leading-4 text-[var(--on-surface-variant)]">{hint}</p>
      ) : null}
    </div>
  );
}
