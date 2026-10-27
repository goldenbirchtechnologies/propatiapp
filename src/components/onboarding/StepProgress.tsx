'use client';

import { cn } from '@/lib/utils';

interface StepProgressProps {
  steps: Array<{ id: string; title: string; done: boolean }>;
  currentStep: string | null;
  className?: string;
}

export default function StepProgress({ steps, currentStep, className }: StepProgressProps) {
  return (
    <nav
      className={cn('flex items-center gap-4 mb-8', className)}
      aria-label="Onboarding progress"
    >
      <ol className="flex items-center gap-2">
        {steps.map((step, i) => {
          const isDone = step.done;
          const isCurrent = currentStep === step.id && !isDone;
          const isFirst = i === 0;
          const isLast = i === steps.length - 1;

          return (
            <li key={step.id} className="flex items-center">
              <span
                className={cn(
                  'relative flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors',
                  isDone
                    ? 'bg-[#10b981] text-white'
                    : isCurrent
                    ? 'bg-[#10b981]/20 text-[#10b981] ring-2 ring-[#10b981]'
                    : 'bg-zinc-800 text-zinc-500'
                )}
              >
                {isDone ? (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                ) : (
                  i + 1
                )}
              </span>
              {!isLast && (
                <span
                  className={cn(
                    'h-px flex-1 max-w-[120px] transition-colors',
                    isDone ? 'bg-[#10b981]' : 'bg-zinc-700'
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}