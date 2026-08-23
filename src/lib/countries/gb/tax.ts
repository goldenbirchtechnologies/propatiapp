import type { TaxEngine } from '../../interfaces';

const SDLT_BANDS = [
  { upTo: 250000, rate: 0 },
  { upTo: 925000, rate: 0.05 },
  { upTo: 1500000, rate: 0.10 },
  { upTo: Infinity, rate: 0.12 },
];

export function calculateSDLT(propertyPrice: number): number {
  let tax = 0;
  let remaining = propertyPrice;
  let previousLimit = 0;
  for (const band of SDLT_BANDS) {
    const taxable = Math.min(remaining, band.upTo - previousLimit);
    if (taxable <= 0) break;
    tax += taxable * band.rate;
    remaining -= taxable;
    previousLimit = band.upTo;
    if (remaining <= 0) break;
  }
  return tax;
}

export function calculateLeasePremiumDuty(premium: number): number {
  if (premium <= 125000) return 0;
  return (premium - 125000) * 0.01;
}

export const taxEngine: TaxEngine = {
  calculateDuty(amount, propertyType, transactionType) {
    const value = typeof amount === 'number' ? amount : amount.toNumber();
    if (transactionType === 'sale' || transactionType === 'purchase') return calculateSDLT(value);
    if (transactionType === 'rent' || transactionType === 'tenancy') return calculateLeasePremiumDuty(value);
    return 0;
  },
  getTaxRate(type) {
    if (type === 'sale') return 0.05;
    if (type === 'rent') return 0.01;
    return 0;
  },
  minimumDuty: 0,
  currency: 'GBP',
  initiateTaxPayment(params) {
    console.log('[GB Tax] Initiating payment (mock)');
    return Promise.resolve({ rrr: 'mock_rrr', paymentUrl: '/mock', amount: params.amount });
  },
  verifyTaxPayment(rrr: string) {
    console.log('[GB Tax] Verifying payment:', rrr);
    return Promise.resolve({ paid: true, transactionId: 'mock_txn' });
  },
};
