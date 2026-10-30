'use client';

import { useMemo, useState } from 'react';
import {
  Archive,
  BadgeCheck,
  ChevronDown,
  Columns3,
  Download,
  FileText,
  History,
  Landmark,
  MailCheck,
  ReceiptText,
  Search,
  Tag,
  TrendingUp,
  TriangleAlert,
  Wallet,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ReconStatus = 'SETTLED' | 'PARTIAL' | 'ARREARS';
type Portfolio = 'ALL' | 'IKOYI' | 'VI' | 'LEKKI';

interface StatementRow {
  id: string;
  tenant: string;
  email: string;
  property: string;
  unit: string;
  ref: string;
  baseRent: number;
  serviceCharge: number;
  arrears: number;
  totalPaid: number;
  status: ReconStatus;
  portfolio: Exclude<Portfolio, 'ALL'>;
}

const PORTFOLIO_LABELS: Record<Exclude<Portfolio, 'ALL'>, string> = {
  IKOYI: 'Ikoyi Prime Enclave',
  VI: 'Victoria Island Commercial',
  LEKKI: 'Lekki Phase 1 Residential',
};

const ROWS: StatementRow[] = [
  { id: '1', tenant: 'Adeola & Co Chambers', email: 'adeola@adeolalaw.ng', property: 'Sovereign Crest', unit: 'Penthouse A', ref: 'SC-401', baseRent: 32500000, serviceCharge: 4800000, arrears: 0, totalPaid: 37300000, status: 'SETTLED', portfolio: 'IKOYI' },
  { id: '2', tenant: 'Nexus Wave Tech Ltd', email: 'billing@nexuswave.com', property: 'Marina Plaza', unit: 'Floor 4', ref: 'MP-04B', baseRent: 24000000, serviceCharge: 3500000, arrears: 0, totalPaid: 27500000, status: 'SETTLED', portfolio: 'VI' },
  { id: '3', tenant: 'Odujinrin & Equities', email: 'ops@odujinrin-spv.ng', property: 'Victoria Haven', unit: 'Suite 108', ref: 'VH-108', baseRent: 18000000, serviceCharge: 2100000, arrears: 3150000, totalPaid: 16950000, status: 'ARREARS', portfolio: 'VI' },
  { id: '4', tenant: 'Bello Architects Nig.', email: 'info@bello-studio.com', property: 'The Lennox', unit: 'Wing C', ref: 'LX-302', baseRent: 16000000, serviceCharge: 2400000, arrears: 0, totalPaid: 18400000, status: 'SETTLED', portfolio: 'LEKKI' },
  { id: '5', tenant: 'Tarkwa Advisory Group', email: 'finance@tarkwa.ng', property: 'Ikoyi Waterside', unit: 'Suite 204', ref: 'IW-204', baseRent: 21000000, serviceCharge: 3200000, arrears: 1500000, totalPaid: 22700000, status: 'PARTIAL', portfolio: 'IKOYI' },
  { id: '6', tenant: 'Cardinal Stone Partners', email: 'accounts@cardinalstone.ng', property: 'Marina Plaza', unit: 'Floor 2', ref: 'MP-02A', baseRent: 19500000, serviceCharge: 2900000, arrears: 0, totalPaid: 22400000, status: 'SETTLED', portfolio: 'VI' },
  { id: '7', tenant: 'Halogen Securities Ltd', email: 'billing@halogen.ng', property: 'Lekki Pearl Estate', unit: 'Block D', ref: 'LP-D11', baseRent: 12500000, serviceCharge: 1800000, arrears: 800000, totalPaid: 13500000, status: 'PARTIAL', portfolio: 'LEKKI' },
  { id: '8', tenant: 'Primrose Development Co', email: 'finance@primrose.ng', property: 'Sovereign Crest', unit: 'Floor 9', ref: 'SC-902', baseRent: 28000000, serviceCharge: 4100000, arrears: 0, totalPaid: 32100000, status: 'SETTLED', portfolio: 'IKOYI' },
];

const STATUS_META: Record<ReconStatus, { label: string; pill: string; dot: string }> = {
  SETTLED: {
    label: 'Fully Settled',
    pill: 'bg-primary/10 text-primary dark:text-[#4edea3]',
    dot: 'bg-primary',
  },
  PARTIAL: {
    label: 'Grace Period',
    pill: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
    dot: 'bg-amber-500',
  },
  ARREARS: {
    label: 'Overdue Notice',
    pill: 'bg-red-500/10 text-red-600 dark:text-red-400',
    dot: 'bg-red-500',
  },
};

const PRESETS = ['Current MTD', 'Last Month', 'Q3 Consolidated', 'Custom Range'] as const;
const PAGE_SIZE = 5;

function naira(value: number): string {
  return `₦${value.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function initials(name: string): string {
  const parts = name.replace(/[^A-Za-z& ]/g, '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '—';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function EstateManagerStatementsClient() {
  const [month, setMonth] = useState('November 2024 (Closed)');
  const [year, setYear] = useState('2024 FY');
  const [portfolio, setPortfolio] = useState<Portfolio>('ALL');
  const [preset, setPreset] = useState<(typeof PRESETS)[number]>('Current MTD');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ReconStatus>('ALL');
  const [page, setPage] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null);

  function notify(title: string, message: string) {
    setToast({ title, message });
    window.clearTimeout((notify as unknown as { timer?: number }).timer);
    (notify as unknown as { timer?: number }).timer = window.setTimeout(() => setToast(null), 4000);
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ROWS.filter((row) => {
      if (portfolio !== 'ALL' && row.portfolio !== portfolio) return false;
      if (statusFilter !== 'ALL' && row.status !== statusFilter) return false;
      if (!q) return true;
      return [row.tenant, row.email, row.unit, row.ref, row.property]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [search, statusFilter, portfolio]);

  const totals = useMemo(() => {
    const scope = portfolio === 'ALL' ? ROWS : ROWS.filter((r) => r.portfolio === portfolio);
    const rent = scope.reduce((sum, r) => sum + r.baseRent, 0);
    const service = scope.reduce((sum, r) => sum + r.serviceCharge, 0);
    const arrears = scope.reduce((sum, r) => sum + r.arrears, 0);
    const managementFee = Math.round(rent * 0.05);
    const withholding = Math.round(rent * 0.025);
    return { rent, service, arrears, net: rent + service - managementFee - withholding };
  }, [portfolio]);

  const statusCounts = useMemo(() => {
    const scope = portfolio === 'ALL' ? ROWS : ROWS.filter((r) => r.portfolio === portfolio);
    return {
      ALL: scope.length,
      SETTLED: scope.filter((r) => r.status === 'SETTLED').length,
      PARTIAL: scope.filter((r) => r.status === 'PARTIAL').length,
      ARREARS: scope.filter((r) => r.status === 'ARREARS').length,
    };
  }, [portfolio]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function handleFilterChange(next: Portfolio | 'ALL' | ReconStatus, kind: 'portfolio' | 'status') {
    setPage(1);
    if (kind === 'portfolio') setPortfolio(next as Portfolio);
    else setStatusFilter(next as 'ALL' | ReconStatus);
  }

  function handleGenerate() {
    if (generating) return;
    setGenerating(true);
    window.setTimeout(() => {
      setGenerating(false);
      notify('Institutional Statement Compiled', 'STMT-2024-11-EM902 downloaded in certified format.');
    }, 1200);
  }

  return (
    <div className="w-full space-y-6">
      <div
        aria-live="polite"
        className={cn(
          'fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl px-4 py-3 shadow-xl transition-all duration-300',
          'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900',
          toast ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-24 opacity-0'
        )}
      >
        <BadgeCheck className="h-5 w-5 text-primary" />
        <div className="flex flex-col">
          <span className="text-sm font-semibold">{toast?.title ?? ''}</span>
          <span className="text-xs opacity-70">{toast?.message ?? ''}</span>
        </div>
      </div>

      <header className="flex flex-col justify-between gap-6 border-b border-zinc-200 pb-6 dark:border-white/[0.08] lg:flex-row lg:items-end">
        <div className="flex max-w-2xl flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            <span className="transition-colors hover:text-primary">Home</span>
            <span>/</span>
            <span className="transition-colors hover:text-primary">Rent &amp; Payments</span>
            <span>/</span>
            <span className="text-zinc-900 dark:text-white">Monthly Statements</span>
            <span className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-0.5 normal-case tracking-normal dark:bg-zinc-800">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              <span className="font-mono text-[11px]">Engine Active • Audited via NIBSS/Paystack</span>
            </span>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Monthly Statements</h1>
            <span className="rounded bg-zinc-100 px-2 py-0.5 font-mono text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              v3.8-rel
            </span>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Generate, review, and download institutional rent, service charge, and arrears account statements
            across managed portfolios with Evidence Act 2011 cryptographic clearance.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={() => notify('Archive Package Exported', `Batch ZIP contains ${filtered.length} verified PDF tenant schedules.`)}
            className="flex h-10 items-center gap-2 rounded-lg bg-zinc-100 px-4 text-sm font-medium text-zinc-900 shadow-sm transition-all hover:bg-zinc-200 active:scale-95 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
          >
            <Archive className="h-4 w-4 text-zinc-500" />
            <span>Batch Export All (ZIP)</span>
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary active:scale-95 disabled:opacity-75"
          >
            <FileText className="h-4 w-4" />
            <span>{generating ? 'Compiling Statement…' : 'Generate Statement (PDF)'}</span>
          </button>
        </div>
      </header>

      <section className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-zinc-900">
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
          <div className="flex flex-wrap items-center gap-3">
            <label className="relative">
              <span className="sr-only">Statement month</span>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="h-10 cursor-pointer appearance-none rounded-lg bg-zinc-100 pl-3 pr-9 text-sm font-semibold text-zinc-900 focus:bg-zinc-200 focus:outline-none dark:bg-zinc-800 dark:text-white"
              >
                <option>November 2024 (Closed)</option>
                <option>October 2024</option>
                <option>September 2024</option>
                <option>August 2024</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-5 w-5 text-zinc-500" />
            </label>
            <label className="relative">
              <span className="sr-only">Fiscal year</span>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="h-10 cursor-pointer appearance-none rounded-lg bg-zinc-100 pl-3 pr-8 text-sm font-semibold text-zinc-900 focus:bg-zinc-200 focus:outline-none dark:bg-zinc-800 dark:text-white"
              >
                <option>2024 FY</option>
                <option>2023 FY</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-5 w-5 text-zinc-500" />
            </label>
            <label className="relative min-w-[260px]">
              <span className="sr-only">Portfolio</span>
              <select
                value={portfolio}
                onChange={(e) => handleFilterChange(e.target.value as Portfolio, 'portfolio')}
                className="h-10 w-full cursor-pointer appearance-none rounded-lg bg-zinc-100 pl-3 pr-8 text-sm font-semibold text-zinc-900 focus:bg-zinc-200 focus:outline-none dark:bg-zinc-800 dark:text-white"
              >
                <option value="ALL">All Portfolios (Ikoyi, VI, Lekki Phase 1)</option>
                <option value="IKOYI">Ikoyi Prime Enclave (4 Properties)</option>
                <option value="VI">Victoria Island Commercial (6 Properties)</option>
                <option value="LEKKI">Lekki Phase 1 Residential (8 Properties)</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-5 w-5 text-zinc-500" />
            </label>
          </div>
          <div className="flex items-center gap-3 self-start xl:self-auto">
            <div className="flex items-center gap-2 rounded-lg bg-zinc-100 px-3 py-1.5 font-mono text-sm text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              <Tag className="h-4 w-4 text-zinc-500" />
              <span>
                MANDATE: <strong className="text-zinc-900 dark:text-white">STMT-2024-11-EM902</strong>
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary dark:text-[#4edea3]">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Auto-Generated
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 pt-3 dark:border-white/[0.08]">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-xs font-semibold uppercase text-zinc-500">Presets:</span>
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setPreset(p);
                  notify('Statement Scope Adjusted', `Loaded statement parameters for: ${p}.`);
                }}
                className={cn(
                  'rounded-md px-3 py-1 text-xs font-medium transition-all',
                  preset === p
                    ? 'bg-primary text-white'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
                )}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <History className="h-3.5 w-3.5" />
            <span>Reconciliation Sync: Today at 04:30 WAT</span>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-white/[0.08] dark:bg-zinc-900">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Total Rent Collected</span>
              <span className="mt-1 font-mono text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                {naira(totals.rent)}
              </span>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-primary dark:bg-zinc-800">
              <Landmark className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-3 dark:border-white/[0.08]">
            <div className="flex items-center gap-1 font-mono text-xs text-primary">
              <TrendingUp className="h-3.5 w-3.5 font-bold" />
              <span>+8.2% vs prev. month</span>
            </div>
            <span className="text-xs text-zinc-500">100% Verified Settled</span>
          </div>
        </div>
        <div className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-white/[0.08] dark:bg-zinc-900">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Service Charges Collected</span>
              <span className="mt-1 font-mono text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                {naira(totals.service)}
              </span>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-primary dark:bg-zinc-800">
              <Zap className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-3 dark:border-white/[0.08]">
            <span className="text-xs text-zinc-600 dark:text-zinc-400">Diesel Escrow / FM Pool</span>
            <span className="font-mono text-xs text-primary">96.4% Recovery</span>
          </div>
        </div>
        <div className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-white/[0.08] dark:bg-zinc-900">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Outstanding Arrears</span>
              <span className="mt-1 font-mono text-2xl font-semibold tracking-tight text-red-600 dark:text-red-400">
                {naira(totals.arrears)}
              </span>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10 text-red-600 dark:text-red-400">
              <TriangleAlert className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-3 dark:border-white/[0.08]">
            <span className="text-xs text-zinc-500">
              {filtered.filter((r) => r.status !== 'SETTLED').length} delinquent units
            </span>
            <span className="rounded bg-red-500/10 px-2 py-0.5 text-xs font-semibold text-red-600 dark:text-red-400">
              Legal Notices Out
            </span>
          </div>
        </div>
        <div className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-white/[0.08] dark:bg-zinc-900">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Net Escrow Settlement</span>
              <span className="mt-1 font-mono text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                {naira(totals.net)}
              </span>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-primary dark:bg-zinc-800">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-3 dark:border-white/[0.08]">
            <span className="text-xs text-zinc-500">Less 5% EM + 2.5% WHT</span>
            <span className="font-mono text-xs text-primary">NIBSS Ready</span>
          </div>
        </div>
      </section>

      <section className="flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-zinc-900">
        <div className="flex flex-col justify-between gap-4 border-b border-zinc-200 p-5 dark:border-white/[0.08] md:flex-row md:items-center">
          <div className="relative w-full max-w-md flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search tenant, unit, or agreement ref…"
              className="h-10 w-full rounded-lg bg-zinc-100 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-500 focus:bg-zinc-200 focus:outline-none dark:bg-zinc-800 dark:text-white"
            />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
              {(['ALL', 'SETTLED', 'PARTIAL', 'ARREARS'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleFilterChange(s, 'status')}
                  className={cn(
                    'rounded px-2.5 py-1 text-xs font-medium',
                    statusFilter === s
                      ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-white'
                      : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                  )}
                >
                  {s === 'ALL' ? `All (${statusCounts.ALL})` : `${STATUS_META[s].label.split(' ')[0]} (${statusCounts[s]})`}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => notify('Custom Fields Filter', 'Column configuration preserved for Lagos Real Estate SPV schema.')}
              className="flex h-9 items-center gap-1.5 rounded-lg bg-zinc-100 px-3 text-xs font-medium text-zinc-900 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
            >
              <Columns3 className="h-4 w-4 text-zinc-500" />
              <span>Columns</span>
            </button>
          </div>
        </div>

        {pageRows.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500 dark:bg-zinc-800">
              <Archive className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">No Statements Found</h3>
            <p className="mt-1 max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
              There are no matching tenant ledger records for the selected period or portfolio filter query.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setStatusFilter('ALL');
                setPortfolio('ALL');
                setPage(1);
              }}
              className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:border-white/[0.08] dark:bg-zinc-800/50">
                  <th className="px-5 py-3">Tenant &amp; Contact</th>
                  <th className="px-4 py-3">Property &amp; Unit</th>
                  <th className="px-4 py-3 text-right">Base Rent</th>
                  <th className="px-4 py-3 text-right">Service Chg</th>
                  <th className="px-4 py-3 text-right">Arrears / Bal</th>
                  <th className="px-4 py-3 text-right">Total Paid</th>
                  <th className="px-4 py-3 text-center">Reconciliation</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 text-sm text-zinc-900 dark:divide-white/[0.08] dark:text-white">
                {pageRows.map((row) => (
                  <tr key={row.id} className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-full font-mono text-xs font-semibold',
                            row.status === 'ARREARS'
                              ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                              : row.status === 'PARTIAL'
                                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                                : 'bg-zinc-100 text-primary dark:bg-zinc-800 dark:text-[#4edea3]'
                          )}
                        >
                          {initials(row.tenant)}
                        </div>
                        <div className="flex min-w-0 flex-col">
                          <span className="truncate text-sm font-semibold">{row.tenant}</span>
                          <span className="truncate text-xs text-zinc-500">{row.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">{row.property}</span>
                        <span className="text-xs text-zinc-500">
                          {row.unit} • Ref #{row.ref}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono">{naira(row.baseRent)}</td>
                    <td className="px-4 py-3.5 text-right font-mono">{naira(row.serviceCharge)}</td>
                    <td className={cn('px-4 py-3.5 text-right font-mono', row.arrears > 0 ? 'font-semibold text-red-600 dark:text-red-400' : 'text-zinc-500')}>
                      {naira(row.arrears)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-semibold text-primary">
                      {naira(row.totalPaid)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold', STATUS_META[row.status].pill)}>
                        <span className={cn('h-1.5 w-1.5 rounded-full', STATUS_META[row.status].dot)} />
                        {STATUS_META[row.status].label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          title="Download Single PDF"
                          onClick={() => notify('Downloading PDF', `${row.tenant} statement downloaded.`)}
                          className="rounded p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-primary dark:hover:bg-zinc-800"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          title="View Ledger"
                          onClick={() => notify('Ledger Record', `Navigating to unit ${row.ref} real-time escrow ledger.`)}
                          className="rounded p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
                        >
                          <ReceiptText className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-col items-center justify-between gap-3 bg-zinc-50 p-4 text-xs text-zinc-500 dark:bg-zinc-800/40 sm:flex-row">
          <div className="flex items-center gap-1.5">
            <span>
              Showing {pageRows.length} of {filtered.length} reconciled property lease ledgers
              {portfolio !== 'ALL' ? ` • ${PORTFOLIO_LABELS[portfolio]}` : ''}
            </span>
            <span>•</span>
            <span className="font-medium text-primary">All bank settlements cleared</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded bg-white px-2.5 py-1 text-zinc-900 hover:bg-zinc-200 disabled:opacity-40 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
            >
              Previous
            </button>
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPage(n)}
                className={cn(
                  'rounded px-2.5 py-1',
                  n === safePage
                    ? 'bg-primary text-white'
                    : 'bg-white text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700'
                )}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              disabled={safePage >= pageCount}
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              className="rounded bg-white px-2.5 py-1 text-zinc-900 hover:bg-zinc-200 disabled:opacity-40 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      <section className="relative flex flex-col justify-between gap-6 overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-zinc-900 lg:flex-row lg:items-center">
        <div className="flex max-w-2xl items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary dark:text-[#4edea3]">
            <BadgeCheck className="h-6 w-6" />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h4 className="text-base font-semibold text-zinc-900 dark:text-white">Digital Compliance &amp; Statutory Seal</h4>
              <span className="rounded bg-zinc-100 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                Section 84 Evidence Act 2011
              </span>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              This automated statement batch incorporates cryptographic time-stamps and FIRS e-invoicing
              reference reconciliation. Valid for Nigerian judicial proceedings and audit disclosure.
            </p>
            <div className="flex items-center gap-2 pt-1 font-mono text-xs text-zinc-500">
              <span>Digital Audit Hash:</span>
              <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-[11px] text-zinc-900 dark:bg-zinc-800 dark:text-white">
                SHA-256: e8f9c12b7044a1e94b12c58e80112
              </code>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => notify('SPV Transmission Initialized', 'Cryptographically sealed ledger transmitted to Landlord SPV trustees via encrypted mailbox.')}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-zinc-100 px-5 text-sm font-medium text-zinc-900 transition-all hover:bg-zinc-200 sm:w-auto dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
          >
            <MailCheck className="h-4 w-4" />
            <span>Sign &amp; Email to Landlord SPV</span>
          </button>
        </div>
      </section>
    </div>
  );
}
