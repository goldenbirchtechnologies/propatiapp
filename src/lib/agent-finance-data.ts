import { prisma } from '@/lib/prisma';
import { parseKoboToNaira } from '@/lib/utils';

/**
 * Shared data access for the agent FINANCE screens.
 *
 * Money units:
 *  - Transaction.amount / agentCommission / platformFee / payeeAmount are BigInt KOBO.
 *  - Wallet.balance and WalletTransaction.amount are Decimal NAIRA.
 *  - Agreement.rentAmount is Decimal NAIRA.
 *  - Invoice.amount is Decimal NAIRA.
 *
 * Everything returned from this module is already normalised to NAIRA so the
 * UI never has to think about kobo again.
 */

export type AgentFinanceProperty = {
  id: string;
  title: string;
  address: string | null;
  area: string | null;
  state: string | null;
};

export type AgentFinanceTransaction = {
  id: string;
  reference: string | null;
  type: string;
  status: string;
  description: string | null;
  amount: number; // naira
  platformFee: number; // naira
  agentCommission: number; // naira
  payeeAmount: number | null; // naira
  agentCommissionStatus: string | null;
  paidAt: string | null;
  createdAt: string;
  listingTitle: string | null;
  payerName: string | null;
  payeeName: string | null;
};

export type AgentFinanceWalletTransaction = {
  id: string;
  reference: string | null;
  type: string;
  status: string;
  amount: number; // naira
  fee: number; // naira
  channel: string | null;
  providerRef: string | null;
  description: string | null;
  openingBalance: number; // naira
  closingBalance: number; // naira
  createdAt: string;
};

export type AgentFinanceAgreement = {
  id: string;
  type: string;
  status: string;
  rentAmount: number; // naira
  serviceCharge: number; // naira
  cautionDeposit: number; // naira
  createdAt: string;
  listingTitle: string | null;
  listingId: string | null;
  landlordName: string | null;
  tenantName: string | null;
  tenantEmail: string | null;
};

export type AgentFinanceInvoice = {
  id: string;
  invoiceNumber: string;
  type: string;
  status: string;
  amount: number; // naira
  dueDate: string;
  paidAt: string | null;
  createdAt: string;
  notes: string | null;
  pdfUrl: string | null;
  tenantName: string | null;
  landlordName: string | null;
  listingTitle: string | null;
};

export type AgentFinancePropertyCollection = {
  property: AgentFinanceProperty;
  agreementCount: number;
  unitCount: number;
  occupiedUnitCount: number;
  expectedRent: number; // naira, sum of rentAmount across the agent's agreements
  collectedRent: number; // naira, sum of released transaction amounts for those agreements
  tenantNames: string[];
  arrearCount: number;
  arrearAmount: number; // naira
  lastCollectionAt: string | null;
};

export type AgentFinanceSummary = {
  walletBalance: number; // naira
  walletLocked: boolean;
  totalInflows: number; // naira
  totalOutflows: number; // naira
  pendingEscrow: number; // naira
  escrowCount: number;
  settledCount: number;
  totalVolume: number; // naira
  transactionCount: number;
  walletTransactionCount: number;
  commissionEntitled: number; // naira
  commissionReleased: number; // naira
  commissionHeld: number; // naira
  commissionCount: number;
  invoiceTotal: number; // naira
  invoicePaid: number; // naira
  invoiceOutstanding: number; // naira
  invoiceCount: number;
  agreementCount: number;
  propertyCount: number;
  arrearsTotal: number; // naira
  arrearsCount: number;
};

/** Commission rate applied to released deal consideration (5%). */
export const AGENT_COMMISSION_RATE = 0.05;

function toNaira(value: unknown): number {
  if (value === null || value === undefined) return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** BigInt kobo -> naira. */
function koboToNaira(value: bigint | null | undefined): number {
  if (value === null || value === undefined) return 0;
  return parseKoboToNaira(Number(value));
}

export async function getAgentProperties(agentId: string): Promise<AgentFinanceProperty[]> {
  const listings = await prisma.listing.findMany({
    where: {
      OR: [
        { agentId },
        { assignments: { some: { agentId, status: 'active' } } },
      ],
    },
    select: { id: true, title: true, address: true, area: true, state: true },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });
  return listings.map((l) => ({
    id: l.id,
    title: l.title,
    address: l.address ?? null,
    area: l.area ?? null,
    state: l.state ?? null,
  }));
}

export async function getAgentWallet(agentId: string) {
  const wallet = await prisma.wallet.findUnique({ where: { userId: agentId } });
  return {
    id: wallet?.id ?? null,
    balance: toNaira(wallet?.balance),
    isLocked: wallet?.isLocked ?? false,
    lockedReason: wallet?.lockedReason ?? null,
    currency: wallet?.currency ?? 'NGN',
  };
}

export async function getAgentWalletTransactions(
  agentId: string,
  take = 200,
): Promise<AgentFinanceWalletTransaction[]> {
  const wallet = await prisma.wallet.findUnique({
    where: { userId: agentId },
    select: { id: true },
  });
  if (!wallet) return [];

  const rows = await prisma.walletTransaction.findMany({
    where: { walletId: wallet.id },
    orderBy: { createdAt: 'desc' },
    take,
  });

  return rows.map((t) => ({
    id: t.id,
    reference: t.reference ?? null,
    type: t.type,
    status: t.status,
    amount: toNaira(t.amount),
    fee: toNaira(t.fee),
    channel: t.channel ?? null,
    providerRef: t.providerRef ?? null,
    description: t.description ?? null,
    openingBalance: toNaira(t.openingBalance),
    closingBalance: toNaira(t.closingBalance),
    createdAt: t.createdAt.toISOString(),
  }));
}

/**
 * Platform transactions where the agent is the payee (their commission) or
 * where they are the recorded agent. Amounts are kobo in the DB.
 */
export async function getAgentTransactions(
  agentId: string,
  take = 200,
): Promise<AgentFinanceTransaction[]> {
  const rows = await prisma.transaction.findMany({
    where: {
      OR: [{ agentId }, { payeeId: agentId }, { payerId: agentId }],
    },
    include: {
      listing: { select: { title: true } },
      payer: { select: { fullName: true } },
      payee: { select: { fullName: true } },
    },
    orderBy: { createdAt: 'desc' },
    take,
  });

  return rows.map((t) => ({
    id: t.id,
    reference: t.reference ?? null,
    type: t.type,
    status: t.status,
    description: t.description ?? null,
    amount: koboToNaira(t.amount),
    platformFee: koboToNaira(t.platformFee),
    agentCommission: koboToNaira(t.agentCommission),
    payeeAmount: t.payeeAmount === null ? null : koboToNaira(t.payeeAmount),
    agentCommissionStatus: t.agentCommissionStatus ?? null,
    paidAt: t.paidAt ? t.paidAt.toISOString() : null,
    createdAt: t.createdAt.toISOString(),
    listingTitle: t.listing?.title ?? null,
    payerName: t.payer?.fullName ?? null,
    payeeName: t.payee?.fullName ?? null,
  }));
}

export async function getAgentAgreements(
  agentId: string,
  take = 200,
): Promise<AgentFinanceAgreement[]> {
  const rows = await prisma.agreement.findMany({
    where: { agentId },
    include: {
      listing: { select: { id: true, title: true } },
      landlord: { select: { fullName: true } },
      tenant: { select: { fullName: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
    take,
  });

  return rows.map((a) => ({
    id: a.id,
    type: a.type,
    status: a.status,
    rentAmount: toNaira(a.rentAmount),
    serviceCharge: toNaira(a.serviceCharge),
    cautionDeposit: toNaira(a.cautionDeposit),
    createdAt: a.createdAt.toISOString(),
    listingTitle: a.listing?.title ?? null,
    listingId: a.listing?.id ?? null,
    landlordName: a.landlord?.fullName ?? null,
    tenantName: a.tenant?.fullName ?? null,
    tenantEmail: a.tenant?.email ?? null,
  }));
}

export async function getAgentInvoices(
  agentId: string,
  take = 200,
): Promise<AgentFinanceInvoice[]> {
  // An invoice is visible to an agent when they are the landlord on the
  // agreement backing it, or the agent appears on that agreement.
  const agreements = await prisma.agreement.findMany({
    where: { agentId },
    select: { id: true, landlordId: true, tenantId: true, listingId: true },
  });
  const agreementIds = agreements.map((a) => a.id);
  const landlordIds = [...new Set(agreements.map((a) => a.landlordId))];
  const tenantIds = [...new Set(agreements.map((a) => a.tenantId))];
  const listingIds = [...new Set(agreements.map((a) => a.listingId).filter(Boolean) as string[])];

  const where: Record<string, unknown> = {};
  if (agreementIds.length) where.agreementId = { in: agreementIds };
  else if (!landlordIds.length && !tenantIds.length && !listingIds.length) where.id = '__none__';

  const OR: Record<string, unknown>[] = [];
  if (landlordIds.length) OR.push({ landlordId: { in: landlordIds } });
  if (tenantIds.length) OR.push({ tenantId: { in: tenantIds } });
  if (listingIds.length) OR.push({ listingId: { in: listingIds } });
  if (OR.length) where.OR = OR;

  const rows = await prisma.invoice.findMany({
    where,
    include: {
      tenant: { select: { fullName: true } },
      landlord: { select: { fullName: true } },
      listing: { select: { title: true } },
    },
    orderBy: { createdAt: 'desc' },
    take,
  });

  return rows.map((i) => ({
    id: i.id,
    invoiceNumber: i.invoiceNumber,
    type: i.type,
    status: i.status,
    amount: toNaira(i.amount),
    dueDate: i.dueDate.toISOString(),
    paidAt: i.paidAt ? i.paidAt.toISOString() : null,
    createdAt: i.createdAt.toISOString(),
    notes: i.notes ?? null,
    pdfUrl: i.pdfUrl ?? null,
    tenantName: i.tenant?.fullName ?? null,
    landlordName: i.landlord?.fullName ?? null,
    listingTitle: i.listing?.title ?? null,
  }));
}

/**
 * Per-property rent collection view, derived from the agent's agreements and
 * the rent schedules attached to them.
 */
export async function getAgentPropertyCollections(
  agentId: string,
): Promise<AgentFinancePropertyCollection[]> {
  const [properties, agreements, schedules] = await Promise.all([
    getAgentProperties(agentId),
    getAgentAgreements(agentId),
    prisma.rentSchedule.findMany({
      where: { agreement: { agentId } },
      select: {
        id: true,
        amount: true,
        status: true,
        dueDate: true,
        paidAt: true,
        agreementId: true,
        agreement: { select: { listingId: true, listing: { select: { title: true } } } },
      },
      orderBy: { dueDate: 'asc' },
      take: 1000,
    }),
  ]);

  const schedulesByAgreement = new Map<string, typeof schedules>();
  for (const s of schedules) {
    const list = schedulesByAgreement.get(s.agreementId) ?? [];
    list.push(s);
    schedulesByAgreement.set(s.agreementId, list);
  }

  const agreementsByListing = new Map<string, AgentFinanceAgreement[]>();
  for (const a of agreements) {
    if (!a.listingId) continue;
    const list = agreementsByListing.get(a.listingId) ?? [];
    list.push(a);
    agreementsByListing.set(a.listingId, list);
  }

  return properties.map((property) => {
    const propertyAgreements = agreementsByListing.get(property.id) ?? [];
    const propertySchedules = propertyAgreements.flatMap(
      (a) => schedulesByAgreement.get(a.id) ?? [],
    );

    const expectedRent = propertyAgreements.reduce((s, a) => s + a.rentAmount, 0);
    const collectedRent = propertySchedules
      .filter((s) => s.status === 'paid' || s.paidAt)
      .reduce((s, x) => s + toNaira(x.amount), 0);

    const now = Date.now();
    const arrears = propertySchedules.filter((s) => {
      if (s.status === 'paid' || s.paidAt) return false;
      if (s.status === 'overdue') return true;
      return new Date(s.dueDate).getTime() < now;
    });

    const tenantNames = [
      ...new Set(propertyAgreements.map((a) => a.tenantName).filter(Boolean) as string[]),
    ];

    const paidDates = propertySchedules
      .filter((s) => s.paidAt)
      .map((s) => s.paidAt!.toISOString())
      .sort();

    return {
      property,
      agreementCount: propertyAgreements.length,
      unitCount: propertyAgreements.length,
      occupiedUnitCount: propertyAgreements.filter((a) => a.tenantName).length,
      expectedRent,
      collectedRent,
      tenantNames,
      arrearCount: arrears.length,
      arrearAmount: arrears.reduce((s, x) => s + toNaira(x.amount), 0),
      lastCollectionAt: paidDates.length ? paidDates[paidDates.length - 1] : null,
    };
  });
}

/** Aggregate summary used by the KPI rows across the finance screens. */
export async function getAgentFinanceSummary(agentId: string): Promise<AgentFinanceSummary> {
  const [wallet, walletTxns, platformTxns, agreements, invoices, properties] = await Promise.all([
    getAgentWallet(agentId),
    getAgentWalletTransactions(agentId),
    getAgentTransactions(agentId),
    getAgentAgreements(agentId),
    getAgentInvoices(agentId),
    getAgentProperties(agentId),
  ]);

  const inflowTypes = new Set(['deposit', 'escrow_credit', 'refund', 'adjustment']);
  const totalInflows = walletTxns
    .filter((t) => inflowTypes.has(t.type) && t.status === 'success')
    .reduce((s, t) => s + t.amount, 0);
  const totalOutflows = walletTxns
    .filter((t) => (t.type === 'withdrawal' || t.type === 'transfer') && t.status === 'success')
    .reduce((s, t) => s + t.amount, 0);

  const escrowTxns = platformTxns.filter((t) => t.status === 'in_escrow');
  const pendingEscrow = escrowTxns.reduce((s, t) => s + t.amount, 0);
  const settledCount = platformTxns.filter((t) => t.status === 'released').length;
  const totalVolume = platformTxns.reduce((s, t) => s + t.amount, 0);

  // Commission entitlement: 5% of released consideration where the agent is
  // the payee, else the recorded agentCommission field.
  const commissionEntitled = platformTxns
    .filter((t) => t.status === 'released')
    .reduce((s, t) => s + (t.agentCommission > 0 ? t.agentCommission : t.amount * AGENT_COMMISSION_RATE), 0);
  const commissionReleased = platformTxns
    .filter((t) => t.status === 'released' && t.agentCommissionStatus === 'released')
    .reduce((s, t) => s + (t.agentCommission > 0 ? t.agentCommission : t.amount * AGENT_COMMISSION_RATE), 0);
  const commissionHeld = platformTxns
    .filter((t) => t.agentCommissionStatus === 'held' || t.status === 'commission_held')
    .reduce((s, t) => s + (t.agentCommission > 0 ? t.agentCommission : t.amount * AGENT_COMMISSION_RATE), 0);

  const invoiceTotal = invoices.reduce((s, i) => s + i.amount, 0);
  const invoicePaid = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  const invoiceOutstanding = invoices
    .filter((i) => i.status === 'sent' || i.status === 'overdue' || i.status === 'draft')
    .reduce((s, i) => s + i.amount, 0);

  const scheduleRows = await prisma.rentSchedule.findMany({
    where: { agreement: { agentId } },
    select: { amount: true, status: true, dueDate: true, paidAt: true },
  });
  const now = Date.now();
  const arrears = scheduleRows.filter((s) => {
    if (s.status === 'paid' || s.paidAt) return false;
    if (s.status === 'overdue') return true;
    return new Date(s.dueDate).getTime() < now;
  });

  return {
    walletBalance: wallet.balance,
    walletLocked: wallet.isLocked,
    totalInflows,
    totalOutflows,
    pendingEscrow,
    escrowCount: escrowTxns.length,
    settledCount,
    totalVolume,
    transactionCount: platformTxns.length,
    walletTransactionCount: walletTxns.length,
    commissionEntitled,
    commissionReleased,
    commissionHeld,
    commissionCount: platformTxns.filter((t) => t.status === 'released').length,
    invoiceTotal,
    invoicePaid,
    invoiceOutstanding,
    invoiceCount: invoices.length,
    agreementCount: agreements.length,
    propertyCount: properties.length,
    arrearsTotal: arrears.reduce((s, x) => s + toNaira(x.amount), 0),
    arrearsCount: arrears.length,
  };
}
