'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2 } from 'lucide-react';
import { PaymentModal } from './payment-modal';

interface RentPaymentButtonProps {
  rentScheduleEntryId: string;
  amount: number; // Amount in kobo
  agreementId: string;
  listingId: string;
  email: string;
  disabled?: boolean;
  hasAgent?: boolean;
}

export function RentPaymentButton({
  rentScheduleEntryId,
  amount,
  agreementId,
  listingId,
  email,
  disabled = false,
  hasAgent = false,
}: RentPaymentButtonProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button
        size="sm"
        onClick={() => setShowModal(true)}
        disabled={disabled}
      >
        <CreditCard className="mr-2 h-4 w-4" />
        Pay Now
      </Button>

      <PaymentModal
        open={showModal}
        onClose={() => setShowModal(false)}
        amount={amount}
        type="rent"
        listingId={listingId}
        agreementId={agreementId}
        rentScheduleEntryId={rentScheduleEntryId}
        email={email}
        description={`Rent payment for agreement ${agreementId.slice(-8)}`}
        hasAgent={hasAgent}
      />
    </>
  );
}
