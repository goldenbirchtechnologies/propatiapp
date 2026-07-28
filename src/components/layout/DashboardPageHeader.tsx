import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface DashboardPageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function DashboardPageHeader({ eyebrow, title, description, actions, className }: DashboardPageHeaderProps) {
  return (
    <header className={cn('flex flex-col gap-4 md:flex-row md:items-end md:justify-between', className)}>
      <div className="space-y-2">
        {eyebrow && (
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            {eyebrow}
          </p>
        )}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
              {description}
            </p>
          )}
        </div>
      </div>

      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </header>
  );
}
