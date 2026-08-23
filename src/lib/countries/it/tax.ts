import type { TaxEngine } from '../../interfaces';

// Italian registration tax (imposta di registro)
// 2% for primary residence, 10% for secondary/non-primary
export function calculateRegistrationTax(propertyValue: number, isPrimaryResidence: boolean): number {
  const rate = isPrimaryResidence ? 0.02 : 0.10;
  return propertyValue * rate;
}

// IRPEF withholding on rent (ritenuta d'acconto)
// 21% standard, 10% for agreed-rate contracts (concordato)
export function calculateIRPEFWithholding(annualRent: number, useConcordato: boolean = true): number {
  const rate = useConcordato ? 0.10 : 0.21;
  return annualRent * rate;
}

// Cedolare secca (flat tax for rental) - 21% or 10% depending on contract type
export function calculateCedolareSecca(annualRent: number, contractType: string = 'concordato'): number {
  if (contractType === 'concordato') return annualRent * 0.10;
  if (contractType === 'transitorio') return annualRent * 0.21;
  return annualRent * 0.21;
}

export const taxEngine: TaxEngine = {
  calculateDuty(amount, propertyType, transactionType) {
    const value = typeof amount === 'number' ? amount : amount.toNumber();
    if (transactionType === 'sale' || transactionType === 'purchase') {
      return calculateRegistrationTax(value, true);
    }
    if (transactionType === 'rent' || transactionType === 'tenancy') {
      return calculateCedolareSecca(value, 'concordato');
    }
    return 0;
  },
  getTaxRate(type) {
    if (type === 'sale') return 0.02;
    if (type === 'rent') return 0.10;
    return 0;
  },
  minimumDuty: 0,
  currency: 'EUR',
  initiateTaxPayment(params) {
    console.log('[IT Tax] Initiating payment (mock)');
    return Promise.resolve({ rrr: 'mock_rrr', paymentUrl: '/mock', amount: params.amount });
  },
  verifyTaxPayment(rrr: string) {
    console.log('[IT Tax] Verifying payment:', rrr);
    return Promise.resolve({ paid: true, transactionId: 'mock_txn' });
  },
};
