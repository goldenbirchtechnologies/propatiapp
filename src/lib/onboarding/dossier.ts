import { Prisma, UserRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { StepId } from './steps';

export interface DossierInput {
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  countryId?: string | null;
  jurisdictionId?: string | null;
  employmentStatus?: 'employed' | 'self_employed' | 'business_owner' | 'student' | 'retired' | 'unemployed';
  employmentType?: 'full_time' | 'part_time' | 'contract' | 'freelance' | 'internship';
  employerName?: string | null;
  jobTitle?: string | null;
  yearlyIncome?: bigint | null;
  yearsInEmployment?: string | null;
  guarantorName?: string | null;
  guarantorPhone?: string | null;
  guarantorRelationship?: string | null;
  guarantorAddress?: string | null;
  guarantorOccupation?: string | null;
  preferredListingType?: 'rent' | 'sale' | 'short_let' | 'share' | 'commercial';
  monthlyBudget?: bigint | null;
}

/**
 * Writes the tenant's rental application dossier and mirrors the fields that
 * existing dashboards already read off the User row. Doing both in one place
 * keeps the dossier and the user profile from drifting apart.
 */
export async function upsertDossier(userId: string, data: DossierInput) {
  const dossier = await prisma.rentalApplicationDossier.upsert({
    where: { userId },
    create: stripUndefined(data) as any,
    update: stripUndefined(data) as any,
  });

  const userPatch: Prisma.UserUpdateInput = {};
  if (data.employmentStatus !== undefined) userPatch.employmentStatus = data.employmentStatus;
  if (data.employmentType !== undefined) userPatch.employmentType = data.employmentType;
  if (data.employerName !== undefined) userPatch.employerName = data.employerName;
  if (data.jobTitle !== undefined) userPatch.jobTitle = data.jobTitle;
  if (data.yearlyIncome !== undefined) userPatch.yearlyIncome = data.yearlyIncome;
  if (data.guarantorName !== undefined) userPatch.guarantorName = data.guarantorName;
  if (data.guarantorPhone !== undefined) userPatch.guarantorPhone = data.guarantorPhone;
  if (data.guarantorRelationship !== undefined) {
    userPatch.guarantorRelationship = data.guarantorRelationship;
  }
  if (data.city !== undefined) userPatch.city = data.city;
  if (data.addressLine1 !== undefined) userPatch.addressLine1 = data.addressLine1;
  if (data.addressLine2 !== undefined) userPatch.addressLine2 = data.addressLine2;
  if (data.countryId !== undefined) userPatch.country = { connect: { code: data.countryId as string } };
  if (data.jurisdictionId !== undefined) userPatch.jurisdiction = { connect: { id: data.jurisdictionId as string } };

  if (Object.keys(userPatch).length > 0) {
    await prisma.user.update({ where: { id: userId }, data: userPatch });
  }

  return dossier;
}

function stripUndefined<T>(data: Partial<T>): Partial<T> {
  const out: Partial<T> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) (out as any)[key] = value;
  }
  return out;
}

/**
 * Copies a submitted dossier onto a listing application so the landlord sees
 * the tenant's screening details without the tenant re-entering them.
 */
export async function applyDossierToApplication(
  dossier: {
    employmentStatus: string | null;
    employmentType: string | null;
    employerName: string | null;
    jobTitle: string | null;
    yearlyIncome: bigint | null;
    guarantorName: string | null;
    guarantorPhone: string | null;
    guarantorRelationship: string | null;
    addressLine1: string | null;
    city: string | null;
    idDocUrl: string | null;
  },
  applicationId: string
) {
  await prisma.application.update({
    where: { id: applicationId },
    data: {
      screeningStatus: {
        nin: false,
        bvn: false,
        credit: false,
        references: false,
        employmentStatus: dossier.employmentStatus,
        employmentType: dossier.employmentType,
        employerName: dossier.employerName,
        jobTitle: dossier.jobTitle,
        yearlyIncome: dossier.yearlyIncome?.toString() ?? null,
        address: [dossier.addressLine1, dossier.city].filter(Boolean).join(', '),
      },
      guarantorData: {
        name: dossier.guarantorName,
        phone: dossier.guarantorPhone,
        relationship: dossier.guarantorRelationship,
        verified: false,
      },
      applicantDocuments: dossier.idDocUrl
        ? [{ name: 'Identity document', url: dossier.idDocUrl, type: 'id', uploadedAt: new Date().toISOString() }]
        : [],
    },
  });
}

export async function ensureOnboardingRow(userId: string, role: UserRole, currentStep: string) {
  return prisma.userOnboarding.upsert({
    where: { userId },
    create: {
      userId,
      role,
      status: 'in_progress',
      currentStep,
    },
    update: {
      status: 'in_progress',
      currentStep,
    },
  });
}

export async function markStepDone(
  userId: string,
  role: UserRole,
  step: StepId,
  currentStep: string
) {
  const fieldMap = {
    location: 'locationDone',
    contact: 'contactDone',
    identity: 'identityDone',
    employment: 'employmentDone',
    guarantor: 'guarantorDone',
    landlordProfile: 'landlordProfileDone',
    landlordSettlement: 'landlordSettlementDone',
    agentProfile: 'agentProfileDone',
    agentLicense: 'agentLicenseDone',
    agentTerritory: 'agentTerritoryDone',
    agentSettlement: 'agentSettlementDone',
    estateProfile: 'estateProfileDone',
    estateAuthority: 'estateAuthorityDone',
    estateRemittance: 'estateRemittanceDone',
  } as const;

  return prisma.userOnboarding.upsert({
    where: { userId },
    create: {
      userId,
      role,
      status: 'in_progress',
      currentStep,
      [fieldMap[step]]: true,
    },
    update: {
      status: 'in_progress',
      currentStep,
      [fieldMap[step]]: true,
    },
  });
}
