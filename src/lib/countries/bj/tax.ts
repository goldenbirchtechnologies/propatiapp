import type { TaxEngine } from '../../interfaces';

export const taxEngine: TaxEngine = {
  calculateDuty(amount, propertyType, transactionType) {
    const annualRent = typeof amount === 'number' ? amount : amount.toNumber();
    // Benin: 0.5% of annual rent, minimum XOF 25000
    const computed = annualRent * 0.005;
    return Math.max(computed, 25000);
  },
  getTaxRate(type) {
    return 0.005;
  },
  minimumDuty: 25000,
  currency: 'XOF',
  initiateTaxPayment(params) {
    console.log('[BJ Tax] Initiating tax payment (mock)');
    return Promise.resolve({ rrr: 'mock_rrr', paymentUrl: '/mock', amount: params.amount });
  },
  verifyTaxPayment(rrr: string) {
    console.log('[BJ Tax] Verifying tax payment:', rrr);
    return Promise.resolve({ paid: true, transactionId: 'mock_txn' });
  },
};
