import type { LegalEngine } from '../../interfaces';
import {
  renderAgreementTemplate as _renderAgreementTemplate,
  type AgreementTemplateData,
} from '../../agreement-templates';

function getTemplate(_listingType: string, _propertyType: string | null): string {
  return 'rental';
}
function renderTemplate(type: string, data: AgreementTemplateData): string {
  return _renderAgreementTemplate(type, data);
}

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
