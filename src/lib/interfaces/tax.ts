import type { StampDutyInitiateParams, StampDutyInitiateResult, StampDutyVerifyResult } from '../stamp-duty';

export interface TaxEngine {
  calculateDuty(amount: number | { toNumber(): number }, propertyType: string, transactionType: string): number;
  getTaxRate(type: string): number;
  minimumDuty: number;
  currency: string;
  initiateTaxPayment(params: StampDutyInitiateParams): Promise<StampDutyInitiateResult>;
  verifyTaxPayment(rrr: string): Promise<StampDutyVerifyResult>;
}
