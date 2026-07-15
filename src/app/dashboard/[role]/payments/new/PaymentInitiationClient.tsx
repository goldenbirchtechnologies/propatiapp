'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CreditCard, AlertCircle, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useInitiatePayment } from '@/hooks/usePayments';
import { useAgreements } from '@/hooks/useAgreements';
import { calculatePaymentBreakdown, formatAmountFromKobo, nairaToKobo } from '@/lib/payment-utils';
import MaterialIcon from '@/components/icons/material-icon';


interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

interface PaymentInitiationClientProps {
  user: User;
}

export default function PaymentInitiationClient({ user }: PaymentInitiationClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [paymentType, setPaymentType] = useState<string>('rent');
  const [agreementId, setAgreementId] = useState<string>('');
  const [listingId, setListingId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const { data: agreementsData } = useAgreements();
  const initiatePayment = useInitiatePayment();

  // Pre-fill from URL params
  useEffect(() => {
    const paramAgreementId = searchParams.get('agreementId');
    const paramAmount = searchParams.get('amount');
    const paramType = searchParams.get('type');

    if (paramAgreementId) setAgreementId(paramAgreementId);
    if (paramAmount) setAmount(paramAmount);
    if (paramType) setPaymentType(paramType);
  }, [searchParams]);

  const agreements = agreementsData?.data?.flatMap((page: unknown) => page.data || []) || [];
  const selectedAgreement = agreements.find((a: unknown) => a.id === agreementId);

  // Auto-fill listing ID from selected agreement
  useEffect(() => {
    if (selectedAgreement) {
      setListingId(selectedAgreement.listingId);
      if (paymentType === 'rent' && selectedAgreement.monthlyRent) {
        setAmount((selectedAgreement.monthlyRent / 100).toString());
      }
    }
  }, [selectedAgreement, paymentType]);

  const breakdown = amount
    ? calculatePaymentBreakdown(
        nairaToKobo(parseFloat(amount)),
        paymentType,
        !!selectedAgreement?.agentId
      )
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid payment amount',
        variant: 'destructive',
      });
      return;
    }

    if (!listingId) {
      toast({
        title: 'Missing Information',
        description: 'Please select an agreement or provide listing details',
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = await initiatePayment.mutateAsync({
        email: user.email,
        amount: parseFloat(amount),
        type: paymentType as unknown,
        listingId,
        agreementId: agreementId || undefined,
        metadata: {
          description: description || `${paymentType} payment`,
        },
      } as unknown);

      if (result.authorizationUrl) {
        // Redirect to Paystack
        window.location.href = result.authorizationUrl;
      }
    } catch (error) {
      toast({
        title: 'Payment Failed',
        description: 'Unable to initiate payment. Please try again.',
        variant: 'destructive',
      });
      console.error('Payment initiation error:', error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Initiate Payment</h1>
          <p className="text-on-surface-variant">
            Make a secure payment for rent, deposits, or service charges
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Payment Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Type</CardTitle>
              <CardDescription>Select the type of payment you want to make</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={paymentType} onValueChange={setPaymentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rent">Rent Payment</SelectItem>
                  <SelectItem value="caution">Caution Deposit</SelectItem>
                  <SelectItem value="service_charge">Service Charge</SelectItem>
                  <SelectItem value="short_let">Short Let</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Agreement Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Agreement</CardTitle>
              <CardDescription>
                Select the agreement this payment is for (optional for direct payments)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="agreement">Select Agreement</Label>
                <Select value={agreementId} onValueChange={setAgreementId}>
                  <SelectTrigger id="agreement">
                    <SelectValue placeholder="Choose an agreement..." />
                  </SelectTrigger>
                  <SelectContent>
                    {agreements.map((agreement: unknown) => (
                      <SelectItem key={agreement.id} value={agreement.id}>
                        {agreement.listing?.title} - {agreement.id.slice(-8).toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedAgreement && (
                <div className="bg-surface-container-low/50 rounded-lg p-4">
                  <p className="text-sm font-semibold">{selectedAgreement.listing?.title}</p>
                  <p className="text-sm text-on-surface-variant">{selectedAgreement.listing?.area}</p>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Agreement: {selectedAgreement.id.slice(-8).toUpperCase()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Amount */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Amount</CardTitle>
              <CardDescription>Enter the amount to pay (in Naira)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₦)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Rent for January 2024"
                />
              </div>
            </CardContent>
          </Card>

          {/* Fee Breakdown */}
          {breakdown && (
            <Card>
              <CardHeader>
                <CardTitle>Payment Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Payment Amount</span>
                    <span className="font-semibold">{formatAmountFromKobo(breakdown.amount)}</span>
                  </div>
                  {breakdown.platformFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-on-surface-variant">
                        Platform Fee ({((breakdown.platformFee / breakdown.amount) * 100).toFixed(1)}%)
                      </span>
                      <MaterialIcon name="{formatAmountFromKobo(breakdown.platformFee)}" className="material-symbols-outlined" />
                    </div>
                  )}
                  {breakdown.agentCommission > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-on-surface-variant">Agent Commission</span>
                      <span>{formatAmountFromKobo(breakdown.agentCommission)}</span>
                    </div>
                  )}
                  <div className="border-t pt-3 flex justify-between font-bold text-lg">
                    <MaterialIcon name="Total to Pay" className="material-symbols-outlined" />
                    <MaterialIcon name="{formatAmountFromKobo(breakdown.total)}" className="material-symbols-outlined" />
                  </div>
                </div>

                <div className="mt-4 bg-primary/10 border border-outline-variant rounded-lg p-3">
                  <div className="flex gap-2">
                    <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-primary">
                      <p className="font-semibold">Escrow Protection</p>
                      <p>
                        Your payment will be held securely in escrow until the transaction is completed.
                        Landlord receives {formatAmountFromKobo(breakdown.payeeAmount)}.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <Card>
            <CardContent className="pt-6">
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={initiatePayment.isPending || !amount || parseFloat(amount) <= 0}
              >
                {initiatePayment.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-5 w-5" />
                    Pay with Paystack
                  </>
                )}
              </Button>
              <p className="text-xs text-center text-on-surface-variant mt-3">
                You will be redirected to Paystack to complete your payment securely
              </p>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
