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
}

export function deriveStepStates(
  role: UserRole,
  facts: UserOnboardingFacts,
  skippedSteps: string[] = []
): OnboardingStepState[] {
  return getStepsForRole(role).map((step) => ({
    id: step.id,
    title: step.title,
    description: step.description,
    done: STEP_PREDICATES[step.id](facts) || skippedSteps.includes(step.id),
    skippable: step.skippable,
  }));
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

  const incomplete = steps.filter((s) => !s.done);
  const blockedBySkip = incomplete.some((s) => s.skippable && skippedSteps.includes(s.id));

  if (incomplete.length === 0) {
    return { status: 'completed', currentStep: null, canComplete: true, blocked: false };
  }

  if (blockedBySkip) {
    const firstBlocked = incomplete.find((s) => skippedSteps.includes(s.id));
    return {
      status: 'blocked',
      currentStep: firstBlocked?.id ?? incomplete[0].id,
      canComplete: false,
      blocked: true,
    };
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
    ? await getSkippedSteps(userId)
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
async function getSkippedSteps(userId: string): Promise<string[]> {
  const row = await prisma.userOnboarding.findUnique({
    where: { userId },
    select: { status: true, currentStep: true },
  });
  if (!row) return [];
  // A blocked onboarding row records the step the user skipped as currentStep.
  return row.status === 'blocked' ? [row.currentStep] : [];
}
