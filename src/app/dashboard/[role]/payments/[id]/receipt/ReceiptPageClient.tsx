'use client';

import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useTransaction } from '@/hooks/usePayments';
import { Receipt } from '@/components/payments/receipt';

interface ReceiptPageClientProps {
  transactionId: string;
}

export default function ReceiptPageClient({ transactionId }: ReceiptPageClientProps) {
  const router = useRouter();
  const { data: transaction, isLoading } = useTransaction(transactionId);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Transaction Not Found</h2>
          <p className="text-zinc-500 mb-4">
            Unable to load receipt for this transaction
          </p>
          <Button onClick={() => router.push('/dashboard/payments')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Transactions
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="mb-6 no-print">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <Receipt transaction={transaction as unknown} />
      </div>
    </div>
  );
}
