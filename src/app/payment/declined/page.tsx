'use client';

import Link from 'next/link';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PaymentDeclinedPage() {
  const handleRetry = () => window.location.assign('/dashboard/payments/new');

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-16">
        <Card className="border-white/[0.08] shadow-1">
          <CardHeader className="items-center text-center">
            <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="h-8 w-8 text-destructive" aria-hidden="true" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Payment Declined</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-center text-sm text-zinc-500">
              Your bank declined the transaction. This doesn&apos;t block your account — you can retry the payment
              when you&apos;re ready.
            </p>

            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
              <p className="text-sm font-medium text-destructive">Bank pickup guidance</p>
              <p className="mt-1 text-sm text-zinc-500">
                Your bank may have placed a hold. Contact your issuing bank and request an approval or release for the
                pending charge. Once resolved, retry the payment below.
              </p>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
              <Button asChild variant="outline">
                <Link href="/dashboard/payments">Back to payments</Link>
              </Button>
              <Button onClick={handleRetry}>Retry with new payment</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
