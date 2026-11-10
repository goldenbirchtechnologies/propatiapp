'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import OnboardingWizard, { type OnboardingStatus } from '@/app/onboarding/OnboardingWizard';

/**
 * Routes that save work as a draft rather than refusing it. The scrim locks the
 * dashboard's scroll, so opening the dossier here would make the form behind it
 * unusable; the pages carry their own "saved as a draft" banner and the resume
 * pill instead, and `?onboarding=1` still opens the dossier on demand.
 */
const DRAFT_ROUTES = [
  '/dashboard/landlord/properties/new',
  '/dashboard/landlord/listing/new',
];

/**
 * The onboarding dossier as a blurred overlay on top of the dashboard.
 *
 * Onboarding is served from the dashboard itself rather than a separate route:
 * the user lands on their role dashboard, keeps the shell visible behind a
 * frosted scrim, and the wizard opens over it. "Save & exit" collapses the
 * overlay back to a resume pill so nothing is ever a dead end.
 *
 * Mounted once per dashboard shell (`TenantRailShell`).
 */
export function OnboardingOverlay() {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [ready, setReady] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  /**
   * `?onboarding=1` opens the dossier on demand — the entry point every role
   * shares. The role onboarding routes forward here, so there is no second,
   * page-shaped onboarding anywhere in the app.
   */
  const [forced, setForced] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/onboarding/status', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (!cancelled) setStatus((json?.data as OnboardingStatus) ?? null);
      })
      .catch(() => {
        // Fail open: a status failure must never lock the dashboard.
        if (!cancelled) setStatus(null);
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Read the forced-open flag after mount: the shell is a client component on a
  // dynamic route, and reading `window` during render would break the SSR pass.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('onboarding') === '1') setForced(true);
  }, []);

  /** The account genuinely needs onboarding: it is flagged and not yet complete. */
  const required = Boolean(ready && status?.required && status.status !== 'completed');
  const onDraftRoute = DRAFT_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const open = Boolean(ready && status && ((required && !onDraftRoute) || forced) && !dismissed);

  /** Dismissing a forced-open dossier must not reopen it on the next refresh. */
  const close = useCallback(() => {
    setDismissed(true);
    if (!forced) return;
    const url = new URL(window.location.href);
    url.searchParams.delete('onboarding');
    window.history.replaceState({}, '', `${url.pathname}${url.search}`);
  }, [forced]);

  // Freeze the dashboard behind the scrim while the wizard is up.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, close]);

  const handleComplete = useCallback(() => {
    close();
    router.refresh();
  }, [close, router]);

  if (!ready || !status) return null;

  if (!open) {
    // The pill is the "you still have work outstanding" nudge. A dossier opened
    // on demand and then dismissed leaves no pill: nothing is outstanding.
    if (!required) return null;
    const remaining = status.steps.filter((s) => !s.done).length;
    return (
      <button
        type="button"
        onClick={() => setDismissed(false)}
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-[var(--accent,#006c49)] px-4 py-2.5 text-[12px] font-semibold text-white shadow-lg shadow-black/20 transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent,#006c49)]"
      >
        <ShieldCheck className="h-4 w-4" />
        {remaining > 0
          ? `Finish onboarding · ${remaining} step${remaining === 1 ? '' : 's'} left`
          : 'Finish onboarding'}
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-8 lg:p-12"
      role="dialog"
      aria-modal="true"
      aria-label="Complete your onboarding dossier"
    >
      {/* Blurred dashboard scrim. Light enough that the shell stays readable
          behind the card — a heavier scrim hid the dashboard completely and the
          overlay read as a full page rather than a panel over one.

          The gutter is never zero: a card flush to all four edges covers the
          scrim completely and the overlay reads as a full page. Keeping 12px
          of blurred dashboard visible at every width is what makes it legible
          as a panel over the dashboard rather than a route of its own. */}
      <div aria-hidden className="absolute inset-0 bg-zinc-950/50 backdrop-blur-[6px]" />

      <div className="relative z-10 flex max-h-[calc(100dvh-1.5rem)] w-full flex-col overflow-hidden rounded-2xl border border-white/40 bg-[#fbf8fc] shadow-[0_32px_80px_-24px_rgba(0,0,0,0.55)] ring-1 ring-black/10 sm:max-h-[84vh] sm:max-w-[1000px]">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <OnboardingWizard
            initialStatus={status}
            variant="modal"
            onExit={close}
            onComplete={handleComplete}
          />
        </div>
      </div>
    </div>
  );
}
