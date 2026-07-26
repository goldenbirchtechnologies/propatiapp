'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { LoadingState } from '@/components/feedback/LoadingState';

interface LoadingFlowPageProps {
  params: {
    flow: string;
  };
}

const FLOW_DESCRIPTIONS: Record<string, string> = {
  search: 'Searching our listings for the best matches…',
  screening: 'Running tenant screening checks…',
  agreement: 'Generating your agreement…',
  payment: 'Processing your payment…',
  subscription: 'Setting up your subscription…',
  verification: 'Verifying your identity…',
};

export default function LoadingFlowPage({ params }: LoadingFlowPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { flow } = params;
  const label = FLOW_DESCRIPTIONS[flow] ?? 'Loading…';
  const message = searchParams.get('message') ?? undefined;

  const handleRetry = () => {
    // When the loader is shown as a fallback after a transient error,
    // retrying refreshes the current navigation stack.
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-background">
      <LoadingState
        label={label}
        description={message}
        onRetry={handleRetry}
        retryLabel="Try again"
      />
    </div>
  );
}
