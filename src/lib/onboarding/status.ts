import { OnboardingStatus, UserRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getStepsForRole, StepId } from './steps';

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
  };

  const derived = deriveStatus(user.role, facts, skippedSteps);
  const steps = deriveStepStates(user.role, facts, skippedSteps);

  // A user who was never flagged for onboarding (pre-existing accounts) is
  // never gated, and their derived status does not matter.
  const required = user.onboardingRequired && user.role !== 'admin';

  return {
    role: user.role,
    status: required ? derived.status : 'completed',
    required,
    currentStep: required ? derived.currentStep : null,
    steps: required ? steps : [],
    canComplete: required ? derived.canComplete : true,
    blocked: required ? derived.blocked : false,
  };
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
