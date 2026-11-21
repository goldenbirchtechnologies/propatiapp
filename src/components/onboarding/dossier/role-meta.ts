/**
 * Role copy + step vocabulary for the onboarding dossier.
 *
 * The Stitch references name every step twice: a short label for the pipeline
 * strip and a full dossier heading for the open card. Both live here so the
 * wizard stays declarative and each role reads like its own product surface.
 */

export type RailVariant = 'tenant' | 'landlord' | 'agent' | 'estate';

export interface RoleMeta {
  label: string;
  title: string;
  subtitle: string;
  rail: RailVariant;
  /** Short label shown in the horizontal step pipeline. */
  stepLabels: Record<string, string>;
  /** Relative weights used for progress; this reflects requirements, not visits. */
  stepWeights: Record<string, number>;
}

export const ROLE_ORDER = ['landlord', 'tenant', 'estate_manager', 'agent'] as const;

export const ROLE_META: Record<string, RoleMeta> = {
  tenant: {
    label: 'Tenant',
    title: 'Tenant Onboarding',
    subtitle:
      'Intake, employment solvency verification, guarantor deed, household profile & legal tenancy covenants under Nigerian Law.',
    rail: 'tenant',
    stepLabels: {
      location: 'Jurisdiction & Location',
      contact: 'Contact information',
      identity: 'Prembly Identity',
      employment: 'Employment & Income',
      guarantor: 'Guarantor & Report',
    },
    stepWeights: { location: 1, contact: 1, identity: 2, employment: 2, guarantor: 2 },
  },
  landlord: {
    label: 'Landlord',
    title: 'Landlord Onboarding',
    subtitle:
      'Legal ownership intake, Business Registration / NIN identity clearance, portfolio mandate and automated payout, caution deposit & tax secure payment.',
    rail: 'landlord',
    stepLabels: {
      location: 'Jurisdiction & Location',
      contact: 'Contact information',
      identity: 'Prembly KYC (NIN / Business Registration)',
      landlordProfile: 'Owner Profile',
      landlordSettlement: 'Payout & Caution Deposit',
    },
    stepWeights: { location: 1, contact: 1, identity: 2, landlordProfile: 3, landlordSettlement: 2 },
  },
  agent: {
    label: 'Agent',
    title: 'Agent & Broker Licensing',
    subtitle:
      'Broker accreditation, REDAN / Real Estate License registry verification, territory allocation and automated commission split secure payment.',
    rail: 'agent',
    stepLabels: {
      location: 'Jurisdiction',
      contact: 'Contact information',
      identity: 'Prembly KYC',
      agentProfile: 'Accreditation',
      agentLicense: 'Broker License',
      agentTerritory: 'Territory',
      agentSettlement: 'Payout',
    },
    stepWeights: { location: 1, contact: 1, identity: 2, agentProfile: 2, agentLicense: 2, agentTerritory: 1, agentSettlement: 2 },
  },
  estate_manager: {
    label: 'Estate Manager',
    title: 'Estate Manager Onboarding',
    subtitle:
      'Property firm onboarding, Estate Surveyor / Estate Surveyors Register licence validation, Power of Attorney legal mandate and dedicated secure payment trust payout.',
    rail: 'estate',
    stepLabels: {
      location: 'Jurisdiction & Firm',
      contact: 'Contact information',
      identity: 'Business Registration & Identity',
      estateProfile: 'Professional Reg',
      estateAuthority: 'Authority & POA',
      estateRemittance: 'Secure Payment & Trust',
    },
    stepWeights: { location: 1, contact: 1, identity: 2, estateProfile: 2, estateAuthority: 2, estateRemittance: 2 },
  },
};

export const ROLE_ICONS: Record<string, string> = {
  landlord: 'building',
  tenant: 'user',
  estate_manager: 'landmark',
  agent: 'badge',
};

/** Full dossier heading per step — the h2 of the open card. */
export const STEP_HEADINGS: Record<string, string> = {
  location: 'Legal Jurisdiction & Real Estate Location',
  contact: 'Dual GSM Two-Factor Authentication',
  identity: 'Identity & Prembly KYC Verification',
  employment: 'Employment & Liquid Solvency Verification',
  guarantor: 'Guarantor Deed & Screening Report',
  landlordProfile: 'Owner Identity & Legal Ownership Profile',
  landlordSettlement: 'Payout, Caution Deposit & Remittance Architecture',
  agentProfile: 'Professional Identity & Emergency Contact Report',
  agentLicense: 'Licensing, Accreditation & Indemnity Verification',
  agentTerritory: 'Operational Territory & Portfolio Scope',
  agentSettlement: 'Commission Split, NUBAN & CRM Architecture',
  estateProfile: 'Corporate Operator Profile & Professional Standing',
  estateAuthority: 'Management Mandate & Authority',
  estateRemittance: 'Client Trust & Secure Payment Payout Account',
};

export const STEP_BLURBS: Record<string, string> = {
  location: 'Domicile and tenancy jurisdiction decide which covenant pack, stamp duty band and eviction process apply to you.',
  contact: 'Verify a Nigerian GSM number over SMS and WhatsApp before any financial or legal step unlocks.',
  identity: 'Verify beneficial ownership against the NIMC and Business Registration registries through the Prembly gateway.',
  employment: 'Annual remuneration and tenure are scored against the rent-to-income ceiling for your state.',
  guarantor: 'A guarantor deed and screening report complete the application and make it admissible for stamp duty.',
  landlordProfile: 'Legal ownership entity, official contact credentials and tax documentation for the asset register.',
  landlordSettlement: 'Where rent lands, how the caution deposit is ring-fenced, and which deductions run automatically.',
  agentProfile: 'Legal identification, professional contacts and an emergency contact for the brokerage register.',
  agentLicense: 'Board registration, corporate entity, indemnity cover and the ethical code of conduct.',
  agentTerritory: 'Only mandates inside a verified regional zone may be executed under REDAN / Real Estate License rules.',
  agentSettlement: 'Where commission lands and how a multi-party split settles at the moment of tenancy payment.',
  estateProfile: 'Legal operator entity, Business Registration, professional credentials and firm contacts.',
  estateAuthority: 'Power of Attorney, management agreement and the scope of legal powers conferred.',
  estateRemittance: 'Client trust account, remittance cadence, management fee and withholding tax routing.',
};

/** Mask a phone number the way the references print it: +234 802 ••• 4419. */
export function maskPhone(phone?: string | null): string {
  if (!phone) return '—';
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 7) return phone;
  const tail = digits.slice(-4);
  const head = digits.slice(0, Math.max(3, digits.length - 7));
  return `+${head} ••• ${tail}`;
}

/** 54,000,000 → ₦54,000,000.00 */
export function formatNaira(value?: number | string | bigint | null, suffix = ''): string {
  if (value === null || value === undefined || value === '') return '—';
  const n = typeof value === 'bigint' ? Number(value) : Number(value);
  if (!Number.isFinite(n)) return '—';
  return `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${suffix}`;
}

/** 54,000,000 → 54,000,000.00 (no symbol, for prefixed currency inputs). */
export function formatAmount(value?: number | string | bigint | null): string {
  if (value === null || value === undefined || value === '') return '—';
  const n = typeof value === 'bigint' ? Number(value) : Number(value);
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
