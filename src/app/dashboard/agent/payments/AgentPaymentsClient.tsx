'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Wallet,
  TrendingUp,
  ArrowDownToLine,
  ArrowUpFromLine,
  Hourglass,
  Shield,
  Receipt,
  Download,
  ChevronRight,
  Building2,
  Calendar,
  SlidersHorizontal,
  Search,
  Clock,
  CheckCircle2,
  Lock,
  History,
  ArrowRight,
  FileText,
  RefreshCw,
} from 'lucide-react';
import {
  FinancePage,
  FinanceHeader,
  FinanceStatCard,
  FinanceProgress,
  FinanceStatus,
  FinanceFilterBar,
  FinanceSearch,
  FinanceSelect,
  FinanceTabs,
  FinanceTableWrap,
  FinanceTableHead,
  FinanceTh,
  FinanceTd,
  FinanceTableRow,
  FinanceEmptyState,
  FinanceComplianceBanner,
  FinancePagination,
  FinanceButton,
  AGENT_FINANCE_LABEL,
  naira,
  nairaShort,
  formatDateTime,
  type FinanceStatusTone,
} from '@/components/financials/agent/AgentFinanceUI';
import type {
  AgentFinanceSummary,
  AgentFinanceTransaction,
  AgentFinanceWalletTransaction,
} from '@/lib/agent-finance-data';

const PAGE_SIZE = 25;

type Props = {
  summary: AgentFinanceSummary;
  platformTxns: AgentFinanceTransaction[];
  walletTxns: AgentFinanceWalletTransaction[];
  properties: Array<{ id: string; title: string }>;
};

type TabKey = 'all' | 'inflow' | 'escrow' | 'outflow';

const STATUS_TONE: Record<string, FinanceStatusTone> = {
  released: 'success',
  success: 'success',
  settled: 'success',
  in_escrow: 'escrow',
  escrow_credit: 'escrow',
  commission_held: 'escrow',
  pending: 'pending',
  draft: 'pending',
  sent: 'pending',
  failed: 'error',
  refunded: 'neutral',
  reversed: 'neutral',
  cancelled: 'neutral',
  overdue: 'error',
};

const STATUS_LABEL: Record<string, string> = {
  released: 'Cleared & Settled',
  success: 'Cleared & Settled',
  settled: 'Cleared & Settled',
  in_escrow: 'In Escrow Vault',
  escrow_credit: 'In Escrow Vault',
  commission_held: 'Commission Held',
  pending: 'Pending Confirmation',
  draft: 'Draft',
  sent: 'Sent',
  failed: 'Failed',
  refunded: 'Refunded',
  reversed: 'Reversed',
  cancelled: 'Cancelled',
  overdue: 'Overdue',
};

const CHANNEL_LABEL: Record<string, string> = {
  deposit: 'Wallet Deposit',
  withdrawal: 'Wallet Withdrawal',
  transfer: 'Wallet Transfer',
  refund: 'Refund',
  adjustment: 'Escrow Adjustment',
  escrow_credit: 'Escrow Credit',
};

function tabOf(tx: AgentFinanceTransaction | AgentFinanceWalletTransaction): TabKey {
  const t = tx as AgentFinanceWalletTransaction;
  if ('openingBalance' in tx) {
    if (t.type === 'withdrawal' || t.type === 'transfer') return 'outflow';
    return 'inflow';
  }
  const p = tx as AgentFinanceTransaction;
  if (p.status === 'in_escrow' || p.status === 'commission_held') return 'escrow';
  if (p.status === 'failed' || p.status === 'refunded') return 'outflow';
  return 'inflow';
}

export default function AgentPaymentsClient({ summary, platformTxns, walletTxns, properties }: Props) {
  const [tab, setTab] = useState<TabKey>('all');
  const [query, setQuery] = useState('');
  const [propertyId, setPropertyId] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  // Unified ledger: platform transactions first (real Payment records), then
  // wallet movements. Both are already normalised to naira.
  const ledger = useMemo(() => {
    const rows: Array<{
      key: string;
      kind: 'platform' | 'wallet';
      reference: string;
      createdAt: string;
      description: string;
      property: string | null;
      counterparty: string | null;
      type: string;
      status: string;
      amount: number;
      channel: string;
      note: string | null;
      source: AgentFinanceTransaction | AgentFinanceWalletTransaction;
    }> = [];

    for (const t of platformTxns) {
      rows.push({
        key: `p-${t.id}`,
        kind: 'platform',
        reference: t.reference ?? t.id.slice(0, 12).toUpperCase(),
        createdAt: t.paidAt ?? t.createdAt,
        description:
          t.description ??
          (t.type === 'rent'
            ? 'Rent inflow'
            : t.type === 'caution'
              ? 'Caution deposit'
              : t.type === 'sale'
                ? 'Sale consideration'
                : t.type === 'short_let'
                  ? 'Short-let booking'
                  : 'Subscription payment'),
        property: t.listingTitle,
        counterparty: t.payerName ?? t.payeeName,
        type: t.type,
        status: t.status,
        amount: t.amount,
        channel: t.payeeAmount !== null ? 'Paystack escrow split' : 'Paystack direct',
        note:
          t.agentCommission > 0 ? `Commission ${nairaShort(t.agentCommission)}` : null,
        source: t,
      });
    }

    for (const t of walletTxns) {
      rows.push({
        key: `w-${t.id}`,
        kind: 'wallet',
        reference: t.reference ?? t.id.slice(0, 12).toUpperCase(),
        createdAt: t.createdAt,
        description: t.description ?? CHANNEL_LABEL[t.type] ?? t.type,
        property: null,
        counterparty: null,
        type: t.type,
        status: t.status,
        amount: t.amount,
        channel: t.channel ?? 'paystack',
        note: t.fee > 0 ? `Fee ${nairaShort(t.fee)}` : null,
        source: t,
      });
    }

    return rows.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [platformTxns, walletTxns]);

  const counts = useMemo(() => {
    const c = { all: ledger.length, inflow: 0, escrow: 0, outflow: 0 };
    for (const row of ledger) c[tabOf(row.source)] += 1;
    return c;
  }, [ledger]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ledger.filter((row) => {
      if (tab !== 'all' && tabOf(row.source) !== tab) return false;
      if (typeFilter !== 'all' && row.type !== typeFilter) return false;
      if (statusFilter !== 'all' && row.status !== statusFilter) return false;
      if (propertyId !== 'all') {
        const platform = row.source as AgentFinanceTransaction;
        if (row.kind !== 'platform') return false;
        const match =
          platform.listingTitle &&
          properties.some((p) => p.id === propertyId && p.title === platform.listingTitle);
        if (!match) return false;
      }
      if (!q) return true;
      return (
        row.reference.toLowerCase().includes(q) ||
        row.description.toLowerCase().includes(q) ||
        (row.property?.toLowerCase().includes(q) ?? false) ||
        (row.counterparty?.toLowerCase().includes(q) ?? false) ||
        row.channel.toLowerCase().includes(q)
      );
    });
  }, [ledger, tab, typeFilter, statusFilter, propertyId, query, properties]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const filteredVolume = filtered.reduce((s, r) => s + r.amount, 0);
  const clearedCount = filtered.filter((r) => r.status === 'released' || r.status === 'success').length;
  const clearedVolume = filtered
    .filter((r) => r.status === 'released' || r.status === 'success')
    .reduce((s, r) => s + r.amount, 0);
  const escrowVolume = filtered
    .filter((r) => r.status === 'in_escrow' || r.status === 'escrow_credit')
    .reduce((s, r) => s + r.amount, 0);
  const clearedPct = filteredVolume > 0 ? (clearedVolume / filteredVolume) * 100 : 0;

  const resetFilters = () => {
    setTab('all');
    setQuery('');
    setPropertyId('all');
    setTypeFilter('all');
    setStatusFilter('all');
    setPage(1);
  };

  const exportCsv = () => {
    const header = ['Reference', 'Date', 'Description', 'Property', 'Counterparty', 'Type', 'Status', 'Channel', 'Amount (NGN)'];
    const body = filtered.map((r) => [
      r.reference,
      r.createdAt,
      r.description,
      r.property ?? '',
      r.counterparty ?? '',
      r.type,
      r.status,
      r.channel,
      r.amount.toFixed(2),
    ]);
    const csv = [header, ...body]
      .map((cols) => cols.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent-payments-ledger-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <FinancePage>
      <FinanceHeader
        breadcrumb={['Agent Portal', 'Finance', 'Rent & Payments Ledger']}
        title="Payments & Financial Records Hub"
        description="Live trust wallet balances, escrow clearing, disbursements and a strict transaction ledger for every mandate under your agency."
        badges={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 dark:border-white/[0.08] bg-zinc-100 dark:bg-white/[0.06] px-2.5 py-1 text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            Live ledger sync
          </span>
        }
        actions={
          <>
            <FinanceButton onClick={exportCsv}>
              <Download className="h-3.5 w-3.5" /> Export Audit (CSV/PDF)
            </FinanceButton>
            <FinanceButton variant="primary" onClick={() => setTab('all')}>
              <Receipt className="h-3.5 w-3.5" /> Record Payment
            </FinanceButton>
          </>
        }
      />

      {/* Bento KPI grid — all figures derived from the live ledger */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <FinanceStatCard
          label="Agent Trust Wallet Balance"
          value={naira(summary.walletBalance)}
          hint={summary.walletLocked ? 'Wallet is locked' : 'Available for settlement'}
          tone="primary"
          icon={<Wallet className="h-4 w-4" />}
          footer={
            <div className="flex items-center justify-between border-t border-zinc-200 dark:border-white/[0.08] pt-3">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {summary.walletLocked ? 'Locked' : 'Ready for settlement'}
              </span>
              <Link
                href="/dashboard/agent/withdrawals"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Withdraw Funds <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          }
        />

        <FinanceStatCard
          label="Total Managed Inflows"
          value={naira(summary.totalInflows)}
          hint={`${counts.inflow} ledger entries · ${summary.transactionCount} payment records`}
          tone="primary"
          icon={<TrendingUp className="h-4 w-4" />}
          footer={
            <div className="flex items-center justify-between border-t border-zinc-200 dark:border-white/[0.08] pt-3 text-[11px] text-zinc-500 dark:text-zinc-400">
              <span>{summary.settledCount} settled transactions</span>
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                {summary.propertyCount} properties
              </span>
            </div>
          }
        />

        <FinanceStatCard
          label="Pending Escrow Clearing"
          value={naira(summary.pendingEscrow)}
          hint={`${summary.escrowCount} item${summary.escrowCount === 1 ? '' : 's'} in the escrow queue`}
          tone="amber"
          icon={<Hourglass className="h-4 w-4" />}
          footer={
            <div className="flex items-center justify-between border-t border-zinc-200 dark:border-white/[0.08] pt-3">
              <FinanceStatus tone="pending">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> In Escrow Queue
              </FinanceStatus>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">T+2 Settlement</span>
            </div>
          }
        />

        <FinanceStatCard
          label="Disbursed to Beneficiaries"
          value={naira(summary.totalOutflows)}
          hint="Net of platform and agency deductions"
          tone="primary"
          icon={<ArrowUpFromLine className="h-4 w-4" />}
          footer={
            <div className="flex items-center justify-between border-t border-zinc-200 dark:border-white/[0.08] pt-3">
              <FinanceStatus tone="success">
                <CheckCircle2 className="h-3 w-3" /> Reconciled
              </FinanceStatus>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {summary.agreementCount} mandates
              </span>
            </div>
          }
        />
      </div>

      {/* Custody / compliance banner */}
      <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-zinc-800/50 p-4 lg:flex-row">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">
              Institutional custody settlement guaranteed
            </p>
            <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">
              All trust collections are held under statutory escrow with partner banks. Counterparty validations
              reconcile directly against the Corporate Affairs Commission database.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className={AGENT_FINANCE_LABEL}>Settlement Bank Partner</div>
            <div className="text-sm font-semibold text-zinc-900 dark:text-white">Paystack / NIBSS Instant</div>
          </div>
          <div className="h-8 w-px bg-zinc-200 dark:bg-white/[0.08]" />
          <div className="text-right">
            <div className={AGENT_FINANCE_LABEL}>Net Velocity</div>
            <div className="text-sm font-semibold text-zinc-900 dark:text-white">
              {summary.walletTransactionCount} wallet movements
            </div>
          </div>
        </div>
      </div>

      {/* Filter console */}
      <FinanceFilterBar className="space-y-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <FinanceTabs
            active={tab}
            onChange={(v) => {
              setTab(v as TabKey);
              setPage(1);
            }}
            tabs={[
              { value: 'all', label: 'All Transactions', count: counts.all },
              { value: 'inflow', label: 'Rent Inflows', count: counts.inflow },
              { value: 'escrow', label: 'Deposits & Escrow', count: counts.escrow },
              { value: 'outflow', label: 'Disbursements', count: counts.outflow },
            ]}
          />

          <div className="flex flex-wrap items-center gap-2">
            <FinanceSearch
              value={query}
              onChange={(v) => {
                setQuery(v);
                setPage(1);
              }}
              placeholder="Search reference, property, tenant or channel..."
            />
            <FinanceSelect
              ariaLabel="Filter by property"
              value={propertyId}
              onChange={(v) => {
                setPropertyId(v);
                setPage(1);
              }}
              options={[
                { value: 'all', label: `All Properties (${properties.length})` },
                ...properties.map((p) => ({ value: p.id, label: p.title })),
              ]}
              className="min-w-[180px]"
            />
            <FinanceSelect
              ariaLabel="Filter by type"
              value={typeFilter}
              onChange={(v) => {
                setTypeFilter(v);
                setPage(1);
              }}
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'rent', label: 'Rent Inflow' },
                { value: 'caution', label: 'Caution Deposit' },
                { value: 'sale', label: 'Sale Consideration' },
                { value: 'short_let', label: 'Short-let Booking' },
                { value: 'deposit', label: 'Wallet Deposit' },
                { value: 'withdrawal', label: 'Wallet Withdrawal' },
                { value: 'adjustment', label: 'Escrow Adjustment' },
                { value: 'escrow_credit', label: 'Escrow Credit' },
              ]}
              className="min-w-[170px]"
            />
            <FinanceSelect
              ariaLabel="Filter by status"
              value={statusFilter}
              onChange={(v) => {
                setStatusFilter(v);
                setPage(1);
              }}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'released', label: 'Cleared & Settled' },
                { value: 'success', label: 'Success' },
                { value: 'in_escrow', label: 'In Escrow' },
                { value: 'commission_held', label: 'Commission Held' },
                { value: 'pending', label: 'Pending' },
                { value: 'failed', label: 'Failed' },
                { value: 'refunded', label: 'Refunded' },
              ]}
              className="min-w-[160px]"
            />
            <FinanceButton variant="ghost" onClick={resetFilters} title="Reset filters">
              <RefreshCw className="h-3.5 w-3.5" />
            </FinanceButton>
          </div>
        </div>

        {/* Filtered metric strip */}
        <div className="grid grid-cols-1 gap-3 border-t border-zinc-200 dark:border-white/[0.08] pt-4 sm:grid-cols-3">
          <div>
            <span className={AGENT_FINANCE_LABEL}>Filtered Volume</span>
            <p className="mt-1 font-mono text-lg font-bold text-zinc-900 dark:text-white">
              {naira(filteredVolume)}
            </p>
          </div>
          <div>
            <span className={AGENT_FINANCE_LABEL}>Cleared & Settled</span>
            <div className="mt-1 flex items-center gap-2">
              <FinanceProgress value={clearedPct} />
              <span className="shrink-0 font-mono text-xs font-semibold text-zinc-900 dark:text-white">
                {clearedPct.toFixed(1)}%
              </span>
            </div>
            <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              {clearedCount} of {filtered.length} entries · {naira(clearedVolume)}
            </p>
          </div>
          <div>
            <span className={AGENT_FINANCE_LABEL}>Held in Escrow</span>
            <p className="mt-1 font-mono text-lg font-bold text-amber-600 dark:text-amber-400">
              {naira(escrowVolume)}
            </p>
          </div>
        </div>
      </FinanceFilterBar>

      {/* Ledger table */}
      <FinanceTableWrap>
        {visible.length === 0 ? (
          <FinanceEmptyState
            icon={<Receipt className="h-6 w-6" />}
            title="No ledger entries match your filters"
            description="Adjust the filters above, or record a payment to start building your transaction ledger. Every entry is sourced from live payment and wallet records."
            action={
              <FinanceButton variant="primary" onClick={resetFilters}>
                <RefreshCw className="h-3.5 w-3.5" /> Reset filters
              </FinanceButton>
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <FinanceTableHead>
                  <FinanceTh>Transaction Ref / Date</FinanceTh>
                  <FinanceTh>Property &amp; Counterparty</FinanceTh>
                  <FinanceTh>Category</FinanceTh>
                  <FinanceTh>Payment Channel</FinanceTh>
                  <FinanceTh align="right">Amount (NGN)</FinanceTh>
                  <FinanceTh align="center">Audit Status</FinanceTh>
                  <FinanceTh align="right">Actions</FinanceTh>
                </FinanceTableHead>
                <tbody className="divide-y divide-zinc-100 text-xs dark:divide-white/[0.06]">
                  {visible.map((row) => {
                    const tone = STATUS_TONE[row.status] ?? 'neutral';
                    const isCredit =
                      tabOf(row.source) === 'inflow' || tabOf(row.source) === 'escrow';
                    return (
                      <FinanceTableRow key={row.key}>
                        <FinanceTd>
                          <div className="flex flex-col">
                            <span className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                              #{row.reference}
                            </span>
                            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                              {formatDateTime(row.createdAt)}
                            </span>
                          </div>
                        </FinanceTd>
                        <FinanceTd>
                          <div className="flex max-w-[260px] flex-col">
                            <span className="truncate font-semibold text-zinc-900 dark:text-white">
                              {row.property ?? row.description}
                            </span>
                            <span className="truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                              {row.property ? row.counterparty ?? '—' : row.description}
                            </span>
                          </div>
                        </FinanceTd>
                        <FinanceTd>
                          <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold capitalize text-zinc-700 dark:bg-white/[0.06] dark:text-zinc-300">
                            {row.type.replace(/_/g, ' ')}
                          </span>
                        </FinanceTd>
                        <FinanceTd>
                          <div className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            <span className="font-mono text-[11px] text-zinc-700 dark:text-zinc-300">
                              {row.channel}
                            </span>
                          </div>
                        </FinanceTd>
                        <FinanceTd align="right">
                          <div
                            className={
                              isCredit
                                ? 'font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400'
                                : 'font-mono text-sm font-bold text-zinc-900 dark:text-white'
                            }
                          >
                            {isCredit ? '+' : '−'}
                            {naira(row.amount)}
                          </div>
                          {row.note ? (
                            <div className="text-[11px] text-zinc-500 dark:text-zinc-400">{row.note}</div>
                          ) : null}
                        </FinanceTd>
                        <FinanceTd align="center">
                          <FinanceStatus tone={tone}>
                            {tone === 'success' ? <CheckCircle2 className="h-3 w-3" /> : null}
                            {tone === 'escrow' ? <Lock className="h-3 w-3" /> : null}
                            {tone === 'pending' ? <Clock className="h-3 w-3" /> : null}
                            {STATUS_LABEL[row.status] ?? row.status}
                          </FinanceStatus>
                        </FinanceTd>
                        <FinanceTd align="right">
                          <div className="inline-flex items-center gap-1">
                            <Link
                              href={`/dashboard/agent/receipts?ref=${encodeURIComponent(row.reference)}`}
                              className="rounded p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-white/[0.06] dark:hover:text-white"
                              title="View transaction detail"
                            >
                              <Receipt className="h-4 w-4" />
                            </Link>
                            <button
                              type="button"
                              onClick={exportCsv}
                              className="rounded p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-white/[0.06] dark:hover:text-white"
                              title="Download ledger extract"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        </FinanceTd>
                      </FinanceTableRow>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <FinancePagination
              page={safePage}
              pageCount={pageCount}
              onPage={setPage}
              summary={`Showing ${(safePage - 1) * PAGE_SIZE + 1} to ${Math.min(
                safePage * PAGE_SIZE,
                filtered.length,
              )} of ${filtered.length} ledger entries`}
            />
          </>
        )}
      </FinanceTableWrap>

      {/* Footer compliance banner */}
      <FinanceComplianceBanner
        icon={<Shield className="h-5 w-5" />}
        title="Trust Assurance & Escrow Guarantee"
        body="All rent remittances are processed through multi-signature escrow wallets under Nigerian AML/CFT guidelines. Counterparty CAC validations reconcile directly against the Corporate Affairs Commission database."
        meta={
          <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-[10px] font-medium text-zinc-500 dark:bg-white/[0.06] dark:text-zinc-400">
            <Building2 className="h-3 w-3" /> LASRERA registered agency
          </span>
        }
      />

      {/* Quick links strip */}
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/dashboard/agent/collections"
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/[0.06]"
        >
          <Calendar className="h-3.5 w-3.5" /> Rent Collections <ChevronRight className="h-3 w-3" />
        </Link>
        <Link
          href="/dashboard/agent/commissions"
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/[0.06]"
        >
          <TrendingUp className="h-3.5 w-3.5" /> Commissions <ChevronRight className="h-3 w-3" />
        </Link>
        <Link
          href="/dashboard/agent/withdrawals"
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/[0.06]"
        >
          <ArrowDownToLine className="h-3.5 w-3.5" /> Withdrawals <ChevronRight className="h-3 w-3" />
        </Link>
        <Link
          href="/dashboard/agent/statements"
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/[0.06]"
        >
          <FileText className="h-3.5 w-3.5" /> Statements <ChevronRight className="h-3 w-3" />
        </Link>
        <Link
          href="/dashboard/agent/commission-ledger"
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/[0.06]"
        >
          <History className="h-3.5 w-3.5" /> Commission Ledger <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
    </FinancePage>
  );
}
