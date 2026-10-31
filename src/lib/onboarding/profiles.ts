import { Prisma, UserRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { markStepDone } from './dossier';
import { ROLE_STEPS, StepId } from './steps';

/**
 * A section counts as done when every field the wizard requires for it holds a
 * value. Deriving completion from the stored data (rather than trusting a
 * submitted flag) means a half-applied write can never mark a step complete.
 */

type LandlordRow = {
  legalEntityType: string | null;
  legalName: string | null;
  primaryPhone: string | null;
  contactEmail: string | null;
  mailingAddress: string | null;
  taxIdType: string | null;
  taxNumber: string | null;
  accountName: string | null;
  bankName: string | null;
  accountNumberEnc: string | null;
  commissionConsent: boolean;
} | null;

type AgentRow = {
  legalName: string | null;
  businessPhone: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  emergencyContactRelationship: string | null;
  board: string | null;
  licenseNumber: string | null;
  codeOfConductConsent: boolean;
  operationalTerritories: Prisma.JsonValue | null;
  focusAreas: Prisma.JsonValue | null;
  bankName: string | null;
  accountName: string | null;
  accountNumberEnc: string | null;
} | null;

type EstateRow = {
  legalEntityName: string | null;
  officeAddress: string | null;
  authoritySubmittedAt: Date | null;
  trustBankName: string | null;
  trustAccountName: string | null;
  trustAccountNumberEnc: string | null;
  remittanceCycle: string | null;
} | null;

function nonEmptyList(value: Prisma.JsonValue | null): boolean {
  return Array.isArray(value) && value.length > 0;
}

export function isLandlordProfileDone(row: LandlordRow): boolean {
  return !!(
    row &&
    row.legalEntityType &&
    row.legalName &&
    row.primaryPhone &&
    row.contactEmail &&
    row.mailingAddress &&
    row.taxIdType &&
    row.taxNumber
  );
}

export function isLandlordSettlementDone(row: LandlordRow): boolean {
  return !!(row && row.accountName && row.bankName && row.accountNumberEnc && row.commissionConsent);
}

export function isAgentProfileDone(row: AgentRow): boolean {
  return !!(
    row &&
    row.legalName &&
    row.businessPhone &&
    row.emergencyContactName &&
    row.emergencyContactPhone &&
    row.emergencyContactRelationship
  );
}

export function isAgentLicenseDone(row: AgentRow): boolean {
  return !!(row && row.board && row.licenseNumber && row.codeOfConductConsent);
}

export function isAgentTerritoryDone(row: AgentRow): boolean {
  return !!(row && nonEmptyList(row.operationalTerritories) && nonEmptyList(row.focusAreas));
}

export function isAgentSettlementDone(row: AgentRow): boolean {
  return !!(row && row.bankName && row.accountName && row.accountNumberEnc);
}

export function isEstateProfileDone(row: EstateRow): boolean {
  return !!(row && row.legalEntityName && row.officeAddress);
}

export function isEstateAuthorityDone(row: EstateRow): boolean {
  return !!(row && row.authoritySubmittedAt);
}

export function isEstateRemittanceDone(row: EstateRow): boolean {
  return !!(
    row &&
    row.trustBankName &&
    row.trustAccountName &&
    row.trustAccountNumberEnc &&
    row.remittanceCycle
  );
}

/** The step the wizard should resume at once `step` has been saved. */
export function nextStepFor(role: UserRole, step: StepId): string {
  const steps = ROLE_STEPS[role] ?? [];
  const index = steps.indexOf(step);
  if (index < 0) return steps[0] ?? 'complete';
  return steps[index + 1] ?? 'complete';
}

/**
 * Records a step as saved and moves the wizard on. The user-level status is
 * flipped here too so the dashboard gate opens as soon as the last step lands.
 */
export async function advanceOnboarding(userId: string, role: UserRole, step: StepId) {
  const next = nextStepFor(role, step);

  await prisma.user.update({
    where: { id: userId },
    data: { onboardingStatus: 'in_progress' },
  });
  await markStepDone(userId, role, step, next);

  return next;
}

/** Loads the role-specific profile row backing a user's remaining steps. */
export async function loadProfileRow(role: UserRole, userId: string) {
  switch (role) {
    case 'landlord':
      return prisma.landlordProfile.findUnique({ where: { userId } });
    case 'agent':
      return prisma.agentProfile.findUnique({ where: { userId } });
    case 'estate_manager':
      return prisma.estateManagerProfile.findUnique({ where: { userId } });
    default:
      return null;
  }
}
