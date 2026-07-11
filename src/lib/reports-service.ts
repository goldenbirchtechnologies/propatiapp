import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import PDFDocument from 'pdfkit';

// ── Types ────────────────────────────────────────────────────────────────────

export type ReportType = 'pl' | 'balance-sheet' | 'cashflow';

export interface ReportFilters {
  type: ReportType;
  /** ISO start date */
  from: string;
  /** ISO end date */
  to: string;
  /** Optional property / listing filter */
  listingId?: string;
  /** Optional organisation filter for estate managers */
  orgId?: string;
  /** Caller role */
  role: string;
  /** Caller user id */
  userId: string;
}

export interface ReportLine {
  label: string;
  category: string;
  amount: number; // Naira (whole number)
  date: string;
  reference: string;
  status: string;
}

export interface ReportSummary {
  type: ReportType;
  periodFrom: string;
  periodTo: string;
  generatedAt: string;
  totals: Record<string, number>;
  lines: ReportLine[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function toNaira(kobo: bigint | number | null | undefined): number {
  if (kobo == null) return 0;
  return Number(kobo) / 100;
}

function fmt(n: number): string {
  return n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Compute the requested report from the database. No schema changes required.
 */
export async function getReportData(filters: ReportFilters): Promise<ReportSummary> {
  const { type, from, to, listingId, orgId, role, userId } = filters;

  const fromDate = new Date(from);
  const toDate = new Date(to);
  toDate.setHours(23, 59, 59, 999);

  // Build scoped where clauses
  const listingWhere: Prisma.ListingWhereInput = {};
  const txnWhere: Prisma.TransactionWhereInput = {};

  if (role === 'landlord') {
    listingWhere.ownerId = userId;
  } else if (role === 'estate_manager') {
    // Org memberships: find orgs managed by this user
    const orgs = await prisma.organisation.findMany({
      where: {
        OR: [
          { ownerId: userId },
          {
            members: {
              some: { userId, status: 'active', role: 'manager' },
            },
          },
        ],
        ...(orgId ? { id: orgId } : {}),
      },
      select: { id: true },
    });
    const orgIds = orgs.map((o) => o.id);
    listingWhere.organisationListings = { some: { orgId: { in: orgIds } } };
  }
  // admin → no restriction

  if (listingId) listingWhere.id = listingId;

  // Find listing IDs matching scope
  const scopedListings = await prisma.listing.findMany({
    where: listingWhere,
    select: { id: true },
  });
  const scopedListingIds = scopedListings.map((l) => l.id);

  txnWhere.OR = [
    { listingId: { in: scopedListingIds } },
    { payerId: role === 'admin' ? undefined : userId },
  ].filter(Boolean) as Prisma.TransactionWhereInput['OR'];

  txnWhere.createdAt = { gte: fromDate, lte: toDate };

  // ── Fetch Transactions ────────────────────────────────────────────────────
  const transactions = await prisma.transaction.findMany({
    where: txnWhere,
    include: {
      listing: { select: { id: true, title: true, area: true } },
      serviceCharges: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  // ── Fetch Service Charges for scoped listings within window ───────────────
  const serviceCharges = scopedListingIds.length
    ? await prisma.serviceCharge.findMany({
        where: {
          listingId: { in: scopedListingIds },
          dueDate: { gte: fromDate, lte: toDate },
        },
        include: { listing: { select: { title: true } } },
      })
    : [];

  // ── Fetch Rent Schedules for agreements on scoped listings within window
  const agreementsOnListings = await prisma.agreement.findMany({
    where: { listingId: { in: scopedListingIds } },
    select: { id: true },
  });
  const rentSchedules = agreementsOnListings.length
    ? await prisma.rentSchedule.findMany({
        where: {
          agreementId: { in: agreementsOnListings.map((a) => a.id) },
          dueDate: { gte: from, lte: to },
        },
        include: { agreement: { include: { listing: { select: { title: true } } } } },
      })
    : [];

  // ── Fetch Subscription income (e.g. platform subscriptions linked to user)
  const subscriptions = role === 'admin'
    ? await prisma.userSubscription.findMany({
        where: { currentPeriodStart: { lte: toDate }, currentPeriodEnd: { gte: fromDate } },
        include: { plan: true, user: { select: { fullName: true, email: true } } },
      })
    : await prisma.userSubscription.findMany({
        where: {
          userId,
          currentPeriodStart: { lte: toDate },
          currentPeriodEnd: { gte: fromDate },
        },
        include: { plan: true },
      });

  // ── Build Lines & Totals based on report type ─────────────────────────────
  const lines: ReportLine[] = [];
  const totals: Record<string, number> = {};

  // Common mappers
  const statusMap: Record<string, string> = {
    released: 'Cleared',
    paid: 'Paid',
    completed: 'Completed',
    pending: 'Pending',
    in_escrow: 'In Escrow',
    refunded: 'Refunded',
    failed: 'Failed',
    paid: 'Paid',
    overdue: 'Overdue',
    draft: 'Draft',
  };

  if (type === 'pl' || type === 'cashflow') {
    // Revenue lines
    for (const txn of transactions) {
      const ref = txn.reference || txn.id;
      const amt = toNaira(txn.amount);
      const cat = txn.type.toUpperCase(); // RENT, CAUTION, SALE, SHORT_LET, SUBSCRIPTION
      const lName = txn.listing?.title || '—';
      const dt = txn.createdAt.toISOString().slice(0, 10);

      if (type === 'pl') {
        // Income
        lines.push({ label: `${lName} · ${cat}`, category: 'Income', amount: amt, date: dt, reference: ref, status: statusMap[txn.status] || txn.status });
        totals['Total Income'] = (totals['Total Income'] || 0) + amt;
        // Expenses
        const fees = toNaira(txn.platformFee);
        if (fees > 0) {
          lines.push({ label: `Platform fee · ${lName}`, category: 'Expense', amount: fees, date: dt, reference: ref, status: statusMap[txn.status] || txn.status });
          totals['Total Expenses'] = (totals['Total Expenses'] || 0) + fees;
        }
        const comm = toNaira(txn.agentCommission);
        if (comm > 0) {
          lines.push({ label: `Agent commission · ${lName}`, category: 'Expense', amount: comm, date: dt, reference: ref, status: statusMap[txn.status] || txn.status });
          totals['Total Expenses'] = (totals['Total Expenses'] || 0) + comm;
        }
      } else {
        // cashflow: all positive are inflows, negative (fees) are outflows
        lines.push({ label: `${lName} · ${cat}`, category: 'Inflow', amount: amt, date: dt, reference: ref, status: statusMap[txn.status] || txn.status });
        totals['Net Cash In'] = (totals['Net Cash In'] || 0) + amt;
      }
    }

    // Service charges as income for estate-manager context
    for (const sc of serviceCharges) {
      const amt = Number(sc.amount);
      const dt = sc.dueDate.toISOString().slice(0, 10);
      lines.push({ label: `Service charge · ${sc.listing.title}`, category: 'Income · Service Charge', amount: amt, date: dt, reference: sc.id, status: statusMap[sc.status] || sc.status });
      if (type === 'pl') totals['Total Income'] = (totals['Total Income'] || 0) + amt;
      else totals['Net Cash In'] = (totals['Net Cash In'] || 0) + amt;
    }

    // Subscriptions
    for (const sub of subscriptions) {
      const amt = toNaira(sub.plan.priceMonthly);
      const dt = sub.currentPeriodStart.toISOString().slice(0, 10);
      lines.push({ label: `Subscription · ${sub.plan.name}`, category: 'Income · Subscription', amount: amt, date: dt, reference: sub.id, status: sub.status });
      if (type === 'pl') totals['Total Income'] = (totals['Total Income'] || 0) + amt;
      else totals['Net Cash In'] = (totals['Net Cash In'] || 0) + amt;
    }

    if (type === 'pl') {
      totals['Net Profit'] = (totals['Total Income'] || 0) - (totals['Total Expenses'] || 0);
    } else {
      totals['Net Cash Flow'] = totals['Net Cash In'] || 0;
    }
  }

  if (type === 'balance-sheet') {
    const income = transactions.reduce((s, t) => s + toNaira(t.amount), 0);
    const fees = transactions.reduce((s, t) => s + toNaira(t.platformFee), 0);
    const comm = transactions.reduce((s, t) => s + toNaira(t.agentCommission), 0);
    const caution = transactions
      .filter((t) => t.type === 'caution' && t.status !== 'refunded')
      .reduce((s, t) => s + toNaira(t.amount), 0);
    const scTotal = serviceCharges.reduce((s, sc) => s + Number(sc.amount), 0);

    totals['Total Assets'] = income + caution + scTotal;
    totals['Total Liabilities'] = fees + comm;
    totals['Net Equity'] = totals['Total Assets'] - totals['Total Liabilities'];

    lines.push(
      { label: 'Rent & transaction income (period)', category: 'Assets · Current', amount: income, date: from, reference: '', status: 'Cleared' },
      { label: 'Security deposits held', category: 'Assets · Current', amount: caution, date: to, reference: '', status: 'Held' },
      { label: 'Service charges billed', category: 'Assets · Receivable', amount: scTotal, date: from, reference: '', status: 'Billed' },
      { label: 'Platform fees', category: 'Liabilities · Payable', amount: fees, date: from, reference: '', status: 'Payable' },
      { label: 'Agent commissions', category: 'Liabilities · Payable', amount: comm, date: from, reference: '', status: 'Payable' },
      { label: 'Owner\'s equity (period net)', category: 'Equity', amount: totals['Net Equity'], date: from, reference: '', status: '' },
    );
  }

  return {
    type,
    periodFrom: from,
    periodTo: to,
    generatedAt: new Date().toISOString(),
    totals,
    lines,
  };
}

// ── CSV Export ───────────────────────────────────────────────────────────────

export function buildCSV(report: ReportSummary): string {
  const header = 'Property / Description,Category,Amount (₦),Date,Reference,Status\n';
  const body = report.lines
    .map(
      (l) =>
        `"${l.label.replace(/"/g, '""')}",${l.category},${l.amount.toFixed(2)},${l.date},"${l.reference}",${l.status}`
    )
    .join('\n');

  const totalsBlock = report.lines.length
    ? `\n\nTOTALS\n` +
      Object.entries(report.totals)
        .map(([k, v]) => `"${k}",,,${v.toFixed(2)},,`)
        .join('\n')
    : '';

  return header + body + totalsBlock;
}

// ── PDF Export ───────────────────────────────────────────────────────────────

export function buildPDFBuffer(report: ReportSummary): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('error', reject);

    const titleMap: Record<ReportType, string> = {
      'pl': 'Profit & Loss Statement',
      'balance-sheet': 'Balance Sheet',
      cashflow: 'Cash Flow Statement',
    };

    // ── Header ──────────────────────────────────────────────────────────────
    doc.fontSize(20).text(titleMap[report.type] || report.type, { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor('#555555');
    doc.text(`Period: ${report.periodFrom} — ${report.periodTo}`, { align: 'center' });
    doc.text(`Generated: ${new Date(report.generatedAt).toLocaleString('en-NG')}`, { align: 'center' });
    doc.moveDown(1);
    doc.fillColor('#000000');

    // ── Summary Row ─────────────────────────────────────────────────────────
    doc.fontSize(13).text('Summary', { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(11);
    for (const [k, v] of Object.entries(report.totals)) {
      doc.text(`${k}: ₦${fmt(v)}`);
    }
    doc.moveDown(1);

    // ── Detail Lines ────────────────────────────────────────────────────────
    doc.fontSize(13).text('Details', { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(10);

    // Table header
    doc.font('Helvetica-Bold');
    doc.text('Property / Description', { continued: false, width: 220 });
    doc.text('Category', { continued: false, width: 140 });
    doc.text('Amount (₦)', { continued: false, width: 90, align: 'right' });
    doc.text('Date', { continued: false, width: 70 });
    doc.text('Status', { continued: true, width: 80 });
    doc.moveDown(0.2);

    // separators
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#dddddd').lineWidth(0.5).stroke();
    doc.moveDown(0.2);

    doc.font('Helvetica');

    for (const l of report.lines) {
      const lineHeight = 14;
      // First row of line
      doc.text(l.label, { width: 220, continued: false });
      doc.text(l.category, { width: 140, continued: false });
      doc.text(`₦${fmt(l.amount)}`, { width: 90, continued: false, align: 'right' });
      doc.text(l.date, { width: 70, continued: false });
      doc.text(l.status, { width: 80, continued: true });
      doc.moveDown(0.15);

      // Page break guard
      if (doc.y > 750) doc.addPage();
    }

    // Totals row in table
    if (report.lines.length) {
      doc.moveDown(0.3);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#aaaaaa').lineWidth(0.5).stroke();
      doc.moveDown(0.3);
      doc.font('Helvetica-Bold');
      for (const [k, v] of Object.entries(report.totals)) {
        doc.text(`${k}: ₦${fmt(v)}`, { align: 'right' });
      }
    }

    // ── Footer ──────────────────────────────────────────────────────────────
    doc.moveDown(1);
    doc.fontSize(9).fillColor('#888888');
    doc.text(
      'This report was auto-generated by PROPATI and is intended for accounting purposes only.',
      { align: 'center' }
    );
    doc.end();

    doc.on('end', () => resolve(Buffer.concat(chunks)));
  });
}
