/**
 * Tenant profile section completion.
 *
 * Same rule as `getOnboardingSnapshot` in `@/lib/onboarding/status`: completion
 * is derived from the data every time, never stored. A half-applied save can
 * then never leave the rail disagreeing with what the sections show.
 *
 * Server-side only in practice — the route computes it and passes it to the
 * client — but nothing here touches the database, so it is directly testable.
 */

export const TENANT_SECTIONS = [
  'personal',
  'identity',
  'employment',
  'financial',
  'guarantor',
  'nextOfKin',
  'addressHistory',
  'emergencyContacts',
  'preferences',
  'verification',
] as const;

export type TenantSectionId = (typeof TENANT_SECTIONS)[number];

export interface TenantSectionResult {
  sectionId: TenantSectionId;
  done: boolean;
  /** Human-readable names of the fields still needed. Empty when `done`. */
  missing: string[];
}

export interface TenantSectionSummary {
  sections: TenantSectionResult[];
  /** Whole number, 0–100. */
  percent: number;
  completedCount: number;
}

/** The dossier columns these checks read. Kept structural so tests need no Prisma client. */
export interface TenantDossierFacts {
  dateOfBirth: Date | null;
  gender: string | null;
  nationality: string | null;
  stateOfResidence: string | null;
  lga: string | null;
  maritalStatus: string | null;

  addressLine1: string | null;
  city: string | null;

  employmentStatus: string | null;
  employmentType: string | null;
  employerName: string | null;
  jobTitle: string | null;
  yearlyIncome: bigint | null;

  otherIncomeSources: string | null;

  guarantorName: string | null;
  guarantorPhone: string | null;
  guarantorRelationship: string | null;

  nokName: string | null;
  nokPhone: string | null;
  nokRelationship: string | null;

  preferredBedrooms: number | null;
  maxMonthlyBudget: bigint | null;
  preferredState: string | null;
}

export interface TenantVerificationFacts {
  idVerified: boolean;
  phoneVerified: boolean;
}

export interface TenantSectionInput {
  dossier: TenantDossierFacts | null;
  addresses: { addressLine1: string | null; city: string | null }[];
  emergencyContacts: { name: string; phone: string }[];
  verification: TenantVerificationFacts;
}

/** A blank string is not a filled field; a zero is (e.g. bedrooms = 0 is studio). */
const filled = (value: unknown): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
};

export function tenantProfileSummary({
  dossier,
  addresses,
  emergencyContacts,
  verification,
}: TenantSectionInput): TenantSectionSummary {
  const d = dossier;

  const rules: Record<TenantSectionId, { label: string; ok: boolean }[]> = {
    personal: [
      { label: 'Date of birth', ok: filled(d?.dateOfBirth) },
      { label: 'Gender', ok: filled(d?.gender) },
      { label: 'Nationality', ok: filled(d?.nationality) },
      { label: 'State of residence', ok: filled(d?.stateOfResidence) },
      { label: 'Marital status', ok: filled(d?.maritalStatus) },
    ],
    identity: [{ label: 'Verified ID', ok: verification.idVerified }],
    employment: [
      { label: 'Employment status', ok: filled(d?.employmentStatus) },
      { label: 'Employer', ok: filled(d?.employerName) },
      { label: 'Job title', ok: filled(d?.jobTitle) },
      { label: 'Yearly income', ok: filled(d?.yearlyIncome) },
    ],
    financial: [
      // Optional by design: many applicants have no other income, and forcing
      // "none" into a text box teaches people to type junk. Any declared
      // employer and income is enough to call this section answered.
      { label: 'Income details', ok: filled(d?.otherIncomeSources) || filled(d?.yearlyIncome) },
    ],
    guarantor: [
      { label: 'Guarantor name', ok: filled(d?.guarantorName) },
      { label: 'Guarantor phone', ok: filled(d?.guarantorPhone) },
      { label: 'Relationship', ok: filled(d?.guarantorRelationship) },
    ],
    nextOfKin: [
      { label: 'Next of kin name', ok: filled(d?.nokName) },
      { label: 'Next of kin phone', ok: filled(d?.nokPhone) },
      { label: 'Relationship', ok: filled(d?.nokRelationship) },
    ],
    addressHistory: [
      { label: 'A previous address', ok: addresses.some((a) => filled(a.addressLine1) && filled(a.city)) },
    ],
    emergencyContacts: [
      { label: 'An emergency contact', ok: emergencyContacts.some((c) => filled(c.name) && filled(c.phone)) },
    ],
    preferences: [
      { label: 'Preferred area', ok: filled(d?.preferredState) },
      { label: 'Monthly budget', ok: filled(d?.maxMonthlyBudget) },
      { label: 'Number of bedrooms', ok: filled(d?.preferredBedrooms) },
    ],
    verification: [{ label: 'Verified phone number', ok: verification.phoneVerified }],
  };

  const sections: TenantSectionResult[] = TENANT_SECTIONS.map((sectionId) => {
    const missing = rules[sectionId].filter((r) => !r.ok).map((r) => r.label);
    return { sectionId, done: missing.length === 0, missing };
  });

  const completedCount = sections.filter((s) => s.done).length;

  return {
    sections,
    completedCount,
    percent: Math.round((completedCount / TENANT_SECTIONS.length) * 100),
  };
}
