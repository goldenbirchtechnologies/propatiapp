import type { LegalEngine } from '../../interfaces';
import { getTemplate, renderTemplate, type AgreementTemplateData } from '../../agreement-templates';

export const legalEngine: LegalEngine = {
  async generateAgreement(data: AgreementTemplateData) {
    const template = getTemplate(data.listingType, data.propertyType);
    return renderTemplate(template, data);
  },
  getTemplate(listingType, propertyType) {
    return getTemplate(listingType, propertyType);
  },
  getMandatoryClauses(type) {
    return [
      'Rent payment terms and due date',
      'Notice period for termination',
      'Maintenance responsibilities',
      'Security deposit terms',
      'Stamp duty payment obligation',
    ];
  },
  validateClauses(clauses) {
    return clauses.length > 0;
  },
};

export type { AgreementTemplateData };
