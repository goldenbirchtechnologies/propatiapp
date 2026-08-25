import type { LegalEngine } from '../../interfaces';

export const legalEngine: LegalEngine = {
  async generateAgreement(data) {
    const template = getBeninTemplate(data.listingType, data.propertyType);
    return renderTemplate(template, data);
  },
  getTemplate(listingType, propertyType) {
    return getBeninTemplate(listingType, propertyType);
  },
  getMandatoryClauses(type) {
    return [
      'Modalités de paiement du loyer',
      'Préavis de résiliation (minimum 3 mois)',
      'Responsabilites de maintenance',
      'Depot de garantie',
      'Obligations des parties',
    ];
  },
  validateClauses(clauses) {
    return clauses.length > 0;
  },
};

function getBeninTemplate(listingType: string, propertyType?: string): string {
  return `
CONTRAT DE BAIL RESIDENTIEL - BENIN

Le present contrat est conclu le {{date}} entre {{landlordName}} (Bailleur) et {{tenantName}} (Locataire).

Propriete: {{propertyAddress}}
Loyer mensuel: XOF {{rentAmount}}
Depot de garantie: XOF {{cautionDeposit}}
Date de debut: {{startDate}}
Date de fin: {{endDate}}

Le locataire s'engage a payer le loyer au plus tard le 5 de chaque mois.
Le bailleur s'engage a maintenir la propriete en bon etat.
`;
}

function renderTemplate(template: string, data: Record<string, unknown>): string {
  return template.replace(/{{(\w+)}}/g, (_, key) => String(data[key] ?? ''));
}
