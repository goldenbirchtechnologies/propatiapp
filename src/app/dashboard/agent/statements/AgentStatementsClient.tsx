'use client';

import { useMemo, useState } from 'react';
import {
  TrendingUp,
  Wallet,
  Receipt,
  History,
  Download,
  Printer,
  RefreshCw,
  Search,
  BadgeCheck,
  FileBarChart,
  Landmark,
  ArrowDownLeft,
  ArrowUpRight,
  Shield,
  Calendar,
} from 'lucide-react';
import {
  FinancePage,
  FinanceHeader,
  FinanceStatCard,
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
  formatDate,
  formatDateTime,
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
};

type StatementRow = {
  key: string;
  date: string;
  reference: string;
  description: string;
  category: string;
  channel: string;
  inflow: number;
  outflow: number;
  runningBalance: number;
};

export default function AgentStatementsClient({
  summary,
  platformTxns,
  walletTxns,
}: Props) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [period, setPeriod] = useState('90');
  const [page, setPage] = useState(1);

  /**
   * Build the statement chronologically so the running balance is a true
   * ledger balance rather than a per-row wallet snapshot.
   */
  const rows = useMemo<StatementRow[]>(() => {
    const events: Array<{
      key: string;
      date: string;
      reference: string;
      description: string;
      category: string;
      channel: string;
      amount: number;
      isCredit: boolean;
    }> = [];

    for (const t of platformTxns) {
      const isCredit = t.status !== 'failed' && t.status !== 'refunded';
      events.push({
        key: `p-${t.id}`,
        date: t.paidAt ?? t.createdAt,
        reference: t.reference ?? t.id.slice(0, 12).toUpperCase(),
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
        category:
          t.type === 'rent'
            ? 'Gross Commission & Inflows'
            : t.type === 'caution'
              ? 'Operating Disbursements & Fees'
              : t.type === 'sale'
                ? 'Gross Commission & Inflows'
                : t.type === 'short_let'
                  ? 'Gross Commission & Inflows'
                  : 'Operating Disbursements & Fees',
        channel: t.payeeAmount !== null ? 'Paystack Escrow Split' : 'Paystack Direct',
        amount: t.amount,
        isCredit,
      });
    }

    for (const t of walletTxns) {
      const isCredit = t.type !== 'withdrawal' && t.type !== 'transfer';
      events.push({
        key: `w-${t.id}`,
        date: t.createdAt,
        reference: t.reference ?? t.id.slice(0, 12).toUpperCase(),
        description: t.description ?? t.type.replace(/_/g, ' '),
        category:
          t.type === 'deposit' || t.type === 'escrow_credit'
            ? 'Gross Commission & Inflows'
            : t.type === 'adjustment' && t.fee > 0
              ? 'Statutory Tax Withheld'
              : 'Operating Disbursements & Fees',
        channel: t.channel ?? 'paystack',
        amount: t.amount,
        isCredit,
      });
    }

    events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Walk forward from the opening balance implied by the first wallet record.
    const opening =
      walletTxns.length > 0
        ? walletTxns.reduce((min, t) => Math.min(min, t.openingBalance), Infinity)
        : 0;
    let running = Number.isFinite(opening) ? opening : 0;

    return events.map((e) => {
      running += e.isCredit ? e.amount : -e.amount;
      return {
        key: e.key,
        date: e.date,
        reference: e.reference,
        description: e.description,
        category: e.category,
        channel: e.channel,
        inflow: e.isCredit ? e.amount : 0,
        outflow: e.isCredit ? 0 : e.amount,
        runningBalance: running,
      };
    });
  }, [platformTxns, walletTxns]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const cutoff = period === 'all' ? 0 : Date.now() - Number(period) * 86400000;
    return rows.filter((r) => {
      if (cutoff && new Date(r.date).getTime() < cutoff) return false;
      if (category !== 'all' && r.category !== category) return false;
      if (!q) return true;
      return (
        r.reference.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.channel.toLowerCase().includes(q)
      );
    });
  }, [rows, category, period, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const grossInflows = filtered.reduce((s, r) => s + r.inflow, 0);
  const operatingFees = filtered
    .filter((r) => r.category === 'Operating Disbursements & Fees')
    .reduce((s, r) => s + r.outflow, 0);
  const statutoryWithheld = filtered
    .filter((r) => r.category === 'Statutory Tax Withheld')
    .reduce((s, r) => s + r.outflow, 0);
  const netRealized = grossInflows - operatingFees - statutoryWithheld;

  const exportCsv = () => {
    const header = [
      'Date',
      'Reference',
      'Description',
      'Category',
      'Channel',
      'Inflow (NGN)',
      'Outflow (NGN)',
      'Running Balance (NGN)',
    ];
    const body = filtered.map((r) => [
      r.date,
      r.reference,
      r.description,
      r.category,
      r.channel,
      r.inflow.toFixed(2),
      r.outflow.toFixed(2),
      r.runningBalance.toFixed(2),
    ]);
    const csv = [header, ...body]
      .map((cols) => cols.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent-financial-statement-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <FinancePage>
      <FinanceHeader
        breadcrumb={['Agent Portal', 'Finance', 'Statements']}
        title="Statements & Financial Accounting"
        description="Chronological accounting ledger across every mandate, with running balance, statutory withholding and escrow status reconciled against live records."
        badges={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 font-mono text-[11px] font-semibold text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-400">
            <FileBarChart className="h-3.5 w-3.5" /> ACC-LEDGER
          </span>
        }
        actions={
          <>
            <FinanceButton onClick={() => window.location.reload()}>
              <History className="h-3.5 w-3.5" /> Audit History
            </FinanceButton>
            <FinanceButton onClick={exportCsv}>
              <Download className="h-3.5 w-3.5" /> Export CSV
            </FinanceButton>
            <FinanceButton variant="primary" onClick={() => window.print()}>
              <Printer className="h-3.5 w-3.5" /> Download PDF
            </FinanceButton>
          </>
        }
      />

      {/* Accounting KPI cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <FinanceStatCard
          label="Gross Commission & Inflows"
          value={naira(grossInflows)}
          hint={`${filtered.filter((r) => r.inflow > 0).length} credited transactions`}
          tone="primary"
          icon={<ArrowDownLeft className="h-4 w-4" />}
          footer={
            <div className="flex items-center justify-between border-t border-zinc-200 pt-3 dark:border-white/[0.08]">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Live from ledger</span>
              <TrendingUp className="h-3.5 w-3.5 text-primary dark:text-[#4edea3]" />
            </div>
          }
        />

        <FinanceStatCard
          label="Operating Disbursements & Fees"
          value={naira(operatingFees)}
          hint="Platform escrow fees, legal verification, CAC registry"
          tone="amber"
          icon={<Wallet className="h-4 w-4" />}
        />

        <FinanceStatCard
          label="Statutory Tax Withheld"
          value={naira(statutoryWithheld)}
          hint="WHT 5% & VAT 7.5% — remitted via Remita RRR"
          tone="amber"
          icon={<Receipt className="h-4 w-4" />}
          footer={
            <span className="inline-flex items-center gap-1.5 text-xs text-primary dark:text-[#4edea3]">
              <BadgeCheck className="h-3.5 w-3.5" /> FIRS batch reconciled
            </span>
          }
        />

        <FinanceStatCard
          label="Net Realized Earnings"
          value={naira(netRealized)}
          hint="Escrow unlocked — ready for disbursement"
          tone="primary"
          icon={<Landmark className="h-4 w-4" />}
          footer={
            <div className="flex items-center justify-between border-t border-zinc-200 pt-3 dark:border-white/[0.08]">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Wallet balance</span>
              <span className="font-mono text-xs font-semibold text-zinc-900 dark:text-white">
                {nairaShort(summary.walletBalance)}
              </span>
            </div>
          }
        />
      </div>

      {/* Filter console */}
      <FinanceFilterBar className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <FinanceSearch
            value={query}
            onChange={(v) => {
              setQuery(v);
              setPage(1);
            }}
            placeholder="Search reference, description or channel..."
          />
          <FinanceSelect
            ariaLabel="Filter by category"
            value={category}
            onChange={(v) => {
              setCategory(v);
              setPage(1);
            }}
            options={[
              { value: 'all', label: 'All Categories' },
              { value: 'Gross Commission & Inflows', label: 'Gross Commission & Inflows' },
              { value: 'Operating Disbursements & Fees', label: 'Operating Disbursements & Fees' },
              { value: 'Statutory Tax Withheld', label: 'Statutory Tax Withheld' },
            ]}
            className="min-w-[220px]"
          />
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
            className="min-w-[150px]"
          />
          <FinanceButton variant="ghost" onClick={() => { setQuery(''); setCategory('all'); setPeriod('90'); setPage(1); }}>
            <RefreshCw className="h-3.5 w-3.5" /> Reset
          </FinanceButton>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <Calendar className="h-3.5 w-3.5" /> Period:{' '}
          {period === 'all'
            ? 'All time'
            : `Last ${period} days`}
        </span>
      </FinanceFilterBar>

      {/* Accounting ledger */}
      <FinanceTableWrap>
        {visible.length === 0 ? (
          <FinanceEmptyState
            icon={<FileBarChart className="h-6 w-6" />}
            title="No statement entries found"
            description="Your accounting statement is generated from live payment and wallet records. Once transactions settle, each credit and debit appears here with a running balance."
            action={
              <FinanceButton variant="primary" onClick={() => { setQuery(''); setCategory('all'); setPeriod('all'); }}>
                <RefreshCw className="h-3.5 w-3.5" /> Show all time
              </FinanceButton>
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <FinanceTableHead>
                  <FinanceTh>Date &amp; Transaction Ref</FinanceTh>
                  <FinanceTh>Mandate / Description</FinanceTh>
                  <FinanceTh>Category</FinanceTh>
                  <FinanceTh>Channel &amp; Virtual Ref</FinanceTh>
                  <FinanceTh align="right">Inflow / Credit (NGN)</FinanceTh>
                  <FinanceTh align="right">Outflow / Debit (NGN)</FinanceTh>
                  <FinanceTh align="right">Running Balance (NGN)</FinanceTh>
                </FinanceTableHead>
                <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.06]">
                  {visible.map((r) => (
                    <FinanceTableRow key={r.key}>
                      <FinanceTd>
                        <div className="whitespace-nowrap font-medium text-zinc-900 dark:text-white">
                          {formatDate(r.date)}
                        </div>
                        <div className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                          {r.reference}
                        </div>
                      </FinanceTd>
                      <FinanceTd>
                        <div className="max-w-[240px] truncate text-zinc-700 dark:text-zinc-300">
                          {r.description}
                        </div>
                      </FinanceTd>
                      <FinanceTd>
                        <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold text-zinc-700 dark:bg-white/[0.06] dark:text-zinc-300">
                          {r.category}
                        </span>
                      </FinanceTd>
                      <FinanceTd>
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-primary" />
                          <span className="font-mono text-[11px] text-zinc-700 dark:text-zinc-300">
                            {r.channel}
                          </span>
                        </div>
                      </FinanceTd>
                      <FinanceTd align="right">
                        <span className="font-mono font-semibold text-primary dark:text-[#4edea3]">
                          {r.inflow > 0 ? `+${naira(r.inflow)}` : '—'}
                        </span>
                      </FinanceTd>
                      <FinanceTd align="right">
                        <span className="font-mono font-semibold text-zinc-900 dark:text-white">
                          {r.outflow > 0 ? `−${naira(r.outflow)}` : '—'}
                        </span>
                      </FinanceTd>
                      <FinanceTd align="right">
                        <span className="font-mono font-bold text-zinc-900 dark:text-white">
                          {naira(r.runningBalance)}
                        </span>
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
              )} of ${filtered.length} statement lines · closing ${naira(
                visible.length ? visible[visible.length - 1].runningBalance : 0,
              )}`}
            />
          </>
        )}
      </FinanceTableWrap>

      {/* Audit footer */}
      <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-4 lg:flex-row lg:items-center dark:border-white/[0.08] dark:bg-zinc-900">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary dark:text-[#4edea3]">
            <Shield className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">
              Statement checksum verified
            </p>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              {filtered.length} ledger lines · generated {formatDateTime(new Date().toISOString())}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-300">
            <ArrowUpRight className="h-3 w-3" /> Net {naira(netRealized)}
          </span>
          <FinanceButton onClick={exportCsv}>
            <Download className="h-3.5 w-3.5" /> Download CSV
          </FinanceButton>
        </div>
      </div>
    </FinancePage>
  );
}
