'use client';

import { FailureState } from '@/components/feedback/FailureState';

interface ErrorFlowPageProps {
  params: {
    flow: string;
  };
}

export default function ErrorFlowPage({ params }: ErrorFlowPageProps) {
  const { flow } = params;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-16">
        <FailureState
          title="Something went wrong"
          description={`We couldn't complete the ${flow} flow due to an unexpected error.`}
          errorCode={flow}
          onRetry={() => window.location.reload()}
          retryLabel="Try again"
          supportHref="/support"
          supportLabel="Contact support"
        />
      </div>
    </div>
  );
}
