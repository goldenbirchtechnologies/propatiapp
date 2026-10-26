import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import AgentSellClient from './AgentSellClient';
import {
  ACTIVE_AGREEMENT_STATUSES,
  estimateCommission,
  stageForStatus,
} from '../_lib/agent-deal-format';
import type { DealRecord, DealStats } from '../_lib/agent-deal-types';

const toNumber = (v: unknown): number => {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') return Number(v) || 0;
  if (v && typeof v === 'object' && 'toNumber' in (v as object)) {
    return (v as { toNumber: () => number }).toNumber();
  }
  return 0;
};

export default async function Page() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'agent') redirect('/dashboard');

  const agentId = user.id;

  // Vendor mandates: the agent represents the owner/seller.
  const [agreements, listings, listingImages] = await Promise.all([
    prisma.agreement.findMany({
      where: { agentId, type: 'sale', status: { in: ACTIVE_AGREEMENT_STATUSES } },
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
        stampDuty: { select: { amount: true, status: true, certificateUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    // Mandated listings that are live and awaiting a buyer.
    prisma.listing.findMany({
      where: { agentId, listingType: 'sale', status: 'active' },
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
      },
      orderBy: { createdAt: 'desc' },
      take: 40,
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
    } | null
  ) =>
    p
      ? {
          id: p.id,
          title: p.title,
          address: p.address,
          area: p.area,
          city: p.city,
          state: p.state,
          listingType: p.listingType,
          propertyType: p.propertyType,
          price: toNumber(p.price),
          imageUrl: coverByListing.get(p.id) ?? null,
          verificationTier: p.verificationTier,
        }
      : null;

  const agreementDeals: (DealRecord & { consideration: number })[] = agreements.map((a) => {
    const consideration =
      a.listing?.listingType === 'sale' ? toNumber(a.listing.price) : toNumber(a.rentAmount);
    return {
      id: a.id,
      reference: a.id.toUpperCase(),
      type: a.type,
      status: a.status,
      stage: stageForStatus(a.status),
      property: toProperty(a.listing),
      landlord: a.landlord,
      tenant: a.tenant,
      agent: a.agent,
      rentAmount: toNumber(a.rentAmount),
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
      consideration,
    };
  });

  // Live sale listings are vendor mandates still seeking a buyer.
  const mandateDeals: (DealRecord & { consideration: number })[] = listings.map((l) => ({
    id: l.id,
    reference: l.id.toUpperCase(),
    type: 'sale',
    status: 'draft',
    stage: 'enquiries',
    property: toProperty(l),
    landlord: l.owner,
    tenant: null,
    agent: { id: agentId, fullName: user.fullName, email: user.email, phone: user.phone },
    rentAmount: 0,
    rentPeriod: null,
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
  }));

  const deals = [...mandateDeals, ...agreementDeals];

  const stats: DealStats = {
    total: deals.length,
    active: deals.filter((d) =>
      ['draft', 'pending_landlord', 'pending_tenant', 'tenant_signed', 'landlord_signed'].includes(
        d.status
      )
    ).length,
    pending: deals.filter((d) =>
      ['draft', 'pending_landlord', 'pending_tenant'].includes(d.status)
    ).length,
    closed: deals.filter((d) => d.status === 'fully_signed').length,
    grossValue: deals.reduce((sum, d) => sum + d.consideration, 0),
    escrowValue: deals
      .filter((d) => ['tenant_signed', 'landlord_signed', 'fully_signed'].includes(d.status))
      .reduce((sum, d) => sum + d.consideration, 0),
    commissionValue: deals
      .filter((d) => d.status === 'fully_signed')
      .reduce((sum, d) => sum + estimateCommission(d.consideration), 0),
    averageStageDays: null,
  };

  return (
    <DashboardShell
      navigation={AGENT_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <AgentSellClient initialDeals={deals} stats={stats} agentRef={agentId} />
      </ErrorBoundary>
    </DashboardShell>
  );
}
