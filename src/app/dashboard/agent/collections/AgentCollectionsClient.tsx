'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Wallet,
  Lock,
  ArrowDownLeft,
  ArrowUpRight,
  Landmark,
  Scale,
  Gauge,
  Search,
  Download,
  Receipt,
  Shield,
  Building2,
  ChevronRight,
  FileText,
  Percent,
  ArrowLeftRight,
  RefreshCw,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import {
  FinancePage,
  FinanceHeader,
  FinanceStatCard,
  FinanceStatus,
  FinanceFilterBar,
  FinanceSearch,
  FinanceSelect,
  FinanceTableWrap,
  FinanceTableHead,
  FinanceTh,
  FinanceTd,
  FinanceTableRow,
  FinanceEmptyState,
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

type Row = {
  key: string;
  reference: string;
  createdAt: string;
  counterparty: string | null;
  deal: string | null;
  category: string;
  channel: string;
  status: string;
  amount: number;
  isCredit: boolean;
};

const STATUS_TONE: Record<string, FinanceStatusTone> = {
  released: 'success',
  success: 'success',
  in_escrow: 'escrow',
  escrow_credit: 'escrow',
  commission_held: 'escrow',
  pending: 'pending',
  failed: 'error',
  refunded: 'neutral',
  reversed: 'neutral',
};

const STATUS_LABEL: Record<string, string> = {
  released: 'Cleared & Settled',
  success: 'Cleared & Settled',
  in_escrow: 'In Escrow',
  escrow_credit: 'In Escrow',
  commission_held: 'Commission Held',
  pending: 'Processing',
  failed: 'Failed',
  refunded: 'Refunded',
  reversed: 'Reversed',
};

export default function AgentCollectionsClient({
  summary,
  platformTxns,
  walletTxns,
  properties,
}: Props) {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');
  const [page, setPage] = useState(1);

  const rows = useMemo<Row[]>(() => {
    const out: Row[] = [];
    for (const t of platformTxns) {
      const isCredit = t.status !== 'failed' && t.status !== 'refunded';
      out.push({
        key: `p-${t.id}`,
        reference: t.reference ?? t.id.slice(0, 12).toUpperCase(),
        createdAt: t.paidAt ?? t.createdAt,
        counterparty: t.payerName ?? t.payeeName,
        deal: t.listingTitle,
        category:
          t.type === 'rent'
            ? 'Rent Inflow'
            : t.type === 'caution'
              ? 'Caution Deposit'
              : t.type === 'sale'
                ? 'Sale Consideration'
                : t.type === 'short_let'
                  ? 'Short-let Booking'
                  : 'Subscription',
        channel: t.payeeAmount !== null ? 'Paystack Dedicated VA' : 'Paystack Direct',
        status: t.status,
        amount: t.amount,
        isCredit,
      });
    }
    for (const t of walletTxns) {
      const isCredit = t.type !== 'withdrawal' && t.type !== 'transfer';
      out.push({
        key: `w-${t.id}`,
        reference: t.reference ?? t.id.slice(0, 12).toUpperCase(),
        createdAt: t.createdAt,
        counterparty: null,
        deal: null,
        category:
          t.type === 'deposit'
            ? 'Deposit / Commission Inflow'
            : t.type === 'withdrawal'
              ? 'Wallet Withdrawal'
              : t.type === 'escrow_credit'
                ? 'Escrow Hold / Release'
                : t.type === 'adjustment'
                  ? 'Management Fee / Adjustment'
                  : 'Statutory Remittance',
        channel: t.channel ?? 'paystack',
        status: t.status,
        amount: t.amount,
        isCredit,
      });
    }
    return out.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [platformTxns, walletTxns]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (typeFilter !== 'all' && r.category !== typeFilter) return false;
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (channelFilter !== 'all') {
        const channel = r.channel.toLowerCase();
        if (channelFilter === 'paystack' && !channel.includes('paystack')) return false;
        if (channelFilter === 'nibss' && !channel.includes('nibss')) return false;
        if (channelFilter === 'escrow' && !channel.includes('escrow')) return false;
        if (channelFilter === 'remita' && !channel.includes('remita')) return false;
      }
      if (!q) return true;
      return (
        r.reference.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        (r.counterparty?.toLowerCase().includes(q) ?? false) ||
        (r.deal?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [rows, typeFilter, statusFilter, channelFilter, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const clearedVolume = filtered
    .filter((r) => r.status === 'released' || r.status === 'success')
    .reduce((s, r) => s + r.amount, 0);
  const clearedCount = filtered.filter(
    (r) => r.status === 'released' || r.status === 'success',
  ).length;
  const inflowCount = filtered.filter((r) => r.isCredit).length;

  const exportCsv = () => {
    const header = ['Reference', 'Timestamp', 'Counterparty', 'Deal', 'Category', 'Channel', 'Status', 'Amount (NGN)'];
    const body = filtered.map((r) => [
      r.reference,
      r.createdAt,
      r.counterparty ?? '',
      r.deal ?? '',
      r.category,
      r.channel,
      r.status,
      r.amount.toFixed(2),
    ]);
    const csv = [header, ...body]
      .map((cols) => cols.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent-clearing-ledger-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetFilters = () => {
    setQuery('');
    setTypeFilter('all');
    setStatusFilter('all');
    setChannelFilter('all');
    setPage(1);
  };

  return (
    <FinancePage>
      <FinanceHeader
        breadcrumb={['Finance', 'Rent & Payments', 'Wallet & Financial Clearing']}
        title="Rent & Payments Clearing Hub"
        description="Wallet engine, multi-channel NGN settlement and escrow clearing across every mandate under your agency."
        badges={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--sovereign-hover)] dark:text-[#4edea3]">
            Tier-4 Institutional
          </span>
        }
        actions={
          <>
            <FinanceButton onClick={exportCsv}>
              <Receipt className="h-3.5 w-3.5" /> Download Statement
            </FinanceButton>
            <FinanceButton variant="primary" onClick={exportCsv}>
              <ArrowUpRight className="h-3.5 w-3.5" /> Initiate Payout / Withdrawal
            </FinanceButton>
          </>
        }
      />

      {/* Navigation band */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 p-1.5">
        <Link
          href="/dashboard/agent/payments"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm"
        >
          <Wallet className="h-4 w-4" /> Overview
        </Link>
        <Link
          href="/dashboard/agent/commissions"
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-white/[0.06]"
        >
          <Percent className="h-4 w-4 text-zinc-500" /> Commissions
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-400">
            {nairaShort(summary.commissionEntitled)}
          </span>
        </Link>
        <Link
          href="/dashboard/agent/invoices"
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-white/[0.06]"
        >
          <FileText className="h-4 w-4 text-zinc-500" /> Invoices
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-400">
            {summary.invoiceCount} active
          </span>
        </Link>
        <Link
          href="/dashboard/agent/withdrawals"
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-white/[0.06]"
        >
          <ArrowLeftRight className="h-4 w-4 text-zinc-500" /> Withdrawals
          <span className="rounded-full bg-amber-500/15 px-2 py-0.5 font-mono text-[11px] font-semibold text-amber-700 dark:text-amber-400">
            {summary.escrowCount} in transit
          </span>
        </Link>
      </div>

      {/* KPI bento grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <FinanceStatCard
          label="Total Cleared Wallet Balance"
          value={naira(summary.walletBalance)}
          hint="Available for instant settlement to your linked bank account"
          tone="primary"
          icon={<Wallet className="h-4 w-4" />}
          footer={
            <div className="flex items-center justify-between border-t border-zinc-200 pt-3 dark:border-white/[0.08]">
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {summary.walletLocked ? 'Wallet locked' : 'Auto-sweep: 23:59 WAT'}
              </span>
              <Link
                href="/dashboard/agent/withdrawals"
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary dark:text-[#4edea3] hover:underline"
              >
                Withdraw Funds <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          }
        />

        <FinanceStatCard
          label="Pending Escrow & Commissions"
          value={naira(summary.pendingEscrow + summary.commissionHeld)}
          hint={`Locked across ${summary.escrowCount} deal${summary.escrowCount === 1 ? '' : 's'} awaiting release`}
          tone="amber"
          icon={<Lock className="h-4 w-4" />}
          footer={
            <div className="flex items-center justify-between border-t border-zinc-200 pt-3 dark:border-white/[0.08]">
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Commission held</span>
              <span className="font-mono text-xs font-semibold text-zinc-900 dark:text-white">
                {nairaShort(summary.commissionHeld)}
              </span>
            </div>
          }
        />

        <FinanceStatCard
          label="Total Inflows / Deposits"
          value={String(inflowCount)}
          hint={`${naira(summary.totalInflows)} across ${summary.transactionCount} payment records`}
          tone="primary"
          icon={<ArrowDownLeft className="h-4 w-4" />}
          footer={
            <div className="flex items-center justify-between border-t border-zinc-200 pt-3 dark:border-white/[0.08]">
              <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-400">
                Paystack &amp; NIBSS Instant
              </span>
              <Shield className="h-4 w-4 text-primary dark:text-[#4edea3]" />
            </div>
          }
        />

        <FinanceStatCard
          label="Completed Withdrawals"
          value={String(summary.walletTransactionCount - summary.escrowCount)}
          hint={`${naira(summary.totalOutflows)} disbursed`}
          tone="primary"
          icon={<ArrowUpRight className="h-4 w-4" />}
          footer={
            <div className="flex items-center justify-between border-t border-zinc-200 pt-3 dark:border-white/[0.08]">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-[var(--sovereign-hover)] dark:text-[#4edea3]">
                Settled to date
              </span>
              <Clock className="h-4 w-4 text-zinc-500" />
            </div>
          }
        />
      </div>

      {/* Settlement & channel authority strip */}
      <div className="grid grid-cols-1 divide-y divide-zinc-200 rounded-xl border border-zinc-200 dark:divide-white/[0.08] dark:border-white/[0.08] bg-white dark:bg-zinc-900 lg:grid-cols-3 lg:divide-y-0">
        <div className="flex items-center gap-3.5 p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-primary dark:bg-white/[0.06] dark:text-[#4edea3]">
            <Landmark className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className={AGENT_FINANCE_LABEL}>Linked Settlement Destination</span>
            <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
              {summary.walletBalance > 0 ? 'Trust wallet cleared balance' : 'No linked destination yet'}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {summary.walletLocked ? 'Wallet currently locked' : 'Auto-sweep enabled at 23:59 WAT'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3.5 p-5 lg:border-x lg:border-zinc-200 dark:lg:border-white/[0.08]">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-primary dark:bg-white/[0.06] dark:text-[#4edea3]">
            <Scale className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className={AGENT_FINANCE_LABEL}>Escrow Custody Partner</span>
            <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
              Stanbic IBTC Trustees &amp; Zenith Escrow
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Segregated legal trustee escrow for all managed assets
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3.5 p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-primary dark:bg-white/[0.06] dark:text-[#4edea3]">
            <Gauge className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className={AGENT_FINANCE_LABEL}>Real-Time RTGS Limit</span>
            <p className="font-mono text-sm font-semibold text-zinc-900 dark:text-white">
              ₦100,000,000.00 / day
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Automated high-value clearing with instant dispatch to NIBSS
            </p>
          </div>
        </div>
      </div>

      {/* Ledger panel */}
      <FinanceTableWrap>
        <div className="space-y-4 border-b border-zinc-200 p-5 dark:border-white/[0.08]">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
                Recent Financial Transactions
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Live ledger mapped from payment records and wallet movements
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-zinc-100 px-2 py-1 font-mono text-[11px] font-medium text-zinc-500 dark:bg-white/[0.06] dark:text-zinc-400">
                {rows.length} total records
              </span>
              <FinanceButton onClick={exportCsv}>
                <Download className="h-3.5 w-3.5" /> Export CSV
              </FinanceButton>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <FinanceSearch
                value={query}
                onChange={(v) => {
                  setQuery(v);
                  setPage(1);
                }}
                placeholder="Search reference, counterparty, property..."
              />
            </div>
            <div className="lg:col-span-3">
              <FinanceSelect
                ariaLabel="Filter by category"
                value={typeFilter}
                onChange={(v) => {
                  setTypeFilter(v);
                  setPage(1);
                }}
                options={[
                  { value: 'all', label: 'All Types' },
                  { value: 'Rent Inflow', label: 'Rent Inflow' },
                  { value: 'Caution Deposit', label: 'Caution Deposit' },
                  { value: 'Sale Consideration', label: 'Sale Consideration' },
                  { value: 'Deposit / Commission Inflow', label: 'Commission Inflow' },
                  { value: 'Wallet Withdrawal', label: 'Wallet Withdrawals' },
                  { value: 'Escrow Hold / Release', label: 'Escrow Hold / Release' },
                  { value: 'Management Fee / Adjustment', label: 'Management Fees' },
                ]}
                className="w-full"
              />
            </div>
            <div className="lg:col-span-2">
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
                  { value: 'success', label: 'Cleared & Settled' },
                  { value: 'in_escrow', label: 'In Escrow' },
                  { value: 'pending', label: 'Processing' },
                  { value: 'failed', label: 'Failed' },
                ]}
                className="w-full"
              />
            </div>
            <div className="lg:col-span-2">
              <FinanceSelect
                ariaLabel="Filter by channel"
                value={channelFilter}
                onChange={(v) => {
                  setChannelFilter(v);
                  setPage(1);
                }}
                options={[
                  { value: 'all', label: 'All Channels' },
                  { value: 'paystack', label: 'Paystack Virtual Acct' },
                  { value: 'nibss', label: 'NIBSS Instant Transfer' },
                  { value: 'escrow', label: 'Institutional Escrow' },
                  { value: 'remita', label: 'Remita Tax Gateway' },
                ]}
                className="w-full"
              />
            </div>
            <div className="flex items-center lg:col-span-1">
              <FinanceButton variant="ghost" onClick={resetFilters} className="w-full" title="Reset filters">
                <RefreshCw className="h-3.5 w-3.5" />
              </FinanceButton>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 border-t border-zinc-200 pt-3 text-xs dark:border-white/[0.08]">
            <span className="text-zinc-500 dark:text-zinc-400">
              Filtered volume:{' '}
              <span className="font-mono font-semibold text-zinc-900 dark:text-white">
                {naira(filtered.reduce((s, r) => s + r.amount, 0))}
              </span>
            </span>
            <span className="text-zinc-500 dark:text-zinc-400">
              Cleared:{' '}
              <span className="font-mono font-semibold text-primary dark:text-[#4edea3]">
                {naira(clearedVolume)}
              </span>{' '}
              ({clearedCount})
            </span>
            <span className="ml-auto inline-flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
              <Shield className="h-3.5 w-3.5 text-primary dark:text-[#4edea3]" />
              Syncing live Paystack webhook feed
            </span>
          </div>
        </div>

        {visible.length === 0 ? (
          <FinanceEmptyState
            icon={<ArrowLeftRight className="h-6 w-6" />}
            title="No clearing records found"
            description="No settlement activity matches the current filters. Adjust the filters or reset them to see the full clearing ledger."
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
                  <FinanceTh>Ref &amp; Timestamp</FinanceTh>
                  <FinanceTh>Counterparty &amp; Deal Reference</FinanceTh>
                  <FinanceTh>Category / Type</FinanceTh>
                  <FinanceTh>Settlement Channel</FinanceTh>
                  <FinanceTh>Status</FinanceTh>
                  <FinanceTh align="right">Amount (NGN)</FinanceTh>
                  <FinanceTh align="center">Actions</FinanceTh>
                </FinanceTableHead>
                <tbody className="divide-y divide-zinc-100 text-xs dark:divide-white/[0.06]">
                  {visible.map((row) => {
                    const tone = STATUS_TONE[row.status] ?? 'neutral';
                    return (
                      <FinanceTableRow key={row.key}>
                        <FinanceTd>
                          <div className="flex flex-col">
                            <span className="font-mono text-xs font-semibold text-zinc-900 dark:text-white">
                              {row.reference}
                            </span>
                            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                              {formatDateTime(row.createdAt)}
                            </span>
                          </div>
                        </FinanceTd>
                        <FinanceTd>
                          <div className="flex max-w-[280px] flex-col">
                            <span className="font-semibold text-zinc-900 dark:text-white">
                              {row.counterparty ?? 'Internal ledger'}
                            </span>
                            <span className="truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                              {row.deal ?? 'Wallet movement'}
                            </span>
                          </div>
                        </FinanceTd>
                        <FinanceTd>
                          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-[var(--sovereign-hover)] dark:text-[#4edea3]">
                            {row.category}
                          </span>
                        </FinanceTd>
                        <FinanceTd>
                          <div className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-primary" />
                            <span className="font-mono text-[11px] text-zinc-700 dark:text-zinc-300">
                              {row.channel}
                            </span>
                          </div>
                        </FinanceTd>
                        <FinanceTd>
                          <FinanceStatus tone={tone}>
                            {tone === 'success' ? <CheckCircle2 className="h-3 w-3" /> : null}
                            {tone === 'escrow' ? <Lock className="h-3 w-3" /> : null}
                            {tone === 'pending' ? <Clock className="h-3 w-3" /> : null}
                            {STATUS_LABEL[row.status] ?? row.status}
                          </FinanceStatus>
                        </FinanceTd>
                        <FinanceTd align="right">
                          <span
                            className={
                              row.isCredit
                                ? 'font-mono text-sm font-bold text-primary dark:text-[#4edea3]'
                                : 'font-mono text-sm font-bold text-zinc-900 dark:text-white'
                            }
                          >
                            {row.isCredit ? '+' : '−'}
                            {naira(row.amount)}
                          </span>
                        </FinanceTd>
                        <FinanceTd align="center">
                          <div className="inline-flex items-center gap-1">
                            <Link
                              href={`/dashboard/agent/receipts?ref=${encodeURIComponent(row.reference)}`}
                              className="rounded p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-white/[0.06] dark:hover:text-white"
                              title="View transaction voucher"
                            >
                              <Receipt className="h-4 w-4" />
                            </Link>
                            <button
                              type="button"
                              onClick={exportCsv}
                              className="rounded p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-white/[0.06] dark:hover:text-white"
                              title="Download clearing memo"
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
              )} of ${filtered.length} clearing records`}
            />
          </>
        )}
      </FinanceTableWrap>

      {/* Cross-links */}
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/dashboard/agent/collections"
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/[0.06]"
        >
          <Building2 className="h-3.5 w-3.5" /> Property collections <ChevronRight className="h-3 w-3" />
        </Link>
        <Link
          href="/dashboard/agent/statements"
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/[0.06]"
        >
          <FileText className="h-3.5 w-3.5" /> Financial statements <ChevronRight className="h-3 w-3" />
        </Link>
        <Link
          href="/dashboard/agent/receipts"
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/[0.06]"
        >
          <Receipt className="h-3.5 w-3.5" /> Payment records <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
    </FinancePage>
  );
}
