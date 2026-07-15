'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, CreditCard } from 'lucide-react';
import { formatAmountFromKobo, calculatePaymentBreakdown } from '@/lib/payment-utils';
import { useInitiatePayment } from '@/hooks/usePayments';
import { useToast } from '@/hooks/use-toast';
interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  amount: number; // Amount in kobo
  type: 'rent' | 'sale' | 'short_let' | 'caution' | 'service_charge';
  listingId: string;
  agreementId?: string;
  rentScheduleEntryId?: string;
  email: string;
  description?: string;
  hasAgent?: boolean;
}
import MaterialIcon from '@/components/icons/material-icon';
export function PaymentModal({
  open,
  onClose,
  amount,
  type,
  listingId,
  agreementId,
  rentScheduleEntryId,
  email,
  description,
  hasAgent = false,
}: PaymentModalProps) {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const initiatePayment = useInitiatePayment();
  const { toast } = useToast();
  const breakdown = calculatePaymentBreakdown(amount, type, hasAgent);
  const handleProceed = async () => {
    if (!termsAccepted) {
      toast({
        title: 'Terms Required',
        description: 'Please accept the terms and conditions to proceed',
        variant: 'destructive',
      });
      return;
    try {
      const result = await initiatePayment.mutateAsync({
        amount: amount / 100, // Convert from kobo to naira for API
        metadata: {
          description: description || `Payment for ${type}`,
        },
      } as unknown);
      // Redirect to Paystack checkout
      if (result.authorizationUrl) {
        window.location.href = result.authorizationUrl;
    } catch (error) {
        title: 'Payment Initiation Failed',
        description: 'Unable to start payment process. Please try again.',
      console.error('Payment initiation error:', error);
  };
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Payment Confirmation</DialogTitle>
          <DialogDescription>
            Review the payment details before proceeding to checkout
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Amount Breakdown */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Payment Amount</span>
              <span className="font-semibold">{formatAmountFromKobo(breakdown.amount)}</span>
            </div>
            {breakdown.platformFee > 0 && (
                <span className="text-muted-foreground">Platform Fee ({((breakdown.platformFee / breakdown.amount) * 100).toFixed(1)}%)</span>
                <span className="font-semibold">{formatAmountFromKobo(breakdown.platformFee)}</span>
            )}
            {breakdown.agentCommission > 0 && (
                <span className="text-muted-foreground">Agent Commission</span>
                <span className="font-semibold">{formatAmountFromKobo(breakdown.agentCommission)}</span>
            <div className="border-t pt-3 flex justify-between font-bold">
              <MaterialIcon name="Total to Pay" className="material-symbols-outlined" />
              <span className="text-lg">{formatAmountFromKobo(breakdown.total)}</span>
          {/* Payee Amount Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">Landlord receives:</span>{' '}
              {formatAmountFromKobo(breakdown.payeeAmount)} after fees
            </p>
          {/* Terms and Conditions */}
          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
            />
            <label
              htmlFor="terms"
              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I agree to the{' '}
              <a href="/terms" target="_blank" className="text-primary underline">
                terms and conditions
              </a>{' '}
              and understand that this payment will be held in escrow until the transaction is completed.
            </label>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={initiatePayment.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleProceed}
            disabled={!termsAccepted || initiatePayment.isPending}
            {initiatePayment.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
                <CreditCard className="mr-2 h-4 w-4" />
                Proceed to Paystack
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, CreditCard } from 'lucide-react';
import { formatAmountFromKobo, calculatePaymentBreakdown } from '@/lib/payment-utils';
import { useInitiatePayment } from '@/hooks/usePayments';
import { useToast } from '@/hooks/use-toast';


interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  amount: number; // Amount in kobo
  type: 'rent' | 'sale' | 'short_let' | 'caution' | 'service_charge';
  listingId: string;
  agreementId?: string;
  rentScheduleEntryId?: string;
  email: string;
  description?: string;
  hasAgent?: boolean;
}
import MaterialIcon from '@/components/icons/material-icon';

export function PaymentModal({
  open,
  onClose,
  amount,
  type,
  listingId,
  agreementId,
  rentScheduleEntryId,
  email,
  description,
  hasAgent = false,
}: PaymentModalProps) {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const initiatePayment = useInitiatePayment();
  const { toast } = useToast();

  const breakdown = calculatePaymentBreakdown(amount, type, hasAgent);

  const handleProceed = async () => {
    if (!termsAccepted) {
      toast({
        title: 'Terms Required',
        description: 'Please accept the terms and conditions to proceed',
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = await initiatePayment.mutateAsync({
        email,
        amount: amount / 100, // Convert from kobo to naira for API
        type,
        listingId,
        agreementId,
        rentScheduleEntryId,
        metadata: {
          description: description || `Payment for ${type}`,
        },
      } as unknown);

      // Redirect to Paystack checkout
      if (result.authorizationUrl) {
        window.location.href = result.authorizationUrl;
      }
    } catch (error) {
      toast({
        title: 'Payment Initiation Failed',
        description: 'Unable to start payment process. Please try again.',
        variant: 'destructive',
      });
      console.error('Payment initiation error:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Payment Confirmation</DialogTitle>
          <DialogDescription>
            Review the payment details before proceeding to checkout
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Amount Breakdown */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Payment Amount</span>
              <span className="font-semibold">{formatAmountFromKobo(breakdown.amount)}</span>
            </div>

            {breakdown.platformFee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Platform Fee ({((breakdown.platformFee / breakdown.amount) * 100).toFixed(1)}%)</span>
                <span className="font-semibold">{formatAmountFromKobo(breakdown.platformFee)}</span>
              </div>
            )}

            {breakdown.agentCommission > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Agent Commission</span>
                <span className="font-semibold">{formatAmountFromKobo(breakdown.agentCommission)}</span>
              </div>
            )}

            <div className="border-t pt-3 flex justify-between font-bold">
              <MaterialIcon name="Total to Pay" className="material-symbols-outlined" />
              <span className="text-lg">{formatAmountFromKobo(breakdown.total)}</span>
            </div>
          </div>

          {/* Payee Amount Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">Landlord receives:</span>{' '}
              {formatAmountFromKobo(breakdown.payeeAmount)} after fees
            </p>
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
            />
            <label
              htmlFor="terms"
              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I agree to the{' '}
              <a href="/terms" target="_blank" className="text-primary underline">
                terms and conditions
              </a>{' '}
              and understand that this payment will be held in escrow until the transaction is completed.
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={initiatePayment.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleProceed}
            disabled={!termsAccepted || initiatePayment.isPending}
          >
            {initiatePayment.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Proceed to Paystack
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
