import { prisma } from './prisma';
import { AgreementType, AgreementStatus } from '@prisma/client';
import { renderAgreementTemplate, type AgreementTemplateData } from './agreement-templates';

interface AgreementTerms {
  startDate: Date;
  endDate: Date;
  rentAmount: number;
  rentPeriod: string;
  cautionDeposit?: number;
  serviceCharge?: number;
  noticePeriodDays?: number;
  noticePeriodText?: string;
  specialClauses?: string;
  riskTier?: 'self_serve' | 'review_required';
  jurisdictionState?: string | null;
  governingStatute?: string | null;
}

interface GenerateAgreementParams {
  listingId: string;
  landlordId: string;
  tenantId: string;
  agentId?: string;
  type: AgreementType;
  terms: AgreementTerms;
  headTenantVerified?: boolean;
}

class AgreementService {
  /**
   * Generate a new agreement from parameters
   */
  async generateAgreement(params: GenerateAgreementParams) {
    const { listingId, landlordId, tenantId, agentId, type, terms } = params;

    // Fetch listing details
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: {
        id: true,
        title: true,
        area: true,
        state: true,
        address: true,
        ownerId: true,
      },
    });

    if (!listing) {
      throw new Error('Listing not found');
    }

    // Verify landlord owns the listing
    if (listing.ownerId !== landlordId) {
      throw new Error('Landlord does not own this listing');
    }

    // Create agreement
    const agreement = await prisma.agreement.create({
      data: {
        listingId,
        landlordId,
        tenantId,
        agentId: agentId || null,
        type,
        status: 'draft',
        startDate: terms.startDate,
        endDate: terms.endDate,
        rentAmount: terms.rentAmount,
        cautionDeposit: terms.cautionDeposit || null,
        serviceCharge: terms.serviceCharge || null,
        rentPeriod: terms.rentPeriod,
        noticePeriodDays: terms.noticePeriodDays || 30,
        specialClauses: terms.specialClauses || null,
        riskTier: terms.riskTier || 'review_required',
        jurisdictionState: terms.jurisdictionState || null,
        governingStatute: terms.governingStatute || null,
        headTenantVerified: params.headTenantVerified || false,
        templateVars: {
          listingTitle: listing.title,
          listingArea: listing.area,
          listingState: listing.state,
          listingAddress: listing.address,
        },
      },
      include: {
        listing: true,
        landlord: { select: { id: true, fullName: true, email: true, phone: true } },
        tenant: { select: { id: true, fullName: true, email: true, phone: true } },
        agent: { select: { id: true, fullName: true, email: true } },
      },
    });

    return agreement;
  }

  /**
   * Render agreement HTML with template variables
   */
  async renderAgreement(agreementId: string): Promise<string> {
    const agreement = await prisma.agreement.findUnique({
      where: { id: agreementId },
      select: {
        id: true,
        type: true,
        riskTier: true,
        jurisdictionState: true,
        governingStatute: true,
        headTenantVerified: true,
        startDate: true,
        endDate: true,
        rentAmount: true,
        rentPeriod: true,
        cautionDeposit: true,
        serviceCharge: true,
        noticePeriodDays: true,
        specialClauses: true,
        listing: { select: { id: true, title: true, area: true, state: true, address: true } },
        landlord: { select: { id: true, fullName: true, email: true, phone: true } },
        tenant: { select: { id: true, fullName: true, email: true, phone: true } },
        agent: { select: { id: true, fullName: true, email: true } },
      },
    });

    if (!agreement) {
      throw new Error('Agreement not found');
    }

    const templateData = {
      agreementId: agreement.id,
      agreementType: agreement.type as AgreementTemplateData['agreementType'],
      riskTier: (agreement.riskTier as 'self_serve' | 'review_required') || 'review_required',
      jurisdictionState: agreement.jurisdictionState,
      governingStatute: agreement.governingStatute,
      agreementDate: new Date().toLocaleDateString('en-NG', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
      listingTitle: agreement.listing.title,
      listingArea: agreement.listing.area,
      listingState: agreement.listing.state,
      listingAddress: agreement.listing.address,
      landlordName: agreement.landlord.fullName,
      landlordEmail: agreement.landlord.email,
      landlordPhone: agreement.landlord.phone || 'N/A',
      tenantName: agreement.tenant.fullName,
      tenantEmail: agreement.tenant.email,
      tenantPhone: agreement.tenant.phone || 'N/A',
      agentName: agreement.agent?.fullName || 'N/A',
      agentEmail: agreement.agent?.email || 'N/A',
      startDate: agreement.startDate?.toLocaleDateString('en-NG') || 'TBD',
      endDate: agreement.endDate?.toLocaleDateString('en-NG') || 'TBD',
      rentAmount: agreement.rentAmount ? Number(agreement.rentAmount).toLocaleString('en-NG') : 'N/A',
      rentPeriod: agreement.rentPeriod || 'monthly',
      cautionDeposit: agreement.cautionDeposit ? Number(agreement.cautionDeposit).toLocaleString('en-NG') : 'N/A',
      serviceCharge: agreement.serviceCharge ? Number(agreement.serviceCharge).toLocaleString('en-NG') : 'N/A',
      noticePeriodDays: agreement.noticePeriodDays,
      specialClauses: agreement.specialClauses || '',
    };

    return renderAgreementTemplate(agreement.type, templateData);
  }

  /**
   * Get agreement status and check if all parties have signed
   */
  async getAgreementStatus(agreementId: string) {
    const agreement = await prisma.agreement.findUnique({
      where: { id: agreementId },
      include: {
        signatures: true,
      },
    });

    if (!agreement) {
      throw new Error('Agreement not found');
    }

    const landlordSigned = agreement.signatures.some(s => s.role === 'landlord');
    const tenantSigned = agreement.signatures.some(s => s.role === 'tenant');
    const fullySignedStatus = landlordSigned && tenantSigned;

    return {
      status: agreement.status,
      landlordSigned,
      tenantSigned,
      fullySignedStatus,
      landlordSignedAt: agreement.landlordSignedAt,
      tenantSignedAt: agreement.tenantSignedAt,
      canTransitionToFullySigned: fullySignedStatus && agreement.status !== 'fully_signed',
    };
  }

  /**
   * Update agreement status after signing
   */
  async updateAgreementAfterSigning(
    agreementId: string,
    signerRole: 'landlord' | 'tenant'
  ): Promise<AgreementStatus> {
    const statusCheck = await this.getAgreementStatus(agreementId);

    let newStatus: AgreementStatus = statusCheck.status;

    if (statusCheck.canTransitionToFullySigned) {
      newStatus = 'fully_signed';
      await prisma.agreement.update({
        where: { id: agreementId },
        data: { status: newStatus },
      });
    } else if (signerRole === 'landlord') {
      newStatus = statusCheck.tenantSigned ? 'fully_signed' : 'landlord_signed';
      await prisma.agreement.update({
        where: { id: agreementId },
        data: {
          status: newStatus,
          landlordSignedAt: new Date(),
        },
      });
    } else if (signerRole === 'tenant') {
      newStatus = statusCheck.landlordSigned ? 'fully_signed' : 'tenant_signed';
      await prisma.agreement.update({
        where: { id: agreementId },
        data: {
          status: newStatus,
          tenantSignedAt: new Date(),
        },
      });
    }

    return newStatus;
  }
}

export const agreementService = new AgreementService();
