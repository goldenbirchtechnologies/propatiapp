'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Landmark,
  CheckCircle2,
  Clock,
  Download,
  Plus,
  Search,
  Receipt,
  Eye,
  MoreVertical,
  ChevronRight,
  Building2,
  CreditCard,
  ArrowLeftRight,
  RefreshCw,
  Shield,
  FileText,
  AlertTriangle,
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
  formatDate,
  type FinanceStatusTone,
} from '@/components/financials/agent/AgentFinanceUI';
import type { AgentFinanceInvoice, AgentFinanceSummary } from '@/lib/agent-finance-data';

const PAGE_SIZE = 20;

type Props = {
  summary: AgentFinanceSummary;
  invoices: AgentFinanceInvoice[];
};

const STATUS_TONE: Record<string, FinanceStatusTone> = {
  paid: 'success',
  sent: 'pending',
  overdue: 'error',
  draft: 'neutral',
  cancelled: 'neutral',
};

const STATUS_LABEL: Record<string, string> = {
  paid: 'Paid & Cleared',
  sent: 'Awaiting Payment',
  overdue: 'Overdue',
  draft: 'Draft',
  cancelled: 'Cancelled',
};

const TYPE_LABEL: Record<string, string> = {
  rent: 'Rent Demand',
  service: 'Service Charge',
  utility: 'Utility Charge',
  agreement: 'Agreement Fee',
  other: 'Other Demand',
};

export default function AgentInvoicesClient({ summary, invoices }: Props) {
  const [tab, setTab] = useState('all');
  const [query, setQuery] = useState('');
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);

  const propertyOptions = useMemo(() => {
    const titles = new Set(invoices.map((i) => i.listingTitle).filter(Boolean) as string[]);
    return [
      { value: 'all', label: `All Properties (${titles.size})` },
      ...[...titles].map((t) => ({ value: t, label: t })),
    ];
  }, [invoices]);

  const counts = useMemo(() => {
    const c = { all: invoices.length, paid: 0, sent: 0, overdue: 0, other: 0 };
    for (const i of invoices) {
      if (i.status === 'paid') c.paid += 1;
      else if (i.status === 'sent') c.sent += 1;
      else if (i.status === 'overdue') c.overdue += 1;
      else c.other += 1;
    }
    return c;
  }, [invoices]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return invoices.filter((i) => {
      if (tab === 'paid' && i.status !== 'paid') return false;
      if (tab === 'sent' && i.status !== 'sent') return false;
      if (tab === 'overdue' && i.status !== 'overdue') return false;
      if (tab === 'other' && ['paid', 'sent', 'overdue'].includes(i.status)) return false;
      if (typeFilter !== 'all' && i.type !== typeFilter) return false;
      if (propertyFilter !== 'all' && i.listingTitle !== propertyFilter) return false;
      if (!q) return true;
      return (
        i.invoiceNumber.toLowerCase().includes(q) ||
        (i.tenantName?.toLowerCase().includes(q) ?? false) ||
        (i.landlordName?.toLowerCase().includes(q) ?? false) ||
        (i.listingTitle?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [invoices, tab, typeFilter, propertyFilter, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const filteredTotal = filtered.reduce((s, i) => s + i.amount, 0);
  const filteredPaid = filtered.filter((i) => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  const filteredDue = filtered
    .filter((i) => i.status === 'sent' || i.status === 'overdue')
    .reduce((s, i) => s + i.amount, 0);

  const exportCsv = () => {
    const header = [
      'Invoice Ref',
      'Issued',
      'Due',
      'Counterparty',
      'Property',
      'Category',
      'Amount (NGN)',
      'Status',
    ];
    const body = filtered.map((i) => [
      i.invoiceNumber,
      i.createdAt,
      i.dueDate,
      i.tenantName ?? i.landlordName ?? '',
      i.listingTitle ?? '',
      TYPE_LABEL[i.type] ?? i.type,
      i.amount.toFixed(2),
      STATUS_LABEL[i.status] ?? i.status,
    ]);
    const csv = [header, ...body]
      .map((cols) => cols.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent-invoice-ledger-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetFilters = () => {
    setTab('all');
    setQuery('');
    setPropertyFilter('all');
    setTypeFilter('all');
    setPage(1);
  };

  return (
    <FinancePage>
      <FinanceHeader
        breadcrumb={['Agent Portal', 'Finance', 'Invoices & Billing Demands']}
        title="Invoices & Billing Demands"
        description="Escrow-backed demand ledger across every mandate — each invoice issues against a registered property and settles through the platform trust account."
        badges={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Tier-4 Institutional
          </span>
        }
        actions={
          <>
            <FinanceButton onClick={exportCsv}>
              <Download className="h-3.5 w-3.5" /> Export Ledger (CSV/PDF)
            </FinanceButton>
            <FinanceButton variant="primary" onClick={() => setTab('all')}>
              <Plus className="h-3.5 w-3.5" /> Issue New Demand
            </FinanceButton>
          </>
        }
      />

      {/* Compliance strip */}
      <div className="flex flex-col items-start gap-4 rounded-xl border border-zinc-200 bg-white p-5 lg:flex-row lg:items-center dark:border-white/[0.08] dark:bg-zinc-900">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <Shield className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
            NFIU &amp; CAC Compliant Financial Infrastructure
          </h3>
          <p className="mt-0.5 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
            Escrow-backed trust distribution with multi-party settlement ledgers. Invoices issue against your
            registered agent profile and disburse statutory value-added tax automatically.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-300">
            <ArrowLeftRight className="h-3 w-3" /> NIBSS Instant
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-300">
            <CreditCard className="h-3 w-3" /> Corporate Card
          </span>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <FinanceStatCard
          label="Total Invoiced (YTD)"
          value={naira(summary.invoiceTotal)}
          hint={`${summary.invoiceCount} invoice${summary.invoiceCount === 1 ? '' : 's'} on the ledger`}
          tone="primary"
          icon={<Receipt className="h-4 w-4" />}
        />
        <FinanceStatCard
          label="Paid / Cleared"
          value={naira(summary.invoicePaid)}
          tone="primary"
          icon={<CheckCircle2 className="h-4 w-4" />}
          footer={
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {counts.paid} settled · {summary.invoiceTotal > 0 ? ((summary.invoicePaid / summary.invoiceTotal) * 100).toFixed(1) : '0.0'}% of ledger
            </span>
          }
        />
        <FinanceStatCard
          label="Outstanding / Due"
          value={naira(summary.invoiceOutstanding)}
          tone="amber"
          icon={<Clock className="h-4 w-4" />}
          footer={
            <span className="inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-3 w-3" />
              {counts.overdue} overdue · {counts.sent} awaiting payment
            </span>
          }
        />
      </div>

      {/* Filter console */}
      <FinanceFilterBar className="space-y-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <FinanceTabs
            active={tab}
            onChange={(v) => {
              setTab(v);
              setPage(1);
            }}
            tabs={[
              { value: 'all', label: 'All Invoices', count: counts.all },
              { value: 'paid', label: 'Paid & Cleared', count: counts.paid },
              { value: 'sent', label: 'Awaiting Payment', count: counts.sent },
              { value: 'overdue', label: 'Overdue', count: counts.overdue },
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
              placeholder="Search invoice ref, counterparty or property..."
            />
            <FinanceSelect
              ariaLabel="Filter by property"
              value={propertyFilter}
              onChange={(v) => {
                setPropertyFilter(v);
                setPage(1);
              }}
              options={propertyOptions}
              className="min-w-[180px]"
            />
            <FinanceSelect
              ariaLabel="Filter by category"
              value={typeFilter}
              onChange={(v) => {
                setTypeFilter(v);
                setPage(1);
              }}
              options={[
                { value: 'all', label: 'All Categories' },
                { value: 'rent', label: 'Rent Demand' },
                { value: 'service', label: 'Service Charge' },
                { value: 'utility', label: 'Utility Charge' },
                { value: 'agreement', label: 'Agreement Fee' },
                { value: 'other', label: 'Other Demand' },
              ]}
              className="min-w-[160px]"
            />
            <FinanceButton variant="ghost" onClick={resetFilters} title="Reset filters">
              <RefreshCw className="h-3.5 w-3.5" />
            </FinanceButton>
          </div>
        </div>
      </FinanceFilterBar>

      {/* Invoice table */}
      <FinanceTableWrap>
        {visible.length === 0 ? (
          <FinanceEmptyState
            icon={<FileText className="h-6 w-6" />}
            title="No invoices found"
            description={
              invoices.length === 0
                ? 'Invoices appear here when a rent, service or agreement demand is raised against a mandate under your agency.'
                : 'No invoices match the current filters. Clear the filters to see the full demand ledger.'
            }
            action={
              invoices.length === 0 ? (
                <Link
                  href="/dashboard/agent/pipeline"
                  className="inline-flex h-9 items-center gap-2 rounded-lg bg-emerald-600 px-3.5 text-xs font-medium text-white"
                >
                  <Building2 className="h-3.5 w-3.5" /> View deal pipeline
                </Link>
              ) : (
                <FinanceButton variant="primary" onClick={resetFilters}>
                  <RefreshCw className="h-3.5 w-3.5" /> Reset filters
                </FinanceButton>
              )
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <FinanceTableHead>
                  <FinanceTh>Invoice Ref</FinanceTh>
                  <FinanceTh>Dates (Issued / Due)</FinanceTh>
                  <FinanceTh>Counterparty / Billed To</FinanceTh>
                  <FinanceTh>Property / Mandate</FinanceTh>
                  <FinanceTh>Category &amp; Duty</FinanceTh>
                  <FinanceTh align="right">Amount (NGN)</FinanceTh>
                  <FinanceTh>Status</FinanceTh>
                  <FinanceTh align="center">Disbursement / Action</FinanceTh>
                </FinanceTableHead>
                <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.06]">
                  {visible.map((i) => {
                    const overdue =
                      i.status === 'overdue' ||
                      (i.status === 'sent' && new Date(i.dueDate).getTime() < Date.now());
                    return (
                      <FinanceTableRow key={i.id}>
                        <FinanceTd>
                          <div className="font-mono font-semibold text-zinc-900 dark:text-white">
                            {i.invoiceNumber}
                          </div>
                          <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                            {i.id.slice(0, 12).toUpperCase()}
                          </div>
                        </FinanceTd>
                        <FinanceTd>
                          <div className="whitespace-nowrap text-zinc-700 dark:text-zinc-300">
                            {formatDate(i.createdAt)}
                          </div>
                          <div
                            className={
                              overdue
                                ? 'whitespace-nowrap text-[11px] font-semibold text-red-600 dark:text-red-400'
                                : 'whitespace-nowrap text-[11px] text-zinc-500 dark:text-zinc-400'
                            }
                          >
                            Due {formatDate(i.dueDate)}
                          </div>
                        </FinanceTd>
                        <FinanceTd>
                          <div className="max-w-[180px] truncate font-medium text-zinc-900 dark:text-white">
                            {i.tenantName ?? i.landlordName ?? '—'}
                          </div>
                          <div className="max-w-[180px] truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                            {i.landlordName && i.tenantName ? `Landlord: ${i.landlordName}` : 'Tenant'}
                          </div>
                        </FinanceTd>
                        <FinanceTd>
                          <div className="max-w-[180px] truncate text-zinc-700 dark:text-zinc-300">
                            {i.listingTitle ?? '—'}
                          </div>
                        </FinanceTd>
                        <FinanceTd>
                          <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold text-zinc-700 dark:bg-white/[0.06] dark:text-zinc-300">
                            {TYPE_LABEL[i.type] ?? i.type}
                          </span>
                        </FinanceTd>
                        <FinanceTd align="right">
                          <span className="font-mono text-sm font-bold text-zinc-900 dark:text-white">
                            {naira(i.amount)}
                          </span>
                        </FinanceTd>
                        <FinanceTd>
                          <FinanceStatus tone={overdue ? 'error' : (STATUS_TONE[i.status] ?? 'neutral')}>
                            {i.status === 'paid' ? <CheckCircle2 className="h-3 w-3" /> : null}
                            {i.status === 'sent' ? <Clock className="h-3 w-3" /> : null}
                            {overdue ? <AlertTriangle className="h-3 w-3" /> : null}
                            {overdue && i.status !== 'overdue' ? 'Overdue' : (STATUS_LABEL[i.status] ?? i.status)}
                          </FinanceStatus>
                        </FinanceTd>
                        <FinanceTd align="center">
                          <div className="inline-flex items-center gap-1">
                            {i.pdfUrl ? (
                              <a
                                href={i.pdfUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-white/[0.06] dark:hover:text-white"
                                title="View invoice PDF"
                              >
                                <Eye className="h-4 w-4" />
                              </a>
                            ) : (
                              <span
                                className="rounded p-1.5 text-zinc-300 dark:text-zinc-700"
                                title="No PDF attached"
                              >
                                <Eye className="h-4 w-4" />
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={exportCsv}
                              className="rounded p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-white/[0.06] dark:hover:text-white"
                              title="Export ledger"
                            >
                              <Receipt className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={exportCsv}
                              className="rounded p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-white/[0.06] dark:hover:text-white"
                              title="More actions"
                            >
                              <MoreVertical className="h-4 w-4" />
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
              )} of ${filtered.length} invoices · ${naira(filteredTotal)} invoiced · ${naira(
                filteredPaid,
              )} paid · ${naira(filteredDue)} due`}
            />
          </>
        )}
      </FinanceTableWrap>

      {/* Footer totals */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-white/[0.08] dark:bg-zinc-900">
        <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-600 dark:text-zinc-400">
          <span>
            Invoiced:{' '}
            <span className="font-mono font-semibold text-zinc-900 dark:text-white">
              {naira(summary.invoiceTotal)}
            </span>
          </span>
          <span className="text-zinc-300 dark:text-zinc-700">•</span>
          <span>
            Paid:{' '}
            <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
              {naira(summary.invoicePaid)}
            </span>
          </span>
          <span className="text-zinc-300 dark:text-zinc-700">•</span>
          <span>
            Due:{' '}
            <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
              {naira(summary.invoiceOutstanding)}
            </span>
          </span>
        </div>
        <Link
          href="/dashboard/agent/statements"
          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          View financial statements <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
    </FinancePage>
  );
}
