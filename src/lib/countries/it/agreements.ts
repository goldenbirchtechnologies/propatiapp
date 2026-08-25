import type { LegalEngine } from '../../interfaces';

export const legalEngine: LegalEngine = {
  async generateAgreement(data) {
    const template = getItalyTemplate(data.listingType, data.propertyType);
    return renderTemplate(template, data);
  },
  getTemplate(listingType, propertyType) {
    return getItalyTemplate(listingType, propertyType);
  },
  getMandatoryClauses(type) {
    return [
      'Tipo di contratto: 4+4 anni o transitorio',
      'Canone mensile e modalita di pagamento',
      'Deposito cauzionale (massimo 3 mensilita)',
      'Spese condominiali a carico del locatario',
      'Manutenzione ordinaria e straordinaria',
      'Recesso e preavviso (minimo 6 mesi)',
      'Registrazione al registro delle imprese',
      'Cedolare secca o IRPEF: ritenuta d acconto',
    ];
  },
  validateClauses(clauses) {
    return clauses.length >= 5;
  },
};

function getItalyTemplate(listingType: string, propertyType?: string): string {
  return `CONTRATTO DI LOCAZIONE

Il presente contratto e stipulato in data {{date}}

TRA:
(1) {{landlordName}} ("il Locatore")
E
(2) {{tenantName}} ("il Locatario")

IMMOBILE: {{propertyAddress}}

DURATA: {{term}} mesi a partire dal {{startDate}} fino al {{endDate}}

CANONE MENSILE: EUR {{rentAmount}} da pagarsi entro il {{rentDueDate}} di ogni mese

DEPOSITO CAUZIONALE: EUR {{cautionDeposit}}

Il contratto e soggetto alle norme del codice civile italiano in materia di locazione abitativa.

Obblighi del Locatore:
- Consegnare l immobile in buone condizioni igieniche e di manutenzione
- Garantire la pacifica godimento dell immobile
- Effettuare le riparazioni straordinarie

Obblighi del Locatario:
- Pagare il canone nei termini stabiliti
- Mantenere l immobile in buone condizioni
- Notificare tempestivamente eventuali danni
- Dare preavviso di almeno 6 mesi in caso di recesso
`;
}

function renderTemplate(template: string, data: Record<string, unknown>): string {
  return template.replace(/{{(\w+)}}/g, (_, key) => String(data[key] ?? ''));
}
