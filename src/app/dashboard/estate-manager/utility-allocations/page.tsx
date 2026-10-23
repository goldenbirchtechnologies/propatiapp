'use client';

import { useEffect, useMemo, useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { useActiveOrganization } from '@/contexts/ActiveOrganizationContext';
import { NoOrgState } from '@/components/organizations/NoOrgState';
import { Zap, Droplets, Trash2, Shield, Package, Search, Download, CheckCircle2, Hourglass, AlertCircle, RefreshCw, Filter } from 'lucide-react';

const LABEL = 'text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400';
const MUTED = 'text-xs text-zinc-500 dark:text-zinc-400';
const TH = 'px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400';

type UtilityType = 'electricity' | 'water' | 'gas' | 'sewer' | 'trash' | 'security' | 'maintenance' | 'internet' | 'other';

interface UtilityAllocation {
  id: string;
  unitId: string;
  type: UtilityType;
  amount: number;
  currency: string;
  billingPeriod: string;
  dueDate: string | null;
  status: 'draft' | 'pending' | 'paid' | 'cancelled' | 'overdue' | 'sent' | 'failed';
  paidAt: string | null;
  createdAt: string;
}

const UTILITY_META: Record<UtilityType, { label: string; icon: JSX.Element; cls: string }> = {
  electricity: { label: 'Electricity', icon: <Zap className="h-4 w-4" />, cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  water: { label: 'Water', icon: <Droplets className="h-4 w-4" />, cls: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400' },
  gas: { label: 'Gas', icon: <Zap className="h-4 w-4" />, cls: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  sewer: { label: 'Sewer', icon: <Trash2 className="h-4 w-4" />, cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  trash: { label: 'Trash', icon: <Trash2 className="h-4 w-4" />, cls: 'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400' },
  security: { label: 'Security', icon: <Shield className="h-4 w-4" />, cls: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
  maintenance: { label: 'Maintenance', icon: <Package className="h-4 w-4" />, cls: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-400' },
  internet: { label: 'Internet', icon: <Zap className="h-4 w-4" />, cls: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  other: { label: 'Other', icon: <Package className="h-4 w-4" />, cls: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400' },
};

const STATUS_META: Record<string, { label: string; dot: string }> = {
  paid: { label: 'Paid', dot: 'bg-emerald-500' },
  completed: { label: 'Completed', dot: 'bg-emerald-500' },
  released: { label: 'Released', dot: 'bg-emerald-500' },
  pending: { label: 'Pending', dot: 'bg-amber-500' },
  draft: { label: 'Draft', dot: 'bg-zinc-400' },
  sent: { label: 'Sent', dot: 'bg-sky-500' },
  overdue: { label: 'Overdue', dot: 'bg-rose-500' },
  failed: { label: 'Failed', dot: 'bg-rose-500' },
  cancelled: { label: 'Cancelled', dot: 'bg-zinc-400' },
};

function ngn(n: number, currency: string = 'NGN'): string {
  if (currency !== 'NGN') return `${currency} ${Math.round(n)}`;
  return `₦${Math.round(n).toLocaleString('en-NG')}`;
}

function fmtDate(v: string | null): string {
  if (!v) return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function UtilityAllocationsPage() {
  const { organization: activeOrg, loading: orgLoading } = useActiveOrganization();
  const [allocations, setAllocations] = useState<UtilityAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    if (!activeOrg) return;
    let cancelled = false;
    setLoading(true);
    fetch('/api/dashboard/estate-manager/financials', { cache: 'no-store' })
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) {
          const raw = json.pl?.utilityAllocations || [];
          setAllocations(raw.map((ua: any) => ({
            id: ua.id,
            unitId: ua.unitId,
            type: ua.type,
            amount: Number(ua.amount || 0),
            currency: ua.currency || 'NGN',
            billingPeriod: ua.billingPeriod || '',
            dueDate: ua.dueDate || null,
            status: ua.status || 'draft',
            paidAt: ua.paidAt || null,
            createdAt: ua.createdAt,
          })));
        }
      })
      .catch(() => { if (!cancelled) setError('Failed to load utility allocations'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [activeOrg]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allocations.filter((a) => {
      if (typeFilter !== 'ALL' && a.type !== typeFilter) return false;
      if (statusFilter !== 'ALL' && a.status !== statusFilter.toLowerCase()) return false;
      if (q) {
        const hay = [a.type, a.status, a.billingPeriod, a.unitId, ngn(a.amount, a.currency)].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [allocations, query, typeFilter, statusFilter]);

  const totals = useMemo(() => {
    const total = filtered.reduce((s, a) => s + a.amount, 0);
    const pending = filtered.filter((a) => ['pending', 'draft', 'sent', 'overdue'].includes(a.status)).reduce((s, a) => s + a.amount, 0);
    const paid = filtered.filter((a) => a.status === 'paid').reduce((s, a) => s + a.amount, 0);
    const byType = (Object.keys(UTILITY_META) as UtilityType[]).map((t) => {
      const items = filtered.filter((a) => a.type === t);
      const amt = items.reduce((s, a) => s + a.amount, 0);
      return { type: t, count: items.length, amount: amt };
    }).filter((v) => v.count > 0).sort((a, b) => b.amount - a.amount);
    return { total, pending, paid, byType };
  }, [filtered]);

  const statusIcon = (s: string) => {
    const sm = STATUS_META[s] ?? STATUS_META.pending;
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 px-2.5 py-1 text-[11px] font-semibold text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
        <span className={`h-1.5 w-1.5 rounded-full ${sm.dot}`} /> {sm.label}
      </span>
    );
  };

  if (orgLoading) return <NoOrgState title="Loading organization…" />;
  if (!activeOrg) return <NoOrgState title="No Organization" description="Select or create an organization to view utility allocations." />;

  return (
    <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Estate Manager">
      <ErrorBoundary>
        <div className="space-y-6">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h1 className="font-heading text-2xl font-bold text-zinc-900 dark:text-white">Utility Allocations</h1>
              <p className={`mt-1 ${MUTED}`}>Utility bills and service charges allocated across units in {activeOrg?.name}.</p>
            </div>
            <div className="flex items-center gap-2.5">
              <button onClick={() => window.location.reload()} className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800">
                <RefreshCw className="h-[18px] w-[18px]" /> Refresh
              </button>
              <button
                onClick={() => {
                  const csv = ['Billing Period,Type,Unit,Amount,Currency,Due Date,Status,Created']
                    .concat(filtered.map((a) => [a.billingPeriod, a.type, a.unitId, String(a.amount), a.currency, a.dueDate || '', a.status, fmtDate(a.createdAt)].join(',')));
                  const blob = new Blob([csv.join('\n')], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'utility-allocations.csv';
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
              <span className={LABEL}>Total Allocated</span>
              <div className="mt-1 text-2xl font-bold font-mono text-zinc-900 dark:text-white">{loading ? '—' : ngn(totals.total)}</div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <span className={LABEL}>Paid</span>
              <div className="mt-1 text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">{loading ? '—' : ngn(totals.paid)}</div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <span className={LABEL}>Outstanding</span>
              <div className="mt-1 text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">{loading ? '—' : ngn(totals.pending)}</div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <span className={LABEL}>Entries</span>
              <div className="mt-1 text-2xl font-bold font-mono text-zinc-900 dark:text-white">{loading ? '—' : totals.byType.reduce((s, v) => s + v.count, 0)}</div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col items-stretch justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center dark:border-zinc-800 dark:bg-zinc-900">
            <div className="relative min-w-[280px] flex-1">
              <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by type, unit, period, or reference…"
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-white dark:focus:bg-zinc-900"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <Filter className="h-5 w-5 text-zinc-400" />
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white">
                <option value="ALL">All Types</option>
                {Object.entries(UTILITY_META).map(([v, m]) => (<option key={v} value={v}>{m.label}</option>))}
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white">
                <option value="ALL">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="sent">Sent</option>
                <option value="overdue">Overdue</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          {/* Allocations table */}
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            {loading ? (
              <div className="p-6 text-center">
                <RefreshCw className="mx-auto h-6 w-6 animate-spin text-zinc-400" />
                <p className={`mt-2 ${MUTED}`}>Loading utility allocations…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-zinc-800"><Zap className="h-9 w-9 opacity-50" /></div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">No utility allocations</h3>
                <p className={`mt-2 max-w-md text-sm ${MUTED}`}>Utility bills and service charges will appear here once allocated to units in this organization.</p>
              </div>
            ) : (
              <div className="min-w-[900px] overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/40">
                      <th className={TH}>UTILITY TYPE</th>
                      <th className={TH}>BILLING PERIOD</th>
                      <th className={TH}>UNIT</th>
                      <th className={TH}>AMOUNT</th>
                      <th className={TH}>DUE DATE</th>
                      <th className={TH}>STATUS</th>
                      <th className={`${TH} text-right`}>PAID AT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
                    {filtered.map((a) => {
                      const meta = UTILITY_META[a.type] ?? UTILITY_META.other;
                      return (
                        <tr key={a.id} className="group transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${meta.cls}`}>{meta.icon}</div>
                              <span className="font-medium text-zinc-900 dark:text-white">{meta.label}</span>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 font-mono text-zinc-600 dark:text-zinc-400">{a.billingPeriod || '—'}</td>
                          <td className="whitespace-nowrap px-4 py-3 font-mono text-zinc-600 dark:text-zinc-400">{a.unitId || '—'}</td>
                          <td className="whitespace-nowrap px-4 py-3 font-mono font-semibold text-zinc-900 dark:text-white">{ngn(a.amount, a.currency)}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-zinc-600 dark:text-zinc-400">{fmtDate(a.dueDate)}</td>
                          <td className="whitespace-nowrap px-4 py-3">{statusIcon(a.status)}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-right font-mono text-zinc-600 dark:text-zinc-400">{fmtDate(a.paidAt)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </ErrorBoundary>
    </DashboardShell>
  );
}
