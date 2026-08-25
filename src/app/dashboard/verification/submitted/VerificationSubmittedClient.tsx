'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight } from 'lucide-react';

type Props = {
  listingId: string | null;
  layer: string;
};

function VerificationSubmittedClient(props: Props) {
  useEffect(() => {
    // Auto-redirect after 6 seconds to checklist
    const timer = setTimeout(() => {
      if (props.listingId) {
        window.location.href = `/dashboard/verification/checklist?listingId=${props.listingId}`;
      }
    }, 6000);

    return () => clearTimeout(timer);
  }, [props.listingId, props.layer]);

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
        <CheckCircle2 className="h-8 w-8 text-[#10b981]" />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Layer {props.layer} Submitted</h2>
        <p className="text-zinc-400 max-w-md">
          Your verification documents have been submitted for review. Our team will review and notify you within 24-48 business hours.
        </p>
      </div>

      <Card className="max-w-md w-full">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm font-medium">Status: Pending Review</span>
          </div>
          <p className="text-xs text-zinc-400">
            You will receive a notification once the review is complete. You can continue to track progress on the checklist page.
          </p>
          <div className="flex gap-3">
            {props.listingId && (
              <Button onClick={() => { window.location.href = `/dashboard/verification/checklist?listingId=${props.listingId}`; }}>
                View Checklist
              </Button>
            )}
            <Button variant="outline" onClick={() => { window.location.href = '/dashboard/landlord/verify'; }}>
              Back to Properties
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default VerificationSubmittedClient;
