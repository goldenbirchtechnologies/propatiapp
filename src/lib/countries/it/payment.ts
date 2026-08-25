import type { PaymentProvider, AccountResolution } from '../../interfaces';

export const paymentProvider: PaymentProvider = {
  initializeCharge(params) {
    console.log('[IT Payment] Initialize charge (mock): SEPA + Stripe');
    return Promise.resolve({ status: true, message: 'Mock', data: { authorization_url: '/mock', access_code: 'mock', reference: 'mock' } });
  },
  verifyTransaction(reference) {
    console.log('[IT Payment] Verify transaction (mock)');
    return Promise.resolve({ status: true, message: 'Mock', data: { status: 'success', reference, amount: 0 } });
  },
  createRecipient(params) {
    console.log('[IT Payment] Create recipient (mock)');
    return Promise.resolve({ status: true, message: 'Mock', data: { recipient_code: 'mock' } });
  },
  initiateTransfer(params) {
    console.log('[IT Payment] Initiate SEPA direct debit (mock)');
    return Promise.resolve({ status: true, message: 'Mock', data: { transfer_code: 'mock' } });
  },
  resolveAccountNumber(iban, bic) {
    return Promise.resolve({ accountNumber: iban, accountName: '', bankId: 0, bankName: '' });
  },
  supportedCurrencies: ['EUR'],
  providerName: 'Stripe + SEPA',
};
