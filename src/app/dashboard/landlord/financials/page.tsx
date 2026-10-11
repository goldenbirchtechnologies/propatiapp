'use client';

import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import RentAndPaymentsHub, { type TabItem } from '@/components/financials/RentAndPaymentsHub';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { toast } from '@/hooks/use-toast';
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
} from 'lucide-react';
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

export default function LandlordFinancialsPage() {
  const { toast: toastHook } = useToast();
  const [loading, setLoading] = useState(false);
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

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams();
      if (filters.propertyId) qs.set('propertyId', filters.propertyId);
      if (filters.from) qs.set('from', filters.from);
      if (filters.to) qs.set('to', filters.to);

      const res = await fetch(`/api/dashboard/landlord/financials/overview?${qs.toString()}`, {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('Failed to load financials');
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed');

      const d = json.data;
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load financials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    load();
  }, [filters.propertyId, filters.from, filters.to]);

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
      if (!res.ok || !data.status) {
        throw new Error(data.message || 'Unable to resolve account');
      }
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
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save bank');
      }
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
      if (!res.ok) {
        throw new Error(data.error || 'Withdrawal failed');
      }
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
      default: 'bg-zinc-900 text-zinc-900 dark:text-white border-zinc-200 dark:border-white/[0.08]/20',
      secondary: 'bg-secondary text-secondary-foreground border-zinc-200 dark:border-white/[0.08]',
      destructive: 'bg-red-500/10 text-red-500 border-red-500/20',
      outline: 'bg-background text-zinc-900 dark:text-white border-zinc-200 dark:border-white/[0.08]',
    };
    return <Badge variant={variant} className={`capitalize border ${map[variant] || map.outline}`}>{label}</Badge>;
  };

  return (
    <DashboardShell navigation={LANDLORD_NAVIGATION} userRole="landlord" userName="Landlord" userAvatar={undefined}>
      <ErrorBoundary>
        <RentAndPaymentsHub tabs={tabs}>
          <TabsContent value="overview">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-[#F8FAFC] dark:bg-[#09090b]">
              <div className="flex flex-col gap-5">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Financials Overview</h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Wallet, payouts, and transaction history</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20" onClick={() => (window.location.href = '/dashboard/landlord/financials/invoices')}>
                      <FileText className="w-3.5 h-3.5" /> Create Invoice
                    </Button>
                    <Button size="sm" variant="outline" className="gap-2 border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#121214] text-zinc-300 hover:bg-zinc-50 dark:bg-[#18181b] hover:text-zinc-900 dark:text-white" onClick={() => setWithdrawModalOpen(true)} disabled={!wallet.bankAccount?.recipientCode}>
                      <ArrowUpRight className="w-3.5 h-3.5" /> Withdraw
                    </Button>
                    <Button size="sm" variant="outline" className="gap-2 border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#121214] text-zinc-300 hover:bg-zinc-50 dark:bg-[#18181b] hover:text-zinc-900 dark:text-white" onClick={() => toastHook({ title: 'Record Payment — coming soon' })}>
                      <Plus className="w-3.5 h-3.5" /> Record Payment
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white dark:bg-[#121214] border border-zinc-200 dark:border-[#27272a] rounded-xl p-3">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="relative flex-1">
                      <Input
                        type="date"
                        value={filters.from}
                        onChange={(e) => setFilters((s) => ({ ...s, from: e.target.value }))}
                        className="h-9 text-xs bg-zinc-50 dark:bg-[#18181b] border-zinc-200 dark:border-[#27272a] text-zinc-300 rounded-lg focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500/30"
                      />
                    </div>
                    <span className="text-xs text-zinc-600 dark:text-zinc-600 dark:text-zinc-500 shrink-0">—</span>
                    <div className="relative flex-1">
                      <Input
                        type="date"
                        value={filters.to}
                        onChange={(e) => setFilters((s) => ({ ...s, to: e.target.value }))}
                        className="h-9 text-xs bg-zinc-50 dark:bg-[#18181b] border-zinc-200 dark:border-[#27272a] text-zinc-300 rounded-lg focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500/30"
                      />
                    </div>
                  </div>
                  <Select value={filters.propertyId} onValueChange={(val) => setFilters((s) => ({ ...s, propertyId: val }))}>
                    <SelectTrigger className="h-9 text-xs min-w-[200px] bg-zinc-50 dark:bg-[#18181b] border-zinc-200 dark:border-[#27272a] text-zinc-300 rounded-lg">
                      <SelectValue placeholder="All properties" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#121214] border-zinc-200 dark:border-[#27272a]">
                      <SelectItem value="">All properties</SelectItem>
                      {properties.map((p) => (
                        <SelectItem key={p.id} value={p.id} className="text-zinc-300 focus:bg-zinc-50 dark:bg-[#18181b] focus:text-zinc-900 dark:text-white">
                          {p.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="outline" size="sm" onClick={handleExport} disabled className="gap-2 border-zinc-200 dark:border-[#27272a] bg-zinc-50 dark:bg-[#18181b] rounded-lg">
                      <Download className="w-3.5 h-3.5" /> Export
                    </Button>
                    <Button variant="ghost" size="sm" onClick={load} className="gap-2 rounded-lg hover:bg-zinc-50 dark:bg-[#18181b]">
                      <RefreshCcw className="w-3.5 h-3.5" /> Refresh
                    </Button>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {[0, 1, 2, 3].map((i) => (
                    <div className="glass-card" key={i} className="p-6">
                      <div className="space-y-3">
                        <div className="rounded" style={{ height: 12, width: '55%', background: 'var(--border)', animation: 'skel-pulse 1.6s ease-in-out infinite' }} />
                        <div className="rounded" style={{ height: 28, width: '40%', background: 'var(--border)', animation: 'skel-pulse 1.6s ease-in-out infinite' }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="glass-card p-6 text-sm text-red-500">{error}</div>
              ) : (
                <>
                  {wallet.availableBalance === 0 && !wallet.bankAccount && metrics.transactionCount === 0 && (
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/20 flex items-center justify-center shrink-0">
                        <Landmark className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-zinc-900 dark:text-white">Welcome — let&apos;s get your payouts ready</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Setup your payout bank and create your first invoice to start receiving rent.</p>
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white" onClick={() => setBankModalOpen(true)}>Setup payout bank</Button>
                          <Button size="sm" variant="outline" className="border-zinc-200 dark:border-[#27272a] bg-transparent text-zinc-300" onClick={() => (window.location.href = '/dashboard/landlord/financials/invoices')}>View invoices</Button>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div className="rounded-xl border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#121214] p-6">
                      <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-[#27272a] mb-4">
                        <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Total Income</h3>
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                          <Banknote className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                      </div>
                      <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">{formatNairaFull(metrics.totalIncome)}</div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5">Released transactions</p>
                    </div>
                    <div className="rounded-xl border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#121214] p-6">
                      <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-[#27272a] mb-4">
                        <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Pending / In Escrow</h3>
                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                        </div>
                      </div>
                      <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">{metrics.pendingCount}</div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5">Awaiting confirmation</p>
                    </div>
                    <div className="rounded-xl border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#121214] p-6">
                      <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-[#27272a] mb-4">
                        <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Transactions</h3>
                        <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-200 dark:border-[#27272a] flex items-center justify-center">
                          <FileText className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                        </div>
                      </div>
                      <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">{metrics.transactionCount}</div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5">Recent total</p>
                    </div>
                    <div className="rounded-xl border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#121214] p-6">
                      <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-[#27272a] mb-4">
                        <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Available Balance</h3>
                        <Wallet className="w-4 h-4 text-zinc-600 dark:text-zinc-600 dark:text-zinc-500" />
                      </div>
                      <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">{formatNairaFull(wallet.availableBalance)}</div>
                      {wallet.availableBalance === 0 && !wallet.bankAccount ? (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">No funds yet. Setup your payout bank account to start receiving rent.</p>
                      ) : (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5">Pending clearing: {formatNairaFull(wallet.pendingClearing)}</p>
                      )}
                      <div className="mt-4 flex flex-wrap gap-2">
                        {!wallet.bankAccount ? (
                          <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20" onClick={() => setBankModalOpen(true)}>
                            <Landmark className="w-3.5 h-3.5" /> Setup bank
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" className="gap-2 border-zinc-200 dark:border-[#27272a] bg-zinc-50 dark:bg-[#18181b] text-zinc-300 hover:text-zinc-900 dark:text-white" onClick={() => setBankModalOpen(true)}>
                            <ShieldCheck className="w-3.5 h-3.5" /> {wallet.bankAccount.accountName || 'Bank'}
                          </Button>
                        )}
                        <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40" onClick={() => setWithdrawModalOpen(true)} disabled={wallet.isLocked || !wallet.bankAccount?.recipientCode}>
                          <ArrowUpRight className="w-3.5 h-3.5" /> Withdraw
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#121214]">
                    <div className="px-6 py-4 border-b border-zinc-200 dark:border-[#27272a]">
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Payout History</h3>
                    </div>
                    <div className="p-6">
                      {transactions.length === 0 && wallet.recentTransactions.length === 0 ? (
                        <div className="rounded-xl border border-zinc-200 dark:border-[#27272a] bg-zinc-50 dark:bg-[#18181b] p-8 text-center">
                          <div className="w-12 h-12 rounded-xl bg-[#27272a] border border-white/[0.06] flex items-center justify-center mx-auto mb-3">
                            <Banknote className="w-6 h-6 text-zinc-500 dark:text-zinc-400" />
                          </div>
                          <p className="text-sm font-medium text-zinc-900 dark:text-white">No payouts yet</p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Withdrawals and wallet transactions will show here.</p>
                          <div className="mt-4 flex items-center justify-center gap-2">
                            <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white" onClick={() => (window.location.href = '/dashboard/landlord/financials/invoices')}>
                              <FileText className="w-3.5 h-3.5" /> Create Invoice
                            </Button>
                            <Button size="sm" variant="outline" className="gap-2 border-zinc-200 dark:border-[#27272a] bg-white dark:bg-[#121214] text-zinc-300" onClick={() => toastHook({ title: 'Record Payment — coming soon' })}>
                              <Plus className="w-3.5 h-3.5" /> Record Payment
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm">
                            <thead className="text-zinc-600 dark:text-zinc-600 dark:text-zinc-500 border-b">
                              <tr>
                                <th className="py-3 font-medium">Date</th>
                                <th className="py-3 font-medium">Reference</th>
                                <th className="py-3 font-medium">Description</th>
                                <th className="py-3 font-medium">Type</th>
                                <th className="py-3 text-right font-medium">Amount</th>
                                <th className="py-3 font-medium">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {transactions.map((tx) => (
                                <tr key={tx.id} className="border-b last:border-0">
                                  <td className="py-3 text-zinc-600 dark:text-zinc-600 dark:text-zinc-500">{tx.date}</td>
                                  <td className="py-3 font-mono text-xs">{tx.reference}</td>
                                  <td className="py-3">{tx.listing || tx.reference}</td>
                                  <td className="py-3 capitalize">{tx.type}</td>
                                  <td className="py-3 text-right font-mono">{formatNairaFull(tx.amount)}</td>
                                  <td className="py-3">{statusBadge(tx.statusBadgeVariant, tx.status)}</td>
                                </tr>
                              ))}
                              {transactions.length === 0 &&
                                wallet.recentTransactions.map((tx) => (
                                  <tr key={`wt-${tx.id}`} className="border-b last:border-0">
                                    <td className="py-3 text-zinc-600 dark:text-zinc-600 dark:text-zinc-500">{tx.date}</td>
                                    <td className="py-3 font-mono text-xs">{tx.providerRef || tx.id}</td>
                                    <td className="py-3">{tx.description || tx.type}</td>
                                    <td className="py-3 capitalize">{tx.type.replace(/_/g, ' ')}</td>
                                    <td className="py-3 text-right font-mono">{formatNairaFull(tx.amount)}</td>
                                    <td className="py-3">
                                      <Badge variant={tx.status === 'success' ? 'default' : 'secondary'} className="capitalize border">
                                        {tx.status}
                                      </Badge>
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
            <PlaceholderTab title="Overdue" description="Overdue payments will appear here." />
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
              <Select
                value={bankCode}
                onValueChange={(v) => {
                  setBankCode(v);
                  const b = banks.find((x) => x.code === v);
                  if (b) setBankNameInput(b.name);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={banksLoading ? 'Loading banks…' : 'Select your bank'} />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {banks.map((b) => (
                    <SelectItem key={b.code} value={b.code}>
                      {b.name}
                    </SelectItem>
                  ))}
                  {!banksLoading && banks.length === 0 && (
                    <div className="px-2 py-1.5 text-xs text-zinc-600 dark:text-zinc-600 dark:text-zinc-500">No banks loaded — check PAYSTACK_SECRET_KEY</div>
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-zinc-600 dark:text-zinc-600 dark:text-zinc-500">Choose your bank — no code needed</p>
            </div>
            <Button variant="secondary" className="w-full gap-2" onClick={resolveAccount} disabled={resolving}>
              {resolving && <Loader2 className="w-4 h-4 animate-spin" />} Verify Account
            </Button>
            {accountName && (
              <div className="rounded-lg border border-success/30 bg-success/5 p-3 text-sm">
                Verified account: <span className="font-semibold">{accountName}</span> at <span className="font-semibold">{bankNameInput}</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBankModalOpen(false)} disabled={savingBank}>
              Cancel
            </Button>
            <Button onClick={saveBankAccount} disabled={savingBank || !accountName}>
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
            <div className="rounded-lg border border-zinc-200 dark:border-white/[0.08] bg-muted/5 p-3 text-xs text-zinc-600 dark:text-zinc-600 dark:text-zinc-500">
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
              <div className="text-xs text-zinc-600 dark:text-zinc-600 dark:text-zinc-500">
                Payout to: <span className="font-semibold text-zinc-900 dark:text-white">{wallet.bankAccount.accountName || 'Saved account'} - {wallet.bankAccount.bankName || ''} ****{wallet.bankAccount.accountNumber?.slice(-4)}</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWithdrawModalOpen(false)} disabled={withdrawing}>
              Cancel
            </Button>
            <Button onClick={requestWithdrawal} disabled={withdrawing}>
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
    <div className="rounded-lg border border-zinc-200 dark:border-white/[0.08] p-6 text-center">
      <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
        {title}
      </p>
      <p className="text-sm text-zinc-600 dark:text-zinc-600 dark:text-zinc-500 mt-1">{description}</p>
    </div>
  );
}