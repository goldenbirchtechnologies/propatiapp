import { OnboardingStatus, UserRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getStepsForRole, StepId } from './steps';
import {
  isAgentLicenseDone,
  isAgentProfileDone,
  isAgentSettlementDone,
  isAgentTerritoryDone,
  isEstateAuthorityDone,
  isEstateProfileDone,
  isEstateRemittanceDone,
  isLandlordProfileDone,
  isLandlordSettlementDone,
} from './profiles';

export interface UserOnboardingFacts {
  countryId: string | null;
  jurisdictionId: string | null;
  city: string | null;
  phone: string | null;
  phoneVerified: boolean;
  idType: string | null;
  idNumberEnc: string | null;
  idVerified: boolean;
  employmentStatus: string | null;
  employerName: string | null;
  jobTitle: string | null;
  yearlyIncome: bigint | null;
  guarantorName: string | null;
  guarantorPhone: string | null;
  guarantorRelationship: string | null;
  landlordProfileComplete?: boolean;
  landlordSettlementComplete?: boolean;
  agentProfileComplete?: boolean;
  agentLicenseComplete?: boolean;
  agentTerritoryComplete?: boolean;
  agentSettlementComplete?: boolean;
  estateProfileComplete?: boolean;
  estateAuthorityComplete?: boolean;
  estateRemittanceComplete?: boolean;
}

/**
 * Step completion is always derived from the user's own columns rather than
 * stored as a separate progress figure. A partially applied write can then
 * never leave the gate disagreeing with the data.
 */
export const STEP_PREDICATES: Record<StepId, (u: UserOnboardingFacts) => boolean> = {
  location: (u) => !!u.countryId && !!u.jurisdictionId && !!u.city,
  contact: (u) => !!u.phone && u.phoneVerified,
  identity: (u) => !!u.idType && !!u.idNumberEnc && u.idVerified,
  employment: (u) =>
    !!u.employmentStatus && !!u.employerName && !!u.jobTitle && u.yearlyIncome != null,
  guarantor: (u) => !!u.guarantorName && !!u.guarantorPhone && !!u.guarantorRelationship,
  landlordProfile: (u) => !!u.landlordProfileComplete,
  landlordSettlement: (u) => !!u.landlordSettlementComplete,
  agentProfile: (u) => !!u.agentProfileComplete,
  agentLicense: (u) => !!u.agentLicenseComplete,
  agentTerritory: (u) => !!u.agentTerritoryComplete,
  agentSettlement: (u) => !!u.agentSettlementComplete,
  estateProfile: (u) => !!u.estateProfileComplete,
  estateAuthority: (u) => !!u.estateAuthorityComplete,
  estateRemittance: (u) => !!u.estateRemittanceComplete,
};

export interface OnboardingStepState {
  id: StepId;
  title: string;
  description: string;
  done: boolean;
  skippable: boolean;
  /** Deferred: the user set this optional step aside without completing it. */
  skipped: boolean;
}

/**
 * The subset of the user's own record the wizard echoes back in the step
 * pipeline and the right-hand rail. Read-only display facts — nothing here is
 * ever written back, and nothing sensitive (NIN/BVN) leaves the database.
 */
export interface OnboardingDisplayFacts {
  fullName: string;
  email: string;
  countryCode: string | null;
  countryName: string | null;
  jurisdictionName: string | null;
  city: string | null;
  phone: string | null;
  phoneVerified: boolean;
  idType: string | null;
  idVerified: boolean;
  employmentStatus: string | null;
  employerName: string | null;
  jobTitle: string | null;
  yearlyIncome: number | null;
  guarantorName: string | null;
  guarantorRelationship: string | null;
}

export interface OnboardingSnapshot {
  role: UserRole;
  status: OnboardingStatus;
  /** False when the user does not need to onboard (admin, or already done). */
  required: boolean;
  currentStep: StepId | null;
  steps: OnboardingStepState[];
  canComplete: boolean;
  /** True when a soft-required step was skipped and blocks completion. */
  blocked: boolean;
  facts: OnboardingDisplayFacts;
}

export function deriveStepStates(
  role: UserRole,
  facts: UserOnboardingFacts,
  skippedSteps: string[] = []
): OnboardingStepState[] {
  return getStepsForRole(role).map((step) => {
    const done = STEP_PREDICATES[step.id](facts);
    return {
      id: step.id,
      title: step.title,
      description: step.description,
      done,
      skippable: step.skippable,
      // Deferral and completion are different states: a skipped step stays
      // open so the gate can show it as outstanding. Once the underlying data
      // is present the predicate wins and the deferral is spent.
      skipped: !done && step.skippable && skippedSteps.includes(step.id),
    };
  });
}

export function deriveStatus(
  role: UserRole,
  facts: UserOnboardingFacts,
  skippedSteps: string[] = []
): { status: OnboardingStatus; currentStep: StepId | null; canComplete: boolean; blocked: boolean } {
  const steps = deriveStepStates(role, facts, skippedSteps);

  if (steps.length === 0) {
    return { status: 'completed', currentStep: null, canComplete: true, blocked: false };
  }

  // A deferred optional step holds the account open rather than completing it.
  const deferred = steps.find((s) => s.skipped);
  if (deferred) {
    return {
      status: 'blocked',
      currentStep: deferred.id,
      canComplete: false,
      blocked: true,
    };
  }

  const incomplete = steps.filter((s) => !s.done);
  if (incomplete.length === 0) {
    return { status: 'completed', currentStep: null, canComplete: true, blocked: false };
  }

  return {
    status: 'in_progress',
    currentStep: incomplete[0].id,
    canComplete: false,
    blocked: false,
  };
}

export async function getOnboardingSnapshot(userId: string): Promise<OnboardingSnapshot | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      onboardingRequired: true,
      fullName: true,
      email: true,
      country: { select: { code: true, name: true } },
      jurisdiction: { select: { name: true } },
      countryId: true,
      jurisdictionId: true,
      city: true,
      phone: true,
      phoneVerified: true,
      idType: true,
      idNumberEnc: true,
      idVerified: true,
      employmentStatus: true,
      employerName: true,
      jobTitle: true,
      yearlyIncome: true,
      guarantorName: true,
      guarantorPhone: true,
      guarantorRelationship: true,
      userOnboarding: {
        select: { status: true, currentStep: true },
      },
    },
  });

  if (!user) return null;

  const skippedSteps = user.onboardingRequired
    ? await getSkippedSteps(userId, user.role)
    : [];

  const facts: UserOnboardingFacts = {
    countryId: user.countryId,
    jurisdictionId: user.jurisdictionId,
    city: user.city,
    phone: user.phone,
    phoneVerified: user.phoneVerified,
    idType: user.idType,
    idNumberEnc: user.idNumberEnc,
    idVerified: user.idVerified,
    employmentStatus: user.employmentStatus,
    employerName: user.employerName,
    jobTitle: user.jobTitle,
    yearlyIncome: user.yearlyIncome,
    guarantorName: user.guarantorName,
    guarantorPhone: user.guarantorPhone,
    guarantorRelationship: user.guarantorRelationship,
    ...(await roleProfileFacts(user.role, userId)),
  };

  const derived = deriveStatus(user.role, facts, skippedSteps);
  const steps = deriveStepStates(user.role, facts, skippedSteps);

  // A user who was never flagged for onboarding (pre-existing accounts) is
  // never gated, and their derived status does not matter.
  const required = user.onboardingRequired && user.role !== 'admin';

  // Steps are always returned so `/onboarding` can render for any signed-in
  // account. `required` stays the flag that forces the flow from the dashboard.
  return {
    role: user.role,
    status: required ? derived.status : 'completed',
    required,
    currentStep: derived.currentStep,
    steps,
    canComplete: required ? derived.canComplete : true,
    blocked: required ? derived.blocked : false,
    facts: {
      fullName: user.fullName,
      email: user.email,
      countryCode: user.country?.code ?? null,
      countryName: user.country?.name ?? null,
      jurisdictionName: user.jurisdiction?.name ?? null,
      city: user.city,
      phone: user.phone,
      phoneVerified: user.phoneVerified,
      idType: user.idType,
      idVerified: user.idVerified,
      employmentStatus: user.employmentStatus,
      employerName: user.employerName,
      jobTitle: user.jobTitle,
      yearlyIncome: user.yearlyIncome == null ? null : Number(user.yearlyIncome),
      guarantorName: user.guarantorName,
      guarantorRelationship: user.guarantorRelationship,
    },
  };
}

/**
 * Loads the role's profile row and reduces it to the completion facts the
 * predicates above read. Only the signed-in user's own role is ever queried.
 */
async function roleProfileFacts(
  role: UserRole,
  userId: string
): Promise<Partial<UserOnboardingFacts>> {
  if (role === 'landlord') {
    const row = await prisma.landlordProfile.findUnique({ where: { userId } });
    return {
      landlordProfileComplete: isLandlordProfileDone(row),
      landlordSettlementComplete: isLandlordSettlementDone(row),
    };
  }

  if (role === 'agent') {
    const row = await prisma.agentProfile.findUnique({ where: { userId } });
    return {
      agentProfileComplete: isAgentProfileDone(row),
      agentLicenseComplete: isAgentLicenseDone(row),
      agentTerritoryComplete: isAgentTerritoryDone(row),
      agentSettlementComplete: isAgentSettlementDone(row),
    };
  }

  if (role === 'estate_manager') {
    const row = await prisma.estateManagerProfile.findUnique({ where: { userId } });
    return {
      estateProfileComplete: isEstateProfileDone(row),
      estateAuthorityComplete: isEstateAuthorityDone(row),
      estateRemittanceComplete: isEstateRemittanceDone(row),
    };
  }

  return {};
}

/**
 * Steps the user explicitly skipped. Kept out of the UserOnboarding booleans
 * because "skipped" and "done" are different: a skipped identity step leaves
 * onboarding blocked rather than complete.
 */
async function getSkippedSteps(userId: string, role: UserRole): Promise<string[]> {
  const row = await prisma.userOnboarding.findUnique({
    where: { userId },
    select: { status: true, currentStep: true },
  });
  if (!row || row.status !== 'blocked' || !row.currentStep) return [];

  // A blocked row records the deferred step as currentStep. Only a step that is
  // genuinely optional for this role may hold the account open: a stale value
  // must not block a user on a step they were never allowed to defer.
  const deferred = getStepsForRole(role).find((s) => s.id === row.currentStep);
  return deferred?.skippable ? [deferred.id] : [];
}
