import type { PaymentProvider, AccountResolution } from '../../interfaces';

export const paymentProvider: PaymentProvider = {
  initializeCharge(params) {
    console.log('[GB Payment] Initialize charge (mock)');
    return Promise.resolve({ status: true, message: 'Mock', data: { authorization_url: '/mock', access_code: 'mock', reference: 'mock' } });
  },
  verifyTransaction(reference) {
    console.log('[GB Payment] Verify transaction (mock)');
    return Promise.resolve({ status: true, message: 'Mock', data: { status: 'success', reference, amount: 0 } });
  },
  createRecipient(params) {
    console.log('[GB Payment] Create recipient (mock)');
    return Promise.resolve({ status: true, message: 'Mock', data: { recipient_code: 'mock' } });
  },
  initiateTransfer(params) {
    console.log('[GB Payment] Initiate transfer/direct debit (mock)');
    return Promise.resolve({ status: true, message: 'Mock', data: { transfer_code: 'mock' } });
  },
  resolveAccountNumber(accountNumber, bankCode) {
    return Promise.resolve({ accountNumber, accountName: '', bankId: 0, bankName: '' });
  },
  supportedCurrencies: ['GBP'],
  providerName: 'Stripe + GoCardless',
};
