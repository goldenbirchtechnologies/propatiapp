'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StepProgress from '@/components/onboarding/StepProgress';
import LocationStep from './steps/LocationStep';
import ContactStep from './steps/ContactStep';
import IdentityStep from './steps/IdentityStep';
import EmploymentStep from './steps/EmploymentStep';
import GuarantorStep from './steps/GuarantorStep';

type StepId = 'location' | 'contact' | 'identity' | 'employment' | 'guarantor';

interface OnboardingWizardProps {
  role: string;
  initialStep?: StepId;
  initialStatus?: string;
  canComplete?: boolean;
  embedded?: boolean;
}

interface StepInfo {
  id: StepId;
  title: string;
  description: string;
}

const STEP_INFOS: Record<StepId, StepInfo> = {
  location: { id: 'location', title: 'Location', description: 'Country, state and city' },
  contact: { id: 'contact', title: 'Contact', description: 'Phone number' },
  identity: { id: 'identity', title: 'Identity', description: 'Verify your ID' },
  employment: { id: 'employment', title: 'Employment', description: 'Job & income' },
  guarantor: { id: 'guarantor', title: 'Guarantor', description: 'Guarantor details' },
};

const COMPONENT_MAP: Record<StepId, React.ComponentType<{ stepId: StepId }>> = {
  location: LocationStep,
  contact: ContactStep,
  identity: IdentityStep,
  employment: EmploymentStep,
  guarantor: GuarantorStep,
};

export default function OnboardingWizard({
  role,
  initialStep,
  initialStatus,
  canComplete,
  embedded = false,
}: OnboardingWizardProps) {
  const router = useRouter();
  const [status, setStatus] = useState<{
    required: boolean;
    currentStep: string | null;
    steps: StepInfo[];
    canComplete: boolean;
  }>({ required: true, currentStep: null, steps: [], canComplete: false });
  const [stepIndex, setStepIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/onboarding/status', { cache: 'no-store' })
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) {
          const data = json.data;
          const steps: StepInfo[] = data.steps.map((s: any) => ({
            id: s.id as StepId,
            title: s.title,
            description: s.description,
          }));
          setStatus({
            required: data.required,
            currentStep: data.currentStep as StepId | null,
            steps,
            canComplete: data.canComplete,
          });
          if (steps.length > 0) {
            const startStep = initialStep ?? data.currentStep ?? steps[0].id;
            const idx = steps.findIndex((s) => s.id === startStep);
            setStepIndex(Math.max(0, idx));
          }
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [initialStep]);

  if (loading) return null;
  if (!status.required || !status.steps.length) {
    if (!embedded) router.push(`/dashboard/${role}`);
    return null;
  }

  const activeStep = status.steps[stepIndex];
  if (!activeStep) return null;
  const StepComponent = COMPONENT_MAP[activeStep.id];
  const isLastStep = stepIndex === status.steps.length - 1;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="flex items-center justify-between mb-4">
        {!embedded && (
          <button
            onClick={() => router.push('/sign-in')}
            className="text-xs text-zinc-500 hover:text-white"
          >
            Skip &amp; sign in
          </button>
        )}
        <StepProgress
          steps={status.steps.map((s) => ({ id: s.id, title: s.title, done: false }))}
          currentStep={status.currentStep}
        />
      </div>

      <div className="flex items-end gap-4">
        <h1 className="text-3xl font-bold tracking-tight">{activeStep.title}</h1>
        <span className="ml-auto text-xs bg-zinc-800 px-3 py-1 rounded-full text-zinc-400">
          Step {stepIndex + 1} of {status.steps.length}
        </span>
      </div>
      <p className="text-zinc-400 mb-8">{activeStep.description}</p>

      <StepComponent stepId={activeStep.id} />

      <div className="mt-10 flex items-center justify-between">
        {stepIndex > 0 && (
          <Button
            variant="outline"
            onClick={() => setStepIndex((i) => i - 1)}
            className="w-full md:w-auto"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        )}
        <Button
          disabled={isLastStep ? !status.canComplete : false}
          onClick={() => {
            if (isLastStep) {
              router.push('/dashboard/' + role);
            } else {
              setStepIndex((i) => i + 1);
            }
          }}
          className="w-full md:w-auto bg-[#10b981] hover:bg-[#006c49]"
        >
          {isLastStep ? (
            <>
              Finish onboarding <ArrowRight className="ml-2 h-4 w-4" />
            </>
          ) : (
            <>
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}