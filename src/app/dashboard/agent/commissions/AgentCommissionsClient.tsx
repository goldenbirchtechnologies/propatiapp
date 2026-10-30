'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Landmark,
  TrendingUp,
  BadgeCheck,
  Lock,
  Percent,
  Scale,
  Download,
  RefreshCw,
  Search,
  Receipt,
  CheckCircle2,
  Clock,
  ArrowRight,
  Briefcase,
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
  FinancePagination,
  FinanceButton,
  AGENT_FINANCE_LABEL,
  naira,
  nairaShort,
  formatDate,
  type FinanceStatusTone,
} from '@/components/financials/agent/AgentFinanceUI';
import type {
  AgentFinanceAgreement,
  AgentFinanceSummary,
  AgentFinanceTransaction,
} from '@/lib/agent-finance-data';

const PAGE_SIZE = 20;

type Props = {
  summary: AgentFinanceSummary;
  agreements: AgentFinanceAgreement[];
  transactions: AgentFinanceTransaction[];
};

type CommissionRow = {
  id: string;
  deal: string;
  client: string;
  amount: number;
  rate: string;
  date: string;
  status: 'paid' | 'escrow' | 'pending';
  escrowRef: string | null;
};

const STATUS_TONE: Record<CommissionRow['status'], FinanceStatusTone> = {
  paid: 'success',
  escrow: 'escrow',
  pending: 'pending',
};

const STATUS_LABEL: Record<CommissionRow['status'], string> = {
  paid: 'Paid Out',
  escrow: 'Pending Escrow',
  pending: 'Accruing',
};

export default function AgentCommissionsClient({ summary, agreements, transactions }: Props) {
  const [tab, setTab] = useState('all');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  // Commission rows are derived from released deal consideration (5% standard
  // agency rate) on the agent's own agreements.
  const rows = useMemo<CommissionRow[]>(() => {
    const out: CommissionRow[] = [];

    for (const a of agreements) {
      const released = transactions.filter(
        (t) => t.status === 'released' && t.description?.includes(a.id),
      );
      const explicit = transactions.filter(
        (t) => t.status === 'released' && t.agentCommission > 0 && t.listingTitle === a.listingTitle,
      );

      const base =
        explicit.length > 0
          ? explicit.reduce((s, t) => s + t.amount, 0)
          : released.length > 0
            ? released.reduce((s, t) => s + t.amount, 0)
            : a.rentAmount;

      if (base <= 0) continue;

      const amount = base * 0.05;
      const status: CommissionRow['status'] =
        explicit.some((t) => t.agentCommissionStatus === 'released')
          ? 'paid'
          : explicit.some((t) => t.agentCommissionStatus === 'held') || explicit.length > 0
            ? 'escrow'
            : a.status === 'fully_signed' || a.status === 'landlord_signed'
              ? 'escrow'
              : 'pending';

      out.push({
        id: a.id,
        deal: `${a.type.replace(/_/g, ' ')} — ${a.listingTitle ?? 'Untitled mandate'}`,
        client: a.tenantName ?? a.landlordName ?? '—',
        amount,
        rate: '5%',
        date: a.createdAt,
        status,
        escrowRef: explicit[0]?.reference ?? null,
      });
    }

    return out.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [agreements, transactions]);

  const counts = useMemo(() => {
    const c = { all: rows.length, paid: 0, escrow: 0, pending: 0 };
    for (const r of rows) c[r.status] += 1;
    return c;
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (tab !== 'all' && r.status !== tab) return false;
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (!q) return true;
      return (
        r.deal.toLowerCase().includes(q) ||
        r.client.toLowerCase().includes(q) ||
        (r.escrowRef?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [rows, tab, statusFilter, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const filteredTotal = filtered.reduce((s, r) => s + r.amount, 0);
  const paidTotal = filtered.filter((r) => r.status === 'paid').reduce((s, r) => s + r.amount, 0);
  const escrowTotal = filtered.filter((r) => r.status === 'escrow').reduce((s, r) => s + r.amount, 0);
  const paidPct = filteredTotal > 0 ? (paidTotal / filteredTotal) * 100 : 0;
  const escrowPct = filteredTotal > 0 ? (escrowTotal / filteredTotal) * 100 : 0;

  const exportCsv = () => {
    const header = ['Deal / Mandate', 'Client', 'Rate', 'Amount (NGN)', 'Status', 'Date', 'Escrow Ref'];
    const body = filtered.map((r) => [
      r.deal,
      r.client,
      r.rate,
      r.amount.toFixed(2),
      STATUS_LABEL[r.status],
      r.date,
      r.escrowRef ?? '',
    ]);
    const csv = [header, ...body]
      .map((cols) => cols.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent-commissions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <FinancePage>
      <FinanceHeader
        breadcrumb={['Finance', 'Rent & Payments', 'Brokerage Commissions Ledger']}
        title="Brokerage Commissions & Retainers"
        description="Immutable commission accounting ledger, statutory 5% agency entitlement tracking, and payout status across every mandated conveyancing deal."
        badges={
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--sovereign-hover)] dark:text-[#4edea3]">
            Statutory Ledger
          </span>
        }
        actions={
          <>
            <FinanceButton onClick={() => window.location.reload()}>
              <RefreshCw className="h-3.5 w-3.5" /> Refresh Ledger
            </FinanceButton>
            <Link
              href="/dashboard/agent/pipeline"
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-white/[0.08] dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-white/[0.06]"
            >
              <Briefcase className="h-3.5 w-3.5 text-primary dark:text-[#4edea3]" /> View Deal Pipeline
            </Link>
            <FinanceButton variant="primary" onClick={exportCsv}>
              <Download className="h-3.5 w-3.5" /> Export CSV
            </FinanceButton>
          </>
        }
      />

      {/* Settlement target card */}
      <div className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-3 dark:border-white/[0.08] dark:bg-zinc-900">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary dark:text-[#4edea3]">
          <Landmark className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className={AGENT_FINANCE_LABEL}>Settlement Target</span>
          <span className="font-mono text-sm font-semibold text-zinc-900 dark:text-white">
            Trust wallet · {naira(summary.walletBalance)} available
          </span>
          <span className="flex items-center gap-1 text-xs text-primary dark:text-[#4edea3]">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Auto-disbursement active
          </span>
        </div>
      </div>

      {/* Statutory regulatory pill */}
      <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 md:flex-row md:items-center dark:border-white/[0.08] dark:bg-zinc-800/50">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary dark:text-[#4edea3]">
            <Scale className="h-4 w-4" />
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            <strong className="font-semibold text-zinc-900 dark:text-white">Statutory Agent Commission:</strong>{' '}
            Fixed at 5.0% of transacted deal consideration pursuant to the NIESV Scale of Professional Charges
            and Lagos State Tenancy Law (Cap. L25, 2015).
          </p>
        </div>
        <span className="inline-flex items-center self-end rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-semibold text-[var(--sovereign-hover)] dark:text-[#4edea3] md:self-auto">
          Scale 1A Standard
        </span>
      </div>

      {/* Executive metric cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <FinanceStatCard
          label="Total Commission Entitled"
          value={naira(summary.commissionEntitled)}
          hint={`${summary.commissionCount} settled deal${summary.commissionCount === 1 ? '' : 's'}`}
          tone="primary"
          icon={<Percent className="h-4 w-4" />}
          footer={
            <div className="flex items-center justify-between border-t border-zinc-200 pt-3 dark:border-white/[0.08]">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary dark:text-[#4edea3]">
                <TrendingUp className="h-3.5 w-3.5" /> Live from released deals
              </span>
              <span className="font-mono text-xs text-zinc-600 dark:text-zinc-400">
                {summary.agreementCount} mandates
              </span>
            </div>
          }
        />

        <FinanceStatCard
          label="Disbursed & Realized"
          value={naira(summary.commissionReleased)}
          tone="primary"
          icon={<BadgeCheck className="h-4 w-4" />}
          footer={
            <div className="space-y-2 border-t border-zinc-200 pt-3 dark:border-white/[0.08]">
              <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  NIBSS / Mandate
                </span>
                <span className="font-mono">
                  {counts.paid} batch{counts.paid === 1 ? '' : 'es'}
                </span>
              </div>
              <FinanceProgress value={paidPct} />
            </div>
          }
        />

        <FinanceStatCard
          label="Pending Escrow & Releases"
          value={naira(summary.commissionHeld)}
          tone="amber"
          icon={<Lock className="h-4 w-4" />}
          footer={
            <div className="space-y-2 border-t border-zinc-200 pt-3 dark:border-white/[0.08]">
              <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
                <span className="inline-flex items-center gap-1.5">
                  <Receipt className="h-3.5 w-3.5" /> Awaiting title &amp; consent
                </span>
                <span className="font-mono">{counts.escrow} holds</span>
              </div>
              <FinanceProgress value={escrowPct} tone="amber" />
            </div>
          }
        />
      </div>

      {/* Filter + tabs */}
      <FinanceFilterBar className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <FinanceTabs
          active={tab}
          onChange={(v) => {
            setTab(v);
            setPage(1);
          }}
          tabs={[
            { value: 'all', label: 'All Commissions', count: counts.all },
            { value: 'paid', label: 'Paid Out', count: counts.paid },
            { value: 'escrow', label: 'Pending Escrow', count: counts.escrow },
            { value: 'pending', label: 'Accruing', count: counts.pending },
          ]}
        />
        <div className="flex flex-wrap items-center gap-2">
          <FinanceSearch
            value={query}
            onChange={(v) => {
              setQuery(v);
              setPage(1);
            }}
            placeholder="Search mandate, client or escrow ref..."
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
              { value: 'paid', label: 'Paid Out' },
              { value: 'escrow', label: 'Pending Escrow' },
              { value: 'pending', label: 'Accruing' },
            ]}
            className="min-w-[160px]"
          />
        </div>
      </FinanceFilterBar>

      {/* Ledger table */}
      <FinanceTableWrap>
        {visible.length === 0 ? (
          <FinanceEmptyState
            icon={<Percent className="h-6 w-6" />}
            title="No commissions yet"
            description="Your earnings appear here once a mandate under your agency reaches a released transaction. Commissions accrue at the standard 5% agency rate."
            action={
              <Link
                href="/dashboard/agent/pipeline"
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3.5 text-xs font-medium text-white"
              >
                <Briefcase className="h-3.5 w-3.5" /> View Deal Pipeline
              </Link>
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <FinanceTableHead>
                  <FinanceTh>Deal / Mandate</FinanceTh>
                  <FinanceTh>Client</FinanceTh>
                  <FinanceTh>Escrow Reference</FinanceTh>
                  <FinanceTh align="right">Commission (NGN)</FinanceTh>
                  <FinanceTh>Rate</FinanceTh>
                  <FinanceTh>Status</FinanceTh>
                  <FinanceTh>Date</FinanceTh>
                  <FinanceTh align="center">Actions</FinanceTh>
                </FinanceTableHead>
                <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.06]">
                  {visible.map((r) => (
                    <FinanceTableRow key={r.id}>
                      <FinanceTd>
                        <div className="max-w-[260px] truncate font-semibold text-zinc-900 dark:text-white">
                          {r.deal}
                        </div>
                        <div className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                          {r.id.slice(0, 12).toUpperCase()}
                        </div>
                      </FinanceTd>
                      <FinanceTd>
                        <div className="max-w-[160px] truncate font-medium text-zinc-900 dark:text-white">
                          {r.client}
                        </div>
                      </FinanceTd>
                      <FinanceTd>
                        <span className="font-mono text-[11px] text-zinc-700 dark:text-zinc-300">
                          {r.escrowRef ?? '—'}
                        </span>
                      </FinanceTd>
                      <FinanceTd align="right">
                        <span className="font-mono text-sm font-bold text-primary dark:text-[#4edea3]">
                          {naira(r.amount)}
                        </span>
                      </FinanceTd>
                      <FinanceTd>
                        <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-zinc-700 dark:bg-white/[0.06] dark:text-zinc-300">
                          <Percent className="h-3 w-3" /> {r.rate}
                        </span>
                      </FinanceTd>
                      <FinanceTd>
                        <FinanceStatus tone={STATUS_TONE[r.status]}>
                          {r.status === 'paid' ? <CheckCircle2 className="h-3 w-3" /> : null}
                          {r.status === 'escrow' ? <Lock className="h-3 w-3" /> : null}
                          {r.status === 'pending' ? <Clock className="h-3 w-3" /> : null}
                          {STATUS_LABEL[r.status]}
                        </FinanceStatus>
                      </FinanceTd>
                      <FinanceTd>
                        <span className="whitespace-nowrap text-zinc-600 dark:text-zinc-400">
                          {formatDate(r.date)}
                        </span>
                      </FinanceTd>
                      <FinanceTd align="center">
                        <Link
                          href={`/dashboard/agent/commission-ledger?ref=${encodeURIComponent(r.escrowRef ?? r.id)}`}
                          className="inline-block rounded p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-white/[0.06] dark:hover:text-white"
                          title="View ledger entry"
                        >
                          <Receipt className="h-4 w-4" />
                        </Link>
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
              )} of ${filtered.length} commissions · ${naira(filteredTotal)} total`}
            />
          </>
        )}
      </FinanceTableWrap>

      {/* Footer cross-links */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-white/[0.08] dark:bg-zinc-900">
        <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-600 dark:text-zinc-400">
          <span>
            Entitled:{' '}
            <span className="font-mono font-semibold text-zinc-900 dark:text-white">
              {naira(summary.commissionEntitled)}
            </span>
          </span>
          <span className="text-zinc-300 dark:text-zinc-700">•</span>
          <span>
            Realized:{' '}
            <span className="font-mono font-semibold text-primary dark:text-[#4edea3]">
              {naira(summary.commissionReleased)}
            </span>
          </span>
          <span className="text-zinc-300 dark:text-zinc-700">•</span>
          <span>
            Held:{' '}
            <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
              {naira(summary.commissionHeld)}
            </span>
          </span>
        </div>
        <Link
          href="/dashboard/agent/commission-ledger"
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary dark:text-[#4edea3] hover:underline"
        >
          Open commission ledger <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </FinancePage>
  );
}
