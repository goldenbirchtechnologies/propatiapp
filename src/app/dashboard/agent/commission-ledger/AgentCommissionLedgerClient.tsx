'use client';

import { useMemo, useState } from 'react';
import {
  Download,
  RefreshCw,
  ArrowDownLeft,
  Landmark,
  BadgeCheck,
  ArrowLeftRight,
  Search,
  Receipt,
  Lock,
  CheckCircle2,
  Clock,
  Table2,
} from 'lucide-react';
import {
  FinancePage,
  FinanceHeader,
  FinanceStatCard,
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
  AgentFinanceWalletTransaction,
} from '@/lib/agent-finance-data';

const PAGE_SIZE = 25;

type Props = {
  summary: AgentFinanceSummary;
  adjustments: AgentFinanceWalletTransaction[];
};

type LedgerRow = {
  key: string;
  reference: string;
  type: string;
  description: string;
  timestamp: string;
  amount: number;
  fee: number;
  status: string;
  isCredit: boolean;
};

const STATUS_TONE: Record<string, FinanceStatusTone> = {
  success: 'success',
  pending: 'pending',
  failed: 'error',
  reversed: 'neutral',
};

const TYPE_LABEL: Record<string, string> = {
  adjustment: 'Adjustment Inflow',
  escrow_credit: 'Escrow Release',
  deposit: 'Commission Deposit',
  withdrawal: 'Commission Payout',
  transfer: 'Transfer',
  refund: 'Refund',
};

export default function AgentCommissionLedgerClient({ summary, adjustments }: Props) {
  const [tab, setTab] = useState('all');
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);

  const rows = useMemo<LedgerRow[]>(
    () =>
      adjustments.map((t) => ({
        key: t.id,
        reference: t.reference ?? t.id.slice(0, 12).toUpperCase(),
        type: t.type,
        description: t.description ?? TYPE_LABEL[t.type] ?? t.type,
        timestamp: t.createdAt,
        amount: t.amount,
        fee: t.fee,
        status: t.status,
        isCredit: t.type !== 'withdrawal' && t.type !== 'transfer',
      })),
    [adjustments],
  );

  const counts = useMemo(() => {
    const c = { all: rows.length, inflow: 0, outflow: 0 };
    for (const r of rows) {
      if (r.isCredit) c.inflow += 1;
      else c.outflow += 1;
    }
    return c;
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (tab === 'inflow' && !r.isCredit) return false;
      if (tab === 'outflow' && r.isCredit) return false;
      if (typeFilter !== 'all' && r.type !== typeFilter) return false;
      if (!q) return true;
      return (
        r.reference.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
      );
    });
  }, [rows, tab, typeFilter, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const inflowTotal = filtered.filter((r) => r.isCredit).reduce((s, r) => s + r.amount, 0);
  const outflowTotal = filtered.filter((r) => !r.isCredit).reduce((s, r) => s + r.amount, 0);
  const netTotal = inflowTotal - outflowTotal;

  const exportCsv = () => {
    const header = ['Reference', 'Type', 'Description', 'Timestamp', 'Status', 'Amount (NGN)', 'Fee (NGN)'];
    const body = filtered.map((r) => [
      r.reference,
      r.type,
      r.description,
      r.timestamp,
      r.status,
      r.amount.toFixed(2),
      r.fee.toFixed(2),
    ]);
    const csv = [header, ...body]
      .map((cols) => cols.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent-commission-ledger-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <FinancePage>
      <FinanceHeader
        breadcrumb={['Finance', 'Commissions', 'Commission Ledger']}
        title="Commission Ledger"
        description="Wallet adjustments, escrow releases and clawback remittances across the agent commission account — every movement reconciled to the live wallet ledger."
        badges={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 font-mono text-[11px] font-semibold text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-400">
            <Table2 className="h-3.5 w-3.5" /> {rows.length} records loaded
          </span>
        }
        actions={
          <>
            <FinanceButton onClick={() => window.location.reload()}>
              <RefreshCw className="h-3.5 w-3.5" /> Refresh Ledger
            </FinanceButton>
            <FinanceButton variant="primary" onClick={exportCsv}>
              <Download className="h-3.5 w-3.5" /> Export Audit Trail (CSV)
            </FinanceButton>
          </>
        }
      />

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <FinanceStatCard
          label="Adjustment Inflows"
          value={naira(inflowTotal)}
          hint={`${counts.inflow} settled escrow release${counts.inflow === 1 ? '' : 's'} in this cycle`}
          tone="primary"
          icon={<ArrowDownLeft className="h-4 w-4" />}
        />
        <FinanceStatCard
          label="Retained Clawbacks & WHT"
          value={`−${naira(outflowTotal)}`}
          hint="Statutory withholding and escrow audit remittance"
          tone="amber"
          icon={<Landmark className="h-4 w-4" />}
        />
        <FinanceStatCard
          label="Net Settled Adjustments"
          value={naira(netTotal)}
          hint="Cleared to your trust wallet"
          tone="primary"
          icon={<BadgeCheck className="h-4 w-4" />}
        />
      </div>

      {/* Telemetry strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-white/[0.08] dark:bg-zinc-800/50">
        <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
          <ArrowLeftRight className="h-3.5 w-3.5 text-primary dark:text-[#4edea3]" />
          <span>Ledger source: wallet adjustments &amp; escrow releases</span>
          <span className="text-zinc-300 dark:text-zinc-700">•</span>
          <span className="font-mono text-[11px]">Batch #{String(rows.length).padStart(4, '0')}</span>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-primary dark:text-[#4edea3]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
          Live ledger sync
        </span>
      </div>

      {/* Filters */}
      <FinanceFilterBar className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <FinanceTabs
          active={tab}
          onChange={(v) => {
            setTab(v);
            setPage(1);
          }}
          tabs={[
            { value: 'all', label: 'All Entries', count: counts.all },
            { value: 'inflow', label: 'Inflows', count: counts.inflow },
            { value: 'outflow', label: 'Outflows', count: counts.outflow },
          ]}
        />
        <div className="flex flex-wrap items-center gap-2">
          <FinanceSearch
            value={query}
            onChange={(v) => {
              setQuery(v);
              setPage(1);
            }}
            placeholder="Search reference or description..."
          />
          <FinanceSelect
            ariaLabel="Filter by ledger type"
            value={typeFilter}
            onChange={(v) => {
              setTypeFilter(v);
              setPage(1);
            }}
            options={[
              { value: 'all', label: 'All Types' },
              { value: 'adjustment', label: 'Adjustment' },
              { value: 'escrow_credit', label: 'Escrow Credit' },
              { value: 'deposit', label: 'Deposit' },
              { value: 'withdrawal', label: 'Withdrawal' },
              { value: 'transfer', label: 'Transfer' },
              { value: 'refund', label: 'Refund' },
            ]}
            className="min-w-[160px]"
          />
        </div>
      </FinanceFilterBar>

      {/* Ledger table */}
      <FinanceTableWrap>
        {visible.length === 0 ? (
          <FinanceEmptyState
            icon={<Table2 className="h-6 w-6" />}
            title="No ledger entries yet"
            description="Commission adjustments, escrow releases and payout movements appear here once they are posted to your trust wallet. The ledger is read live from the wallet transaction record."
            action={
              <FinanceButton variant="primary" onClick={() => window.location.reload()}>
                <RefreshCw className="h-3.5 w-3.5" /> Refresh ledger
              </FinanceButton>
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <FinanceTableHead>
                  <FinanceTh>Transaction Ref / Type</FinanceTh>
                  <FinanceTh>Deal &amp; Mandate Description</FinanceTh>
                  <FinanceTh>Timestamp (WAT)</FinanceTh>
                  <FinanceTh align="right">Adjustment Amount</FinanceTh>
                  <FinanceTh>Ledger Status</FinanceTh>
                  <FinanceTh align="center">Actions</FinanceTh>
                </FinanceTableHead>
                <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.06]">
                  {visible.map((r) => (
                    <FinanceTableRow key={r.key}>
                      <FinanceTd>
                        <div className="font-mono text-xs font-semibold text-primary dark:text-[#4edea3]">
                          {r.reference}
                        </div>
                        <div className="text-[11px] capitalize text-zinc-500 dark:text-zinc-400">
                          {TYPE_LABEL[r.type] ?? r.type.replace(/_/g, ' ')}
                        </div>
                      </FinanceTd>
                      <FinanceTd>
                        <div className="max-w-[280px] truncate font-medium text-zinc-900 dark:text-white">
                          {r.description}
                        </div>
                      </FinanceTd>
                      <FinanceTd>
                        <span className="whitespace-nowrap text-zinc-600 dark:text-zinc-400">
                          {formatDateTime(r.timestamp)}
                        </span>
                      </FinanceTd>
                      <FinanceTd align="right">
                        <span
                          className={
                            r.isCredit
                              ? 'font-mono text-sm font-bold text-primary dark:text-[#4edea3]'
                              : 'font-mono text-sm font-bold text-zinc-900 dark:text-white'
                          }
                        >
                          {r.isCredit ? '+' : '−'}
                          {naira(r.amount)}
                        </span>
                        {r.fee > 0 ? (
                          <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                            Fee {nairaShort(r.fee)}
                          </div>
                        ) : null}
                      </FinanceTd>
                      <FinanceTd>
                        <FinanceStatus tone={STATUS_TONE[r.status] ?? 'neutral'}>
                          {r.status === 'success' ? <CheckCircle2 className="h-3 w-3" /> : null}
                          {r.status === 'pending' ? <Clock className="h-3 w-3" /> : null}
                          {r.status === 'reversed' ? <Lock className="h-3 w-3" /> : null}
                          <span className="capitalize">{r.status}</span>
                        </FinanceStatus>
                      </FinanceTd>
                      <FinanceTd align="center">
                        <button
                          type="button"
                          onClick={exportCsv}
                          className="rounded p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-white/[0.06] dark:hover:text-white"
                          title="Export ledger extract"
                        >
                          <Receipt className="h-4 w-4" />
                        </button>
                      </FinanceTd>
                    </FinanceTableRow>
                  ))}
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

      {/* Footer totals */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-white/[0.08] dark:bg-zinc-900">
        <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-600 dark:text-zinc-400">
          <span>
            Inflows:{' '}
            <span className="font-mono font-semibold text-primary dark:text-[#4edea3]">
              {naira(inflowTotal)}
            </span>
          </span>
          <span className="text-zinc-300 dark:text-zinc-700">•</span>
          <span>
            Outflows:{' '}
            <span className="font-mono font-semibold text-zinc-900 dark:text-white">{naira(outflowTotal)}</span>
          </span>
          <span className="text-zinc-300 dark:text-zinc-700">•</span>
          <span>
            Net:{' '}
            <span className="font-mono font-semibold text-zinc-900 dark:text-white">{naira(netTotal)}</span>
          </span>
        </div>
        <div className="text-right">
          <span className={AGENT_FINANCE_LABEL}>Wallet balance</span>
          <p className="font-mono text-sm font-bold text-zinc-900 dark:text-white">
            {naira(summary.walletBalance)}
          </p>
        </div>
      </div>
    </FinancePage>
  );
}
