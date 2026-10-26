import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import AgentPipelineClient from './AgentPipelineClient';
import {
  ACTIVE_AGREEMENT_STATUSES,
  daysSince,
  estimateCommission,
  stageForStatus,
} from '../_lib/agent-deal-format';
import type { DealRecord, DealStats, PropertyRef } from '../_lib/agent-deal-types';

const toNumber = (v: unknown): number => {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') return Number(v) || 0;
  if (v && typeof v === 'object' && 'toNumber' in (v as object)) {
    return (v as { toNumber: () => number }).toNumber();
  }
  return 0;
};

export default async function AgentPipelinePage() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'agent') redirect('/dashboard');

  const agentId = user.id;

  const [agreements, draftListings, viewings, listingImages] = await Promise.all([
    prisma.agreement.findMany({
      where: { agentId, status: { in: ACTIVE_AGREEMENT_STATUSES } },
      select: {
        id: true,
        type: true,
        status: true,
        rentAmount: true,
        rentPeriod: true,
        cautionDeposit: true,
        serviceCharge: true,
        startDate: true,
        endDate: true,
        noticePeriodDays: true,
        specialClauses: true,
        jurisdictionState: true,
        governingStatute: true,
        riskTier: true,
        headTenantVerified: true,
        landlordSignedAt: true,
        tenantSignedAt: true,
        finalizedAt: true,
        lockStatus: true,
        pdfUrl: true,
        createdAt: true,
        updatedAt: true,
        listing: {
          select: {
            id: true,
            title: true,
            address: true,
            area: true,
            city: true,
            state: true,
            listingType: true,
            propertyType: true,
            price: true,
            verificationTier: true,
          },
        },
        landlord: { select: { id: true, fullName: true, email: true, phone: true } },
        tenant: { select: { id: true, fullName: true, email: true, phone: true } },
        agent: { select: { id: true, fullName: true, email: true, phone: true } },
        stampDuty: {
          select: { amount: true, status: true, certificateUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.listing.findMany({
      where: { agentId, status: 'draft' },
      select: {
        id: true,
        title: true,
        address: true,
        area: true,
        city: true,
        state: true,
        listingType: true,
        propertyType: true,
        price: true,
        createdAt: true,
        updatedAt: true,
        verificationTier: true,
        owner: { select: { id: true, fullName: true, email: true, phone: true } },
        agent: { select: { id: true, fullName: true, email: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 30,
    }),
    prisma.screeningCall.findMany({
      where: { listing: { agentId } },
      select: {
        id: true,
        scheduledAt: true,
        status: true,
        createdAt: true,
        listing: {
          select: {
            id: true,
            title: true,
            address: true,
            area: true,
            city: true,
            state: true,
            listingType: true,
            propertyType: true,
            price: true,
            verificationTier: true,
          },
        },
        tenant: { select: { id: true, fullName: true, email: true, phone: true } },
      },
      orderBy: { scheduledAt: 'asc' },
      take: 30,
    }),
    prisma.listingImage.findMany({
      where: { listing: { agentId } },
      select: { listingId: true, url: true, isCover: true },
      orderBy: { isCover: 'desc' },
    }),
  ]);

  const coverByListing = new Map<string, string>();
  for (const img of listingImages) {
    if (img.isCover && !coverByListing.has(img.listingId)) {
      coverByListing.set(img.listingId, img.url);
    }
  }
  if (!coverByListing.size) {
    for (const img of listingImages) {
      if (!coverByListing.has(img.listingId)) coverByListing.set(img.listingId, img.url);
    }
  }

  const toProperty = (
    p: {
      id: string;
      title: string;
      address: string;
      area: string | null;
      city: string | null;
      state: string | null;
      listingType: string;
      propertyType: string | null;
      price: unknown;
      verificationTier: string | null;
    } | null,
    imageUrl: string | null = null
  ): PropertyRef | null => {
    if (!p) return null;
    return {
      id: p.id,
      title: p.title,
      address: p.address,
      area: p.area,
      city: p.city,
      state: p.state,
      listingType: p.listingType,
      propertyType: p.propertyType,
      price: toNumber(p.price),
      imageUrl,
      verificationTier: p.verificationTier,
    };
  };

  const agreementDeals: DealRecord[] = agreements.map((a) => {
    const property = toProperty(a.listing, a.listing ? coverByListing.get(a.listing.id) ?? null : null);
    const rentAmount = toNumber(a.rentAmount);
    return {
      id: a.id,
      reference: a.id.toUpperCase(),
      type: a.type,
      status: a.status,
      stage: stageForStatus(a.status),
      property,
      landlord: a.landlord,
      tenant: a.tenant,
      agent: a.agent,
      rentAmount,
      rentPeriod: a.rentPeriod,
      cautionDeposit: toNumber(a.cautionDeposit),
      serviceCharge: toNumber(a.serviceCharge),
      startDate: a.startDate?.toISOString() ?? null,
      endDate: a.endDate?.toISOString() ?? null,
      noticePeriodDays: a.noticePeriodDays,
      specialClauses: a.specialClauses,
      jurisdictionState: a.jurisdictionState,
      governingStatute: a.governingStatute,
      riskTier: a.riskTier,
      headTenantVerified: a.headTenantVerified,
      landlordSignedAt: a.landlordSignedAt?.toISOString() ?? null,
      tenantSignedAt: a.tenantSignedAt?.toISOString() ?? null,
      finalizedAt: a.finalizedAt?.toISOString() ?? null,
      lockStatus: a.lockStatus,
      pdfUrl: a.pdfUrl,
      stampDutyAmount: a.stampDuty ? toNumber(a.stampDuty.amount) : null,
      stampDutyStatus: a.stampDuty?.status ?? null,
      stampDutyCertificateUrl: a.stampDuty?.certificateUrl ?? null,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
      // Consideration for the pipeline: sale price, else annualised rent.
      consideration:
        property && property.listingType === 'sale'
          ? property.price
          : rentAmount,
    } as DealRecord & { consideration: number };
  });

  // Draft listings are live enquiries — they have not become agreements yet.
  const enquiryDeals = draftListings.map(
    (l): DealRecord & { consideration: number } => ({
      id: l.id,
      reference: l.id.toUpperCase(),
      type: 'rental',
      status: 'draft',
      stage: 'enquiries',
      property: toProperty(l, coverByListing.get(l.id) ?? null),
      landlord: l.owner,
      tenant: null,
      agent: l.agent,
      rentAmount: 0,
      rentPeriod: l.listing.pricePeriod,
      cautionDeposit: 0,
      serviceCharge: 0,
      startDate: null,
      endDate: null,
      noticePeriodDays: null,
      specialClauses: null,
      jurisdictionState: l.state,
      governingStatute: null,
      riskTier: null,
      headTenantVerified: false,
      landlordSignedAt: null,
      tenantSignedAt: null,
      finalizedAt: null,
      lockStatus: 'mutable',
      pdfUrl: null,
      stampDutyAmount: null,
      stampDutyStatus: null,
      stampDutyCertificateUrl: null,
      createdAt: l.createdAt.toISOString(),
      updatedAt: l.updatedAt.toISOString(),
      consideration: toNumber(l.price),
    })
  );

  // Scheduled viewings / inspections.
  const viewingDeals = viewings.map(
    (v): DealRecord & { consideration: number } => ({
      id: v.id,
      reference: v.id.toUpperCase(),
      type: v.listing?.listingType ?? 'rental',
      status: 'draft',
      stage: 'viewings',
      property: toProperty(v.listing, v.listing ? coverByListing.get(v.listing.id) ?? null : null),
      landlord: null,
      tenant: v.tenant,
      agent: { id: agentId, fullName: user.fullName, email: user.email, phone: user.phone },
      rentAmount: 0,
      rentPeriod: v.listing?.listingType ? null : null,
      cautionDeposit: 0,
      serviceCharge: 0,
      startDate: v.scheduledAt?.toISOString() ?? null,
      endDate: null,
      noticePeriodDays: null,
      specialClauses: null,
      jurisdictionState: v.listing?.state ?? null,
      governingStatute: null,
      riskTier: null,
      headTenantVerified: false,
      landlordSignedAt: null,
      tenantSignedAt: null,
      finalizedAt: null,
      lockStatus: 'mutable',
      pdfUrl: null,
      stampDutyAmount: null,
      stampDutyStatus: null,
      stampDutyCertificateUrl: null,
      createdAt: v.createdAt.toISOString(),
      updatedAt: v.createdAt.toISOString(),
      consideration: toNumber(v.listing?.price ?? 0),
    })
  );

  const allDeals = [...agreementDeals, ...enquiryDeals, ...viewingDeals];

  const considerationOf = (d: DealRecord) =>
    (d as DealRecord & { consideration?: number }).consideration ?? d.rentAmount ?? 0;

  const grossValue = allDeals.reduce((sum, d) => sum + considerationOf(d), 0);
  const escrowValue = allDeals
    .filter((d) => ['tenant_signed', 'landlord_signed', 'fully_signed'].includes(d.status))
    .reduce((sum, d) => sum + considerationOf(d), 0);
  const commissionValue = allDeals
    .filter((d) => d.status === 'fully_signed')
    .reduce((sum, d) => sum + estimateCommission(considerationOf(d)), 0);

  const stageDays = allDeals
    .map((d) => daysSince(d.createdAt))
    .filter((n): n is number => n !== null);
  const averageStageDays = stageDays.length
    ? Math.round(stageDays.reduce((a, b) => a + b, 0) / stageDays.length)
    : null;

  const stats: DealStats = {
    total: allDeals.length,
    active: allDeals.filter((d) =>
      ['draft', 'pending_landlord', 'pending_tenant', 'tenant_signed', 'landlord_signed'].includes(
        d.status
      )
    ).length,
    pending: allDeals.filter((d) =>
      ['draft', 'pending_landlord', 'pending_tenant'].includes(d.status)
    ).length,
    closed: allDeals.filter((d) => d.status === 'fully_signed').length,
    grossValue,
    escrowValue,
    commissionValue,
    averageStageDays,
  };

  return (
    <DashboardShell
      navigation={AGENT_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <AgentPipelineClient
          initialData={{
            deals: allDeals,
            stats,
            agentRef: agentId,
          }}
        />
      </ErrorBoundary>
    </DashboardShell>
  );
}
