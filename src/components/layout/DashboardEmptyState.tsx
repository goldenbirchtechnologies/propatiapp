import { cn } from '@/lib/utils';
import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';

interface DashboardEmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  className?: string;
}

export function DashboardEmptyState({
  title,
  description,
  icon,
  primaryAction,
  secondaryAction,
  className,
}: DashboardEmptyStateProps) {
  return (
    <Card className={cn('border-dashed border-outline-variant bg-surface-container-lowest/70 p-8 text-center shadow-sm', className)}>
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4">
        {icon && (
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            {icon}
          </div>
        )}
        <div className="space-y-2">
          <h3 className="text-xl font-semibold tracking-tight text-foreground">{title}</h3>
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {primaryAction}
          {secondaryAction}
        </div>
      </div>
    </Card>
  );
}
