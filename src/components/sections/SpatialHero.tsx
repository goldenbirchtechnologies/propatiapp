'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { SpatialSection } from './SpatialSection';

interface SpatialHeroProps extends React.HTMLAttributes<HTMLDivElement> {
  eyebrow?: string;
  headline: string;
  subhead?: string;
  primaryCta?: React.ReactNode;
  secondaryCta?: React.ReactNode;
  bgImage?: string;
  trustBadges?: { label: string; icon?: React.ReactNode }[];
}

const SpatialHero = React.forwardRef<HTMLDivElement, SpatialHeroProps>(
  (
    {
      className,
      eyebrow,
      headline,
      subhead,
      primaryCta,
      secondaryCta,
      bgImage,
      trustBadges = [],
      ...props
    },
    ref
  ) => {
    return (
      <SpatialSection
        ref={ref}
        elevation={1}
        spacing="lg"
        className={cn(
          'relative overflow-hidden',
          bgImage && 'bg-cover bg-center',
          className
        )}
        style={bgImage ? { backgroundImage: `url(${bgImage})` } : undefined}
        {...props}
      >
        {bgImage && (
          <div className="absolute inset-0 bg-base/80" aria-hidden="true" />
        )}
        <div className="relative z-10 mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
          {eyebrow && (
            <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
              {eyebrow}
            </span>
          )}
          <h1 className="font-display text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl">
            {headline}
          </h1>
          {subhead && (
            <p className="mx-auto mt-6 max-w-2xl text-lg text-text-secondary">
              {subhead}
            </p>
          )}
          {(primaryCta || secondaryCta) && (
            <div className="mx-auto mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              {primaryCta}
              {secondaryCta}
            </div>
          )}
          {trustBadges.length > 0 && (
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-text-muted">
              {trustBadges.map((badge, idx) => (
                <span key={idx} className="inline-flex items-center gap-2">
                  {badge.icon}
                  {badge.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </SpatialSection>
    );
  }
);

SpatialHero.displayName = 'SpatialHero';

export { SpatialHero };
