import type { LegalEngine } from '../../interfaces';

export const legalEngine: LegalEngine = {
  async generateAgreement(data) {
    // Ghana tenancy template (English)
    const template = getGhanaTemplate(data.listingType, data.propertyType);
    return renderTemplate(template, data);
  },
  getTemplate(listingType, propertyType) {
    return getGhanaTemplate(listingType, propertyType);
  },
  getMandatoryClauses(type) {
    return [
      'Rent payment terms and due date',
      'Notice period for termination (minimum 1 month)',
      'Maintenance responsibilities',
      'Security deposit terms',
      'Utility payment obligations',
    ];
  },
  validateClauses(clauses) {
    return clauses.length > 0;
  },
};

function getGhanaTemplate(listingType: string, propertyType?: string): string {
  return `
GHANA RESIDENTIAL TENANCY AGREEMENT

This Agreement is made on {{date}} between {{landlordName}} (Landlord) and {{tenantName}} (Tenant).

Property: {{propertyAddress}}
Monthly Rent: GHS {{rentAmount}}
Security Deposit: GHS {{cautionDeposit}}
Start Date: {{startDate}}
End Date: {{endDate}}

Tenant agrees to pay rent on or before the 1st of each month.
Landlord agrees to maintain the property in habitable condition.
`;
}

function renderTemplate(template: string, data: Record<string, unknown>): string {
  return template.replace(/{{(\w+)}}/g, (_, key) => String(data[key] ?? ''));
}
