import { prisma } from '@/lib/prisma';
import { getSettlementSummary } from '@/lib/settlement';
import { getEffectivePlatformConfig } from '@/lib/platform-config-server';
import { getOnboardingSnapshot } from '@/lib/onboarding/status';
import { landlordWorkspaceSummary } from './completion';
import type {
  LandlordDocumentCategory,
  LandlordDocumentRow,
  LandlordProfileValues,
  LandlordWorkspace,
} from './types';

const str = (value: string | null | undefined): string => value ?? '';

/**
 * One read path for the owner workspace. The server page and the GET route both
 * call this, so the first paint and a refetch can never disagree about which
 * facts are stored.
 */
export async function loadLandlordWorkspace(userId: string): Promise<LandlordWorkspace> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      phoneVerified: true,
      avatarUrl: true,
      idType: true,
      idVerified: true,
      ninVerified: true,
      countryId: true,
      jurisdictionId: true,
      city: true,
      addressLine1: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const [profile, settlement, documents, config, snapshot, jurisdiction] = await Promise.all([
    prisma.landlordProfile.findUnique({ where: { userId } }),
    getSettlementSummary(userId),
    prisma.landlordDocument.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    }),
    getEffectivePlatformConfig(),
    getOnboardingSnapshot(userId),
    user.jurisdictionId
      ? prisma.jurisdiction.findUnique({
          where: { id: user.jurisdictionId },
          select: { name: true },
        })
      : Promise.resolve(null),
  ]);

  const values: LandlordProfileValues = {
    legalEntityType:
      (profile?.legalEntityType as LandlordProfileValues['legalEntityType']) ?? null,
    legalName: str(profile?.legalName),
    jointOwnerNames: str(profile?.jointOwnerNames),
    companyName: str(profile?.companyName),
    companyRegistrationNumber: str(profile?.companyRegistrationNumber),
    companyAddress: str(profile?.companyAddress),
    representativeName: str(profile?.representativeName),
    representativePhone: str(profile?.representativePhone),
    representativeEmail: str(profile?.representativeEmail),
    primaryPhone: str(profile?.primaryPhone ?? user.phone),
    contactEmail: str(profile?.contactEmail ?? user.email),
    mailingAddress: str(profile?.mailingAddress),
    countryCode: str(profile?.countryCode ?? user.countryId),
    stateRegion: str(profile?.stateRegion ?? jurisdiction?.name),
    city: str(profile?.city ?? user.city),
    streetAddress: str(profile?.streetAddress ?? profile?.mailingAddress ?? user.addressLine1),
    postalCode: str(profile?.postalCode),
    taxIdType: (profile?.taxIdType as LandlordProfileValues['taxIdType']) ?? null,
    taxNumber: str(profile?.taxNumber),
    taxJurisdiction: str(profile?.taxJurisdiction),
    managementFeeType:
      (profile?.managementFeeType as LandlordProfileValues['managementFeeType']) ?? null,
    managementFeeValue:
      profile?.managementFeeValue === null || profile?.managementFeeValue === undefined
        ? ''
        : String(profile.managementFeeValue),
  };

  const documentRows: LandlordDocumentRow[] = documents.map((doc) => ({
    id: doc.id,
    category: doc.category as LandlordDocumentCategory,
    name: doc.name,
    url: doc.url,
    mimeType: doc.mimeType,
    sizeBytes: doc.sizeBytes,
    status: doc.status,
    reviewNote: doc.reviewNote,
    expiresAt: doc.expiresAt ? doc.expiresAt.toISOString() : null,
    createdAt: doc.createdAt.toISOString(),
  }));

  const settlementView = {
    linked: settlement.settlement.linked,
    state: settlement.settlement.state,
    bankName: settlement.settlement.bankName,
    accountName: settlement.settlement.accountName,
    accountNumberMasked: settlement.settlement.accountNumberMasked,
  };

  const rent = config.transactionFees.long_term_rent;

  return {
    account: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      phoneVerified: user.phoneVerified,
      avatarUrl: user.avatarUrl,
      idType: user.idType,
      idVerified: user.idVerified,
      ninVerified: user.ninVerified,
    },
    profile: values,
    settlement: settlementView,
    documents: documentRows,
    completion: landlordWorkspaceSummary({
      profile: values,
      settlement: settlementView,
      documents: documentRows,
    }),
    platformFees: {
      currency: config.currency,
      vatRate: config.vat.rate,
      agencyFeeRate: rent.agencyFeeRate.default,
      agreementFeeRate: rent.agreementFeeRate.default,
      cautionDepositRate: rent.cautionDepositRate,
      platformFeePayer: rent.platformFeePayer,
      stampDutyInstrument: rent.stampDutyInstrument,
    },
    onboarding: {
      required: snapshot?.required ?? false,
      completed: snapshot ? snapshot.status === 'completed' : false,
      remaining: snapshot ? snapshot.steps.filter((step) => !step.done).length : 0,
    },
  };
}
