'use client'

import AppIcon from '@/components/icons/app-icon';

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
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-zinc-500" />
        <h2 className="text-2xl font-bold mb-2">Transaction Not Found</h2>
        <p className="text-zinc-500 mb-4">
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
            <p className="text-zinc-500">
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
      <div className="glass-card">
        <div className="px-6 py-5 border-b border-white/[0.08]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Payment Status</h3>
              <p className="text-sm text-zinc-500">Current status of this transaction</p>
            </div>
            <TransactionStatusBadge status={transaction.status} />
          </div>
        </div>
        <div className="p-6">
          {/* Status Timeline */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-success/10 rounded-full p-2 mt-1">
                <CheckCircle className="h-4 w-4 text-[#00ff66]" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">Payment Initiated</p>
                <p className="text-sm text-zinc-500">
                  {format(new Date(transaction.createdAt), 'PPpp')}
                </p>
              </div>
            </div>

            {transaction.status !== 'pending' && transaction.status !== 'failed' && (
              <div className="flex items-start gap-3">
                <div className="bg-zinc-900 rounded-full p-2 mt-1">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Payment Verified - In Escrow</p>
                  <p className="text-sm text-zinc-500">
                    Funds are being held securely
                  </p>
                </div>
              </div>
            )}

            {(transaction.status === 'released' || transaction.status === 'completed') && (
              <div className="flex items-start gap-3">
                <div className="bg-success/10 rounded-full p-2 mt-1">
                  <CheckCircle className="h-4 w-4 text-[#00ff66]" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Payment Released</p>
                  <p className="text-sm text-zinc-500">
                    {transaction.releasedAt
                      ? format(new Date(transaction.releasedAt), 'PPpp')
                      : 'Completed'}
                  </p>
                </div>
              </div>
            )}

            {transaction.status === 'failed' && (
              <div className="flex items-start gap-3">
                <div className="bg-red-500/10 rounded-full p-2 mt-1">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Payment Failed</p>
                  <p className="text-sm text-zinc-500">
                    The payment could not be processed
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Amount Breakdown */}
      <div className="glass-card">
        <div className="px-6 py-5 border-b border-white/[0.08]">
          <h3 className="text-lg font-semibold text-white">Amount Breakdown</h3>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            <div className="flex justify-between text-lg">
              <span className="text-zinc-500">Payment Amount</span>
              <span className="font-bold">{formatAmountFromKobo(transaction.amount)}</span>
            </div>

            <Separator />

            {transaction.platformFee > 0 && (
              <div className="flex justify-between">
                <span className="text-zinc-500">Platform Fee</span>
                <AppIcon name={formatAmountFromKobo(transaction.platformFee)} className="lucide" />
              </div>
            )}

            {transaction.agentCommission > 0 && (
              <div className="flex justify-between">
                <span className="text-zinc-500">Agent Commission</span>
                <span>{formatAmountFromKobo(transaction.agentCommission)}</span>
              </div>
            )}

            {transaction.payeeAmount && (
              <div className="flex justify-between">
                <span className="text-zinc-500">Amount to Landlord</span>
                <span className="font-semibold">{formatAmountFromKobo(transaction.payeeAmount)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transaction Information */}
      <div className="glass-card">
        <div className="px-6 py-5 border-b border-white/[0.08]">
          <h3 className="text-lg font-semibold text-white">Transaction Information</h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-zinc-500 mb-2">
                <CreditCard className="h-4 w-4" />
                <span className="text-sm font-semibold">Payment Type</span>
              </div>
              <Badge variant="outline" className="capitalize">
                {transaction.type.replace('_', ' ')}
              </Badge>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-zinc-500 mb-2">
                <FileText className="h-4 w-4" />
                <span className="text-sm font-semibold">Reference</span>
              </div>
              <p className="font-mono text-sm">{transaction.reference}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-zinc-500 mb-2">
                <User className="h-4 w-4" />
                <span className="text-sm font-semibold">Payer</span>
              </div>
              <p className="font-medium">{transaction.payer?.fullName || 'N/A'}</p>
              <p className="text-sm text-zinc-500">{transaction.payer?.email || ''}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-zinc-500 mb-2">
                <User className="h-4 w-4" />
                <span className="text-sm font-semibold">Payee</span>
              </div>
              <p className="font-medium">{transaction.payee?.fullName || 'N/A'}</p>
              <p className="text-sm text-zinc-500">{transaction.payee?.email || ''}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Property/Agreement Information */}
      {transaction.listing && (
        <div className="glass-card">
          <div className="px-6 py-5 border-b border-white/[0.08]">
            <h3 className="text-lg font-semibold text-white">Related Property</h3>
          </div>
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="bg-zinc-950/50 rounded-lg p-3">
                <Building className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{transaction.listing.title}</h3>
                <p className="text-sm text-zinc-500">{transaction.listing.area}</p>
                {transaction.agreements?.[0] && (
                  <div className="mt-2">
                    <Badge variant="secondary">
                      Agreement: {transaction.agreements[0].id.slice(-8).toUpperCase()}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Escrow Information */}
      {transaction.status === 'in_escrow' && (
        <div className="glass-card border-white/[0.08] bg-zinc-900/50">
          <div className="px-6 py-5 border-b border-white/[0.08]">
            <h3 className="text-lg font-semibold text-white text-white">Escrow Protection</h3>
          </div>
          <div className="p-6">
            <p className="text-sm text-white">
              Your payment is being held securely in escrow. The funds will be released to the landlord
              once the transaction is completed and verified by the admin.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
