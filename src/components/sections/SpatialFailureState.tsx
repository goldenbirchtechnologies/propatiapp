'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { SpatialSection } from './SpatialSection';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SpatialFailureStateProps extends React.HTMLAttributes<HTMLDivElement> {
  errorCode?: string | number;
  errorMessage: string;
  retryButton?: React.ReactNode;
  supportLink?: string;
}

const SpatialFailureState = React.forwardRef<HTMLDivElement, SpatialFailureStateProps>(
  (
    {
      className,
      errorCode,
      errorMessage,
      retryButton,
      supportLink,
      ...props
    },
    ref
  ) => {
    return (
      <SpatialSection ref={ref} elevation={1} spacing="md" className={cn('mx-auto max-w-lg', className)} {...props}>
        <div className="p-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-error" />
          {errorCode && (
            <p className="mt-4 text-sm font-medium uppercase tracking-wider text-text-muted">
              Error {errorCode}
            </p>
          )}
          <h2 className="mt-2 font-display text-2xl font-bold text-text-primary">
            Something went wrong
          </h2>
          <p className="mt-2 text-text-secondary">{errorMessage}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {retryButton}
            {supportLink && (
              <a
                href={supportLink}
                className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-primary hover:underline"
              >
                Contact support
              </a>
            )}
          </div>
        </div>
      </SpatialSection>
    );
  }
);

SpatialFailureState.displayName = 'SpatialFailureState';

export { SpatialFailureState };
