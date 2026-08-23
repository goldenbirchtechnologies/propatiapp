import type { AgreementTemplateData } from '../agreement-templates';

export interface LegalEngine {
  generateAgreement(data: AgreementTemplateData): Promise<string>;
  getTemplate(listingType: string, propertyType?: string): string;
  getMandatoryClauses(type: string): string[];
  validateClauses(clauses: string[]): boolean;
}
