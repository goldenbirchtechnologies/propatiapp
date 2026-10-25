'use client';

import { useEffect, useState, useCallback } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import RentAndPaymentsHub, { type TabItem } from '@/components/financials/RentAndPaymentsHub';
import { TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import {
  ArrowUpRight,
  Banknote,
  Download,
  Landmark,
  Loader2,
  RefreshCcw,
  ShieldCheck,
  Wallet,
  Plus,
  FileText,
  Building2,
  AlertTriangle,
  Clock,
  TrendingUp,
  Eye,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { formatNairaFull } from '@/lib/utils';

const tabs: TabItem[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'payments', label: 'Payments' },
  { value: 'invoices', label: 'Invoices' },
  { value: 'overdue', label: 'Overdue' },
];

type TransactionRow = {
  id: string;
  date: string;
  reference: string;
  listing: string;
  listingId?: string;
  type: string;
  status: string;
  statusBadgeVariant: 'default' | 'secondary' | 'destructive' | 'outline';
  amount: number;
  currency: string;
};

type WalletTxRow = {
  id: string;
  type: string;
  status: string;
  amount: number;
  currency: string;
  providerRef: string | null;
  description: string | null;
  date: string;
  meta?: Record<string, unknown>;
};

const MIN_WITHDRAWAL = 500;

type WalletState = {
  availableBalance: number;
  pendingClearing: number;
  currency: string;
  isLocked: boolean;
  bankAccount: {
    bankName: string | null;
    accountNumber: string | null;
    accountName: string | null;
    recipientCode: string | null;
    customerCode: string | null;
    status: string | null;
  } | null;
  recentTransactions: WalletTxRow[];
};

type VacancyMetrics = {
  total: number;
  vacantCount: number;
  activeCount: number;
  vacancyRate: number;
  vacantList: Array<{ id: string; title: string; status: string; price: number | null; pricePeriod: string | null; area: string | null; state: string | null }>;
};

type OverdueMetrics = {
  totalAmount: number;
  count: number;
  criticalCount: number;
  criticalAmount: number;
  earlyCount: number;
  earlyAmount: number;
  rows: Array<{ id: string; tenant: string; listing: string; amount: number; days: number; dueDate: string; type: string }>;
};

export default function LandlordFinancialsPage() {
  const { toast: toastHook } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState({ totalIncome: 0, pendingCount: 0, transactionCount: 0 });
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [wallet, setWallet] = useState<WalletState>({
    availableBalance: 0,
    pendingClearing: 0,
    currency: 'NGN',
    isLocked: false,
    bankAccount: null,
    recentTransactions: [],
  });
  const [properties, setProperties] = useState<{ id: string; title: string }[]>([]);
  const [filters, setFilters] = useState({ propertyId: '', from: '', to: '' });
  const [vacancy, setVacancy] = useState<VacancyMetrics>({ total: 0, vacantCount: 0, activeCount: 0, vacancyRate: 0, vacantList: [] });
  const [overdue, setOverdue] = useState<OverdueMetrics>({ totalAmount: 0, count: 0, criticalCount: 0, criticalAmount: 0, earlyCount: 0, earlyAmount: 0, rows: [] });

  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [savingBank, setSavingBank] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [accountName, setAccountName] = useState('');
  const [bankNameInput, setBankNameInput] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [accountNumberInput, setAccountNumberInput] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawReason, setWithdrawReason] = useState('Wallet withdrawal');
  const [banks, setBanks] = useState<Array<{ name: string; code: string; slug: string }>>([]);
  const [banksLoading, setBanksLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams();
      if (filters.propertyId) qs.set('propertyId', filters.propertyId);
      if (filters.from) qs.set('from', filters.from);
      if (filters.to) qs.set('to', filters.to);
      const qsStr = qs.toString();

      const [finRes, vacRes, rentRes] = await Promise.all([
        fetch(`/api/dashboard/landlord/financials/overview${qsStr ? `?${qsStr}` : ''}`, { cache: 'no-store' }),
        fetch('/api/dashboard/landlord/vacancies', { cache: 'no-store' }),
        fetch('/api/dashboard/landlord/rent', { cache: 'no-store' }),
      ]);

      if (!finRes.ok) throw new Error('Failed to load financials');
      const finJson = await finRes.json();
      if (!finJson.success) throw new Error(finJson.error || 'Failed');
      const d = finJson.data;
      setMetrics(d.metrics);
      setTransactions(d.transactions || []);
      setWallet({
        availableBalance: d.wallet?.availableBalance || 0,
        pendingClearing: d.wallet?.pendingClearing || 0,
        currency: d.wallet?.currency || 'NGN',
        isLocked: d.wallet?.isLocked || false,
        bankAccount: d.wallet?.bankAccount || null,
        recentTransactions: d.wallet?.recentTransactions || [],
      });
      setProperties(d.filters?.properties || []);

      // Vacancy metrics — live from /api/dashboard/landlord/vacancies (listings)
      try {
        if (vacRes.ok) {
          const vj = await vacRes.json();
          const listings: any[] = Array.isArray(vj?.data) ? vj.data : [];
          const total = listings.length;
          const vacantList = listings.filter((l) => String(l.status).toLowerCase() !== 'active' && String(l.status).toLowerCase() !== 'published');
          // Fallback: if no vacant by status, treat draft/suspended as vacant
          const vacantCount = vacantList.length;
          const activeCount = total - vacantCount;
          const vacancyRate = total ? Math.round((vacantCount / total) * 100) : 0;
          setVacancy({
            total,
            vacantCount,
            activeCount,
            vacancyRate,
            vacantList: vacantList.slice(0, 5).map((l) => ({
              id: l.id,
              title: l.title,
              status: String(l.status),
              price: l.price != null ? Number(l.price) : null,
              pricePeriod: l.pricePeriod ?? null,
              area: l.area ?? null,
              state: l.state ?? null,
            })),
          });
        }
      } catch {
        // vacancy non-blocking
      }

      // Overdue metrics — live from /api/dashboard/landlord/rent (rentSchedules)
      try {
        if (rentRes.ok) {
          const rj = await rentRes.json();
          const schedules: any[] = Array.isArray(rj?.data) ? rj.data : [];
          const now = Date.now();
          const overdueRows = schedules
            .filter((rs) => {
              const due = new Date(rs.dueDate).getTime();
              if (rs.status === 'overdue') return true;
              if (rs.status === 'paid') return false;
              if (rs.paidAt) return false;
              return due < now;
            })
            .map((rs) => {
              const days = Math.max(1, Math.floor((now - new Date(rs.dueDate).getTime()) / 86400000));
              return {
                id: rs.id,
                tenant: rs.agreement?.tenant?.fullName ?? '—',
                listing: rs.agreement?.listing?.title ?? '—',
                amount: Number(rs.amount) || 0,
                days,
                dueDate: rs.dueDate,
                type: 'Rent',
              };
            })
            .sort((a, b) => b.days - a.days);

          const totalAmount = overdueRows.reduce((s, r) => s + r.amount, 0);
          const critical = overdueRows.filter((r) => r.days >= 30);
          const early = overdueRows.filter((r) => r.days < 30);
          setOverdue({
            totalAmount,
            count: overdueRows.length,
            criticalCount: critical.length,
            criticalAmount: critical.reduce((s, r) => s + r.amount, 0),
            earlyCount: early.length,
            earlyAmount: early.reduce((s, r) => s + r.amount, 0),
            rows: overdueRows.slice(0, 5),
          });
        }
      } catch {
        // overdue non-blocking
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load financials');
    } finally {
      setLoading(false);
    }
  }, [filters.propertyId, filters.from, filters.to]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!bankModalOpen || banks.length > 0) return;
    setBanksLoading(true);
    fetch('/api/paystack/banks')
      .then((r) => r.json())
      .then((d) => {
        const list = Array.isArray(d?.data) ? d.data : Array.isArray(d?.banks) ? d.banks : [];
        if (list.length) setBanks(list.map((b: any) => ({ name: b.name, code: String(b.code), slug: b.slug || '' })));
      })
      .catch(() => {})
      .finally(() => setBanksLoading(false));
  }, [bankModalOpen, banks.length]);

  const resolveAccount = async () => {
    if (!accountNumberInput || !bankCode) {
      toastHook({ title: 'Account number and bank code are required', variant: 'destructive' });
      return;
    }
    setResolving(true);
    try {
      const res = await fetch(`/api/paystack/resolve-account?accountNumber=${encodeURIComponent(accountNumberInput)}&bankCode=${encodeURIComponent(bankCode)}`);
      const data = await res.json();
      if (!res.ok || !data.status) throw new Error(data.message || 'Unable to resolve account');
      setAccountName(data.data.account_name);
      setBankNameInput(data.data.bank_name);
      toastHook({ title: 'Account resolved', description: data.data.account_name });
    } catch (err) {
      toastHook({ title: 'Resolution failed', description: err instanceof Error ? err.message : 'Unknown error', variant: 'destructive' });
    } finally {
      setResolving(false);
    }
  };

  const saveBankAccount = async () => {
    if (!accountNumberInput || !bankCode || !accountName) {
      toastHook({ title: 'Please resolve the account first', variant: 'destructive' });
      return;
    }
    setSavingBank(true);
    try {
      const res = await fetch('/api/user/bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountNumber: accountNumberInput, bankCode }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to save bank');
      toastHook({ title: 'Bank account saved', description: `${bankNameInput} - ${accountName}` });
      setBankModalOpen(false);
      load();
    } catch (err) {
      toastHook({ title: 'Save failed', description: err instanceof Error ? err.message : 'Unknown error', variant: 'destructive' });
    } finally {
      setSavingBank(false);
    }
  };

  const requestWithdrawal = async () => {
    const amount = Number(withdrawAmount);
    if (!amount || amount < MIN_WITHDRAWAL) {
      toastHook({ title: `Minimum withdrawal is ${formatNairaFull(MIN_WITHDRAWAL)}`, variant: 'destructive' });
      return;
    }
    if (amount > wallet.availableBalance) {
      toastHook({ title: 'Insufficient available balance', variant: 'destructive' });
      return;
    }
    setWithdrawing(true);
    try {
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, reason: withdrawReason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Withdrawal failed');
      toastHook({ title: 'Withdrawal initiated', description: formatNairaFull(amount) });
      setWithdrawModalOpen(false);
      setWithdrawAmount('');
      setWithdrawReason('Wallet withdrawal');
      load();
    } catch (err) {
      toastHook({ title: 'Withdrawal failed', description: err instanceof Error ? err.message : 'Unknown error', variant: 'destructive' });
    } finally {
      setWithdrawing(false);
    }
  };

  const handleExport = async () => {
    toastHook({ title: 'Export started', description: 'Your CSV export will be available shortly.' });
  };

  const statusBadge = (variant: TransactionRow['statusBadgeVariant'], label: string) => {
    const map: Record<string, string> = {
      default: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
      secondary: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
      destructive: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
      outline: 'bg-zinc-100 dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-white/[0.08]',
    };
    return <Badge variant={variant} className={`capitalize border ${map[variant] || map.outline}`}>{label}</Badge>;
  };

  return (
    <DashboardShell navigation={LANDLORD_NAVIGATION} userRole="landlord" userName="Landlord" userAvatar={undefined}>
      <ErrorBoundary>
        <RentAndPaymentsHub tabs={tabs}>
          <TabsContent value="overview">
            <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
              {/* Header */}
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-semibold tracking-widest text-zinc-500">
                    <span>Finances &amp; Analytics</span>
                    <span className="text-zinc-300 dark:text-zinc-700">/</span>
                    <span className="text-emerald-600 dark:text-emerald-400">Financials &amp; Payouts</span>
                  </div>
                  <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Financials Overview</h1>
                  <p className="mt-1 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">Wallet, payouts, vacancy exposure and overdue recovery — all computed from live ledger data. No mock balances.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20" onClick={() => (window.location.href = '/dashboard/landlord/financials/invoices')}>
                    <FileText className="w-3.5 h-3.5" /> Create Invoice
                  </Button>
                  <Button size="sm" variant="outline" className="gap-2 border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/[0.06]" onClick={() => setWithdrawModalOpen(true)} disabled={!wallet.bankAccount?.recipientCode}>
                    <ArrowUpRight className="w-3.5 h-3.5" /> Withdraw
                  </Button>
                  <Button size="sm" variant="outline" className="gap-2 border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/[0.06]" onClick={() => toastHook({ title: 'Record Payment — coming soon' })}>
                    <Plus className="w-3.5 h-3.5" /> Record Payment
                  </Button>
                </div>
              </div>

              {/* Filter bar — bichrome */}
              <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 p-3 sm:flex-row sm:items-center">
                <div className="flex flex-1 items-center gap-2">
                  <div className="relative flex-1">
                    <Input type="date" value={filters.from} onChange={(e) => setFilters((s) => ({ ...s, from: e.target.value }))} className="h-9 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 rounded-lg text-xs focus-visible:ring-emerald-500/30" />
                  </div>
                  <span className="shrink-0 text-xs text-zinc-500">—</span>
                  <div className="relative flex-1">
                    <Input type="date" value={filters.to} onChange={(e) => setFilters((s) => ({ ...s, to: e.target.value }))} className="h-9 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 rounded-lg text-xs focus-visible:ring-emerald-500/30" />
                  </div>
                </div>
                <Select value={filters.propertyId} onValueChange={(val) => setFilters((s) => ({ ...s, propertyId: val === '__all__' ? '' : val }))}>
                  <SelectTrigger className="h-9 min-w-[200px] bg-white dark:bg-zinc-950 border-zinc-200 dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 rounded-lg text-xs">
                    <SelectValue placeholder="All properties" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/[0.08]">
                    <SelectItem value="__all__">All properties</SelectItem>
                    {properties.map((p) => (
                      <SelectItem key={p.id} value={p.id} className="text-zinc-700 dark:text-zinc-300 focus:bg-zinc-50 dark:focus:bg-white/[0.06]">{p.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex shrink-0 items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleExport} disabled className="gap-2 rounded-lg border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-zinc-950 text-zinc-500">
                    <Download className="w-3.5 h-3.5" /> Export
                  </Button>
                  <Button variant="ghost" size="sm" onClick={load} className="gap-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/[0.06]">
                    <RefreshCcw className="w-3.5 h-3.5" /> Refresh
                  </Button>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 p-5">
                      <div className="h-3 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                      <div className="mt-4 h-7 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                      <div className="mt-2 h-3 w-20 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 p-6 text-sm text-red-700 dark:text-red-300">
                  <p className="font-semibold">Could not load financials</p>
                  <p className="mt-1 text-xs opacity-80">{error}</p>
                  <Button variant="outline" size="sm" className="mt-3 border-red-200 dark:border-red-500/20" onClick={load}>Retry</Button>
                </div>
              ) : (
                <>
                  {wallet.availableBalance === 0 && !wallet.bankAccount && metrics.transactionCount === 0 && vacancy.total === 0 && (
                    <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 border border-amber-500/20">
                        <Landmark className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-zinc-900 dark:text-white">Welcome — let&apos;s get your payouts ready</p>
                        <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">Setup your payout bank and create your first invoice to start receiving rent.</p>
                        <div className="mt-3 flex gap-2">
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white" onClick={() => setBankModalOpen(true)}>Setup payout bank</Button>
                          <Button size="sm" variant="outline" className="border-zinc-200 dark:border-white/[0.08] bg-transparent text-zinc-600 dark:text-zinc-400" onClick={() => (window.location.href = '/dashboard/landlord/financials/invoices')}>View invoices</Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bento KPI — 4 live cards: Total Income | Pending Escrow | Vacancy | Overdue */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 p-5">
                      <div className="absolute inset-x-0 top-0 h-1 bg-emerald-500" />
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Total Income</span>
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                          <Banknote className="h-3.5 w-3.5" />
                        </span>
                      </div>
                      <div className="mt-3 text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">{formatNairaFull(metrics.totalIncome)}</div>
                      <p className="mt-1 text-xs text-zinc-500">{metrics.transactionCount} transactions · Released</p>
                      <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        <TrendingUp className="h-3.5 w-3.5" /> Live ledger
                      </div>
                    </div>

                    <div className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 p-5">
                      <div className="absolute inset-x-0 top-0 h-1 bg-amber-500" />
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">In Escrow · Pending</span>
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                          <ShieldCheck className="h-3.5 w-3.5" />
                        </span>
                      </div>
                      <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">{metrics.pendingCount}</span>
                        <span className="text-xs text-zinc-500">accounts</span>
                      </div>
                      <p className="mt-1 text-xs text-zinc-500">Pending clearing: {formatNairaFull(wallet.pendingClearing)}</p>
                      <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                        <Clock className="h-3.5 w-3.5" /> Awaiting confirmation
                      </div>
                    </div>

                    <div className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 p-5">
                      <div className="absolute inset-x-0 top-0 h-1 bg-blue-600" />
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Vacancy Exposure</span>
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
                          <Building2 className="h-3.5 w-3.5" />
                        </span>
                      </div>
                      <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">{vacancy.vacantCount}</span>
                        <span className="text-xs text-zinc-500">/ {vacancy.total} units</span>
                        <span className={`ml-1 rounded-full px-2 py-0.5 text-[11px] font-semibold border ${vacancy.vacancyRate > 30 ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' : vacancy.vacancyRate > 10 ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'}`}>
                          {vacancy.vacancyRate}% vacant
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-zinc-500">{vacancy.activeCount} active · live listings</p>
                      <Link href="/dashboard/landlord/vacancies" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">
                        View vacancies <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>

                    <div className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 p-5">
                      <div className="absolute inset-x-0 top-0 h-1 bg-red-500" />
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Overdue Ledger</span>
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400">
                          <AlertTriangle className="h-3.5 w-3.5" />
                        </span>
                      </div>
                      <div className="mt-3 text-2xl font-bold tracking-tight text-red-600 dark:text-red-400 font-mono">{formatNairaFull(overdue.totalAmount)}</div>
                      <p className="mt-1 text-xs text-zinc-500">{overdue.count} delinquent · {overdue.criticalCount} critical (≥30d)</p>
                      <Link href="/dashboard/landlord/financials/overdue" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400 hover:underline">
                        Recovery &amp; notices <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>

                  {/* Bento row 2 — Wallet + Vacancy snapshot */}
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 p-5">
                      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/[0.08] pb-3">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Available Balance</h3>
                        <Wallet className="h-4 w-4 text-zinc-400" />
                      </div>
                      <div className="mt-4 text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">{formatNairaFull(wallet.availableBalance)}</div>
                      {wallet.availableBalance === 0 && !wallet.bankAccount ? (
                        <p className="mt-2 text-xs leading-relaxed text-zinc-500">No funds yet. Setup your payout bank to start receiving rent.</p>
                      ) : (
                        <p className="mt-1 text-xs text-zinc-500">Pending clearing: {formatNairaFull(wallet.pendingClearing)} · {wallet.currency}</p>
                      )}
                      <div className="mt-4 flex flex-wrap gap-2">
                        {!wallet.bankAccount ? (
                          <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20" onClick={() => setBankModalOpen(true)}>
                            <Landmark className="w-3.5 h-3.5" /> Setup bank
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" className="gap-2 border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300" onClick={() => setBankModalOpen(true)}>
                            <ShieldCheck className="w-3.5 h-3.5" /> {wallet.bankAccount.accountName || wallet.bankAccount.bankName || 'Bank'}
                          </Button>
                        )}
                        <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40" onClick={() => setWithdrawModalOpen(true)} disabled={wallet.isLocked || !wallet.bankAccount?.recipientCode}>
                          <ArrowUpRight className="w-3.5 h-3.5" /> Withdraw
                        </Button>
                      </div>
                      {wallet.bankAccount && (
                        <div className="mt-4 rounded-lg border border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-zinc-950 p-3 text-xs text-zinc-600 dark:text-zinc-400">
                          Payout to <span className="font-semibold text-zinc-900 dark:text-white">{wallet.bankAccount.bankName || 'Bank'}</span> · ****{wallet.bankAccount.accountNumber?.slice(-4) ?? '—'} {wallet.isLocked && <span className="ml-2 rounded-full bg-red-500/10 px-2 py-0.5 text-[11px] font-semibold text-red-600 dark:text-red-400 border border-red-500/20">Locked</span>}
                        </div>
                      )}
                    </div>

                    <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 p-5">
                      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/[0.08] pb-3">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Vacancy Snapshot</h3>
                        <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400 border border-blue-500/20">{vacancy.vacantCount} vacant</span>
                      </div>
                      {vacancy.vacantList.length === 0 ? (
                        <div className="py-8 text-center">
                          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-white/[0.06] border border-zinc-200 dark:border-white/[0.08]">
                            <Building2 className="h-5 w-5 text-zinc-500" />
                          </div>
                          <p className="mt-3 text-sm font-medium text-zinc-900 dark:text-white">No vacant units</p>
                          <p className="mx-auto mt-1 max-w-xs text-xs text-zinc-500">All listings are active. Create a new listing to fill the market gap.</p>
                          <Button asChild size="sm" className="mt-4 bg-emerald-600 hover:bg-emerald-500 text-white">
                            <Link href="/dashboard/landlord/listing/new">Publish listing</Link>
                          </Button>
                        </div>
                      ) : (
                        <div className="mt-4 space-y-3">
                          {vacancy.vacantList.map((v) => (
                            <Link key={v.id} href={`/dashboard/landlord/properties/${v.id}`} className="flex items-center justify-between rounded-lg border border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-zinc-950 px-3 py-3 hover:bg-zinc-100 dark:hover:bg-white/[0.04] transition-colors">
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">{v.title}</p>
                                <p className="truncate text-xs text-zinc-500">{[v.area, v.state].filter(Boolean).join(', ') || '—'} · <span className="capitalize">{v.status.replace(/_/g, ' ')}</span></p>
                              </div>
                              <div className="ml-3 shrink-0 text-right">
                                <p className="text-sm font-semibold text-zinc-900 dark:text-white">{v.price != null ? formatNairaFull(v.price) : '—'}</p>
                                <p className="text-xs text-zinc-500">{v.pricePeriod ?? ''}</p>
                              </div>
                            </Link>
                          ))}
                          <Link href="/dashboard/landlord/vacancies" className="flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 py-2.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/[0.04]">
                            View all vacancies <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bento row 3 — Overdue snapshot (live) */}
                  <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900">
                    <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/[0.08] px-5 py-4">
                      <div>
                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Overdue Recovery</h3>
                        <p className="text-xs text-zinc-500">Live rent ledger · {overdue.count} delinquent · {overdue.criticalCount} critical (≥30d)</p>
                      </div>
                      <Link href="/dashboard/landlord/financials/overdue" className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/[0.04]">
                        <Eye className="h-3.5 w-3.5" /> Full ledger
                      </Link>
                    </div>
                    <div className="p-5">
                      {overdue.rows.length === 0 ? (
                        <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-zinc-950 p-8 text-center">
                          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                            <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <p className="mt-3 text-sm font-medium text-zinc-900 dark:text-white">No overdue payments</p>
                          <p className="mt-1 text-xs text-zinc-500">All rent schedules are current. Overdue items will appear here with days count and actions.</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm">
                            <thead className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                              <tr className="border-b border-zinc-200 dark:border-white/[0.08]">
                                <th className="py-2 font-semibold">Tenant</th>
                                <th className="py-2 font-semibold">Property</th>
                                <th className="py-2 text-right font-semibold">Amount</th>
                                <th className="py-2 font-semibold">Days</th>
                                <th className="py-2 font-semibold">Type</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.06]">
                              {overdue.rows.map((r) => (
                                <tr key={r.id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.03]">
                                  <td className="py-3 font-medium text-zinc-900 dark:text-white">{r.tenant}</td>
                                  <td className="py-3 text-zinc-600 dark:text-zinc-400">{r.listing}</td>
                                  <td className="py-3 text-right font-mono font-semibold text-red-600 dark:text-red-400">{formatNairaFull(r.amount)}</td>
                                  <td className="py-3">
                                    <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${r.days >= 30 ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'}`}>
                                      {r.days}d
                                    </span>
                                  </td>
                                  <td className="py-3 text-zinc-600 dark:text-zinc-400">{r.type}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                      {overdue.rows.length > 0 && (
                        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/[0.08] p-3 text-xs">
                          <span className="font-semibold text-zinc-900 dark:text-white">Totals:</span>
                          <span className="text-zinc-600 dark:text-zinc-400">Early (&lt;30d): <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">{formatNairaFull(overdue.earlyAmount)}</span> ({overdue.earlyCount})</span>
                          <span className="text-zinc-300 dark:text-zinc-700">•</span>
                          <span className="text-zinc-600 dark:text-zinc-400">Critical (≥30d): <span className="font-mono font-semibold text-red-600 dark:text-red-400">{formatNairaFull(overdue.criticalAmount)}</span> ({overdue.criticalCount})</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payout History — keep live table */}
                  <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900">
                    <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/[0.08] px-5 py-4">
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Payout History</h3>
                      <span className="rounded-full bg-zinc-100 dark:bg-white/[0.06] px-2.5 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-white/[0.08]">{transactions.length} records</span>
                    </div>
                    <div className="p-5">
                      {transactions.length === 0 && wallet.recentTransactions.length === 0 ? (
                        <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-zinc-950 p-8 text-center">
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-white/[0.06] border border-zinc-200 dark:border-white/[0.08]">
                            <Banknote className="h-6 w-6 text-zinc-500" />
                          </div>
                          <p className="mt-3 text-sm font-medium text-zinc-900 dark:text-white">No payouts yet</p>
                          <p className="mt-1 text-xs text-zinc-500">Withdrawals and wallet transactions will show here.</p>
                          <div className="mt-4 flex items-center justify-center gap-2">
                            <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white" onClick={() => (window.location.href = '/dashboard/landlord/financials/invoices')}>
                              <FileText className="w-3.5 h-3.5" /> Create Invoice
                            </Button>
                            <Button size="sm" variant="outline" className="gap-2 border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400" onClick={() => toastHook({ title: 'Record Payment — coming soon' })}>
                              <Plus className="w-3.5 h-3.5" /> Record Payment
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm">
                            <thead className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                              <tr className="border-b border-zinc-200 dark:border-white/[0.08]">
                                <th className="py-3 font-semibold">Date</th>
                                <th className="py-3 font-semibold">Reference</th>
                                <th className="py-3 font-semibold">Description</th>
                                <th className="py-3 font-semibold">Type</th>
                                <th className="py-3 text-right font-semibold">Amount</th>
                                <th className="py-3 font-semibold">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.06]">
                              {transactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.03]">
                                  <td className="whitespace-nowrap py-3 text-zinc-600 dark:text-zinc-400">{tx.date}</td>
                                  <td className="whitespace-nowrap py-3 font-mono text-xs text-zinc-900 dark:text-white">{tx.reference}</td>
                                  <td className="py-3 text-zinc-700 dark:text-zinc-300">{tx.listing || tx.reference}</td>
                                  <td className="whitespace-nowrap py-3 capitalize text-zinc-600 dark:text-zinc-400">{tx.type}</td>
                                  <td className="whitespace-nowrap py-3 text-right font-mono font-semibold text-zinc-900 dark:text-white">{formatNairaFull(tx.amount)}</td>
                                  <td className="whitespace-nowrap py-3">{statusBadge(tx.statusBadgeVariant, tx.status)}</td>
                                </tr>
                              ))}
                              {transactions.length === 0 &&
                                wallet.recentTransactions.map((tx) => (
                                  <tr key={`wt-${tx.id}`} className="hover:bg-zinc-50 dark:hover:bg-white/[0.03]">
                                    <td className="whitespace-nowrap py-3 text-zinc-600 dark:text-zinc-400">{tx.date}</td>
                                    <td className="whitespace-nowrap py-3 font-mono text-xs text-zinc-900 dark:text-white">{tx.providerRef || tx.id}</td>
                                    <td className="py-3 text-zinc-700 dark:text-zinc-300">{tx.description || tx.type}</td>
                                    <td className="whitespace-nowrap py-3 capitalize text-zinc-600 dark:text-zinc-400">{tx.type.replace(/_/g, ' ')}</td>
                                    <td className="whitespace-nowrap py-3 text-right font-mono font-semibold text-zinc-900 dark:text-white">{formatNairaFull(tx.amount)}</td>
                                    <td className="whitespace-nowrap py-3">
                                      <Badge variant={tx.status === 'success' ? 'default' : 'secondary'} className="capitalize border">{tx.status}</Badge>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </TabsContent>
          <TabsContent value="payments">
            <PlaceholderTab title="Payments" description="Payment history will appear here." />
          </TabsContent>
          <TabsContent value="invoices">
            <PlaceholderTab title="Invoices" description="Invoice statements will appear here." />
          </TabsContent>
          <TabsContent value="overdue">
            <PlaceholderTab title="Overdue" description="Overdue payments will appear here — see the Overdue Recovery card above for live totals." />
          </TabsContent>
        </RentAndPaymentsHub>
      </ErrorBoundary>

      <Dialog open={bankModalOpen} onOpenChange={setBankModalOpen}>
        <DialogContent showCloseButton>
          <DialogHeader>
            <DialogTitle>Bank Account Setup</DialogTitle>
            <DialogDescription>Enter your payout bank details. We&apos;ll auto-verify the account name with Paystack before saving.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Account Number</Label>
              <Input value={accountNumberInput} onChange={(e) => setAccountNumberInput(e.target.value.replace(/\D/g, ''))} placeholder="0123456789" />
            </div>
            <div className="space-y-2">
              <Label>Bank</Label>
              <Select value={bankCode} onValueChange={(v) => { setBankCode(v); const b = banks.find((x) => x.code === v); if (b) setBankNameInput(b.name); }}>
                <SelectTrigger><SelectValue placeholder={banksLoading ? 'Loading banks…' : 'Select your bank'} /></SelectTrigger>
                <SelectContent className="max-h-64">
                  {banks.map((b) => (
                    <SelectItem key={b.code} value={b.code}>{b.name}</SelectItem>
                  ))}
                  {!banksLoading && banks.length === 0 && (
                    <div className="px-2 py-1.5 text-xs text-zinc-500">No banks loaded — check PAYSTACK_SECRET_KEY</div>
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-zinc-500">Choose your bank — no code needed</p>
            </div>
            <Button variant="secondary" className="w-full gap-2" onClick={resolveAccount} disabled={resolving}>
              {resolving && <Loader2 className="w-4 h-4 animate-spin" />} Verify Account
            </Button>
            {accountName && (
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300">
                Verified account: <span className="font-semibold">{accountName}</span> at <span className="font-semibold">{bankNameInput}</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBankModalOpen(false)} disabled={savingBank}>Cancel</Button>
            <Button onClick={saveBankAccount} disabled={savingBank || !accountName} className="bg-emerald-600 hover:bg-emerald-500 text-white">
              {savingBank && <Loader2 className="w-4 h-4 animate-spin" />} Save Bank
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={withdrawModalOpen} onOpenChange={setWithdrawModalOpen}>
        <DialogContent showCloseButton>
          <DialogHeader>
            <DialogTitle>Withdraw Funds</DialogTitle>
            <DialogDescription>Request a payout to your saved bank account via Paystack Transfers.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-zinc-950 p-3 text-xs text-zinc-600 dark:text-zinc-400">
              Available: <span className="font-semibold text-zinc-900 dark:text-white">{formatNairaFull(wallet.availableBalance)}</span> · Min withdrawal: ₦{MIN_WITHDRAWAL.toLocaleString()}
            </div>
            <div className="space-y-2">
              <Label>Amount (NGN)</Label>
              <Input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Input value={withdrawReason} onChange={(e) => setWithdrawReason(e.target.value)} />
            </div>
            {wallet.bankAccount && (
              <div className="text-xs text-zinc-600 dark:text-zinc-400">
                Payout to: <span className="font-semibold text-zinc-900 dark:text-white">{wallet.bankAccount.accountName || 'Saved account'} - {wallet.bankAccount.bankName || ''} ****{wallet.bankAccount.accountNumber?.slice(-4)}</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWithdrawModalOpen(false)} disabled={withdrawing}>Cancel</Button>
            <Button onClick={requestWithdrawal} disabled={withdrawing} className="bg-emerald-600 hover:bg-emerald-500 text-white">
              {withdrawing && <Loader2 className="w-4 h-4 animate-spin" />} Send payout request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}

function PlaceholderTab({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 p-6 text-center">
      <p className="text-sm font-medium text-zinc-900 dark:text-white">{title}</p>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{description}</p>
    </div>
  );
}
