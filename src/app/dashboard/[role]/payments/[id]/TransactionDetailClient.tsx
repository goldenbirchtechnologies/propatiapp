'use client';

import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Download,
  CreditCard,
  Building,
  User,
  Calendar,
  FileText,
  Loader2,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { useTransaction } from '@/hooks/usePayments';
import { TransactionStatusBadge } from '@/components/payments/transaction-status-badge';
import { formatAmountFromKobo, formatTransactionReference } from '@/lib/payment-utils';

interface User {
  id: string;
  role: string;
}

interface TransactionDetailClientProps {
  transactionId: string;
  user: User;
}

export default function TransactionDetailClient({ transactionId, user }: TransactionDetailClientProps) {
  const router = useRouter();
  const { data: transaction, isLoading } = useTransaction(transactionId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-bold mb-2">Transaction Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The transaction you're looking for doesn't exist or you don't have access to it.
        </p>
        <Button onClick={() => router.push('/dashboard/payments')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Transactions
        </Button>
      </div>
    );
  }

  const handleDownloadReceipt = () => {
    router.push(`/dashboard/payments/${transactionId}/receipt`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Transaction Details</h1>
            <p className="text-muted-foreground">
              Reference: {formatTransactionReference(transaction.reference)}
            </p>
          </div>
        </div>
        {(transaction.status === 'released' || transaction.status === 'completed') && (
          <Button onClick={handleDownloadReceipt}>
            <Download className="mr-2 h-4 w-4" />
            Download Receipt
          </Button>
        )}
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payment Status</CardTitle>
              <CardDescription>Current status of this transaction</CardDescription>
            </div>
            <TransactionStatusBadge status={transaction.status} />
          </div>
        </CardHeader>
        <CardContent>
          {/* Status Timeline */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-green-100 rounded-full p-2 mt-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">Payment Initiated</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(transaction.createdAt), 'PPpp')}
                </p>
              </div>
            </div>

            {transaction.status !== 'pending' && transaction.status !== 'failed' && (
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 rounded-full p-2 mt-1">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Payment Verified - In Escrow</p>
                  <p className="text-sm text-muted-foreground">
                    Funds are being held securely
                  </p>
                </div>
              </div>
            )}

            {(transaction.status === 'released' || transaction.status === 'completed') && (
              <div className="flex items-start gap-3">
                <div className="bg-green-100 rounded-full p-2 mt-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Payment Released</p>
                  <p className="text-sm text-muted-foreground">
                    {transaction.releasedAt
                      ? format(new Date(transaction.releasedAt), 'PPpp')
                      : 'Completed'}
                  </p>
                </div>
              </div>
            )}

            {transaction.status === 'failed' && (
              <div className="flex items-start gap-3">
                <div className="bg-red-100 rounded-full p-2 mt-1">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Payment Failed</p>
                  <p className="text-sm text-muted-foreground">
                    The payment could not be processed
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Amount Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Amount Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-lg">
              <span className="text-muted-foreground">Payment Amount</span>
              <span className="font-bold">{formatAmountFromKobo(transaction.amount)}</span>
            </div>

            <Separator />

            {transaction.platformFee > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform Fee</span>
                <span>{formatAmountFromKobo(transaction.platformFee)}</span>
              </div>
            )}

            {transaction.agentCommission > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Agent Commission</span>
                <span>{formatAmountFromKobo(transaction.agentCommission)}</span>
              </div>
            )}

            {transaction.payeeAmount && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount to Landlord</span>
                <span className="font-semibold">{formatAmountFromKobo(transaction.payeeAmount)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transaction Information */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <CreditCard className="h-4 w-4" />
                <span className="text-sm font-semibold">Payment Type</span>
              </div>
              <Badge variant="outline" className="capitalize">
                {transaction.type.replace('_', ' ')}
              </Badge>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <FileText className="h-4 w-4" />
                <span className="text-sm font-semibold">Reference</span>
              </div>
              <p className="font-mono text-sm">{transaction.reference}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <User className="h-4 w-4" />
                <span className="text-sm font-semibold">Payer</span>
              </div>
              <p className="font-medium">{transaction.payer?.fullName || 'N/A'}</p>
              <p className="text-sm text-muted-foreground">{transaction.payer?.email || ''}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <User className="h-4 w-4" />
                <span className="text-sm font-semibold">Payee</span>
              </div>
              <p className="font-medium">{transaction.payee?.fullName || 'N/A'}</p>
              <p className="text-sm text-muted-foreground">{transaction.payee?.email || ''}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property/Agreement Information */}
      {transaction.listing && (
        <Card>
          <CardHeader>
            <CardTitle>Related Property</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              <div className="bg-muted rounded-lg p-3">
                <Building className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{transaction.listing.title}</h3>
                <p className="text-sm text-muted-foreground">{transaction.listing.area}</p>
                {transaction.agreements?.[0] && (
                  <div className="mt-2">
                    <Badge variant="secondary">
                      Agreement: {transaction.agreements[0].id.slice(-8).toUpperCase()}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Escrow Information */}
      {transaction.status === 'in_escrow' && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="text-blue-900">Escrow Protection</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-900">
              Your payment is being held securely in escrow. The funds will be released to the landlord
              once the transaction is completed and verified by the admin.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
