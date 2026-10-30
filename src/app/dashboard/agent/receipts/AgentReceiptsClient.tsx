'use client';

import { useMemo, useState } from 'react';
import {
  Receipt,
  Download,
  Eye,
  Search,
  Lock,
  CheckCircle2,
  Clock,
  Shield,
  BadgeCheck,
  Printer,
  TrendingUp,
  Building2,
  Landmark,
  History,
  X,
  CreditCard,
  RefreshCw,
  ArrowLeftRight,
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
  AGENT_FINANCE_INSET,
  naira,
  nairaShort,
  formatDate,
  formatDateTime,
  initialsOf,
  type FinanceStatusTone,
} from '@/components/financials/agent/AgentFinanceUI';
import type {
  AgentFinanceSummary,
  AgentFinanceTransaction,
  AgentFinanceWalletTransaction,
} from '@/lib/agent-finance-data';

const PAGE_SIZE = 20;

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
  description: string;
  property: string | null;
  counterparty: string | null;
  counterpartyMeta: string | null;
  channel: string;
  type: string;
  status: string;
  amount: number;
  commission: number;
  fee: number;
  kind: 'platform' | 'wallet';
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
  released: 'Settled & Cleared',
  success: 'Settled & Cleared',
  in_escrow: 'In Escrow Vault',
  escrow_credit: 'In Escrow Vault',
  commission_held: 'Commission Held',
  pending: 'Pending Confirmation',
  failed: 'Failed',
  refunded: 'Refunded',
  reversed: 'Reversed',
};

const CHANNEL_ICON: Record<string, typeof CreditCard> = {
  deposit: CreditCard,
  withdrawal: ArrowLeftRight,
  adjustment: Lock,
  escrow_credit: Lock,
  transfer: ArrowLeftRight,
  refund: RefreshCw,
};

export default function AgentReceiptsClient({ summary, platformTxns, walletTxns, properties }: Props) {
  const [statusTab, setStatusTab] = useState('all');
  const [query, setQuery] = useState('');
  const [propertyId, setPropertyId] = useState('all');
  const [period, setPeriod] = useState('90');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Row | null>(null);

  const rows = useMemo<Row[]>(() => {
    const out: Row[] = [];
    for (const t of platformTxns) {
      out.push({
        key: `p-${t.id}`,
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
                  : 'Payment record'),
        property: t.listingTitle,
        counterparty: t.payerName ?? t.payeeName,
        counterpartyMeta: t.payerName && t.payeeName ? `Payer · ${t.payerName}` : null,
        channel: t.payeeAmount !== null ? 'Paystack Escrow' : 'Paystack Direct',
        type: t.type,
        status: t.status,
        amount: t.amount,
        commission: t.agentCommission,
        fee: t.platformFee,
        kind: 'platform',
      });
    }
    for (const t of walletTxns) {
      out.push({
        key: `w-${t.id}`,
        reference: t.reference ?? t.id.slice(0, 12).toUpperCase(),
        createdAt: t.createdAt,
        description: t.description ?? t.type.replace(/_/g, ' '),
        property: null,
        counterparty: null,
        counterpartyMeta: null,
        channel: t.channel ?? 'paystack',
        type: t.type,
        status: t.status,
        amount: t.amount,
        commission: 0,
        fee: t.fee,
        kind: 'wallet',
      });
    }
    return out.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [platformTxns, walletTxns]);

  const counts = useMemo(() => {
    const c = { all: rows.length, settled: 0, escrow: 0, pending: 0, other: 0 };
    for (const r of rows) {
      if (r.status === 'released' || r.status === 'success') c.settled += 1;
      else if (r.status === 'in_escrow' || r.status === 'escrow_credit') c.escrow += 1;
      else if (r.status === 'pending') c.pending += 1;
      else c.other += 1;
    }
    return c;
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const cutoff = period === 'all' ? 0 : Date.now() - Number(period) * 86400000;
    return rows.filter((r) => {
      if (statusTab === 'settled' && !(r.status === 'released' || r.status === 'success')) return false;
      if (statusTab === 'escrow' && !(r.status === 'in_escrow' || r.status === 'escrow_credit')) return false;
      if (statusTab === 'pending' && r.status !== 'pending') return false;
      if (statusTab === 'other' && (r.status === 'released' || r.status === 'success' || r.status === 'in_escrow' || r.status === 'escrow_credit' || r.status === 'pending')) return false;
      if (cutoff && new Date(r.createdAt).getTime() < cutoff) return false;
      if (propertyId !== 'all') {
        const match =
          r.property && properties.some((p) => p.id === propertyId && p.title === r.property);
        if (!match) return false;
      }
      if (!q) return true;
      return (
        r.reference.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        (r.counterparty?.toLowerCase().includes(q) ?? false) ||
        (r.property?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [rows, statusTab, period, propertyId, query, properties]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const totalVolume = filtered.reduce((s, r) => s + r.amount, 0);
  const settledVolume = filtered
    .filter((r) => r.status === 'released' || r.status === 'success')
    .reduce((s, r) => s + r.amount, 0);
  const escrowVolume = filtered
    .filter((r) => r.status === 'in_escrow' || r.status === 'escrow_credit')
    .reduce((s, r) => s + r.amount, 0);
  const whtDeducted = filtered.reduce((s, r) => s + r.fee, 0);
  const clearedPct = totalVolume > 0 ? (settledVolume / totalVolume) * 100 : 0;

  const exportCsv = () => {
    const header = ['Reference', 'Date', 'Description', 'Property', 'Counterparty', 'Channel', 'Status', 'Amount (NGN)'];
    const body = filtered.map((r) => [
      r.reference,
      r.createdAt,
      r.description,
      r.property ?? '',
      r.counterparty ?? '',
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
    a.download = `agent-audit-trail-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetFilters = () => {
    setStatusTab('all');
    setQuery('');
    setPropertyId('all');
    setPeriod('90');
    setPage(1);
  };

  return (
    <FinancePage>
      <FinanceHeader
        breadcrumb={['Agent Dashboard', 'Finance', 'Payment Records Ledger']}
        title="Payment Records & Audit Trail"
        description="Granular transaction records for every managed mandate — direct remittances, escrow releases and automated disbursements, reconciled against live payment records."
        badges={
          <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-400">
            LEDGER-ARC
          </span>
        }
        actions={
          <>
            <FinanceButton onClick={exportCsv}>
              <Download className="h-3.5 w-3.5" /> Export CSV
            </FinanceButton>
            <FinanceButton onClick={exportCsv}>
              <Printer className="h-3.5 w-3.5" /> Export PDF Audit
            </FinanceButton>
          </>
        }
      />

      {/* Secondary route-context tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <FinanceTabs
          active={statusTab}
          onChange={(v) => {
            setStatusTab(v);
            setPage(1);
          }}
          tabs={[
            { value: 'all', label: 'All Records', count: counts.all },
            { value: 'settled', label: 'Settled & Cleared', count: counts.settled },
            { value: 'escrow', label: 'In Escrow Vault', count: counts.escrow },
            { value: 'pending', label: 'Pending Confirmation', count: counts.pending },
            { value: 'other', label: 'Other', count: counts.other },
          ]}
        />
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-mono text-[11px] text-[var(--sovereign-hover)] dark:text-[#4edea3]">
          <Lock className="h-3.5 w-3.5" /> NIBSS Instant &amp; Paystack Split Engine
        </span>
      </div>

      {/* Compact bento metric strip */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <FinanceStatCard
          label="Total Filtered Volume"
          value={naira(totalVolume)}
          hint={`${filtered.length} indexed transactions`}
          tone="primary"
          icon={<Landmark className="h-4 w-4" />}
        />
        <FinanceStatCard
          label="Cleared & Settled"
          value={naira(settledVolume)}
          tone="primary"
          icon={<CheckCircle2 className="h-4 w-4" />}
          footer={
            <div className="flex items-center gap-2">
              <FinanceProgress value={clearedPct} />
              <span className="shrink-0 font-mono text-xs font-semibold text-zinc-900 dark:text-white">
                {clearedPct.toFixed(1)}%
              </span>
            </div>
          }
        />
        <FinanceStatCard
          label="Escrow Retained"
          value={naira(escrowVolume)}
          hint={`${counts.escrow} entries in holding vault`}
          tone="blue"
          icon={<Lock className="h-4 w-4" />}
        />
        <FinanceStatCard
          label="Fees & Withholding (WHT)"
          value={naira(whtDeducted)}
          tone="amber"
          icon={<Receipt className="h-4 w-4" />}
          footer={
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-primary dark:text-[#4edea3]">
              <CheckCircle2 className="h-3 w-3" /> Reconciled against payment records
            </span>
          }
        />
      </div>

      {/* Query console */}
      <FinanceFilterBar className="space-y-4">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <FinanceSearch
              value={query}
              onChange={(v) => {
                setQuery(v);
                setPage(1);
              }}
              placeholder="Search transaction ref, tenant name, or property..."
            />
          </div>
          <div className="lg:col-span-3">
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
              className="w-full"
            />
          </div>
          <div className="lg:col-span-2">
            <FinanceSelect
              ariaLabel="Filter by period"
              value={period}
              onChange={(v) => {
                setPeriod(v);
                setPage(1);
              }}
              options={[
                { value: '30', label: 'Last 30 Days' },
                { value: '90', label: 'Last 90 Days' },
                { value: '365', label: 'Year to Date' },
                { value: 'all', label: 'All Time' },
              ]}
              className="w-full"
            />
          </div>
          <div className="flex items-center justify-end lg:col-span-2">
            <FinanceButton variant="ghost" onClick={resetFilters} className="w-full">
              <RefreshCw className="h-3.5 w-3.5" /> Reset
            </FinanceButton>
          </div>
        </div>
      </FinanceFilterBar>

      {/* Split workspace: table + detail drawer */}
      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-12">
        <FinanceTableWrap className="xl:col-span-8">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-zinc-800/50 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                Institutional Ledger Archive
              </span>
              <span className="rounded-full bg-zinc-200 px-2 py-0.5 font-mono text-[11px] font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                Showing {visible.length} of {filtered.length}
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
              <History className="h-3.5 w-3.5" /> Sorted by: Most Recent
            </span>
          </div>

          {visible.length === 0 ? (
            <FinanceEmptyState
              icon={<Receipt className="h-6 w-6" />}
              title="No payment records found"
              description="No ledger entries match the current filters. Widen the date range or clear the property filter to see more of the archive."
              action={
                <FinanceButton variant="primary" onClick={resetFilters}>
                  <RefreshCw className="h-3.5 w-3.5" /> Reset filters
                </FinanceButton>
              }
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <FinanceTableHead>
                    <FinanceTh>Transaction Ref &amp; Date</FinanceTh>
                    <FinanceTh>Property &amp; Mandate</FinanceTh>
                    <FinanceTh>Tenant / Counterparty</FinanceTh>
                    <FinanceTh>Channel</FinanceTh>
                    <FinanceTh align="right">Amount (NGN)</FinanceTh>
                    <FinanceTh>Status</FinanceTh>
                    <FinanceTh align="center">Actions</FinanceTh>
                  </FinanceTableHead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.06]">
                    {visible.map((row) => {
                      const tone = STATUS_TONE[row.status] ?? 'neutral';
                      const ChannelIcon = CHANNEL_ICON[row.type] ?? CreditCard;
                      const isSelected = selected?.key === row.key;
                      return (
                        <tr
                          key={row.key}
                          onClick={() => setSelected(row)}
                          className={
                            isSelected
                              ? 'cursor-pointer bg-primary/5 hover:bg-primary/10'
                              : 'cursor-pointer hover:bg-zinc-50 dark:hover:bg-white/[0.03]'
                          }
                        >
                          <FinanceTd>
                            <div className="font-semibold text-zinc-900 dark:text-white">#{row.reference}</div>
                            <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                              {formatDateTime(row.createdAt)}
                            </div>
                          </FinanceTd>
                          <FinanceTd>
                            <div className="max-w-[180px] truncate font-medium text-zinc-900 dark:text-white">
                              {row.property ?? row.description}
                            </div>
                            <div className="max-w-[180px] truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                              {row.property ? row.description : 'Wallet movement'}
                            </div>
                          </FinanceTd>
                          <FinanceTd>
                            <div className="max-w-[160px] truncate font-medium text-zinc-900 dark:text-white">
                              {row.counterparty ?? '—'}
                            </div>
                            <div className="max-w-[160px] truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                              {row.counterpartyMeta ?? row.type.replace(/_/g, ' ')}
                            </div>
                          </FinanceTd>
                          <FinanceTd>
                            <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-700 dark:bg-white/[0.06] dark:text-zinc-300">
                              <ChannelIcon className="h-3 w-3 text-primary dark:text-[#4edea3]" />
                              {row.channel}
                            </span>
                          </FinanceTd>
                          <FinanceTd align="right">
                            <span className="font-mono text-xs font-semibold text-primary dark:text-[#4edea3]">
                              +{naira(row.amount)}
                            </span>
                          </FinanceTd>
                          <FinanceTd>
                            <FinanceStatus tone={tone}>
                              {tone === 'success' ? <CheckCircle2 className="h-3 w-3" /> : null}
                              {tone === 'escrow' ? <Lock className="h-3 w-3" /> : null}
                              {tone === 'pending' ? <Clock className="h-3 w-3" /> : null}
                              {STATUS_LABEL[row.status] ?? row.status}
                            </FinanceStatus>
                          </FinanceTd>
                          <FinanceTd align="center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelected(row);
                                }}
                                className="rounded p-1 text-primary hover:bg-zinc-100 dark:hover:bg-white/[0.06] dark:text-[#4edea3]"
                                title="View Detail"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  exportCsv();
                                }}
                                className="rounded p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-white/[0.06] dark:hover:text-white"
                                title="Download CSV"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                            </div>
                          </FinanceTd>
                        </tr>
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
                )} of ${filtered.length} ledger items`}
              />
            </>
          )}
        </FinanceTableWrap>

        {/* Detail inspection panel */}
        <aside className="xl:col-span-4">
          {selected ? (
            <div className="space-y-4 rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 p-4">
              <div className="flex items-start justify-between border-b border-zinc-200 pb-3 dark:border-white/[0.08]">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={AGENT_FINANCE_LABEL}>Selected Audit Record</span>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--sovereign-hover)] dark:text-[#4edea3]">
                      MATCHED &amp; VERIFIED
                    </span>
                  </div>
                  <h2 className="mt-1 text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
                    #{selected.reference}
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {selected.property ?? selected.description}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-white/[0.06] dark:hover:text-white"
                  title="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Counterparty */}
              <div className={AGENT_FINANCE_INSET + ' flex items-center justify-between p-3'}>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary dark:text-[#4edea3]">
                    {initialsOf(selected.counterparty)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                      {selected.counterparty ?? 'Internal ledger entry'}
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {selected.property ?? 'Wallet movement'}
                    </span>
                  </div>
                </div>
                {selected.counterparty ? (
                  <BadgeCheck className="h-5 w-5 text-primary dark:text-[#4edea3]" />
                ) : null}
              </div>

              {/* Gross inflow breakdown */}
              <div className="space-y-1.5">
                <span className={AGENT_FINANCE_LABEL + ' block'}>Transaction Breakdown</span>
                <div className={AGENT_FINANCE_INSET + ' space-y-2.5 p-4 font-mono text-xs'}>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-600 dark:text-zinc-400">Gross Transaction</span>
                    <span className="font-medium text-zinc-900 dark:text-white">{naira(selected.amount)}</span>
                  </div>
                  {selected.commission > 0 ? (
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-600 dark:text-zinc-400">Agent Commission</span>
                      <span className="font-medium text-primary dark:text-[#4edea3]">
                        {naira(selected.commission)}
                      </span>
                    </div>
                  ) : null}
                  {selected.fee > 0 ? (
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-600 dark:text-zinc-400">
                        Platform Fee / Statutory Withholding
                      </span>
                      <span className="font-medium text-amber-600 dark:text-amber-400">
                        −{naira(selected.fee)}
                      </span>
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between border-t border-zinc-200 pt-2 font-semibold dark:border-white/[0.08]">
                    <span className="text-zinc-900 dark:text-white">Net Recorded</span>
                    <span className="text-primary dark:text-[#4edea3]">
                      {naira(selected.amount - selected.fee)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Audit metadata */}
              <div className={AGENT_FINANCE_INSET + ' space-y-2 p-3'}>
                <div className="flex items-center gap-2 text-[var(--sovereign-hover)] dark:text-[#4edea3]">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm font-semibold">Audit &amp; Compliance</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="rounded bg-white p-2 dark:bg-zinc-900">
                    <div className="text-[10px] uppercase text-zinc-500 dark:text-zinc-400">Value Date</div>
                    <div className="font-semibold text-zinc-900 dark:text-white">
                      {formatDate(selected.createdAt)}
                    </div>
                  </div>
                  <div className="rounded bg-white p-2 dark:bg-zinc-900">
                    <div className="text-[10px] uppercase text-zinc-500 dark:text-zinc-400">Status</div>
                    <div className="font-semibold text-zinc-900 dark:text-white">
                      {STATUS_LABEL[selected.status] ?? selected.status}
                    </div>
                  </div>
                </div>
                <div className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                  Reference: <span className="text-zinc-900 dark:text-white">{selected.reference}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <FinanceButton variant="primary" onClick={exportCsv} className="flex-1">
                  <Download className="h-3.5 w-3.5" /> Download Audit Extract
                </FinanceButton>
                <FinanceButton onClick={() => window.print()} title="Print ledger copy">
                  <Printer className="h-3.5 w-3.5" />
                </FinanceButton>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 px-6 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400">
                <Eye className="h-6 w-6" />
              </div>
              <p className="mt-3 text-sm font-semibold text-zinc-900 dark:text-white">
                Select an audit record
              </p>
              <p className="mt-1 max-w-xs text-xs text-zinc-600 dark:text-zinc-400">
                Choose any ledger row to inspect its breakdown, counterparty verification and audit trail.
              </p>
            </div>
          )}
        </aside>
      </div>

      {/* CBN / e-invoicing banner */}
      <FinanceComplianceBanner
        icon={<TrendingUp className="h-5 w-5" />}
        title="Central Bank of Nigeria Electronic Invoicing Integration"
        body="Every transaction logged on this portal syncs with the NIBSS Instant Clearing mesh and issues instant LASRERA digital receipts."
        meta={
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-300">
              <Building2 className="h-3 w-3" /> {summary.propertyCount} managed properties
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-300">
              <Shield className="h-3 w-3" /> Security protocol v2.4
            </span>
          </div>
        }
      />
    </FinancePage>
  );
}
