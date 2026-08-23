import type { TaxEngine } from '../../interfaces';
import { calculateStampDuty, initiateStampDutyPayment, verifyStampDutyPayment, type StampDutyInitiateParams, type StampDutyInitiateResult, type StampDutyVerifyResult } from '../../stamp-duty';

export const taxEngine: TaxEngine = {
  calculateDuty(amount, propertyType, transactionType) {
    const annualRent = typeof amount === 'number' ? amount : amount.toNumber();
    return calculateStampDuty(annualRent);
  },
  getTaxRate(type) {
    return 0.0078;
  },
  minimumDuty: 500,
  currency: 'NGN',
  initiateTaxPayment(params: StampDutyInitiateParams) {
    return initiateStampDutyPayment(params);
  },
  verifyTaxPayment(rrr: string) {
    return verifyStampDutyPayment(rrr);
  },
};

export type { StampDutyInitiateParams, StampDutyInitiateResult, StampDutyVerifyResult };
