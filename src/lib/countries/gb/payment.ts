import type { PaymentProvider, AccountResolution } from '../../interfaces';

export const paymentProvider: PaymentProvider = {
  initializeCharge(params) {
    console.log('[GB Payment] Initialize charge (mock)');
    return Promise.resolve({ status: true, message: 'Mock', data: { authorization_url: '/mock', access_code: 'mock', reference: 'mock' } });
  },
  verifyTransaction(reference) {
    console.log('[GB Payment] Verify transaction (mock)');
    return Promise.resolve({
      status: true,
      message: 'Mock',
      data: {
        id: 0,
        domain: 'mock',
        status: 'success' as const,
        reference,
        amount: 0,
        message: null,
        gateway_response: 'Mock',
        paid_at: '',
        created_at: '',
        channel: 'mock',
        currency: 'GBP',
        ip_address: '',
        metadata: {},
        fees: 0,
        customer: { id: 0, email: '', customer_code: '' },
        authorization: {
          authorization_code: '',
          bin: '',
          last4: '',
          exp_month: '',
          exp_year: '',
          channel: '',
          card_type: '',
          bank: '',
          country_code: '',
          brand: '',
          reusable: false,
          signature: '',
        },
      },
    });
  },
  createRecipient(params) {
    console.log('[GB Payment] Create recipient (mock)');
    return Promise.resolve({
      status: true,
      message: 'Mock',
      data: {
        recipient_code: 'mock',
        type: 'mock',
        name: params.name,
        details: {
          account_number: params.account_number,
          account_name: params.name,
          bank_code: params.bank_code,
          bank_name: '',
        },
      },
    });
  },
  initiateTransfer(params) {
    console.log('[GB Payment] Initiate transfer/direct debit (mock)');
    return Promise.resolve({
      status: true,
      message: 'Mock',
      data: {
        transfer_code: 'mock',
        reference: params.reference,
        status: 'pending' as const,
        amount: params.amount,
        recipient: params.recipient,
        reason: params.reason ?? '',
        currency: 'GBP',
      },
    });
  },
  resolveAccountNumber(accountNumber, bankCode) {
    return Promise.resolve({ accountNumber, accountName: '', bankId: 0, bankName: '' });
  },
  supportedCurrencies: ['GBP'],
  providerName: 'Stripe + GoCardless',
};
