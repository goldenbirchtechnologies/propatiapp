'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { SpatialSection } from './SpatialSection';
import { Snowflake } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SpatialFrozenStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  ticketLink?: string;
  appealLink?: string;
}

const SpatialFrozenState = React.forwardRef<HTMLDivElement, SpatialFrozenStateProps>(
  (
    {
      className,
      title,
      description,
      ticketLink,
      appealLink,
      ...props
    },
    ref
  ) => {
    return (
      <SpatialSection ref={ref} elevation={1} spacing="md" className={cn('mx-auto max-w-lg', className)} {...props}>
        <div className="p-8 text-center">
          <Snowflake className="mx-auto h-12 w-12 text-frozen" />
          <h2 className="mt-4 font-display text-2xl font-bold text-text-primary">
            {title}
          </h2>
          <p className="mt-2 text-text-secondary">{description}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {ticketLink && (
              <Button variant="default" asChild>
                <a href={ticketLink}>Open support ticket</a>
              </Button>
            )}
            {appealLink && (
              <Button variant="outline" asChild>
                <a href={appealLink}>Submit appeal</a>
              </Button>
            )}
          </div>
        </div>
      </SpatialSection>
    );
  }
);

SpatialFrozenState.displayName = 'SpatialFrozenState';

export { SpatialFrozenState };
