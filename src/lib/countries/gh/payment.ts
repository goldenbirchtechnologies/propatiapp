import type { PaymentProvider, AccountResolution } from '../../interfaces';
import { paystack } from '../../../lib/paystack';

export const paymentProvider: PaymentProvider = {
  initializeCharge(params) {
    return paystack.initializePayment({ ...params, channels: ['card', 'bank', 'ussd', 'bank_transfer', 'mobile_money'] });
  },
  verifyTransaction(reference) {
    return paystack.verifyPayment(reference);
  },
  createRecipient(params) {
    return paystack.createTransferRecipient({ ...params, currency: 'GHS' });
  },
  initiateTransfer(params) {
    return paystack.initiateTransfer(params);
  },
  resolveAccountNumber(accountNumber, bankCode) {
    return paystack.resolveAccountNumber(accountNumber, bankCode).then(res => ({
      accountNumber: res.data?.account_number ?? accountNumber,
      accountName: res.data?.account_name ?? '',
      bankId: res.data?.bank_id ?? 0,
      bankName: res.data?.bank_name ?? '',
    }));
  },
  supportedCurrencies: ['GHS'],
  providerName: 'Paystack',
};
