import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import AgentBuyClient from './AgentBuyClient';
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

  const [agreements, listingImages] = await Promise.all([
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

  const deals: (DealRecord & { consideration: number })[] = agreements.map((a) => {
    const consideration =
      a.listing?.listingType === 'sale'
        ? toNumber(a.listing.price)
        : toNumber(a.rentAmount);
    return {
      id: a.id,
      reference: a.id.toUpperCase(),
      type: a.type,
      status: a.status,
      stage: stageForStatus(a.status),
      property: a.listing
        ? {
            id: a.listing.id,
            title: a.listing.title,
            address: a.listing.address,
            area: a.listing.area,
            city: a.listing.city,
            state: a.listing.state,
            listingType: a.listing.listingType,
            propertyType: a.listing.propertyType,
            price: toNumber(a.listing.price),
            imageUrl: coverByListing.get(a.listing.id) ?? null,
            verificationTier: a.listing.verificationTier,
          }
        : null,
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
        <AgentBuyClient initialDeals={deals} stats={stats} agentRef={agentId} />
      </ErrorBoundary>
    </DashboardShell>
  );
}
