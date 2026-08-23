import type { InitializePaymentParams, InitializePaymentResponse, VerifyPaymentResponse, TransferRecipientParams, TransferRecipientResponse, InitiateTransferParams, InitiateTransferResponse } from '../paystack';

export interface AccountResolution {
  accountNumber: string;
  accountName: string;
  bankId: number;
  bankName: string;
}

export interface PaymentProvider {
  initializeCharge(params: InitializePaymentParams): Promise<InitializePaymentResponse>;
  verifyTransaction(reference: string): Promise<VerifyPaymentResponse>;
  createRecipient(params: TransferRecipientParams): Promise<TransferRecipientResponse>;
  initiateTransfer(params: InitiateTransferParams): Promise<InitiateTransferResponse>;
  resolveAccountNumber(accountNumber: string, bankCode: string): Promise<AccountResolution>;
  supportedCurrencies: string[];
  providerName: string;
}
