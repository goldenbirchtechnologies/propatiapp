'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/modal';
import { SignOutLink } from './SignOutLink';

interface OnboardingSnapshot {
  role: string;
  status: 'not_started' | 'in_progress' | 'blocked' | 'completed';
  required: boolean;
  currentStep: string | null;
  canComplete: boolean;
  blocked: boolean;
  steps: Array<{
    id: string;
    title: string;
    description: string;
    done: boolean;
    skippable: boolean;
  }>;
}

interface OnboardingGateProps {
  /** Override for testing or special cases. If provided, the fetch is skipped. */
  snapshot?: OnboardingSnapshot | null;
}

export function OnboardingGate({ snapshot: providedSnapshot }: OnboardingGateProps) {
  const router = useRouter();
  const [snapshot, setSnapshot] = useState<OnboardingSnapshot | null>(
    providedSnapshot ?? null
  );
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (providedSnapshot) return;
    let cancelled = false;
    fetch('/api/onboarding/status', { cache: 'no-store' })
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) setSnapshot(json.data);
      })
      .catch(() => {
        if (!cancelled) setSnapshot(null);
      });
    return () => {
      cancelled = true;
    };
  }, [providedSnapshot]);

  // Fail open: if we cannot determine status, do not lock the user out.
  if (!snapshot?.required || snapshot.status === 'completed' || dismissed) return null;

  return (
    <Modal
      open
      onOpenChange={() => {}}
      title="Complete your profile"
      description={snapshot.blocked
        ? 'One step is pending verification. You can still access the dashboard.'
        : 'Finish the steps below to unlock your dashboard.'}
      size="lg"
      showClose={false}
      closeOnOverlayClick={false}
      closeOnEscape={false}
      footer={
        <div className="flex items-center justify-between w-full pt-4 border-t border-zinc-700">
          <SignOutLink />
          <button
            className="btn btn-primary"
            onClick={() => {
              if (snapshot.blocked) {
                setDismissed(true);
                return;
              }
              router.push('/onboarding');
            }}
          >
            {snapshot.blocked ? 'Continue to dashboard' : 'Complete onboarding'}
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {snapshot.steps.map((step) => (
          <div
            key={step.id}
            className={`rounded-lg p-4 transition-colors ${
              step.done
                ? 'bg-primary/20 border border-primary/30'
                : step.skippable
                ? 'bg-amber-900/20 border border-amber-900/30'
                : 'bg-zinc-800 border border-zinc-700'
            }`}
          >
            <div className="flex items-start gap-3">
              <span
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step.done
                    ? 'bg-primary text-white'
                    : 'bg-zinc-700 text-zinc-400'
                }`}
              >
                {step.done ? (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                ) : step.skippable ? (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                  </svg>
                ) : (
                  <span className="text-zinc-400">•</span>
                )}
              </span>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-white">{step.title}</h4>
                <p className="text-sm text-zinc-400 mt-0.5">{step.description}</p>
                {step.skippable && !step.done && (
                  <span className="inline-block mt-2 text-xs text-amber-400 bg-amber-900/30 px-2 py-0.5 rounded">
                    Skippable — dashboard available
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}