'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { SpatialSection } from './SpatialSection';
import { Check, Sparkles } from 'lucide-react';

interface Plan {
  name: string;
  price: { monthly: string; annual: string };
  period?: string;
  description?: string;
  features: string[];
  cta: React.ReactNode;
  highlighted?: boolean;
}

interface SpatialPricingTableProps extends React.HTMLAttributes<HTMLDivElement> {
  plans: Plan[];
  highlightedPlan?: string;
  loading?: boolean;
  toggleLabel?: { monthly: string; annual: string };
}

const SpatialPricingTable = React.forwardRef<HTMLDivElement, SpatialPricingTableProps>(
  (
    {
      className,
      plans,
      highlightedPlan,
      loading = false,
      toggleLabel = { monthly: 'Monthly', annual: 'Annual' },
      ...props
    },
    ref
  ) => {
    const [period, setPeriod] = React.useState<'monthly' | 'annual'>('monthly');

    if (loading) {
      return (
        <SpatialSection ref={ref} elevation={1} spacing="lg" className={className} {...props}>
          <div className="mx-auto max-w-5xl px-4">
            <div className="mb-8 flex justify-center">
              <div className="h-10 w-64 animate-shimmer rounded-lg bg-border-subtle" />
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="rounded-lg border border-default bg-raised p-6 shadow-1">
                  <div className="mb-4 h-6 w-24 animate-shimmer rounded bg-border-subtle" />
                  <div className="mb-6 h-10 w-32 animate-shimmer rounded bg-border-subtle" />
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-4 w-full animate-shimmer rounded bg-border-subtle" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SpatialSection>
      );
    }

    return (
      <SpatialSection ref={ref} elevation={1} spacing="lg" className={className} {...props}>
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-10 flex justify-center">
            <div className="inline-flex rounded-lg border border-default bg-raised p-1 shadow-1">
              <button
                type="button"
                onClick={() => setPeriod('monthly')}
                className={cn(
                  'rounded-md px-4 py-2 text-sm font-medium transition-colors',
                  period === 'monthly'
                    ? 'bg-primary text-on-primary'
                    : 'text-text-secondary hover:text-text-primary'
                )}
              >
                {toggleLabel.monthly}
              </button>
              <button
                type="button"
                onClick={() => setPeriod('annual')}
                className={cn(
                  'rounded-md px-4 py-2 text-sm font-medium transition-colors',
                  period === 'annual'
                    ? 'bg-primary text-on-primary'
                    : 'text-text-secondary hover:text-text-primary'
                )}
              >
                {toggleLabel.annual}
              </button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => {
              const isHighlighted = plan.name === highlightedPlan;
              return (
                <div
                  key={plan.name}
                  className={cn(
                    'relative flex flex-col rounded-lg border bg-raised p-6 shadow-1',
                    isHighlighted ? 'border-primary shadow-2' : 'border-default'
                  )}
                >
                  {isHighlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-on-primary">
                        <Sparkles className="h-3 w-3" />
                        Popular
                      </span>
                    </div>
                  )}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-text-primary">{plan.name}</h3>
                    {plan.description && (
                      <p className="mt-1 text-sm text-text-secondary">{plan.description}</p>
                    )}
                  </div>
                  <div className="mb-6">
                    <span className="text-3xl font-bold text-text-primary">
                      {period === 'monthly' ? plan.price.monthly : plan.price.annual}
                    </span>
                    {plan.period && (
                      <span className="text-text-muted">/{plan.period}</span>
                    )}
                  </div>
                  <ul className="mb-6 flex-1 space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-text-secondary">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto">{plan.cta}</div>
                </div>
              );
            })}
          </div>
        </div>
      </SpatialSection>
    );
  }
);

SpatialPricingTable.displayName = 'SpatialPricingTable';

export { SpatialPricingTable };
