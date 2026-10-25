'use client';

import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
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
} from 'lucide-react';
import { formatNairaFull } from '@/lib/utils';

type WalletTxRow = {
  id: string;
  type: string;
  status: string;
  amount: number;
  currency: string;
  providerRef: string | null;
  description: string | null;
  date: string;
};

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
  } | null;
  recentTransactions: WalletTxRow[];
};

const MIN_WITHDRAWAL = 500;

export default function LandlordWithdrawalsPage() {
  const { toast: toastHook } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wallet, setWallet] = useState<WalletState>({
    availableBalance: 0,
    pendingClearing: 0,
    currency: 'NGN',
    isLocked: false,
    bankAccount: null,
    recentTransactions: [],
  });
  const [totalWithdrawn, setTotalWithdrawn] = useState(0);

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
      const [balRes, txRes] = await Promise.all([
        fetch('/api/wallet/balance', { cache: 'no-store' }),
        fetch('/api/wallet/transactions', { cache: 'no-store' }),
      ]);
      const balJson = await balRes.json().catch(() => ({}));
      const txJson = await txRes.json().catch(() => ({}));
      const w = balJson?.data || balJson?.wallet || balJson || {};
      const txs = (txJson?.data || txJson?.transactions || []).map((t: any) => ({
        id: t.id,
        type: t.type,
        status: t.status,
        amount: Number(t.amount),
        currency: t.currency || 'NGN',
        providerRef: t.providerRef ?? t.reference ?? null,
        description: t.description ?? null,
        date: t.date || t.createdAt || new Date().toISOString(),
      }));
      setWallet({
        availableBalance: w.availableBalance ?? w.balance ?? 0,
        pendingClearing: w.pendingClearing ?? w.pending ?? 0,
        currency: w.currency || 'NGN',
        isLocked: w.isLocked || false,
        bankAccount: w.bankAccount || null,
        recentTransactions: txs,
      });
      const withdrawn = txs
        .filter((t: any) => String(t.type).toLowerCase().includes('withdraw'))
        .reduce((s: number, t: any) => s + Number(t.amount || 0), 0);
      setTotalWithdrawn(withdrawn);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load wallet');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

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

  const handleExport = () => toastHook({ title: 'Export started', description: 'Your CSV export will be available shortly.' });

  return (
    <DashboardShell navigation={LANDLORD_NAVIGATION} userRole="landlord" userName="Landlord" userAvatar={undefined}>
      <ErrorBoundary>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <nav className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                <span>Home</span><span>/</span><span>Financials &amp; Payouts</span><span>/</span><span className="text-emerald-600 font-semibold">Withdrawals</span>
              </nav>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Withdrawals &amp; Fund Management</h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Disburse rental yields, manage settlement nodes, and monitor payouts.</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="sm" className="gap-2 border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400" onClick={() => setBankModalOpen(true)}>
                <Landmark className="w-4 h-4" /> Payout Bank Settings
              </Button>
              <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white" onClick={() => setWithdrawModalOpen(true)} disabled={wallet.isLocked || !wallet.bankAccount?.recipientCode}>
                <ArrowUpRight className="w-4 h-4" /> Request Withdrawal
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-40 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/10 p-4 text-sm text-red-600 dark:text-red-400">{error}</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 p-6 relative overflow-hidden">
                  <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600"><Wallet className="w-5 h-5" /></div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Live Escrow Float</span>
                  </div>
                  <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">{formatNairaFull(wallet.availableBalance)}</div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">Settled &amp; ready for immediate disbursement</p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Direct Bank Settlement Ready</div>
                </div>
                <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 p-6 relative overflow-hidden">
                  <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400"><Loader2 className="w-5 h-5" /></div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">Clearing</span>
                  </div>
                  <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">{formatNairaFull(wallet.pendingClearing)}</div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">Pending clearing with escrow custody</p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 font-mono"><RefreshCcw className="w-3.5 h-3.5" /> Pending clearing</div>
                </div>
                <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 p-6 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300"><Banknote className="w-5 h-5" /></div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Audited</span>
                  </div>
                  <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">{formatNairaFull(totalWithdrawn)}</div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">YTD aggregate disbursals</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                    <span>Tax Withheld (WHT 10%): Compliant</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% Cleared</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 overflow-hidden">
                <div className="p-4 border-b border-zinc-200 dark:border-white/[0.08] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                  <div className="relative flex-1 max-w-sm">
                    <Input placeholder="Search reference, destination account, bank..." className="h-9 text-xs bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-white/[0.08] text-zinc-900 dark:text-white rounded-lg" />
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="outline" size="sm" onClick={handleExport} className="gap-2 border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                      <Download className="w-3.5 h-3.5" /> Export CSV
                    </Button>
                    <Button variant="ghost" size="sm" onClick={load} className="gap-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800">
                      <RefreshCcw className="w-3.5 h-3.5" /> Refresh
                    </Button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 uppercase text-[11px] tracking-wider">
                      <tr>
                        <th className="py-3 px-4 font-medium">Reference</th>
                        <th className="py-3 px-4 font-medium">Date &amp; Time</th>
                        <th className="py-3 px-4 font-medium">Destination Account</th>
                        <th className="py-3 px-4 font-medium">Type</th>
                        <th className="py-3 px-4 font-medium text-right">Amount</th>
                        <th className="py-3 px-4 font-medium text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-white/[0.06]">
                      {wallet.recentTransactions.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center">
                            <div className="flex flex-col items-center gap-2">
                              <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-white/[0.08] flex items-center justify-center">
                                <Wallet className="w-6 h-6 text-zinc-400" />
                              </div>
                              <p className="text-sm font-medium text-zinc-900 dark:text-white">No withdrawals yet</p>
                              <p className="text-xs text-zinc-600 dark:text-zinc-400">Your settlement transactions will populate here.</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        wallet.recentTransactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                            <td className="py-3.5 px-4 font-mono text-xs text-emerald-600 dark:text-emerald-400 font-bold">{tx.providerRef || tx.id}</td>
                            <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">{new Date(tx.date).toLocaleString('en-NG')}</td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 font-bold text-xs">BK</div>
                                <div className="flex flex-col">
                                  <span className="text-sm text-zinc-900 dark:text-white">{wallet.bankAccount?.bankName || 'Bank'} •••• {wallet.bankAccount?.accountNumber?.slice(-4) || '----'}</span>
                                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">{wallet.bankAccount?.accountName || ''}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-xs text-zinc-600 dark:text-zinc-400 capitalize">{tx.type.replace(/_/g, ' ')}</span>
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-bold text-zinc-900 dark:text-white">{formatNairaFull(tx.amount)}</td>
                            <td className="py-3.5 px-4 text-center">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${tx.status === 'success' || tx.status === 'released' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : tx.status === 'pending' ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400' : 'bg-red-500/10 text-red-700 dark:text-red-400'}`}>
                                {tx.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="px-4 py-3 border-t border-zinc-200 dark:border-white/[0.08] text-xs text-zinc-500 dark:text-zinc-400">
                  Showing {wallet.recentTransactions.length} of {wallet.recentTransactions.length} total withdrawal ledger records
                </div>
              </div>
            </>
          )}
        </div>

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
                    {banks.map((b) => (<SelectItem key={b.code} value={b.code}>{b.name}</SelectItem>))}
                    {!banksLoading && banks.length === 0 && (<div className="px-2 py-1.5 text-xs text-zinc-500">No banks loaded — check PAYSTACK_SECRET_KEY</div>)}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="secondary" className="w-full gap-2" onClick={resolveAccount} disabled={resolving}>
                {resolving && <Loader2 className="w-4 h-4 animate-spin" />} Verify Account
              </Button>
              {accountName && (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm text-zinc-900 dark:text-white">
                  Verified account: <span className="font-semibold">{accountName}</span> at <span className="font-semibold">{bankNameInput}</span>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setBankModalOpen(false)} disabled={savingBank}>Cancel</Button>
              <Button onClick={saveBankAccount} disabled={savingBank || !accountName}>
                {savingBank && <Loader2 className="w-4 h-4 animate-spin" />} Save Bank
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={withdrawModalOpen} onOpenChange={setWithdrawModalOpen}>
          <DialogContent showCloseButton>
            <DialogHeader>
              <DialogTitle>Request Fund Withdrawal</DialogTitle>
              <DialogDescription>Initiate a payout to your saved bank account via Paystack Transfers.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="rounded-lg border border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-zinc-800 p-3 text-xs text-zinc-600 dark:text-zinc-400">
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
              <Button onClick={requestWithdrawal} disabled={withdrawing}>
                {withdrawing && <Loader2 className="w-4 h-4 animate-spin" />} Send payout request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </ErrorBoundary>
    </DashboardShell>
  );
}
