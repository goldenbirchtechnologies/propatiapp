import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FailureStateProps {
  title?: string;
  description?: string;
  errorCode?: string;
  onRetry?: () => void;
  retryLabel?: string;
  supportHref?: string;
  supportLabel?: string;
  className?: string;
}

export function FailureState({
  title = 'Something went wrong',
  description = 'We couldn’t complete this action.',
  errorCode,
  onRetry,
  retryLabel = 'Try again',
  supportHref = '/support',
  supportLabel = 'Contact support',
  className,
}: FailureStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4 py-16 text-center', className)}>
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-7 w-7 text-destructive" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {errorCode && (
        <p className="rounded-md border border-border bg-muted/50 px-3 py-1.5 text-xs font-mono text-muted-foreground">
          Error code: {errorCode}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <Button variant="default" onClick={onRetry}>
            {retryLabel}
          </Button>
        )}
        <Button asChild variant="outline">
          <a href={supportHref}>{supportLabel}</a>
        </Button>
      </div>
    </div>
  );
}
