import type { LegalEngine } from '../../interfaces';

export const legalEngine: LegalEngine = {
  async generateAgreement(data) {
    const template = getASTTemplate(data.listingType, data.propertyType);
    return renderTemplate(template, data);
  },
  getTemplate(listingType, propertyType) {
    return getASTTemplate(listingType, propertyType);
  },
  getMandatoryClauses(type) {
    return [
      'Assured Shorthold Tenancy (AST) terms',
      'Deposit protection scheme (TDS/DPS/MyDeposits)',
      'Section 8 and Section 21 notice procedures',
      'Right to Rent confirmation',
      'EPC rating requirements (minimum E)',
      'Gas safety certificate (annual)',
      'Right to Quiet Enjoyment',
      'Landlord obligations for repairs',
      'Tenant obligations and restrictions',
    ];
  },
  validateClauses(clauses) {
    return clauses.length >= 5;
  },
};

function getASTTemplate(listingType: string, propertyType?: string): string {
  return `ASSURED SHORTHOLD TENANCY AGREEMENT

THIS AGREEMENT is made on {{date}}

BETWEEN:
(1) {{landlordName}} ("the Landlord")
AND
(2) {{tenantName}} ("the Tenant")

PROPERTY: {{propertyAddress}}

TERM: Fixed term of {{term}} months commencing {{startDate}} and ending {{endDate}}

RENT: {{rentAmount}} per calendar month payable in advance on the {{rentDueDate}} of each month

DEPOSIT: {{cautionDeposit}} (protected with an authorised tenancy deposit scheme)

The property is let on an Assured Shorthold Tenancy under the Housing Act 1988 (as amended).

Tenant Rights:
- Right to Quiet Enjoyment
- Right to have property maintained in good repair
- Right to 2 months notice before eviction (Section 21)

Landlord Obligations:
- Maintain structure and exterior
- Ensure gas and electrical safety
- Protect tenants deposit
- Provide Energy Performance Certificate

Notice Periods:
- Section 8: Immediate (serious breaches)
- Section 21: 2 months notice (no fault)`;
}

function renderTemplate(template: string, data: Record<string, unknown>): string {
  return template.replace(/{{(\w+)}}/g, (_, key) => String(data[key] ?? ''));
}
