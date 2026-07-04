'use client';

import * as React from 'react';
import { Snowflake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FrozenStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  ticketHref?: string;
  ticketLabel?: string;
  appealHref?: string;
  appealLabel?: string;
}

const FrozenState = React.forwardRef<HTMLDivElement, FrozenStateProps>(
  (
    {
      className,
      title = 'This account is currently suspended',
      description = 'Your access has been temporarily paused. Please reach out to resolve this.',
      ticketHref = '/support',
      ticketLabel = 'Open a ticket',
      appealHref = '/appeal',
      appealLabel = 'Submit an appeal',
      ...props
    },
    ref
  ) => {
    return (
      <div ref={ref} className={cn('flex flex-col items-center justify-center gap-4 py-16 text-center', className)} {...props}>
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <Snowflake className="h-7 w-7 text-frozen" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild variant="secondary">
            <a href={ticketHref}>{ticketLabel}</a>
          </Button>
          <Button asChild variant="outline">
            <a href={appealHref}>{appealLabel}</a>
          </Button>
        </div>
      </div>
    );
  }
);

FrozenState.displayName = 'FrozenState';

export { FrozenState };
