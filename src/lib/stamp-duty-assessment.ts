import { prisma } from '@/lib/prisma';
import {
  assessStampDuty,
  leaseTermMonths,
  resolveAuthority,
  resolveInstrument,
  resolvePayerIdentity,
  type StampDutyAssessment,
  type AuthorityConfig,
  type PayerIdentity,
} from '@/lib/stamp-duty';
import { getVerifiedPayerIdentity } from '@/lib/verified-identity';
import type { RemittingAuthority } from '@prisma/client';

export interface AgreementStampDutyContext {
  agreement: {
    id: string;
    type: string;
    status: string;
    landlordId: string;
    tenantId: string;
    rentAmount: unknown;
    startDate: Date | null;
    endDate: Date | null;
    jurisdictionState: string | null;
    listing: { address: string; area: string; state: string; listingType: string | null };
    landlord: { id: string; fullName: string; email: string; phone: string | null };
    tenant: { id: string; fullName: string; email: string; phone: string | null };
  };
  assessment: StampDutyAssessment;
  authority: AuthorityConfig;
  payer: PayerIdentity;
  /** Payer for each side, so either party can settle the duty. */
  payers: { landlord: PayerIdentity; tenant: PayerIdentity };
  /** Whether each side's payer name came from a verified identity. */
  identityVerified: { landlord: boolean; tenant: boolean };
  propertyAddress: string;
  alreadyStamped: boolean;
  existingStatus: string | null;
  existingRrr: string | null;
}

/**
 * Load an agreement and assess the stamp duty payable on it: instrument,
 * basis, rate, taxable amount, collecting authority and who is named on the
 * certificate.
 *
 * Returns null when the agreement does not exist.
 */
export async function loadStampDutyContext(
  agreementId: string
): Promise<AgreementStampDutyContext | null> {
  const agreement = await prisma.agreement.findUnique({
    where: { id: agreementId },
    select: {
      id: true,
      type: true,
      status: true,
      landlordId: true,
      tenantId: true,
      rentAmount: true,
      startDate: true,
      endDate: true,
      jurisdictionState: true,
      listing: { select: { address: true, area: true, state: true, listingType: true } },
      landlord: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          businessProfiles: {
            select: { companyName: true, rcNumber: true, verified: true },
            take: 1,
          },
        },
      },
      tenant: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          businessProfiles: {
            select: { companyName: true, rcNumber: true, verified: true },
            take: 1,
          },
        },
      },
      stampDuty: { select: { status: true, remitaRrr: true } },
    },
  });

  if (!agreement) return null;

  const state = agreement.jurisdictionState || agreement.listing.state;
  const listingType = agreement.listing.listingType;

  // The certificate names a person, so the name on it should be the one the
  // identity provider confirmed — not whatever was typed into the profile.
  // Unverified participants fall back to their profile details unchanged.
  const [landlordIdentity, tenantIdentity] = await Promise.all([
    getVerifiedPayerIdentity(agreement.landlordId),
    getVerifiedPayerIdentity(agreement.tenantId),
  ]);

  const landlordPerson = withVerifiedIdentity(agreement.landlord, landlordIdentity);
  const tenantPerson = withVerifiedIdentity(agreement.tenant, tenantIdentity);

  const landlordPayer = resolvePayerIdentity({
    person: landlordPerson,
    businessProfile: agreement.landlord.businessProfiles[0] ?? null,
    agreementType: agreement.type,
    listingType,
  });
  const tenantPayer = resolvePayerIdentity({
    person: tenantPerson,
    businessProfile: agreement.tenant.businessProfiles[0] ?? null,
    agreementType: agreement.type,
    listingType,
  });

  // A corporate lease is stamped against the company where one is on file;
  // otherwise the tenant is the natural person being assessed.
  const payer = tenantPayer.type === 'corporate' ? tenantPayer : landlordPayer.type === 'corporate' ? landlordPayer : tenantPayer;

  const instrument = resolveInstrument({
    agreementType: agreement.type,
    payerType: payer.type,
    listingType,
  });

  const months = leaseTermMonths(agreement.startDate, agreement.endDate);
  const annualRent = Number(agreement.rentAmount ?? 0);

  const assessment = assessStampDuty({
    instrument,
    annualRent,
    leaseTermMonths: months,
  });

  const authority = resolveAuthority(state);

  return {
    agreement: {
      id: agreement.id,
      type: agreement.type,
      status: agreement.status,
      landlordId: agreement.landlordId,
      tenantId: agreement.tenantId,
      rentAmount: agreement.rentAmount,
      startDate: agreement.startDate,
      endDate: agreement.endDate,
      jurisdictionState: state ?? null,
      listing: agreement.listing,
      landlord: {
        id: agreement.landlord.id,
        fullName: landlordPerson.fullName,
        email: landlordPerson.email,
        phone: landlordPerson.phone,
      },
      tenant: {
        id: agreement.tenant.id,
        fullName: tenantPerson.fullName,
        email: tenantPerson.email,
        phone: tenantPerson.phone,
      },
    },
    assessment,
    authority,
    payer,
    payers: { landlord: landlordPayer, tenant: tenantPayer },
    identityVerified: {
      landlord: Boolean(landlordIdentity?.verified),
      tenant: Boolean(tenantIdentity?.verified),
    },
    propertyAddress: [agreement.listing.address, agreement.listing.area, agreement.listing.state]
      .filter(Boolean)
      .join(', '),
    alreadyStamped: agreement.stampDuty?.status === 'paid' || agreement.stampDuty?.status === 'issued',
    existingStatus: agreement.stampDuty?.status ?? null,
    existingRrr: agreement.stampDuty?.remitaRrr ?? null,
  };
}

type PersonDetails = { fullName: string; email: string; phone: string | null };

/**
 * Overlay a verified identity onto the profile record.
 *
 * Only fields the provider actually confirmed are replaced, so a partial
 * verification cannot blank out details the user already supplied.
 */
function withVerifiedIdentity<T extends PersonDetails>(
  person: T,
  identity: Awaited<ReturnType<typeof getVerifiedPayerIdentity>>
): T {
  if (!identity?.verified) return person;

  return {
    ...person,
    fullName: identity.fullName || person.fullName,
    email: identity.email || person.email,
    phone: identity.phone || person.phone,
  };
}

/** Shape returned to the client for display. */
export function toAssessmentPayload(ctx: AgreementStampDutyContext) {
  return {
    agreementId: ctx.agreement.id,
    instrument: ctx.assessment.instrument,
    basis: ctx.assessment.basis,
    rate: ctx.assessment.rate,
    annualRent: ctx.assessment.annualRent,
    taxableAmount: ctx.assessment.taxableAmount,
    amount: ctx.assessment.amount,
    leaseTermMonths: ctx.assessment.leaseTermMonths,
    authority: ctx.authority.authority as RemittingAuthority,
    authorityLabel: ctx.authority.label,
    authorityState: ctx.agreement.jurisdictionState,
    payerType: ctx.payer.type,
    payerName: ctx.payer.name,
    payerRcNumber: ctx.payer.rcNumber,
    payers: {
      landlord: {
        type: ctx.payers.landlord.type,
        name: ctx.payers.landlord.name,
        rcNumber: ctx.payers.landlord.rcNumber,
        verified: ctx.identityVerified.landlord,
      },
      tenant: {
        type: ctx.payers.tenant.type,
        name: ctx.payers.tenant.name,
        rcNumber: ctx.payers.tenant.rcNumber,
        verified: ctx.identityVerified.tenant,
      },
    },
    propertyAddress: ctx.propertyAddress,
    alreadyStamped: ctx.alreadyStamped,
    existingStatus: ctx.existingStatus,
    existingRrr: ctx.existingRrr,
    /** False when the agreement is not yet executable or duty is nil. */
    payable: ctx.agreement.status === 'fully_signed' && ctx.assessment.amount > 0 && !ctx.alreadyStamped,
  };
}
