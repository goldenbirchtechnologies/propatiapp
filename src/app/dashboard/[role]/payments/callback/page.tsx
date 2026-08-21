'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, Download, ArrowRight } from 'lucide-react';
import { useVerifyPayment } from '@/hooks/usePayments';
import { useToast } from '@/hooks/use-toast';

export default function PaymentCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [transactionId, setTransactionId] = useState<string | null>(null);

  const verifyPayment = useVerifyPayment();

  useEffect(() => {
    const reference = searchParams.get('reference');
    const trxref = searchParams.get('trxref'); // Paystack also sends this

    if (!reference && !trxref) {
      toast({
        title: 'Invalid Callback',
        description: 'No payment reference found',
        variant: 'destructive',
      });
      setStatus('failed');
      return;
    }

    const paymentRef = reference || trxref;

    // Verify the payment
    verifyPayment.mutate(paymentRef!, {
      onSuccess: (data) => {
        setStatus('success');
        setTransactionId(data.id);
        toast({
          title: 'Payment Successful',
          description: 'Your payment has been verified successfully',
        });
      },
      onError: (error) => {
        setStatus('failed');
        toast({
          title: 'Verification Failed',
          description: 'Unable to verify your payment. Please contact support.',
          variant: 'destructive',
        });
        console.error('Payment verification error:', error);
      },
    });
  }, [searchParams, verifyPayment, toast]);

  const handleDownloadReceipt = () => {
    if (transactionId) {
      router.push(`/dashboard/payments/${transactionId}/receipt`);
    }
  };

  const handleViewTransaction = () => {
    if (transactionId) {
      router.push(`/dashboard/payments/${transactionId}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6">
          {status === 'verifying' && (
            <div className="text-center py-8">
              <Loader2 className="h-16 w-16 animate-spin text-white mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Verifying Payment</h2>
              <p className="text-neutral-400">
                Please wait while we verify your payment with Paystack...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center py-8">
              <div className="bg-success/10 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-[#00ff66]" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
              <p className="text-neutral-400 mb-6">
                Your payment has been received and verified. The funds are now held securely in escrow.
              </p>

              <div className="space-y-3">
                <Button
                  onClick={handleViewTransaction}
                  className="w-full"
                  size="lg"
                >
                  <ArrowRight className="mr-2 h-5 w-5" />
                  View Transaction Details
                </Button>
                <Button
                  onClick={handleDownloadReceipt}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Download Receipt
                </Button>
              </div>
            </div>
          )}

          {status === 'failed' && (
            <div className="text-center py-8">
              <div className="bg-red-500/10 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <XCircle className="h-12 w-12 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Payment Failed</h2>
              <p className="text-neutral-400 mb-6">
                We couldn't verify your payment. If you were charged, please contact support with your payment reference.
              </p>

              <div className="space-y-3">
                <Button
                  onClick={() => router.push('/dashboard/payments/new')}
                  className="w-full"
                  size="lg"
                >
                  Try Again
                </Button>
                <Button
                  onClick={() => router.push('/dashboard/payments')}
                  variant="outline"
                  className="w-full"
                >
                  View All Transactions
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </div>
    </div>
  );
}
