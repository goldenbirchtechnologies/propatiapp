import { UserRole } from '@prisma/client';

export type StepId =
  | 'location'
  | 'contact'
  | 'identity'
  | 'employment'
  | 'guarantor'
  | 'landlordProfile'
  | 'landlordSettlement'
  | 'agentProfile'
  | 'agentLicense'
  | 'agentTerritory'
  | 'agentSettlement'
  | 'estateProfile'
  | 'estateAuthority'
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
  tenant: ['location', 'contact', 'identity', 'employment', 'guarantor'],
  landlord: ['location', 'contact', 'identity', 'landlordProfile', 'landlordSettlement'],
  agent: ['location', 'contact', 'identity', 'agentProfile', 'agentLicense', 'agentTerritory', 'agentSettlement'],
  estate_manager: ['location', 'contact', 'identity', 'estateProfile', 'estateAuthority', 'estateRemittance'],
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
    title: 'Contact',
    description: 'Add a phone number so landlords, agents, and the platform can reach you.',
    skippable: false,
  },
  identity: {
    id: 'identity',
    title: 'Identity',
    description: 'Verify your government-issued ID to unlock listings, agreements, and rent collections.',
    skippable: true,
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
