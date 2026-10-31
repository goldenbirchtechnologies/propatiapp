'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StepProgress from '@/components/onboarding/StepProgress';
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

type StepId =
  | 'location'
  | 'contact'
  | 'identity'
  | 'employment'
  | 'guarantor'
  | 'landlordProfile'
  | 'landlordSettlement'
  | 'agentProfile'
  | 'agentLicense'
  | 'agentTerritory'
  | 'agentSettlement'
  | 'estateProfile'
  | 'estateAuthority'
  | 'estateRemittance';

export interface OnboardingStepInfo {
  id: string;
  title: string;
  description: string;
  done: boolean;
  skippable?: boolean;
}

export interface OnboardingStatus {
  role: string;
  status: 'not_started' | 'in_progress' | 'blocked' | 'completed';
  required: boolean;
  currentStep: string | null;
  steps: OnboardingStepInfo[];
  canComplete: boolean;
  blocked: boolean;
}

interface OnboardingWizardProps {
  initialStatus?: OnboardingStatus;
  role?: string;
  embedded?: boolean;
}

const COMPONENT_MAP: Record<string, React.ComponentType<any>> = {
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

function firstOpenIndex(status: OnboardingStatus) {
  if (status.currentStep) {
    const match = status.steps.findIndex((s) => s.id === status.currentStep);
    if (match >= 0) return match;
  }
  const open = status.steps.findIndex((s) => !s.done);
  return open >= 0 ? open : 0;
}

export default function OnboardingWizard({
  initialStatus,
  role,
  embedded = false,
}: OnboardingWizardProps) {
  const router = useRouter();
  const [status, setStatus] = useState<OnboardingStatus | null>(initialStatus ?? null);
  const [stepIndex, setStepIndex] = useState(() =>
    initialStatus ? firstOpenIndex(initialStatus) : 0
  );
  const [loading, setLoading] = useState(!initialStatus);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<OnboardingStatus> => {
    const res = await fetch('/api/onboarding/status', { cache: 'no-store' });
    if (!res.ok) throw new Error('Could not load your onboarding status.');
    const json = await res.json();
    const next = json.data as OnboardingStatus;
    setStatus(next);
    return next;
  }, []);

  useEffect(() => {
    if (initialStatus) return;
    let cancelled = false;
    refresh()
      .then((next) => {
        if (!cancelled) setStepIndex(firstOpenIndex(next));
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [initialStatus, refresh]);

  async function handleContinue() {
    setNotice(null);
    setBusy(true);
    try {
      const fresh = await refresh();
      const current = fresh.steps[stepIndex];
      if (!current) return;
      if (!current.done) {
        setNotice('Save this step before moving on.');
        return;
      }
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
      router.push(dashboardFor(fresh.role));
      router.refresh();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Could not reach the server.');
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md py-24 text-center">
        <h1 className="text-xl font-semibold text-white">We couldn&apos;t load your onboarding</h1>
        <p className="mt-2 text-sm text-zinc-400">{error}</p>
        <Button
          className="mt-6"
          onClick={() => {
            setError(null);
            setLoading(true);
            refresh()
              .then((next) => setStepIndex(firstOpenIndex(next)))
              .catch((e: Error) => setError(e.message))
              .finally(() => setLoading(false));
          }}
        >
          Try again
        </Button>
      </div>
    );
  }

  if (!status) return null;

  const steps = status.steps;
  const roleForNav = status.role ?? role ?? '';

  if (status.status === 'completed' || steps.length === 0) {
    return (
      <div className="mx-auto max-w-md py-24 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-[#006c49]" />
        <h1 className="mt-4 text-2xl font-bold text-white">You&apos;re all set</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Your profile is complete. Everything in Propati is now available to you.
        </p>
        <Button
          className="mt-6 bg-[#006c49] hover:bg-[#006c49]"
          onClick={async () => {
            try {
              await fetch('/api/onboarding/complete', { method: 'POST' });
            } catch {
              // Completion is derived from the profile; navigation can proceed.
            }
            router.push(dashboardFor(roleForNav));
            router.refresh();
          }}
        >
          Go to dashboard <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    );
  }

  const activeStep = steps[stepIndex];
  if (!activeStep) return null;
  const StepComponent = COMPONENT_MAP[activeStep.id];
  const isLastStep = stepIndex === steps.length - 1;

  return (
    <div className="mx-auto max-w-3xl py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <StepProgress
          steps={steps.map((s) => ({ id: s.id, title: s.title, done: s.done }))}
          currentStep={activeStep.id}
        />
        {!embedded && (
          <button
            type="button"
            onClick={() => router.push(dashboardFor(roleForNav))}
            className="shrink-0 text-xs text-zinc-500 transition-colors hover:text-white"
          >
            Continue later
          </button>
        )}
      </div>

      <div className="flex items-end gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-white">{activeStep.title}</h1>
        <span className="ml-auto whitespace-nowrap rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-400">
          Step {stepIndex + 1} of {steps.length}
        </span>
      </div>
      <p className="mb-8 text-zinc-400">{activeStep.description}</p>

      {StepComponent ? (
        <StepComponent stepId={activeStep.id} />
      ) : (
        <p className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 text-sm text-zinc-400">
          This step isn&apos;t available yet.
        </p>
      )}

      {notice && (
        <p className="mt-6 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          {notice}
        </p>
      )}

      <div className="mt-10 flex items-center justify-between gap-3">
        <Button
          variant="outline"
          onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
          disabled={stepIndex === 0 || busy}
          className="w-full md:w-auto"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button
          onClick={isLastStep ? handleFinish : handleContinue}
          disabled={busy}
          className="w-full md:w-auto bg-[#006c49] hover:bg-[#006c49]"
        >
          {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLastStep ? 'Finish onboarding' : 'Continue'}
          {!busy && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
