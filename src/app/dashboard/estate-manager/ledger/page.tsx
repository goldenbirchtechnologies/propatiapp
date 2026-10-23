'use client';

import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Search, Download, RefreshCw, CheckCircle2, Hourglass, AlertCircle } from 'lucide-react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { useActiveOrganization } from '@/contexts/ActiveOrganizationContext';
import { NoOrgState } from '@/components/organizations/NoOrgState';

type TxType = 'deposit' | 'escrow_credit' | 'transfer' | 'refund' | 'adjustment' | 'withdrawal';
type TxStatus = 'completed' | 'paid' | 'released' | 'pending' | 'in_escrow' | 'failed' | 'cancelled' | 'refunded';

interface WalletTransaction {
  id: string;
  type: TxType;
  status: TxStatus;
  amount: number;
  description?: string | null;
  reference?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

const TYPE_META: Partial<Record<TxType, { label: string; cls: string }>> = {
  deposit: { label: 'Deposit', cls: 'text-emerald-600 dark:text-emerald-400' },
  escrow_credit: { label: 'Escrow Credit', cls: 'text-sky-600 dark:text-sky-400' },
  transfer: { label: 'Transfer', cls: 'text-zinc-600 dark:text-zinc-400' },
  refund: { label: 'Refund', cls: 'text-purple-600 dark:text-purple-400' },
  adjustment: { label: 'Adjustment', cls: 'text-orange-600 dark:text-orange-400' },
  withdrawal: { label: 'Withdrawal', cls: 'text-rose-600 dark:text-rose-400' },
};

const STATUS_META: Partial<Record<TxStatus, { label: string; cls: string; dot: string }>> = {
  completed: { label: 'Completed', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30', dot: 'bg-emerald-500' },
  paid: { label: 'Paid', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30', dot: 'bg-emerald-500' },
  released: { label: 'Released', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30', dot: 'bg-emerald-500' },
  pending: { label: 'Pending', cls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30', dot: 'bg-amber-500' },
  in_escrow: { label: 'In Escrow', cls: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/30', dot: 'bg-sky-500' },
  failed: { label: 'Failed', cls: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30', dot: 'bg-rose-500' },
  cancelled: { label: 'Cancelled', cls: 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700', dot: 'bg-zinc-400' },
  refunded: { label: 'Refunded', cls: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/30', dot: 'bg-purple-500' },
};

const LABEL = 'text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400';
const MUTED = 'text-xs text-zinc-500 dark:text-zinc-400';
const TH = 'px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400';

function ngn(n: number): string {
  return `₦${Math.abs(Math.round(n)).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function fmtDate(v: string): string {
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' });
}
function fmtTime(v: string): string {
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export default function LedgerPage() {
  const { organization: activeOrg, loading: orgLoading } = useActiveOrganization();
  const [txns, setTxns] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<'30' | '90' | '365' | 'ALL'>('ALL');

  useEffect(() => {
    if (!activeOrg) return;
    let cancelled = false;
    setLoading(true);
    fetch(`/api/wallet/transactions?orgId=${activeOrg.id}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) {
          const raw = json.items || json.data || [];
          setTxns(raw.map((t: any) => ({
            id: t.id,
            description: t.description || t.reference || 'Transaction',
            reference: t.reference || null,
            amount: Number(t.amount || 0),
            status: t.status as TxStatus,
            createdAt: t.createdAt,
            type: t.type as TxType,
          })));
        }
      })
      .catch(() => { if (!cancelled) setError('Failed to load ledger'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [activeOrg]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const cutoff = (() => {
      const now = Date.now();
      switch (dateFilter) {
        case '30': return now - 30 * 86400000;
        case '90': return now - 90 * 86400000;
        case '365': return now - 365 * 86400000;
        default: return 0;
      }
    })();
    return txns.filter((t) => {
      if (cutoff && new Date(t.createdAt).getTime() < cutoff) return false;
      if (typeFilter !== 'ALL' && t.type !== typeFilter) return false;
      if (statusFilter !== 'ALL' && t.status !== statusFilter.toLowerCase()) return false;
      if (q) {
        const hay = [t.type, t.status, t.description, t.reference, t.createdAt].filter(Boolean).join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [txns, query, typeFilter, statusFilter, dateFilter]);

  const totals = useMemo(() => {
    const total = filtered.reduce((s, t) => s + t.amount, 0);
    const credit = filtered.filter((t) => ['deposit', 'escrow_credit', 'refund', 'adjustment'].includes(t.type)).reduce((s, t) => s + t.amount, 0);
    const debit = filtered.filter((t) => ['withdrawal', 'transfer'].includes(t.type)).reduce((s, t) => s + t.amount, 0);
    return { total, credit, debit, count: filtered.length };
  }, [filtered]);

  const statusIcon = (s: TxStatus) => {
    switch (s) {
      case 'completed': case 'paid': case 'released': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'pending': case 'in_escrow': return <Hourglass className="h-4 w-4 text-amber-500" />;
      case 'failed': case 'cancelled': case 'refunded': return <AlertCircle className="h-4 w-4 text-rose-500" />;
      default: return <AlertCircle className="h-4 w-4 text-zinc-400" />;
    }
  };

  if (orgLoading) return <NoOrgState title="Loading organization…" />;
  if (!activeOrg) return <NoOrgState title="No Organization" description="Select or create an organization to view the ledger." />;

  return (
    <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Estate Manager">
      <ErrorBoundary>
        <div className="space-y-6">
          <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Ledger</h1>
              <p className={`mt-1 text-sm ${MUTED}`}>Wallet transaction history for {activeOrg?.name || 'your organization'}.</p>
            </div>
            <div className="flex items-center gap-2.5">
              <button onClick={() => window.location.reload()} className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800">
                <RefreshCw className="h-[18px] w-[18px]" /> Refresh
              </button>
              <button
                onClick={() => {
                  const csv = ['Date,Type,Description,Reference,Status,Amount (₦)']
                    .concat(filtered.map((t) => [fmtDate(t.createdAt), t.type, t.description || '', t.reference || '', t.status, String(t.amount)].join(',')));
                  const blob = new Blob([csv.join('\n')], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'ledger.csv';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                disabled={filtered.length === 0}
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <Download className="h-[18px] w-[18px]" /> Export
              </button>
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <span className={LABEL}>Net Change</span>
              <div className={`mt-1 text-2xl font-bold font-mono ${totals.total >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{ngn(totals.total)}</div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <span className={LABEL}>Credits</span>
              <div className="mt-1 text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">{ngn(totals.credit)}</div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <span className={LABEL}>Debits</span>
              <div className="mt-1 text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">{ngn(totals.debit)}</div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <span className={LABEL}>Entries</span>
              <div className="mt-1 text-2xl font-bold font-mono text-zinc-900 dark:text-white">{totals.count}</div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col items-stretch justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center dark:border-zinc-800 dark:bg-zinc-900">
            <div className="relative min-w-[280px] flex-1">
              <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search description or reference…"
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-white dark:focus:bg-zinc-900"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white">
                <option value="ALL">All Types</option>
                {Object.entries(TYPE_META).map(([v, m]) => (<option key={v} value={v}>{m?.label}</option>))}
              </select>
              <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value as '30' | '90' | '365' | 'ALL')} className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white">
                <option value="ALL">All Time</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white">
                <option value="ALL">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="paid">Paid</option>
                <option value="released">Released</option>
                <option value="pending">Pending</option>
                <option value="in_escrow">In Escrow</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>

          {/* Ledger table */}
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            {loading ? (
              <div className="p-6 text-center">
                <RefreshCw className="mx-auto h-6 w-6 animate-spin text-zinc-400" />
                <p className={`mt-2 ${MUTED}`}>Loading ledger entries…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-zinc-800"><BookOpen className="h-9 w-9 opacity-50" /></div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">No ledger entries</h3>
                <p className={`mt-2 max-w-md text-sm ${MUTED}`}>Wallet transactions will appear here once collections or disbursements are executed for this organization.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/40">
                      <th className={TH}>TYPE</th>
                      <th className={TH}>DATE &amp; TIME</th>
                      <th className={TH}>DESCRIPTION</th>
                      <th className={TH}>REFERENCE</th>
                      <th className={TH}>STATUS</th>
                      <th className={`${TH} text-right`}>AMOUNT (₦)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
                    {filtered.map((t) => {
                      const meta = TYPE_META[t.type] ?? TYPE_META.transfer;
                      const stat = STATUS_META[t.status] ?? STATUS_META.pending;
                      const isDebit = ['withdrawal', 'transfer'].includes(t.type);
                      const isCancelled = t.status === 'cancelled' || t.status === 'failed' || t.status === 'refunded';
                      return (
                        <tr key={t.id} className="group transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 dark:bg-zinc-800 ${meta?.cls ?? ''}`}>
                                <span className="text-xs font-bold">{t.type.slice(0, 1).toUpperCase()}</span>
                              </div>
                              <span className="font-medium text-zinc-900 dark:text-white">{meta?.label ?? t.type}</span>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <span className="font-mono text-zinc-900 dark:text-white">{fmtDate(t.createdAt)}</span>
                            <div className={MUTED}>{fmtTime(t.createdAt)}</div>
                          </td>
                          <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{t.description || '—'}</td>
                          <td className="whitespace-nowrap px-4 py-3 font-mono text-zinc-600 dark:text-zinc-400">{t.reference || '—'}</td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${stat?.cls ?? ''}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${stat?.dot ?? 'bg-zinc-400'}`} />
                              {stat?.label ?? t.status}
                            </span>
                          </td>
                          <td className={`whitespace-nowrap px-4 py-3 text-right font-mono font-bold ${isCancelled ? 'text-zinc-400' : isDebit ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            {isCancelled ? '—' : (isDebit ? `-${ngn(t.amount)}` : `+${ngn(t.amount)}`)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          {!loading && filtered.length > 0 && (
            <div className="border-t border-zinc-200 bg-zinc-50 px-4 py-3 text-xs dark:border-zinc-800 dark:bg-zinc-800/30">
              <span className={MUTED}>Showing <span className="font-semibold text-zinc-900 dark:text-white">{filtered.length}</span> of <span className="font-semibold text-zinc-900 dark:text-white">{txns.length}</span> transactions</span>
            </div>
          )}
        </div>
      </ErrorBoundary>
    </DashboardShell>
  );
}
