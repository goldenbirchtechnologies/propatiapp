'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  Percent,
  Download,
  RefreshCw,
  Building2,
  Home,
  Receipt,
  Car,
  Wrench,
  Zap,
  ShieldCheck,
  Settings,
  ArrowRight,
  Landmark,
  AlertCircle,
} from 'lucide-react';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { useActiveOrganization, useActiveOrganizationId } from '@/contexts/ActiveOrganizationContext';
import { NoOrgState } from '@/components/organizations/NoOrgState';

// ─── Response shape from GET /api/dashboard/estate-manager/financials ───
interface PL {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  margin: number;
  revenueBreakdown: Array<{ label: string; amount: number }>;
  expenseBreakdown: Array<{ label: string; amount: number }>;
  monthlyTrend: Array<{ month: string; revenue: number; expenses: number; profit: number }>;
  unitCount: number;
  occupiedUnits: number;
  pendingPayments: number;
  pendingPaymentsAmount: number;
  hasData: boolean;
}

// ─── Icons + accent per real backend label ───
const REVENUE_META: Record<string, { icon: typeof Building2 }> = {
  'Rental Income': { icon: Home },
  'Service Charges': { icon: Receipt },
  'Other Income': { icon: Car },
};

const EXPENSE_META: Record<string, { icon: typeof Wrench }> = {
  Maintenance: { icon: Wrench },
  Utilities: { icon: Zap },
  Salaries: { icon: ShieldCheck },
  Insurance: { icon: Landmark },
  'Other Expenses': { icon: Settings },
};

// ─── Formatting ───
function ngn(amount: number): string {
  return `₦${Math.round(amount).toLocaleString('en-NG')}`;
}

function compactNgn(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (abs >= 1e9) return `${sign}₦${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${sign}₦${(abs / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${sign}₦${(abs / 1e3).toFixed(1)}k`;
  return `${sign}₦${Math.round(abs)}`;
}

// ─── Style primitives (bichrome light/dark, emerald accent) ───
const CARD = 'rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900';
const SECTION_CARD = 'rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900';
const LABEL = 'text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400';
const MUTED = 'text-xs text-zinc-500 dark:text-zinc-400';

function KpiSkeleton() {
  return (
    <div className={`${CARD} space-y-4`} aria-busy="true">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-3 w-full" />
    </div>
  );
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-zinc-200 dark:bg-zinc-800 ${className ?? ''}`} />;
}

function EmptyRow({ label }: { label: string }) {
  return (
    <tr>
      <td colSpan={3} className="py-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
        No {label.toLowerCase()} recorded for this organization.
      </td>
    </tr>
  );
}

export default function EstateManagerFinancialsPage() {
  const { organization, loading: orgLoading } = useActiveOrganization();
  const { orgId } = useActiveOrganizationId();

  const [pl, setPl] = useState<PL | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<'6m' | '1y'>('6m');
  const [syncing, setSyncing] = useState(false);

  const load = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/dashboard/estate-manager/financials', { cache: 'no-store' });
      if (!res.ok) throw new Error(`Failed to load financials (${res.status})`);
      const json = await res.json();
      if (json?.noOrg) {
        setPl(null);
        return;
      }
      setPl(json?.pl ?? null);
    } catch (e) {
      setError((e as Error).message ?? 'Could not load financials');
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    if (orgId) load();
    else if (!orgLoading) setLoading(false);
  }, [orgId, orgLoading, load]);

  // "Sync" re-reads the ledger; no external sync target exists in the backend.
  const handleSync = async () => {
    setSyncing(true);
    await load();
    setTimeout(() => setSyncing(false), 600);
  };

  if (orgLoading || loading) {
    return (
      <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Estate Manager">
        <div className="mx-auto w-full max-w-[1240px] space-y-8" aria-busy="true">
          <Skeleton className="h-9 w-56" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)}
          </div>
          <Skeleton className="h-72 w-full" />
        </div>
      </DashboardShell>
    );
  }

  if (!organization || !orgId) {
    return (
      <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Estate Manager">
        <NoOrgState
          title="No Organization"
          description="Financials are scoped to an organization. Create one to track revenue, expenses, and yield."
          actionLabel="Create Organization"
          actionHref="/dashboard/estate-manager/organizations/new"
        />
      </DashboardShell>
    );
  }

  if (error) {
    return (
      <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Estate Manager">
        <div className="mx-auto w-full max-w-md rounded-xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900/50 dark:bg-red-950/30">
          <AlertCircle className="mx-auto h-8 w-8 text-red-500" />
          <p className="mt-3 text-sm font-semibold text-zinc-900 dark:text-white">Could not load financials</p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{error}</p>
          <button
            onClick={load}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Retry
          </button>
        </div>
      </DashboardShell>
    );
  }

  const revenue = pl?.totalRevenue ?? 0;
  const expenses = pl?.totalExpenses ?? 0;
  const netProfit = pl?.netProfit ?? 0;
  const margin = pl?.margin ?? 0;

  const revenueRows = (pl?.revenueBreakdown ?? []).filter((r) => r.amount > 0);
  const expenseRows = (pl?.expenseBreakdown ?? []).filter((r) => r.amount > 0);

  const trend = range === '6m' ? (pl?.monthlyTrend ?? []).slice(-6) : (pl?.monthlyTrend ?? []);
  // Chart scale is derived from the data, not a fixed ₦30M grid.
  const maxVal = Math.max(1, ...trend.flatMap((m) => [m.revenue, m.expenses]));
  const gridLines = [maxVal, maxVal * 0.66, maxVal * 0.33, 0];

  const pct = (part: number, whole: number) => (whole > 0 ? (part / whole) * 100 : 0);

  const BreakdownTable = ({
    title,
    rows,
    total,
    totalLabel,
    meta,
    tone,
    action,
  }: {
    title: string;
    rows: Array<{ label: string; amount: number }>;
    total: number;
    totalLabel: string;
    meta: Record<string, { icon: typeof Building2 }>;
    tone: 'emerald' | 'rose';
    action?: React.ReactNode;
  }) => {
    const accent = tone === 'emerald' ? 'text-primary dark:text-[#4edea3]' : 'text-rose-600 dark:text-rose-400';
    const bar = tone === 'emerald' ? 'bg-primary' : 'bg-rose-500';
    const dot = tone === 'emerald' ? 'bg-primary' : 'bg-rose-500';
    return (
      <div className={`${SECTION_CARD} flex flex-col justify-between`}>
        <div>
          <div className="mb-4 flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
              <h3 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">{title}</h3>
            </div>
            {action}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className={`border-b border-zinc-200 text-[11px] font-semibold uppercase tracking-wider dark:border-zinc-800 ${LABEL}`}>
                  <th className="pb-3 font-semibold">{title === 'Revenue Sources' ? 'Source' : 'Category'}</th>
                  <th className="pb-3 text-right font-semibold">Amount (NGN)</th>
                  <th className="pb-3 pl-6 text-right font-semibold">Share %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
                {rows.length === 0 ? (
                  <EmptyRow label={title} />
                ) : (
                  rows.map((r) => {
                    const Icon = meta[r.label]?.icon ?? Building2;
                    const share = pct(r.amount, total);
                    return (
                      <tr key={r.label} className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                        <td className="py-3.5 pr-2 font-medium text-zinc-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <Icon className={`h-[18px] w-[18px] ${accent}`} />
                            <span>{r.label}</span>
                          </div>
                        </td>
                        <td className={`py-3.5 text-right font-mono font-semibold ${accent}`}>
                          {ngn(r.amount)}
                          <span className="text-[11px] font-normal text-zinc-500 dark:text-zinc-400">.00</span>
                        </td>
                        <td className="py-3.5 pl-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="font-mono font-medium text-zinc-900 dark:text-white">{share.toFixed(1)}%</span>
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                              <div className={`h-full rounded-full ${bar}`} style={{ width: `${share}%` }} />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-3 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          <span>{totalLabel}</span>
          <span className="font-mono font-bold text-zinc-900 dark:text-white">{ngn(total)}.00</span>
        </div>
      </div>
    );
  };

  return (
    <DashboardShell
      navigation={ESTATE_MANAGER_NAVIGATION}
      userRole="estate_manager"
      userName="Estate Manager"
    >
      <main className="mx-auto w-full max-w-[1240px] p-6 lg:p-10">
        {/* Header */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-primary dark:text-[#4edea3]">
                Portfolio Intelligence
              </span>
              <span className="text-zinc-400">•</span>
              <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                {organization.name}
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Financials</h1>
            <p className="max-w-xl text-sm text-zinc-500 dark:text-zinc-400">
              Profit and loss summary, yield efficiency, and revenue-to-expense allocations across your managed titles.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
              {(['6m', '1y'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
                    range === r
                      ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-white'
                      : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                  }`}
                >
                  {r.toUpperCase()}
                </button>
              ))}
            </div>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-sm font-medium text-zinc-700 shadow-sm transition-all hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <RefreshCw className={`h-[18px] w-[18px] text-zinc-400 ${syncing ? 'animate-spin' : ''}`} />
              Sync
            </button>
          </div>
        </div>

        {/* KPI grid */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {/* Revenue */}
          <div className={`${CARD} relative flex flex-col justify-between overflow-hidden`}>
            <div className="pointer-events-none absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-primary/5 blur-xl" />
            <div className="mb-4 flex items-center justify-between">
              <span className={LABEL}>Total Revenue</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--sovereign-container-bg)] text-primary dark:bg-primary/10 dark:text-[#4edea3]">
                <Wallet className="h-5 w-5" />
              </div>
            </div>
            <div className="z-10 flex flex-col gap-1.5">
              <div className="font-mono text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                {ngn(revenue)}
                <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">.00</span>
              </div>
              {pl?.hasData ? (
                <p className={`mt-2 border-t border-zinc-200 pt-2 dark:border-zinc-800 ${MUTED}`}>
                  Across {pl.occupiedUnits} occupied of {pl.unitCount} units
                </p>
              ) : (
                <p className={`mt-2 border-t border-zinc-200 pt-2 dark:border-zinc-800 ${MUTED}`}>
                  No rent roll recorded yet
                </p>
              )}
            </div>
          </div>

          {/* Expenses */}
          <div className={`${CARD} relative flex flex-col justify-between overflow-hidden`}>
            <div className="pointer-events-none absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-rose-500/5 blur-xl" />
            <div className="mb-4 flex items-center justify-between">
              <span className={LABEL}>Total Expenses</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
                <TrendingDown className="h-5 w-5" />
              </div>
            </div>
            <div className="z-10 flex flex-col gap-1.5">
              <div className="font-mono text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                {ngn(expenses)}
                <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">.00</span>
              </div>
              <p className={`mt-2 border-t border-zinc-200 pt-2 dark:border-zinc-800 ${MUTED}`}>
                Utility allocations and subscriptions
              </p>
            </div>
          </div>

          {/* Net profit */}
          <div className={`${CARD} relative flex flex-col justify-between overflow-hidden`}>
            <div className="pointer-events-none absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-teal-500/10 blur-xl" />
            <div className="mb-4 flex items-center justify-between">
              <span className={LABEL}>Net Profit</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <div className="z-10 flex flex-col gap-1.5">
              <div
                className={`font-mono text-2xl font-bold tracking-tight ${
                  netProfit >= 0 ? 'text-zinc-900 dark:text-white' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {ngn(netProfit)}
                <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">.00</span>
              </div>
              <p className={`mt-2 border-t border-zinc-200 pt-2 dark:border-zinc-800 ${MUTED}`}>
                {pl?.pendingPayments
                  ? `${pl.pendingPayments} invoice${pl.pendingPayments === 1 ? '' : 's'} pending (${compactNgn(pl.pendingPaymentsAmount)})`
                  : 'No pending invoices'}
              </p>
            </div>
          </div>

          {/* Margin */}
          <div className={`${CARD} relative flex flex-col justify-between overflow-hidden`}>
            <div className="pointer-events-none absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-primary/10 blur-xl" />
            <div className="mb-4 flex items-center justify-between">
              <span className={LABEL}>Profit Margin</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                <Percent className="h-5 w-5" />
              </div>
            </div>
            <div className="z-10 flex flex-col gap-1.5">
              <div
                className={`font-mono text-2xl font-bold tracking-tight ${
                  margin >= 0 ? 'text-zinc-900 dark:text-white' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {margin.toFixed(2)}%
              </div>
              <p className={`mt-2 border-t border-zinc-200 pt-2 dark:border-zinc-800 ${MUTED}`}>
                {revenue > 0 ? `Operating ratio at ${(100 - margin).toFixed(1)}%` : 'No revenue to compute a ratio'}
              </p>
            </div>
          </div>
        </div>

        {/* Trajectory chart */}
        <div className={`${SECTION_CARD} mb-8 flex flex-col gap-6`}>
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">
                Profit &amp; Cashflow Trajectory
              </h2>
              <p className={`${MUTED}`}>Monthly gross receivables vs operating liabilities</p>
            </div>
          </div>

          {trend.length === 0 ? (
            <p className="py-10 text-center text-xs text-zinc-500 dark:text-zinc-400">
              No billing cycles recorded yet — the trajectory chart populates as service charges and utilities are billed.
            </p>
          ) : (
            <>
              <div className="relative flex h-64 w-full flex-col justify-end pt-6 pb-2">
                {/* Grid */}
                <div className="pointer-events-none absolute inset-x-0 bottom-8 top-6 flex flex-col justify-between opacity-40">
                  {gridLines.map((v, i) => (
                    <div key={i} className="flex w-full justify-end border-b border-dashed border-zinc-300 dark:border-zinc-700">
                      <span className="-mt-2.5 pr-2 font-mono text-[10px] text-zinc-500">{compactNgn(v)}</span>
                    </div>
                  ))}
                </div>

                {/* Bars */}
                <div className="z-20 grid h-48 items-end gap-2 px-2 sm:gap-6 sm:px-8" style={{ gridTemplateColumns: `repeat(${trend.length}, minmax(0, 1fr))` }}>
                  {trend.map((m, i) => {
                    const isLast = i === trend.length - 1;
                    const revH = Math.max(1, (m.revenue / maxVal) * 100);
                    const expH = Math.max(1, (m.expenses / maxVal) * 100);
                    return (
                      <div key={m.month + i} className="group flex h-full flex-col items-center justify-end">
                        <div className="flex h-full w-full items-end justify-center gap-1 sm:gap-2">
                          <div
                            className={`w-3.5 rounded-t transition-all group-hover:brightness-110 sm:w-6 ${isLast ? 'bg-primary ring-2 ring-primary/20' : 'bg-primary'}`}
                            style={{ height: `${revH}%` }}
                            title={`${m.month} revenue: ${ngn(m.revenue)}`}
                          />
                          <div
                            className="w-3.5 rounded-t bg-rose-500 transition-all group-hover:brightness-110 sm:w-6"
                            style={{ height: `${expH}%` }}
                            title={`${m.month} expenses: ${ngn(m.expenses)}`}
                          />
                        </div>
                        <span
                          className={`mt-3 text-xs font-medium ${
                            isLast ? 'font-bold text-primary dark:text-[#4edea3]' : 'text-zinc-500 dark:text-zinc-400'
                          }`}
                        >
                          {m.month}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center justify-center gap-6 border-t border-zinc-200 pt-2 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-primary" />
                  <span>Revenue</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-rose-500" />
                  <span>Operating Expenses</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Breakdown tables */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <BreakdownTable
            title="Revenue Sources"
            rows={revenueRows}
            total={revenue}
            totalLabel="Gross Receivables"
            meta={REVENUE_META}
            tone="emerald"
            action={
              <Link
                href="/dashboard/estate-manager/collections"
                className="flex items-center gap-1 text-sm font-medium text-primary hover:underline dark:text-[#4edea3]"
              >
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
          <BreakdownTable
            title="Expense Allocations"
            rows={expenseRows}
            total={expenses}
            totalLabel="Operating Outflows Total"
            meta={EXPENSE_META}
            tone="rose"
            action={
              <Link
                href="/dashboard/estate-manager/utilities"
                className="flex items-center gap-1 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              >
                <Download className="h-4 w-4" /> Utilities
              </Link>
            }
          />
        </div>

        {/* Settlement context — only real fields */}
        <div className={`${SECTION_CARD} flex flex-col items-start justify-between gap-4 p-5 md:flex-row md:items-center`}>
          <div className="flex items-start gap-3.5 md:items-center">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--sovereign-container-bg)] text-primary dark:bg-primary/10 dark:text-[#4edea3]">
              <Landmark className="h-[22px] w-[22px]" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-semibold text-zinc-900 dark:text-white">{organization.name}</span>
              <p className={`mt-0.5 ${MUTED}`}>
                {pl?.hasData
                  ? `Ledger covers ${pl.unitCount} unit${pl.unitCount === 1 ? '' : 's'} and ${pl.occupiedUnits} active tenancies.`
                  : 'No units or billing cycles recorded for this organization yet.'}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <Link
              href="/dashboard/estate-manager/ledger"
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3.5 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <Receipt className="h-4 w-4" /> Ledger
            </Link>
            <Link
              href="/dashboard/estate-manager/disbursements"
              className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-3.5 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/20 dark:text-[#4edea3]"
            >
              Disbursements <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>
    </DashboardShell>
  );
}
