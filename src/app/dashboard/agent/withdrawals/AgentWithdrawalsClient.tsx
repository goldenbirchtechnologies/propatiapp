'use client';

import { useMemo, useState } from 'react';
import {
  Wallet,
  TrendingUp,
  ArrowUpFromLine,
  Download,
  RefreshCw,
  Receipt,
  Search,
  Printer,
  CheckCircle2,
  Clock,
  Lock,
  Landmark,
  X,
  Scale,
  AlertTriangle,
  Loader2,
  BadgeCheck,
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
  AGENT_FINANCE_INSET,
  naira,
  nairaShort,
  formatDateTime,
  type FinanceStatusTone,
} from '@/components/financials/agent/AgentFinanceUI';
import type {
  AgentFinanceSummary,
  AgentFinanceWalletTransaction,
} from '@/lib/agent-finance-data';

const PAGE_SIZE = 20;
const MIN_PAYOUT = 500;

type Props = {
  summary: AgentFinanceSummary;
  withdrawals: AgentFinanceWalletTransaction[];
};

type PayoutRow = {
  key: string;
  reference: string;
  description: string;
  beneficiary: string;
  timestamp: string;
  channel: string;
  amount: number;
  status: string;
};

const STATUS_TONE: Record<string, FinanceStatusTone> = {
  success: 'success',
  pending: 'pending',
  failed: 'error',
  reversed: 'neutral',
};

const STATUS_LABEL: Record<string, string> = {
  success: 'Settled / Cleared',
  pending: 'Processing',
  failed: 'Failed',
  reversed: 'Reversed',
};

export default function AgentWithdrawalsClient({ summary, withdrawals }: Props) {
  const [tab, setTab] = useState('all');
  const [query, setQuery] = useState('');
  const [gateway, setGateway] = useState('all');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('Agent commission payout');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const rows = useMemo<PayoutRow[]>(
    () =>
      withdrawals.map((t) => ({
        key: t.id,
        reference: t.reference ?? t.id.slice(0, 12).toUpperCase(),
        description: t.description ?? 'Wallet withdrawal',
        beneficiary: 'Trust wallet · linked settlement account',
        timestamp: t.createdAt,
        channel: t.channel ?? 'paystack',
        amount: t.amount,
        status: t.status,
      })),
    [withdrawals],
  );

  const counts = useMemo(() => {
    const c = { all: rows.length, settled: 0, processing: 0, other: 0 };
    for (const r of rows) {
      if (r.status === 'success') c.settled += 1;
      else if (r.status === 'pending') c.processing += 1;
      else c.other += 1;
    }
    return c;
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (tab === 'settled' && r.status !== 'success') return false;
      if (tab === 'processing' && r.status !== 'pending') return false;
      if (tab === 'other' && (r.status === 'success' || r.status === 'pending')) return false;
      if (gateway !== 'all' && !r.channel.toLowerCase().includes(gateway)) return false;
      if (!q) return true;
      return (
        r.reference.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
      );
    });
  }, [rows, tab, gateway, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const totalWithdrawn = withdrawals
    .filter((t) => t.status === 'success')
    .reduce((s, t) => s + t.amount, 0);
  const pendingTotal = withdrawals
    .filter((t) => t.status === 'pending')
    .reduce((s, t) => s + t.amount, 0);
  const available = summary.walletBalance;

  const exportCsv = () => {
    const header = ['Reference', 'Description', 'Timestamp', 'Gateway', 'Amount (NGN)', 'Status'];
    const body = filtered.map((r) => [
      r.reference,
      r.description,
      r.timestamp,
      r.channel,
      r.amount.toFixed(2),
      STATUS_LABEL[r.status] ?? r.status,
    ]);
    const csv = [header, ...body]
      .map((cols) => cols.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent-payout-history-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const requestPayout = async () => {
    setError(null);
    setSuccess(null);
    const value = Number(amount);
    if (!value || value <= 0) {
      setError('Enter a valid amount.');
      return;
    }
    if (value < MIN_PAYOUT) {
      setError(`Minimum payout is ${naira(MIN_PAYOUT)}.`);
      return;
    }
    if (value > available) {
      setError('Amount exceeds your available wallet balance.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/wallet/agent-payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: value, description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payout request failed');
      setSuccess(`Payout of ${naira(value)} recorded against your trust wallet.`);
      setAmount('');
      setModalOpen(false);
      // Refresh the server-rendered data.
      window.location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Payout request failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FinancePage>
      <FinanceHeader
        breadcrumb={['Agent Portal', 'Finance', 'Withdrawals & Payout History']}
        title="Withdrawals & Payout History"
        description="Disbursement ledger for your trust wallet — every settlement request, clearing gateway and terminal status is recorded here."
        badges={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 font-mono text-[11px] font-semibold text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-400">
            PAYOUT-LEDGER
          </span>
        }
        actions={
          <>
            <FinanceButton onClick={() => window.location.reload()}>
              <RefreshCw className="h-3.5 w-3.5" /> Refresh Status
            </FinanceButton>
            <FinanceButton onClick={exportCsv}>
              <Download className="h-3.5 w-3.5" /> Export Ledger (CSV/PDF)
            </FinanceButton>
            <FinanceButton
              variant="primary"
              onClick={() => {
                setError(null);
                setSuccess(null);
                setModalOpen(true);
              }}
            >
              <ArrowUpFromLine className="h-3.5 w-3.5" /> Request Payout
            </FinanceButton>
          </>
        }
      />

      {/* CBN compliance notice */}
      <div className="flex flex-col items-start gap-4 rounded-xl border border-zinc-200 bg-white p-5 lg:flex-row lg:items-center dark:border-white/[0.08] dark:bg-zinc-900">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-300">
          <Scale className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-zinc-900 dark:text-white">
            Central Bank of Nigeria (CBN) Direct Settlement Notice
          </p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
            NFIU AML compliant. In compliance with anti-money-laundering regulations, withdrawals exceeding
            ₦5,000,000.00 require tier-3 biometric verification and a secondary authorisation before release.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-[11px] font-semibold text-red-600 dark:text-red-400">
          <AlertTriangle className="h-3.5 w-3.5" /> NFIU AML COMPLIANT
        </span>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <FinanceStatCard
          label="Available Balance"
          value={naira(available)}
          hint={summary.walletLocked ? 'Wallet locked — payouts paused' : 'Available for payout'}
          tone="primary"
          icon={<Wallet className="h-4 w-4" />}
          footer={
            <div className="flex items-center justify-between border-t border-zinc-200 pt-3 dark:border-white/[0.08]">
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Trust wallet</span>
              {summary.walletLocked ? (
                <FinanceStatus tone="error">
                  <Lock className="h-3 w-3" /> Locked
                </FinanceStatus>
              ) : (
                <FinanceStatus tone="success">
                  <BadgeCheck className="h-3 w-3" /> Ready
                </FinanceStatus>
              )}
            </div>
          }
        />

        <FinanceStatCard
          label="Total Disbursed"
          value={naira(totalWithdrawn)}
          hint={`${counts.settled} settled payout${counts.settled === 1 ? '' : 's'}`}
          tone="primary"
          icon={<TrendingUp className="h-4 w-4" />}
        />

        <FinanceStatCard
          label="In Transit / Processing"
          value={naira(pendingTotal)}
          hint={`${counts.processing} payout${counts.processing === 1 ? '' : 's'} awaiting clearing`}
          tone="amber"
          icon={<Clock className="h-4 w-4" />}
        />

        <FinanceStatCard
          label="Payout Records"
          value={String(rows.length)}
          hint="All payout history entries"
          tone="neutral"
          icon={<Landmark className="h-4 w-4" />}
          footer={
            <div className="flex items-center justify-between border-t border-zinc-200 pt-3 dark:border-white/[0.08]">
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Avg {nairaShort(rows.length ? totalWithdrawn / Math.max(1, counts.settled) : 0)}
              </span>
              <Receipt className="h-3.5 w-3.5 text-zinc-500" />
            </div>
          }
        />
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
            { value: 'all', label: 'All Withdrawals', count: counts.all },
            { value: 'settled', label: 'Settled / Cleared', count: counts.settled },
            { value: 'processing', label: 'Processing', count: counts.processing },
            { value: 'other', label: 'Other', count: counts.other },
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
            ariaLabel="Filter by gateway"
            value={gateway}
            onChange={(v) => {
              setGateway(v);
              setPage(1);
            }}
            options={[
              { value: 'all', label: 'Gateway: All' },
              { value: 'paystack', label: 'Paystack' },
              { value: 'nibss', label: 'NIBSS' },
              { value: 'bank', label: 'Bank Transfer' },
            ]}
            className="min-w-[150px]"
          />
        </div>
      </FinanceFilterBar>

      {/* Payout history table */}
      <FinanceTableWrap>
        {visible.length === 0 ? (
          <FinanceEmptyState
            icon={<ArrowUpFromLine className="h-6 w-6" />}
            title="No withdrawals yet"
            description="Your payout history appears here once you request a disbursement. Payouts debit your trust wallet and settle through the linked bank account."
            action={
              <FinanceButton
                variant="primary"
                onClick={() => {
                  setError(null);
                  setSuccess(null);
                  setModalOpen(true);
                }}
              >
                <ArrowUpFromLine className="h-3.5 w-3.5" /> Request Payout
              </FinanceButton>
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <FinanceTableHead>
                  <FinanceTh>Transaction Ref / Session ID</FinanceTh>
                  <FinanceTh>Payout Description &amp; Beneficiary</FinanceTh>
                  <FinanceTh>Timestamp (WAT)</FinanceTh>
                  <FinanceTh>Clearing Gateway</FinanceTh>
                  <FinanceTh align="right">Amount (NGN)</FinanceTh>
                  <FinanceTh>Status</FinanceTh>
                  <FinanceTh align="center">Actions</FinanceTh>
                </FinanceTableHead>
                <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.06]">
                  {visible.map((r) => (
                    <FinanceTableRow key={r.key}>
                      <FinanceTd>
                        <div className="font-mono font-semibold text-zinc-900 dark:text-white">
                          {r.reference}
                        </div>
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          {r.key.slice(0, 12).toUpperCase()}
                        </div>
                      </FinanceTd>
                      <FinanceTd>
                        <div className="max-w-[240px] truncate font-medium text-zinc-900 dark:text-white">
                          {r.description}
                        </div>
                        <div className="max-w-[240px] truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                          {r.beneficiary}
                        </div>
                      </FinanceTd>
                      <FinanceTd>
                        <span className="whitespace-nowrap text-zinc-600 dark:text-zinc-400">
                          {formatDateTime(r.timestamp)}
                        </span>
                      </FinanceTd>
                      <FinanceTd>
                        <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-[11px] capitalize text-zinc-700 dark:bg-white/[0.06] dark:text-zinc-300">
                          {r.channel}
                        </span>
                      </FinanceTd>
                      <FinanceTd align="right">
                        <span className="font-mono text-sm font-bold text-red-600 dark:text-red-400">
                          −{naira(r.amount)}
                        </span>
                      </FinanceTd>
                      <FinanceTd>
                        <FinanceStatus tone={STATUS_TONE[r.status] ?? 'neutral'}>
                          {r.status === 'success' ? <CheckCircle2 className="h-3 w-3" /> : null}
                          {r.status === 'pending' ? <Clock className="h-3 w-3" /> : null}
                          {r.status === 'reversed' ? <Lock className="h-3 w-3" /> : null}
                          {STATUS_LABEL[r.status] ?? r.status}
                        </FinanceStatus>
                      </FinanceTd>
                      <FinanceTd align="center">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={exportCsv}
                            className="rounded p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-white/[0.06] dark:hover:text-white"
                            title="Download voucher"
                          >
                            <Receipt className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => window.print()}
                            className="rounded p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-white/[0.06] dark:hover:text-white"
                            title="Print voucher"
                          >
                            <Printer className="h-4 w-4" />
                          </button>
                        </div>
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
              )} of ${filtered.length} payout records`}
            />
          </>
        )}
      </FinanceTableWrap>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-white/[0.08] dark:bg-zinc-900">
        <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-600 dark:text-zinc-400">
          <span>
            Disbursed:{' '}
            <span className="font-mono font-semibold text-zinc-900 dark:text-white">
              {naira(totalWithdrawn)}
            </span>
          </span>
          <span className="text-zinc-300 dark:text-zinc-700">•</span>
          <span>
            In transit:{' '}
            <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
              {naira(pendingTotal)}
            </span>
          </span>
          <span className="text-zinc-300 dark:text-zinc-700">•</span>
          <span>
            Available:{' '}
            <span className="font-mono font-semibold text-primary dark:text-[#4edea3]">
              {naira(available)}
            </span>
          </span>
        </div>
        <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
          Minimum payout {naira(MIN_PAYOUT)} · Tier-3 verification above ₦5,000,000.00
        </span>
      </div>

      {/* Payout request modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Request payout"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div className="w-full max-w-lg space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-white/[0.08] dark:bg-zinc-900">
            <div className="flex items-start justify-between border-b border-zinc-200 pb-3 dark:border-white/[0.08]">
              <div>
                <span className={AGENT_FINANCE_LABEL}>Disbursement Request</span>
                <h2 className="mt-0.5 text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
                  Authorize &amp; Disburse
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-white/[0.06] dark:hover:text-white"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className={AGENT_FINANCE_INSET + ' p-3 text-xs text-zinc-600 dark:text-zinc-400'}>
                Available balance:{' '}
                <span className="font-mono font-semibold text-zinc-900 dark:text-white">
                  {naira(available)}
                </span>{' '}
                · Minimum payout {naira(MIN_PAYOUT)}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="payout-amount"
                  className="text-xs font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Amount (NGN)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-sm font-semibold text-zinc-400">₦</span>
                  <input
                    id="payout-amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="h-10 w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-8 pr-3 font-mono text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-white/[0.08] dark:bg-zinc-800/50 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="payout-description"
                  className="text-xs font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Payout Description
                </label>
                <input
                  id="payout-description"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-10 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-white/[0.08] dark:bg-zinc-800/50 dark:text-white"
                />
              </div>

              {error ? (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-700 dark:text-red-300">
                  {error}
                </div>
              ) : null}
              {success ? (
                <div className="rounded-lg border border-primary/20 bg-primary/10 p-3 text-xs text-[var(--sovereign-hover)] dark:text-[#6ffbbe]">
                  {success}
                </div>
              ) : null}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-zinc-200 pt-3 dark:border-white/[0.08]">
              <FinanceButton variant="ghost" onClick={() => setModalOpen(false)} disabled={submitting}>
                Cancel
              </FinanceButton>
              <FinanceButton
                variant="primary"
                onClick={requestPayout}
                disabled={submitting || summary.walletLocked || available <= 0}
              >
                {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Lock className="h-3.5 w-3.5" />}
                Authorize &amp; Disburse
              </FinanceButton>
            </div>
          </div>
        </div>
      )}
    </FinancePage>
  );
}
