import type { PaymentProvider, AccountResolution } from '../../interfaces';
import { paystack, type InitializePaymentParams, type InitializePaymentResponse, type VerifyPaymentResponse, type TransferRecipientParams, type TransferRecipientResponse, type InitiateTransferParams, type InitiateTransferResponse } from '../../paystack';

export const paymentProvider: PaymentProvider = {
  initializeCharge(params: InitializePaymentParams) {
    return paystack.initializePayment(params);
  },
  verifyTransaction(reference: string) {
    return paystack.verifyPayment(reference);
  },
  createRecipient(params: TransferRecipientParams) {
    return paystack.createTransferRecipient(params);
  },
  initiateTransfer(params: InitiateTransferParams) {
    return paystack.initiateTransfer(params);
  },
  resolveAccountNumber(accountNumber: string, bankCode: string): Promise<AccountResolution> {
    return paystack.resolveAccountNumber(accountNumber, bankCode).then(res => ({
      accountNumber: res.data?.account_number ?? accountNumber,
      accountName: res.data?.account_name ?? '',
      bankId: res.data?.bank_id ?? 0,
      bankName: res.data?.bank_name ?? '',
    }));
  },
  supportedCurrencies: ['NGN'],
  providerName: 'Paystack',
};

export type { InitializePaymentParams, InitializePaymentResponse, VerifyPaymentResponse, TransferRecipientParams, TransferRecipientResponse, InitiateTransferParams, InitiateTransferResponse };
