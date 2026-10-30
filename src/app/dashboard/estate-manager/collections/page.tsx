'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Wallet,
  TrendingUp,
  Lock,
  CheckCircle2,
  PiggyBank,
  Search,
  Download,
  Eye,
  Send,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';

// ─── Real TransactionStatus enum from prisma/schema.prisma ───
type TxnStatus = 'pending' | 'in_escrow' | 'commission_held' | 'released' | 'failed' | 'refunded';

interface ManagedTxn {
  id: string;
  reference: string | null;
  type: string;
  status: TxnStatus | string;
  amount: string; // kobo (BigInt serialized)
  platformFee: string;
  agentCommission: string;
  payeeAmount: string | null; // landlord split
  paystackRef: string | null;
  description: string | null;
  paidAt: string | null;
  createdAt: string;
  listing: { id: string; title: string; area: string | null } | null;
  payer: { id: string; fullName: string | null; email: string } | null; // tenant
  payee: { id: string; fullName: string | null; email: string } | null; // landlord
}

// amount fields are BigInt kobo → naira
const toNaira = (kobo: string | number | null | undefined): number => {
  if (kobo === null || kobo === undefined) return 0;
  return Number(kobo) / 100;
};

function ngn(amount: number): string {
  return `₦${Math.round(amount).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function compactNgn(amount: number): string {
  if (amount >= 1e9) return `₦${(amount / 1e9).toFixed(2)}B`;
  if (amount >= 1e6) return `₦${(amount / 1e6).toFixed(1)}M`;
  if (amount >= 1e3) return `₦${(amount / 1e3).toFixed(1)}k`;
  return `₦${Math.round(amount)}`;
}

const STATUS_META: Record<string, { label: string; cls: string; dot: string }> = {
  released: { label: 'Disbursed', cls: 'bg-[var(--sovereign-container-bg)] text-[var(--sovereign-hover)] border-primary dark:bg-primary/10 dark:text-[#4edea3] dark:border-primary/30', dot: 'bg-primary' },
  in_escrow: { label: 'In Escrow', cls: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30', dot: 'bg-blue-500' },
  commission_held: { label: 'Escrow Pending', cls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30', dot: 'bg-amber-500' },
  pending: { label: 'Pending', cls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30', dot: 'bg-amber-500' },
  failed: { label: 'Failed', cls: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30', dot: 'bg-rose-500' },
  refunded: { label: 'Refunded', cls: 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700', dot: 'bg-zinc-400' },
};

// Tabs map to real statuses. 'active' = money moving but not yet disbursed.
type TabKey = 'all' | 'active' | 'escrow' | 'flagged';
const TAB_STATUSES: Record<TabKey, string[]> = {
  all: [],
  active: ['released'],
  escrow: ['in_escrow', 'commission_held'],
  flagged: ['failed', 'refunded'],
};

const CARD = 'rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900';
const LABEL = 'text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400';
const MUTED = 'text-xs text-zinc-500 dark:text-zinc-400';
const TH = 'px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400';

function initialsOf(name: string | null | undefined, email?: string): string {
  const src = name?.trim() || email?.split('@')[0] || '?';
  const parts = src.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function ManagedCollectionsPage() {
  const [items, setItems] = useState<ManagedTxn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<TabKey>('all');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Pull every managed transaction (no status filter) so tabs + KPIs can
      // slice client-side across the real status set.
      const res = await fetch('/api/wallet/managed', { cache: 'no-store' });
      if (!res.ok) throw new Error(`Failed to load collections (${res.status})`);
      const json = await res.json();
      setItems(json?.items ?? []);
    } catch (e) {
      setError((e as Error).message ?? 'Could not load managed collections');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Normalize once
  const rows = useMemo(
    () =>
      items.map((t) => {
        const gross = toNaira(t.amount);
        const emFee = toNaira(t.platformFee) + toNaira(t.agentCommission);
        const landlordSplit = t.payeeAmount !== null ? toNaira(t.payeeAmount) : gross - emFee;
        return { t, gross, emFee, landlordSplit };
      }),
    [items]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const statuses = TAB_STATUSES[tab];
    return rows.filter(({ t }) => {
      const matchesTab = statuses.length === 0 || statuses.includes(t.status);
      const matchesQuery =
        !q ||
        [t.reference, t.paystackRef, t.listing?.title, t.payer?.fullName, t.payer?.email, t.payee?.fullName, t.payee?.email]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q));
      return matchesTab && matchesQuery;
    });
  }, [rows, query, tab]);

  const tabCounts = useMemo(() => {
    const c: Record<TabKey, number> = { all: rows.length, active: 0, escrow: 0, flagged: 0 };
    for (const { t } of rows) {
      for (const key of ['active', 'escrow', 'flagged'] as TabKey[]) {
        if (TAB_STATUSES[key].includes(t.status)) c[key] += 1;
      }
    }
    return c;
  }, [rows]);

  // KPIs from real money
  const kpis = useMemo(() => {
    let collected = 0, escrow = 0, disbursed = 0, emFees = 0;
    for (const { t, gross, emFee, landlordSplit } of rows) {
      if (t.status === 'released') {
        collected += gross;
        disbursed += landlordSplit;
        emFees += emFee;
      } else if (t.status === 'in_escrow' || t.status === 'commission_held') {
        escrow += gross;
      }
    }
    return { collected, escrow, disbursed, emFees };
  }, [rows]);

  const exportCsv = () => {
    const header = ['Reference', 'Property', 'Tenant', 'Landlord', 'Gross', 'Landlord Split', 'EM Fee', 'Status', 'Date'];
    const csvRows = filtered.map(({ t, gross, landlordSplit, emFee }) => [
      t.reference ?? t.paystackRef ?? t.id.slice(0, 8),
      t.listing?.title ?? '',
      t.payer?.fullName ?? '',
      t.payee?.fullName ?? '',
      gross,
      landlordSplit,
      emFee,
      t.status,
      t.paidAt ?? t.createdAt,
    ]);
    const csv = [header, ...csvRows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'collections-audit.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const Kpi = ({ icon: Icon, label, value, sub, tone = 'default' }: {
    icon: typeof Wallet;
    label: string;
    value: string;
    sub: string;
    tone?: 'default' | 'emerald' | 'amber' | 'blue';
  }) => {
    const iconCls =
      tone === 'emerald' ? 'bg-primary/10 text-primary dark:text-[#4edea3]'
      : tone === 'amber' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
      : tone === 'blue' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
      : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400';
    return (
      <div className={CARD}>
        <div className="mb-3 flex items-center justify-between">
          <span className={LABEL}>{label}</span>
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconCls}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">{value}</div>
        <p className={`mt-2 ${MUTED}`}>{sub}</p>
      </div>
    );
  };

  if (loading) {
    return (
      <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Manager">
        <div className="mx-auto w-full max-w-[1240px] space-y-6" aria-busy="true">
          <div className="h-9 w-64 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
            ))}
          </div>
          <div className="h-72 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Manager">
      <main className="mx-auto w-full max-w-[1240px] space-y-8 p-6 lg:p-10">
        {/* Breadcrumb */}
        <nav className={`flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider ${MUTED}`}>
          <Link href="/dashboard/estate-manager" className="transition-colors hover:text-primary">Home</Link>
          <span className="text-zinc-300 dark:text-zinc-600">/</span>
          <span>Rent &amp; Payments</span>
          <span className="text-zinc-300 dark:text-zinc-600">/</span>
          <span className="text-primary dark:text-[#4edea3]">Managed Collections</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-3xl space-y-1.5">
            <h1 className="text-3xl font-bold tracking-tight text-[var(--sovereign-hover)] dark:text-[#4edea3]">Managed Collections</h1>
            <p className={`text-sm ${MUTED}`}>
              Rent collection, escrow holding, and split disbursement reconciliation across your managed properties.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={exportCsv}
              disabled={filtered.length === 0}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <Download className="h-[18px] w-[18px] text-primary" /> Export Audit (CSV)
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
            <button onClick={load} className="ml-auto inline-flex items-center gap-1 font-medium underline">
              <RefreshCw className="h-3 w-3" /> Retry
            </button>
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <Kpi icon={TrendingUp} label="Total Disbursed" value={compactNgn(kpis.disbursed)} sub="Released to landlords (all time)" tone="emerald" />
          <Kpi icon={Lock} label="Escrow Holding" value={compactNgn(kpis.escrow)} sub="Awaiting disbursement clearance" tone="blue" />
          <Kpi icon={CheckCircle2} label="Gross Collected" value={compactNgn(kpis.collected)} sub="Released transactions, gross value" />
          <Kpi icon={PiggyBank} label="Commission Earned" value={compactNgn(kpis.emFees)} sub="Platform + agent fees on released" tone="amber" />
        </div>

        {/* Filter bar */}
        <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
            <div className="flex gap-1 overflow-x-auto rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
              {([
                ['all', 'All', tabCounts.all],
                ['active', 'Disbursed', tabCounts.active],
                ['escrow', 'Escrow Pending', tabCounts.escrow],
                ['flagged', 'Flagged', tabCounts.flagged],
              ] as const).map(([key, label, n]) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                    tab === key
                      ? 'bg-white text-primary shadow-sm dark:bg-zinc-900 dark:text-[#4edea3]'
                      : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                  }`}
                >
                  {label} <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-xs text-primary dark:text-[#4edea3]">{n}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search property, tenant, landlord, or reference..."
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-primary focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-white dark:focus:bg-zinc-900"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          {rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
                <Wallet className="h-9 w-9 opacity-50" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">No managed collections yet</h3>
              <p className={`mt-2 max-w-md text-sm ${MUTED}`}>
                Collections appear here when rent transactions are routed through you for managed properties.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/40">
                      <th className={TH}>Reference</th>
                      <th className={TH}>Property</th>
                      <th className={TH}>Tenant → Landlord</th>
                      <th className={`${TH} text-right`}>Gross</th>
                      <th className={`${TH} text-right`}>Landlord Split</th>
                      <th className={`${TH} text-right`}>EM Fee</th>
                      <th className={`${TH} text-center`}>Status</th>
                      <th className={`${TH} text-right`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-5 py-10 text-center text-xs text-zinc-500 dark:text-zinc-400">
                          No collections match these filters.
                        </td>
                      </tr>
                    ) : (
                      filtered.map(({ t, gross, landlordSplit, emFee }) => {
                        const meta = STATUS_META[t.status] ?? STATUS_META.pending;
                        return (
                          <tr key={t.id} className="group transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                            <td className="whitespace-nowrap px-5 py-3">
                              <div className="font-mono text-sm font-medium text-primary dark:text-[#4edea3]">
                                {t.reference ?? t.paystackRef ?? t.id.slice(0, 8).toUpperCase()}
                              </div>
                              <div className={MUTED}>{t.type}</div>
                            </td>
                            <td className="px-5 py-3">
                              <div className="text-sm font-medium text-zinc-900 dark:text-white">{t.listing?.title ?? '—'}</div>
                              <div className={`truncate ${MUTED}`}>{t.listing?.area ?? '—'}</div>
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2.5">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-[var(--sovereign-hover)] dark:text-[#4edea3]">
                                  {initialsOf(t.payer?.fullName, t.payer?.email)}
                                </div>
                                <div className="flex min-w-0 flex-col">
                                  <span className="truncate text-sm font-medium text-zinc-900 dark:text-white">
                                    {t.payer?.fullName ?? 'Payer'}
                                  </span>
                                  <span className={`truncate ${MUTED}`}>→ {t.payee?.fullName ?? 'Payee'}</span>
                                </div>
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-5 py-3 text-right font-mono text-sm font-semibold text-zinc-900 dark:text-white">
                              {ngn(gross)}
                            </td>
                            <td className="whitespace-nowrap px-5 py-3 text-right">
                              <div className="font-mono text-sm font-medium text-primary dark:text-[#4edea3]">{ngn(landlordSplit)}</div>
                              <div className={MUTED}>to {t.payee?.fullName ?? 'landlord'}</div>
                            </td>
                            <td className="whitespace-nowrap px-5 py-3 text-right font-mono text-sm text-zinc-700 dark:text-zinc-300">
                              {ngn(emFee)}
                            </td>
                            <td className="whitespace-nowrap px-5 py-3 text-center">
                              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${meta.cls}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                                {meta.label}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-5 py-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Link
                                  href={`/api/payments/transactions/${t.id}/receipt`}
                                  title="View receipt"
                                  className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-primary dark:hover:bg-zinc-800"
                                >
                                  <Eye className="h-[18px] w-[18px]" />
                                </Link>
                                {t.payer?.email && (
                                  <a
                                    href={`mailto:${t.payer.email}`}
                                    title="Contact payer"
                                    className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-primary dark:hover:bg-zinc-800"
                                  >
                                    <Send className="h-[18px] w-[18px]" />
                                  </a>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between border-t border-zinc-200 bg-zinc-50 px-5 py-3 text-xs dark:border-zinc-800 dark:bg-zinc-800/30">
                <span className={MUTED}>
                  Showing <span className="font-semibold text-zinc-900 dark:text-white">{filtered.length}</span> of{' '}
                  <span className="font-semibold text-zinc-900 dark:text-white">{rows.length}</span> collections
                </span>
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-400" />}
              </div>
            </>
          )}
        </div>
      </main>
    </DashboardShell>
  );
}
