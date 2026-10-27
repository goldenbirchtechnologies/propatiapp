import { UserRole } from '@prisma/client';

export type StepId = 'location' | 'contact' | 'identity' | 'employment' | 'guarantor';

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
  landlord: ['location', 'contact', 'identity'],
  agent: ['location', 'contact', 'identity'],
  estate_manager: ['location', 'contact', 'identity'],
  admin: [],
};

export const STEP_DEFINITIONS: Record<StepId, StepDefinition> = {
  location: {
    id: 'location',
    title: 'Location',
    description: 'Tell us where you are so we can map you to the right jurisdiction.',
    skippable: false,
  },
  contact: {
    id: 'contact',
    title: 'Contact',
    description: 'Add a phone number so landlords and agents can reach you.',
    skippable: false,
  },
  identity: {
    id: 'identity',
    title: 'Identity',
    description: 'Verify your identity to unlock listings and agreements.',
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
    description: 'Add a guarantor who can vouch for you.',
    skippable: false,
  },
};

export function getStepsForRole(role: UserRole): StepDefinition[] {
  const steps = ROLE_STEPS[role] ?? [];
  return steps.map((id) => STEP_DEFINITIONS[id]);
}

/**
 * Employment types only make sense for people who are working. Retired,
 * unemployed and students have no employment type.
 */
export const EMPLOYMENT_STATUS_REQUIRES_TYPE: Array<string> = [
  'employed',
  'self_employed',
  'business_owner',
];
