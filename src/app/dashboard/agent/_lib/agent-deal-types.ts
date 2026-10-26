/**
 * Serialisable shapes shared by the agent PIPELINE / BUY / SELL / DEALS screens.
 *
 * These mirror the Prisma selections made in the corresponding `page.tsx`
 * server components — the server queries, flattens and hands plain objects to
 * the client component so nothing leaks a Prisma Decimal or Date instance.
 */

import type { StageId } from './agent-deal-format';

export type Party = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
};

export type PropertyRef = {
  id: string;
  title: string;
  address: string;
  area: string | null;
  city: string | null;
  state: string | null;
  listingType: string;
  propertyType: string | null;
  price: number;
  imageUrl: string | null;
  verificationTier: string | null;
};

export type DealRecord = {
  id: string;
  /** Human-facing reference, derived from the agreement id. */
  reference: string;
  type: string;
  status: string;
  stage: StageId;
  property: PropertyRef | null;
  landlord: Party | null;
  tenant: Party | null;
  agent: Party | null;
  rentAmount: number;
  rentPeriod: string | null;
  cautionDeposit: number;
  serviceCharge: number;
  startDate: string | null;
  endDate: string | null;
  noticePeriodDays: number | null;
  specialClauses: string | null;
  jurisdictionState: string | null;
  governingStatute: string | null;
  riskTier: string | null;
  headTenantVerified: boolean;
  landlordSignedAt: string | null;
  tenantSignedAt: string | null;
  finalizedAt: string | null;
  lockStatus: string;
  pdfUrl: string | null;
  stampDutyAmount: number | null;
  stampDutyStatus: string | null;
  stampDutyCertificateUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DealStats = {
  total: number;
  active: number;
  pending: number;
  closed: number;
  grossValue: number;
  escrowValue: number;
  commissionValue: number;
  averageStageDays: number | null;
};

export type PipelinePayload = {
  deals: DealRecord[];
  stats: DealStats;
  /** agentId used for the scope badge in the header. */
  agentRef: string;
};
