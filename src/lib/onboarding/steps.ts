import { UserRole } from '@prisma/client';

export type StepId =
  | 'location'
  | 'contact'
  | 'identity'
  | 'tenantProfile'
  | 'employment'
  | 'guarantor'
  | 'landlordProfile'
  | 'landlordPortfolio'
  | 'landlordSettlement'
  | 'agentProfile'
  | 'agentLicense'
  | 'agentTerritory'
  | 'agentServices'
  | 'agentSettlement'
  | 'estateProfile'
  | 'estateAuthority'
  | 'estateCapabilities'
  | 'estateRemittance';

export interface StepDefinition {
  id: StepId;
  title: string;
  description: string;
  /** Skippable steps leave onboarding in "blocked" rather than "completed". */
  skippable: boolean;
}

/**
 * Steps required per role. Admins are staff and are never gated.
 * Unknown roles fall back to an empty list so the wizard never crashes.
 */
export const ROLE_STEPS: Record<UserRole, StepId[]> = {
  tenant: ['location', 'identity', 'tenantProfile', 'employment', 'guarantor'],
  landlord: ['location', 'identity', 'landlordProfile', 'landlordPortfolio', 'landlordSettlement'],
  agent: ['location', 'identity', 'agentProfile', 'agentLicense', 'agentTerritory', 'agentServices', 'agentSettlement'],
  estate_manager: ['location', 'identity', 'estateProfile', 'estateAuthority', 'estateCapabilities', 'estateRemittance'],
  admin: [],
};

export const STEP_DEFINITIONS: Record<StepId, StepDefinition> = {
  location: {
    id: 'location',
    title: 'Location',
    description: 'Define your physical residence to apply statutory tenancy covenants under Nigerian Law.',
    skippable: false,
  },
  contact: {
    id: 'contact',
    title: 'Contact information',
    description: 'Verify a mobile number so important property, agreement and payment updates reach you.',
    skippable: false,
  },
  identity: {
    id: 'identity',
    title: 'Identity',
    description: 'Verify your government-issued ID to unlock listings, agreements, and rent collections.',
    skippable: true,
  },
  tenantProfile: {
    id: 'tenantProfile',
    title: 'Personal & rental profile',
    description: 'Add the personal, next-of-kin and rental preferences that help tailor applications to you.',
    skippable: false,
  },
  employment: {
    id: 'employment',
    title: 'Employment',
    description: 'Your income and employer help landlords assess your application.',
    skippable: false,
  },
  guarantor: {
    id: 'guarantor',
    title: 'Guarantor',
    description: 'Add a guarantor and complete your rental application dossier.',
    skippable: false,
  },
  landlordProfile: {
    id: 'landlordProfile',
    title: 'Owner Profile',
    description: 'Legal ownership entity, contact credentials, KYC photo ID, and tax documentation.',
    skippable: false,
  },
  landlordPortfolio: {
    id: 'landlordPortfolio',
    title: 'Property portfolio & services',
    description: 'Tell us what you own and which property services you want to use. You can add properties later.',
    skippable: false,
  },
  landlordSettlement: {
    id: 'landlordSettlement',
    title: 'Settlement',
    description: 'Configure bank account, target rent, security deposit, and management fee consent.',
    skippable: false,
  },
  agentProfile: {
    id: 'agentProfile',
    title: 'Professional Profile',
    description: 'Legal identification, professional contacts, NIN/BVN/TIN, and emergency contact.',
    skippable: false,
  },
  agentLicense: {
    id: 'agentLicense',
    title: 'Licensing',
    description: 'Real estate board registration, corporate entity, indemnity insurance, and code of conduct.',
    skippable: false,
  },
  agentTerritory: {
    id: 'agentTerritory',
    title: 'Territory',
    description: 'Operational territory, real estate focus areas, and active listings count.',
    skippable: false,
  },
  agentServices: {
    id: 'agentServices',
    title: 'Services offered',
    description: 'Choose the services clients can request from your professional profile.',
    skippable: false,
  },
  agentSettlement: {
    id: 'agentSettlement',
    title: 'Settlement',
    description: 'Bank details for commission distributions, commission tier, and CRM/device setup.',
    skippable: false,
  },
  estateProfile: {
    id: 'estateProfile',
    title: 'Corporate Profile',
    description: 'Legal operator entity, CAC registration, professional credentials, and team contacts.',
    skippable: false,
  },
  estateAuthority: {
    id: 'estateAuthority',
    title: 'Authority',
    description: 'Power of Attorney, management agreement, eviction mandate, and screening parameters.',
    skippable: false,
  },
  estateCapabilities: {
    id: 'estateCapabilities',
    title: 'Management capabilities',
    description: 'Set the operating services and authorization context for the properties you manage.',
    skippable: false,
  },
  estateRemittance: {
    id: 'estateRemittance',
    title: 'Remittance',
    description: 'Client trust bank account, remittance cycle, management fees, and tax withholding.',
    skippable: false,
  },
};

export function getStepsForRole(role: UserRole): StepDefinition[] {
  const steps = ROLE_STEPS[role] ?? [];
  return steps.map((id) => STEP_DEFINITIONS[id]);
}

export const EMPLOYMENT_STATUS_REQUIRES_TYPE: Array<string> = [
  'employed',
  'self_employed',
  'business_owner',
];
