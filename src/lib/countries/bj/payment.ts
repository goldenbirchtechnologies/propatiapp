import type { PaymentProvider, AccountResolution } from '../../interfaces';

export const paymentProvider: PaymentProvider = {
  initializeCharge(params) {
    // TODO: Integrate local provider (e.g., Celtis, Orange Money)
    console.log('[BJ Payment] Initialize charge (mock)');
    return Promise.resolve({ status: true, message: 'Mock', data: { authorization_url: '/mock', access_code: 'mock', reference: 'mock' } });
  },
  verifyTransaction(reference) {
    console.log('[BJ Payment] Verify transaction (mock)');
    return Promise.resolve({ status: true, message: 'Mock', data: { status: 'success', reference, amount: 0 } });
  },
  createRecipient(params) {
    console.log('[BJ Payment] Create recipient (mock)');
    return Promise.resolve({ status: true, message: 'Mock', data: { recipient_code: 'mock' } });
  },
  initiateTransfer(params) {
    console.log('[BJ Payment] Initiate transfer (mock)');
    return Promise.resolve({ status: true, message: 'Mock', data: { transfer_code: 'mock' } });
  },
  resolveAccountNumber(accountNumber, bankCode) {
    return Promise.resolve({ accountNumber, accountName: '', bankId: 0, bankName: '' });
  },
  supportedCurrencies: ['XOF'],
  providerName: 'Local Provider',
};
