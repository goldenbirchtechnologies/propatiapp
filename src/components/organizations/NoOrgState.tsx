'use client';

import { Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface NoOrgStateProps {
  actionLabel?: string;
  actionHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  title?: string;
  description?: string;
}

export function NoOrgState({
  actionLabel = 'Create Organization',
  actionHref = '/dashboard/estate-manager/profile',
  secondaryLabel = 'Link Organization',
  secondaryHref = '/dashboard/estate-manager/invite-property-manager',
  title = 'No Organization',
  description = 'You need an organization to access this section.',
}: NoOrgStateProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
      <div className="w-16 h-16 rounded-full bg-muted/10 flex items-center justify-center mb-4">
        <Building2 className="h-8 w-8 text-zinc-600 dark:text-zinc-400" />
      </div>
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md mb-6">{description}</p>
      <div className="flex gap-3">
        <Button
          onClick={() => router.push(actionHref || '/')}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {actionLabel}
        </Button>
        {secondaryLabel && (
          <Button variant="outline" onClick={() => router.push(secondaryHref || '/')} className="border-zinc-200 dark:border-white/[0.08]">
            {secondaryLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
