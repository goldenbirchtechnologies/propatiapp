'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface SpatialSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  elevation?: 1 | 2 | 3 | 4;
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  reveal?: boolean;
  as?: React.ElementType;
}

const SpatialSection = React.forwardRef<HTMLDivElement, SpatialSectionProps>(
  (
    {
      className,
      elevation = 2,
      spacing = 'md',
      reveal = false,
      as = 'section',
      children,
      ...props
    },
    ref
  ) => {
    const Comp = as;

    const spacingClasses = {
      none: '',
      sm: 'py-4',
      md: 'py-8 md:py-12',
      lg: 'py-12 md:py-16 lg:py-24',
    };

    const revealClass = reveal
      ? 'opacity-0 translate-y-3 motion-safe:animate-[fadeUp_0.5s_ease_forwards]'
      : '';

    return (
      <Comp
        ref={ref}
        className={cn(
          'bg-raised border border-default rounded-lg',
          `shadow-${elevation}`,
          spacingClasses[spacing],
          revealClass,
          className
        )}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);

SpatialSection.displayName = 'SpatialSection';

export { SpatialSection };
