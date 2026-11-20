import type {
  LandlordCompletion,
  LandlordDocumentRow,
  LandlordProfileValues,
  LandlordSectionStatus,
  LandlordSettlementView,
} from './types';

const has = (value: string | null | undefined): boolean =>
  typeof value === 'string' && value.trim().length > 0;

/**
 * Completion is derived from what is actually stored. Nothing here counts a
 * section as done because a form was opened or a button was pressed — each
 * section lists the specific stored facts that are still missing.
 */
export function landlordWorkspaceSummary(input: {
  profile: LandlordProfileValues;
  settlement: LandlordSettlementView;
  documents: LandlordDocumentRow[];
}): LandlordCompletion {
  const { profile, settlement, documents } = input;

  const legalMissing: string[] = [];
  if (!profile.legalEntityType) legalMissing.push('Legal entity type');
  if (!has(profile.legalName)) legalMissing.push('Registered legal name');
  if (profile.legalEntityType === 'joint' && !has(profile.jointOwnerNames)) {
    legalMissing.push('Joint owner names');
  }
  if (profile.legalEntityType === 'company') {
    if (!has(profile.companyName)) legalMissing.push('Company name');
    if (!has(profile.companyRegistrationNumber)) legalMissing.push('RC number');
  }

  const contactMissing: string[] = [];
  if (!has(profile.primaryPhone)) contactMissing.push('Primary phone');
  if (!has(profile.contactEmail)) contactMissing.push('Contact email');
  if (!has(profile.streetAddress)) contactMissing.push('Street address');
  if (!has(profile.city)) contactMissing.push('City');
  if (!has(profile.stateRegion)) contactMissing.push('State');

  const taxMissing: string[] = [];
  if (!profile.taxIdType) taxMissing.push('Tax ID type');
  if (!has(profile.taxNumber)) taxMissing.push('Tax number');

  const documentMissing: string[] = [];
  const categories = new Set(documents.map((doc) => doc.category));
  if (!categories.has('government_id')) documentMissing.push('Government ID');
  if (!categories.has('ownership_evidence')) documentMissing.push('Proof of ownership');
  if (profile.legalEntityType === 'company' && !categories.has('company_registration')) {
    documentMissing.push('Company registration');
  }
  if (profile.legalEntityType === 'joint' && !categories.has('joint_ownership')) {
    documentMissing.push('Joint ownership evidence');
  }
  if (documents.some((doc) => doc.status === 'rejected' || doc.status === 'action_required')) {
    documentMissing.push('Resolve flagged documents');
  }

  const financialMissing: string[] = [];
  if (!settlement.linked) financialMissing.push('Payout account');
  else if (settlement.state !== 'verified') financialMissing.push('Payout account verification');

  const sections: LandlordSectionStatus[] = [
    { sectionId: 'legal', done: legalMissing.length === 0, missing: legalMissing },
    { sectionId: 'contact', done: contactMissing.length === 0, missing: contactMissing },
    { sectionId: 'tax', done: taxMissing.length === 0, missing: taxMissing },
    { sectionId: 'documents', done: documentMissing.length === 0, missing: documentMissing },
    { sectionId: 'financial', done: financialMissing.length === 0, missing: financialMissing },
  ];

  const completedCount = sections.filter((section) => section.done).length;
  const total = sections.length;

  return {
    percent: Math.round((completedCount / total) * 100),
    completedCount,
    total,
    sections,
  };
}
