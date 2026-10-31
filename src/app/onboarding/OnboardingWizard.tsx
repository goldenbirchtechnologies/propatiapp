'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle2, Loader2, Lock, ShieldAlert } from 'lucide-react';
import {
  DButton,
  DCallout,
  DCard,
  DDivider,
  DPill,
} from '@/components/onboarding/dossier/primitives';
import { DossierNav, DossierShell } from '@/components/onboarding/dossier/Shell';
import { DossierRail, RailFacts } from '@/components/onboarding/dossier/Rail';
import { ROLE_META } from '@/components/onboarding/dossier/role-meta';
import LocationStep from './steps/LocationStep';
import ContactStep from './steps/ContactStep';
import IdentityStep from './steps/IdentityStep';
import EmploymentStep from './steps/EmploymentStep';
import GuarantorStep from './steps/GuarantorStep';
import LandlordProfileStep from './steps/LandlordProfileStep';
import LandlordSettlementStep from './steps/LandlordSettlementStep';
import AgentProfileStep from './steps/AgentProfileStep';
import AgentLicenseStep from './steps/AgentLicenseStep';
import AgentTerritoryStep from './steps/AgentTerritoryStep';
import AgentSettlementStep from './steps/AgentSettlementStep';
import EstateProfileStep from './steps/EstateProfileStep';
import EstateAuthorityStep from './steps/EstateAuthorityStep';
import EstateRemittanceStep from './steps/EstateRemittanceStep';
import { StepProps } from './steps/types';

export interface OnboardingStepInfo {
  id: string;
  title: string;
  description: string;
  done: boolean;
  skippable?: boolean;
  /** Deferred by the user: still outstanding, but no longer in the way of the dashboard. */
  skipped?: boolean;
}

export interface OnboardingStatus {
  role: string;
  status: 'not_started' | 'in_progress' | 'blocked' | 'completed';
  required: boolean;
  currentStep: string | null;
  steps: OnboardingStepInfo[];
  canComplete: boolean;
  blocked: boolean;
  facts?: RailFacts;
}

interface OnboardingWizardProps {
  initialStatus: OnboardingStatus;
}

const COMPONENT_MAP: Record<string, React.ComponentType<StepProps>> = {
  location: LocationStep,
  contact: ContactStep,
  identity: IdentityStep,
  employment: EmploymentStep,
  guarantor: GuarantorStep,
  landlordProfile: LandlordProfileStep,
  landlordSettlement: LandlordSettlementStep,
  agentProfile: AgentProfileStep,
  agentLicense: AgentLicenseStep,
  agentTerritory: AgentTerritoryStep,
  agentSettlement: AgentSettlementStep,
  estateProfile: EstateProfileStep,
  estateAuthority: EstateAuthorityStep,
  estateRemittance: EstateRemittanceStep,
};

const DASHBOARDS: Record<string, string> = {
  landlord: '/dashboard/landlord',
  tenant: '/dashboard/tenant',
  agent: '/dashboard/agent',
  estate_manager: '/dashboard/estate-manager',
  admin: '/admin',
};

function dashboardFor(role: string) {
  return DASHBOARDS[role] ?? '/dashboard';
}

const EMPTY_FACTS: RailFacts = {
  fullName: '—',
  email: '—',
  countryCode: null,
  countryName: null,
  jurisdictionName: null,
  city: null,
  phone: null,
  phoneVerified: false,
  idType: null,
  idVerified: false,
  employmentStatus: null,
  employerName: null,
  jobTitle: null,
  yearlyIncome: null,
  guarantorName: null,
  guarantorRelationship: null,
};

function firstOpenIndex(status: OnboardingStatus) {
  if (status.currentStep) {
    const match = status.steps.findIndex((s) => s.id === status.currentStep);
    if (match >= 0 && !status.steps[match].done) return match;
  }
  const open = status.steps.findIndex((s) => !s.done);
  return open >= 0 ? open : 0;
}

/**
 * The wizard owns navigation and server truth; each step owns its own form.
 *
 * A step reports a successful save through `onSaved`, which re-reads the
 * snapshot so the pipeline tick and the rail agree with what the database now
 * holds. Steps are never advanced optimistically — "Continue" re-checks the
 * saved state, so a partially written form can't slip past the gate.
 */
export default function OnboardingWizard({ initialStatus }: OnboardingWizardProps) {
  const router = useRouter();
  const [status, setStatus] = useState<OnboardingStatus>(initialStatus);
  const [stepIndex, setStepIndex] = useState(() => firstOpenIndex(initialStatus));
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  /*
   * Facts come from the server-rendered snapshot only. `/api/onboarding/status`
   * is deliberately redacted, so a refresh keeps the facts it already has
   * rather than blanking the rail mid-flow.
   */
  const facts = status.facts ?? EMPTY_FACTS;

  const refresh = useCallback(async (): Promise<OnboardingStatus> => {
    const res = await fetch('/api/onboarding/status', { cache: 'no-store' });
    if (!res.ok) throw new Error('Could not load your onboarding status.');
    const json = await res.json();
    const next = json.data as OnboardingStatus;
    // The blocked screen is a fresh-load state. Mid-flow it must not replace
    // the step being worked on, so once a deferral exists the wizard stays up
    // and the deferred step simply shows as outstanding in the pipeline. The
    // raw snapshot is still returned, so "Finish" can report the block.
    setStatus((prev) => ({
      ...next,
      facts: next.facts ?? prev.facts,
      status: next.status === 'blocked' && prev.status !== 'blocked' ? 'in_progress' : next.status,
    }));
    return next;
  }, []);

  const handleStepSaved = useCallback(async () => {
    setNotice(null);
    try {
      await refresh();
    } catch {
      // The step itself reported the save succeeded; a failed refresh only
      // costs the tick, and the next action retries it.
    }
  }, [refresh]);

  async function handleContinue() {
    setNotice(null);
    setBusy(true);
    try {
      const fresh = await refresh();
      const current = fresh.steps[stepIndex];
      if (!current) return;
      // A deferred step is allowed to stay open while the user works ahead.
      if (!current.done && !current.skipped) {
        setNotice(
          current.skippable
            ? 'Save this step, or defer it and finish later. Deferring keeps agreements and payments locked.'
            : 'Save this step before moving on.'
        );
        return;
      }
      setStepIndex(Math.min(stepIndex + 1, fresh.steps.length - 1));
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Could not reach the server.');
    } finally {
      setBusy(false);
    }
  }

  /**
   * Defers the active step. The server records the deferral and marks the
   * account blocked; the wizard then moves on to the next section rather than
   * stopping, because the point of deferring is to keep working.
   */
  async function handleSkip() {
    setNotice(null);
    setBusy(true);
    try {
      const current = status?.steps[stepIndex];
      if (!current?.skippable || current.done || current.skipped) return;

      const res = await fetch('/api/onboarding/skip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: current.id }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.message || json?.error || 'Could not defer this step.');
      }

      const fresh = await refresh();
      setStepIndex(Math.min(stepIndex + 1, fresh.steps.length - 1));
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Could not reach the server.');
    } finally {
      setBusy(false);
    }
  }

  async function handleFinish() {
    setNotice(null);
    setBusy(true);
    try {
      const fresh = await refresh();
      if (!fresh.canComplete) {
        const open = fresh.steps.findIndex((s) => !s.done);
        if (open >= 0) setStepIndex(open);
        setNotice(
          fresh.blocked
            ? 'A skipped step is blocking completion. Finish it to continue.'
            : 'Finish every step before completing onboarding.'
        );
        return;
      }
      const res = await fetch('/api/onboarding/complete', { method: 'POST' });
      if (!res.ok) throw new Error('Could not complete onboarding.');
      router.push(dashboardFor(fresh.role ?? status.role));
      router.refresh();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Could not reach the server.');
    } finally {
      setBusy(false);
    }
  }

  function exitToDashboard() {
    router.push(dashboardFor(status.role));
    router.refresh();
  }

  /* ── Loading / error ───────────────────────────────────────────────── */

  if (!status) {
    return (
      <div className="dossier-theme flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  const steps = status.steps;

  /* ── Nothing to do ─────────────────────────────────────────────────── */

  if (status.status === 'completed' || steps.length === 0) {
    return (
      <DossierComplete
        role={status.role}
        fullName={facts.fullName}
        onContinue={async () => {
          try {
            await fetch('/api/onboarding/complete', { method: 'POST' });
          } catch {
            // Completion is derived from the profile; navigation can proceed.
          }
          exitToDashboard();
        }}
      />
    );
  }

  /* ── Soft block ────────────────────────────────────────────────────── */

  if (status.status === 'blocked') {
    const blockedStep = steps.find((s) => s.id === status.currentStep) ?? steps.find((s) => !s.done);
    return (
      <DossierBlocked
        role={status.role}
        blockedStepTitle={blockedStep?.title ?? 'Identity'}
        onResume={() => {
          const index = steps.findIndex((s) => s.id === blockedStep?.id);
          setStepIndex(index >= 0 ? index : firstOpenIndex(status));
          setStatus((prev) => ({ ...prev, status: 'in_progress', blocked: false }));
        }}
        // Resuming is local state only: the server still reports "blocked" until
        // the step is actually saved, at which point `refresh` clears it.
        onContinueLater={exitToDashboard}
      />
    );
  }

  /* ── Active step ───────────────────────────────────────────────────── */

  const activeStep = steps[stepIndex] ?? steps[0];
  const activeIndex = steps.findIndex((s) => s.id === activeStep.id);
  const StepComponent = COMPONENT_MAP[activeStep.id];
  const isLastStep = activeIndex === steps.length - 1;
  const firstIncomplete = steps.findIndex((s) => !s.done && !s.skipped);
  const maxReachableIndex = firstIncomplete === -1 ? steps.length - 1 : firstIncomplete;
  const meta = ROLE_META[status.role];

  return (
    <DossierShell
      role={status.role}
      steps={steps.map((s) => ({ id: s.id, title: s.title, done: s.done, skippable: s.skippable }))}
      activeIndex={activeIndex}
      maxReachableIndex={maxReachableIndex}
      onSelectStep={(index) => {
        setNotice(null);
        setStepIndex(index);
      }}
      onExit={exitToDashboard}
      rail={
        <DossierRail
          role={status.role}
          facts={facts}
          status={status.status}
          stepIndex={activeIndex}
          stepCount={steps.length}
        />
      }
    >
      <DCard className="p-6">
        {/* Card head — the dossier heading for this step. */}
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <div className="min-w-0">
            <p className="dossier-eyebrow text-[var(--on-surface-variant)]">
              Section {String(activeIndex + 1).padStart(2, '0')} —{' '}
              {meta?.stepLabels?.[activeStep.id] ?? activeStep.title}
            </p>
            <h2 className="mt-1 text-[20px] font-semibold leading-[1.3] tracking-[-0.005em] text-[var(--on-surface)]">
              {activeStep.title}
            </h2>
          </div>
          {activeStep.done ? (
            <DPill tone="mint">
              <CheckCircle2 className="h-3 w-3" /> Saved
            </DPill>
          ) : activeStep.skipped ? (
            <DPill tone="danger">
              <ShieldAlert className="h-3 w-3" /> Deferred
            </DPill>
          ) : activeStep.skippable ? (
            <DPill tone="neutral">
              <ShieldAlert className="h-3 w-3" /> Optional
            </DPill>
          ) : (
            <DPill tone="danger">Required</DPill>
          )}
        </div>

        <p className="mt-2 max-w-[68ch] text-[13px] leading-[1.55] text-[var(--on-surface-variant)]">
          {activeStep.description}
        </p>

        <DDivider className="my-5" />

        {StepComponent ? (
          <StepComponent
            stepId={activeStep.id}
            facts={facts}
            onSaved={handleStepSaved}
          />
        ) : (
          <DCallout title="Not available yet">
            This section is still being built. You can come back to it later.
          </DCallout>
        )}

        {activeStep.skippable && !activeStep.done ? (
          <div className="mt-5 rounded-lg border border-[var(--outline-variant)] px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="max-w-[52ch] text-[12px] leading-[1.55] text-[var(--on-surface-variant)]">
                {activeStep.skipped
                  ? 'This section is deferred. Keep working through the rest — agreements, payments and listings stay locked until it is saved.'
                  : 'You can defer this section and finish it later. Your dashboard stays open, but agreements, payments and listings remain locked until it is saved.'}
              </p>
              {activeStep.skipped ? null : (
                <button
                  type="button"
                  onClick={handleSkip}
                  disabled={busy}
                  className="shrink-0 text-[12px] font-semibold text-[var(--accent)] underline-offset-2 hover:underline disabled:opacity-50"
                >
                  Defer this step
                </button>
              )}
            </div>
          </div>
        ) : null}
      </DCard>

      {notice ? (
        <div className="mt-4">
          <DCallout tone="danger" title="Almost there">
            {notice}
          </DCallout>
        </div>
      ) : null}

      <DossierNav
        onBack={() => {
          setNotice(null);
          setStepIndex((i) => Math.max(0, i - 1));
        }}
        onNext={isLastStep ? handleFinish : handleContinue}
        backDisabled={activeIndex === 0}
        busy={busy}
        isLast={isLastStep}
        blocked={false}
      />
    </DossierShell>
  );
}

/* ── Blocked screen ───────────────────────────────────────────────────── */

function DossierBlocked({
  role,
  blockedStepTitle,
  onResume,
  onContinueLater,
}: {
  role: string;
  blockedStepTitle: string;
  onResume: () => void;
  onContinueLater: () => void;
}) {
  return (
    <div className="dossier-theme flex min-h-screen items-center justify-center px-5 py-12">
      <DCard className="w-full max-w-[560px] p-7">
        <div className="flex items-start gap-3">
          <span
            aria-hidden
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[rgba(186,26,26,0.1)] text-[#93000a]"
          >
            <Lock className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <DPill tone="danger">Action needed</DPill>
            <h1 className="mt-2 text-[22px] font-semibold leading-[1.3] text-[var(--on-surface)]">
              {blockedStepTitle} is still outstanding
            </h1>
            <p className="mt-2 text-[13px] leading-[1.55] text-[var(--on-surface-variant)]">
              You skipped a step that Nigerian tenancy and anti-money-laundering rules treat as
              mandatory. Your {ROLE_META[role]?.label ?? 'account'} dashboard stays open in the
              meantime — only agreements, payments and listings remain locked until it clears.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <DButton onClick={onResume}>
            Finish this step <ArrowRight className="h-4 w-4" />
          </DButton>
          <DButton variant="ghost" onClick={onContinueLater}>
            Continue to dashboard
          </DButton>
        </div>
      </DCard>
    </div>
  );
}

/* ── Complete screen ──────────────────────────────────────────────────── */

function DossierComplete({
  role,
  fullName,
  onContinue,
}: {
  role: string;
  fullName: string;
  onContinue: () => void;
}) {
  return (
    <div className="dossier-theme flex min-h-screen items-center justify-center px-5 py-12">
      <DCard className="w-full max-w-[560px] p-7">
        <span
          aria-hidden
          className="grid h-12 w-12 place-items-center rounded-full bg-[rgba(0,108,73,0.1)] text-[var(--accent)]"
        >
          <CheckCircle2 className="h-6 w-6" />
        </span>
        <DPill tone="mint" className="mt-4">
          Dossier complete
        </DPill>
        <h1 className="mt-2 text-[24px] font-semibold leading-[1.3] tracking-[-0.01em] text-[var(--on-surface)]">
          You&apos;re all set, {fullName.split(' ')[0]}
        </h1>
        <p className="mt-2 text-[13px] leading-[1.55] text-[var(--on-surface-variant)]">
          Your {ROLE_META[role]?.label ?? 'account'} dossier has cleared verification. Everything in
          Propati is now available to you.
        </p>
        <DButton className="mt-5" onClick={onContinue}>
          Go to dashboard <ArrowRight className="h-4 w-4" />
        </DButton>
      </DCard>
    </div>
  );
}
