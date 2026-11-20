export type LandlordSectionId = 'legal' | 'contact' | 'tax' | 'documents' | 'financial';

export type LegalEntityType = 'individual' | 'joint' | 'company';
export type TaxIdType = 'tin' | 'nin' | 'other';
export type ManagementFeeType = 'percentage' | 'fixed';

export type LandlordDocumentCategory =
  | 'government_id'
  | 'company_registration'
  | 'joint_ownership'
  | 'tax_document'
  | 'ownership_evidence'
  | 'supporting';

export interface LandlordSectionStatus {
  sectionId: LandlordSectionId;
  done: boolean;
  missing: string[];
}

export interface LandlordCompletion {
  percent: number;
  completedCount: number;
  total: number;
  sections: LandlordSectionStatus[];
}

export interface LandlordAccount {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  phoneVerified: boolean;
  avatarUrl: string | null;
  idType: string | null;
  idVerified: boolean;
  ninVerified: boolean;
}

export interface LandlordProfileValues {
  legalEntityType: LegalEntityType | null;
  legalName: string;
  jointOwnerNames: string;
  companyName: string;
  companyRegistrationNumber: string;
  companyAddress: string;
  representativeName: string;
  representativePhone: string;
  representativeEmail: string;
  primaryPhone: string;
  contactEmail: string;
  mailingAddress: string;
  countryCode: string;
  stateRegion: string;
  city: string;
  streetAddress: string;
  postalCode: string;
  taxIdType: TaxIdType | null;
  taxNumber: string;
  taxJurisdiction: string;
  managementFeeType: ManagementFeeType | null;
  managementFeeValue: string;
}

export interface LandlordSettlementView {
  linked: boolean;
  state: 'verified' | 'pending' | 'missing';
  bankName: string | null;
  accountName: string | null;
  accountNumberMasked: string | null;
}

export interface LandlordPlatformFees {
  currency: string;
  vatRate: number;
  agencyFeeRate: number;
  agreementFeeRate: number;
  cautionDepositRate: number;
  platformFeePayer: string;
  stampDutyInstrument: string;
}

export interface LandlordDocumentRow {
  id: string;
  category: LandlordDocumentCategory;
  name: string;
  url: string;
  mimeType: string | null;
  sizeBytes: number | null;
  status: string;
  reviewNote: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface LandlordWorkspace {
  account: LandlordAccount;
  profile: LandlordProfileValues;
  settlement: LandlordSettlementView;
  documents: LandlordDocumentRow[];
  completion: LandlordCompletion;
  platformFees: LandlordPlatformFees;
  onboarding: {
    required: boolean;
    completed: boolean;
    remaining: number;
  };
}

export const LANDLORD_SECTIONS: Array<{ id: LandlordSectionId; index: number; label: string }> = [
  { id: 'legal', index: 1, label: 'Legal ownership' },
  { id: 'contact', index: 2, label: 'Contact & address' },
  { id: 'tax', index: 3, label: 'Tax & compliance' },
  { id: 'documents', index: 4, label: 'Identity & documents' },
  { id: 'financial', index: 5, label: 'Financial mandate' },
];

export const DOCUMENT_CATEGORY_LABELS: Record<LandlordDocumentCategory, string> = {
  government_id: 'Government ID',
  company_registration: 'Company registration',
  joint_ownership: 'Joint ownership evidence',
  tax_document: 'Tax document',
  ownership_evidence: 'Proof of ownership',
  supporting: 'Supporting document',
};

export const DOCUMENT_CATEGORIES = Object.keys(
  DOCUMENT_CATEGORY_LABELS
) as LandlordDocumentCategory[];
