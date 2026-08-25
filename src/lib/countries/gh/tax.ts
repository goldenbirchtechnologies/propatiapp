import type { TaxEngine } from '../../interfaces';

export const taxEngine: TaxEngine = {
  calculateDuty(amount, propertyType, transactionType) {
    const annualRent = typeof amount === 'number' ? amount : amount.toNumber();
    // Ghana: 1% of annual rent, minimum GHS 50
    const computed = annualRent * 0.01;
    return Math.max(computed, 50);
  },
  getTaxRate(type) {
    return 0.01;
  },
  minimumDuty: 50,
  currency: 'GHS',
  initiateTaxPayment(params) {
    // TODO: Integrate Ghana Revenue Authority payment
    console.log('[GH Tax] Initiating tax payment (mock)');
    return Promise.resolve({ rrr: 'mock_rrr', paymentUrl: '/mock', amount: params.amount });
  },
  verifyTaxPayment(rrr: string) {
    console.log('[GH Tax] Verifying tax payment:', rrr);
    return Promise.resolve({ paid: true, transactionId: 'mock_txn' });
  },
};
