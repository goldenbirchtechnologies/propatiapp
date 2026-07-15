'use client'

import MaterialIcon from '@/components/icons/material-icon';

import { format } from 'date-fns';
import { formatAmountFromKobo, formatTransactionReference } from '@/lib/payment-utils';
import { TransactionStatusBadge } from './transaction-status-badge';


interface ReceiptProps {
  transaction: {
    id: string;
    reference: string;
    amount: number; // in kobo
    platformFee: number;
    agentCommission: number;
    payeeAmount: number;
    type: string;
    status: string;
    createdAt: string;
    paidAt?: string;
    payer: {
      fullName: string;
      email: string;
    };
    payee?: {
      fullName: string;
      email: string;
    };
    listing?: {
      title: string;
      area: string;
    };
    agreement?: {
      id: string;
    };
  };
}

export function Receipt({ transaction }: ReceiptProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto bg-white">
      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .receipt-print-area,
          .receipt-print-area * {
            visibility: visible;
          }
          .receipt-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="receipt-print-area p-8 border rounded-lg shadow-sm">
        {/* Header */}
        <div className="border-b pb-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-primary">PROPATI</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Nigeria's Verified Property Marketplace
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                www.propati.ng | support@propati.ng
              </p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold">Payment Receipt</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Receipt #{formatTransactionReference(transaction.reference)}
              </p>
              <TransactionStatusBadge
                status={transaction.status as unknown}
                className="mt-2"
              />
            </div>
          </div>
        </div>

        {/* Transaction Details */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              From (Payer)
            </h3>
            <p className="font-semibold">{transaction.payer.fullName}</p>
            <p className="text-sm text-muted-foreground">{transaction.payer.email}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              To (Payee)
            </h3>
            <p className="font-semibold">
              {transaction.payee?.fullName || 'N/A'}
            </p>
            <p className="text-sm text-muted-foreground">
              {transaction.payee?.email || ''}
            </p>
          </div>
        </div>

        {/* Property Details */}
        {transaction.listing && (
          <div className="bg-muted/30 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              Property Details
            </h3>
            <p className="font-semibold">{transaction.listing.title}</p>
            <p className="text-sm text-muted-foreground">{transaction.listing.area}</p>
            {transaction.agreement && (
              <p className="text-xs text-muted-foreground mt-1">
                Agreement ID: {transaction.agreement.id.slice(-8).toUpperCase()}
              </p>
            )}
          </div>
        )}

        {/* Payment Breakdown */}
        <div className="border-t pt-6 mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-4">
            Payment Breakdown
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Amount</span>
              <span className="font-semibold">
                {formatAmountFromKobo(transaction.amount)}
              </span>
            </div>
            {transaction.platformFee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Platform Fee</span>
                <MaterialIcon name={formatAmountFromKobo(transaction.platformFee)} className="material-symbols-outlined" />
              </div>
            )}
            {transaction.agentCommission > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Agent Commission</span>
                <span>{formatAmountFromKobo(transaction.agentCommission)}</span>
              </div>
            )}
            {transaction.payeeAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount to Landlord</span>
                <span className="font-semibold">
                  {formatAmountFromKobo(transaction.payeeAmount)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Transaction Info */}
        <div className="border-t pt-6 mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-4">
            Transaction Information
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Transaction ID</p>
              <p className="font-mono text-xs">{transaction.id}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Reference</p>
              <p className="font-mono text-xs">{transaction.reference}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Payment Type</p>
              <p className="capitalize">{transaction.type.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Date Initiated</p>
              <p>{format(new Date(transaction.createdAt), 'PPpp')}</p>
            </div>
            {transaction.paidAt && (
              <div>
                <p className="text-muted-foreground">Date Paid</p>
                <p>{format(new Date(transaction.paidAt), 'PPpp')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            This is an electronically generated receipt and does not require a signature.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            For inquiries, contact support@propati.ng or visit www.propati.ng
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            PROPATI - Secured by Paystack | Regulated Property Transactions
          </p>
        </div>
      </div>

      {/* Print Button (hidden in print) */}
      <div className="mt-6 text-center no-print">
        <button
          onClick={handlePrint}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Print / Download as PDF
        </button>
        <p className="text-xs text-muted-foreground mt-2">
          Use your browser's print function and select "Save as PDF"
        </p>
      </div>
    </div>
  );
}
