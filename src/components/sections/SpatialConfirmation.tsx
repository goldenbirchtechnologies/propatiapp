'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { SpatialSection } from './SpatialSection';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Action {
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: 'default' | 'outline' | 'secondary';
}

interface SpatialConfirmationProps extends React.HTMLAttributes<HTMLDivElement> {
  status?: 'success' | 'info';
  title: string;
  description: string;
  actions?: Action[];
  receiptLink?: string;
}

const SpatialConfirmation = React.forwardRef<HTMLDivElement, SpatialConfirmationProps>(
  (
    {
      className,
      status = 'success',
      title,
      description,
      actions = [],
      receiptLink,
      ...props
    },
    ref
  ) => {
    const iconMap = {
      success: <CheckCircle2 className="mx-auto h-12 w-12 text-success" />,
      info: <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />,
    };

    return (
      <SpatialSection ref={ref} elevation={1} spacing="md" className={cn('mx-auto max-w-lg', className)} {...props}>
        <div className="p-8 text-center">
          {iconMap[status]}
          <h2 className="mt-4 font-display text-2xl font-bold text-text-primary">
            {title}
          </h2>
          <p className="mt-2 text-text-secondary">{description}</p>
          {receiptLink && (
            <a
              href={receiptLink}
              className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
            >
              View receipt
            </a>
          )}
          {actions.length > 0 && (
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {actions.map((action, idx) => {
                const Tag = action.href ? 'a' : 'button';
                return (
                  <Tag
                    key={idx}
                    href={action.href}
                    onClick={action.onClick}
                    className={cn(
                      'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                      action.variant === 'outline'
                        ? 'border border-default bg-raised text-text-primary hover:bg-border-subtle'
                        : action.variant === 'secondary'
                          ? 'bg-secondary text-on-secondary hover:bg-secondary/90'
                          : 'bg-primary text-on-primary hover:bg-primary/90'
                    )}
                  >
                    {action.label}
                  </Tag>
                );
              })}
            </div>
          )}
        </div>
      </SpatialSection>
    );
  }
);

SpatialConfirmation.displayName = 'SpatialConfirmation';

export { SpatialConfirmation };
