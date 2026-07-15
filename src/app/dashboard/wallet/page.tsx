
'use client';

import React, { useEffect, useState } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Copy, RefreshCcw, CreditCard, Landmark, Wallet2, ArrowDownToLine, ArrowUpFromLine, Clock } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

type Tab = 'overview' | 'deposit' | 'withdraw' | 'history' | 'methods';

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: 'overview', label: 'Overview', icon: <Wallet2 className="h-4 w-4" /> },
  { key: 'deposit', label: 'Deposit', icon: <ArrowDownToLine className="h-4 w-4" /> },
  { key: 'withdraw', label: 'Withdraw', icon: <ArrowUpFromLine className="h-4 w-4" /> },
  { key: 'history', label: 'History', icon: <Clock className="h-4 w-4" /> },
  { key: 'methods', label: 'Payment Methods', icon: <CreditCard className="h-4 w-4" /> },
];

export default function WalletPage() {
  const { user } = useUser();
  const [tab, setTab] = useState<Tab>('overview');
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Array<Record<string, unknown>>>([]);
  const [paystackAccount, setPaystackAccount] = useState<Record<string, unknown> | null>(null);
  const [withdrawalAccount, setWithdrawalAccount] = useState<{ bankName: string; accountNumber: string; accountName: string } | null>(null);
  const [paystackBalance, setPaystackBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [balanceRes, txRes, paystackRes, paystackBalanceRes] = await Promise.all([
        fetch('/api/wallet/balance'), fetch('/api/wallet/transactions?limit=20'), fetch('/api/paystack/me'), fetch('/api/paystack/balance'),
      ]);
      const balanceJson = await balanceRes.json();
      const txJson = await txRes.json();
      const paystackJson = await paystackRes.json();
      const paystackBalanceJson = await paystackBalanceRes.json();
      setBalance(balanceJson?.data?.balance ?? 0);
      setTransactions(txJson?.items ?? []);
      setPaystackAccount(paystackJson?.data ?? null);
      setPaystackBalance(paystackBalanceJson?.data?.balance ?? 0);
    } catch {
      toast.error('Failed to load wallet');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const formatAmount = (value: number | string | bigint) => {
    const amount = typeof value === 'bigint' ? Number(value) : Number(value);
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);
  };

  const copyReference = (value: string) => {
    navigator.clipboard.writeText(value).then(() => toast.success('Reference copied'));
  };

  const createPaystackCustomer = async () => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/paystack/customer', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      toast.success('Paystack payment account created');
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create account');
    } finally {
      setActionLoading(false);
    }
  };

  const createDedicatedAccount = async () => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/paystack/dedicated-account', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      toast.success('Dedicated account created');
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create dedicated account');
    } finally {
      setActionLoading(false);
    }
  };

  const deposit = async (amount: number) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/wallet/deposit/initiate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      window.location.href = data.authorizationUrl;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Deposit failed');
      setActionLoading(false);
    }
  };

  const withdraw = async (amount: number, bankCode?: string, accountNumber?: string) => {
    setActionLoading(true);
    try {
      if (bankCode && accountNumber) {
        const bankRes = await fetch('/api/user/bank', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bankCode, accountNumber }) });
        const bankData = await bankRes.json();
        if (!bankRes.ok) throw new Error(bankData.error || 'Failed to save bank');
        const payoutRes = await fetch('/api/wallet/payout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount, recipientCode: bankData.recipient.recipient_code, reason: 'Wallet withdrawal' }) });
        const payoutData = await payoutRes.json();
        if (!payoutRes.ok) throw new Error(payoutData.error || 'Payout failed');
        toast.success('Withdrawal initiated via Paystack');
      } else {
        const res = await fetch('/api/wallet/withdraw', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount }) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed');
        toast.success('Withdrawal successful');
      }
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Withdrawal failed');
    } finally {
      setActionLoading(false);
    }
  };

  const userName = user?.fullName || user?.firstName || 'User';
  const navItems = TABS.map(t => ({ label: t.label, href: `/dashboard/wallet${t.key === 'overview' ? '' : '/' + t.key}` }));
  const linkedAccount = paystackAccount ? { customerCode: paystackAccount.customerCode as string, accountName: paystackAccount.accountName as string, accountNumber: paystackAccount.accountNumber as string, bankName: paystackAccount.bankName as string } : null;

  return (
    <DashboardShell navigation={navItems} userRole="wallet" userName={userName} userAvatar={user?.imageUrl || undefined}>
      <div className="wallet-shell space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Wallet</h1>
            <p className="text-muted-foreground text-sm">Paystack-linked balance and payment management.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={load}>
              <RefreshCcw className="mr-2 size-4" /> Refresh
            </Button>
            <Button variant="ghost" size="sm" onClick={async () => { await fetch('/api/paystack/balance', { method: 'POST', body: JSON.stringify({reconcile: true})}); toast.success('Reconciled'); load(); }}>
              Reconcile Paystack
            </Button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto border-b border-border/60 pb-2">
          {TABS.map((item) => (
            <Button key={item.key} variant={tab === item.key ? 'secondary' : 'ghost'} onClick={() => setTab(item.key)} className="gap-2">
              {item.icon}
              <span className="hidden md:inline">{item.label}</span>
            </Button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Wallet balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? '...' : formatAmount(balance ?? 0)}</div>
                <p className="text-xs text-muted-foreground">Available funds</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Paystack customer balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? '...' : formatAmount(paystackBalance)}</div>
                <p className="text-xs text-muted-foreground">Live customer balance</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Payment account</CardTitle>
              </CardHeader>
              <CardContent>
                {linkedAccount ? (
                  <div className="space-y-1">
                    <p className="font-semibold">{String(linkedAccount.bankName || 'Paystack')}</p>
                    <p className="text-xs text-muted-foreground">{String(linkedAccount.accountName || '')}</p>
                    <p className="text-xs text-muted-foreground">{String(linkedAccount.accountNumber || '')}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">No payment account linked yet.</p>
                    <Button size="sm" onClick={createPaystackCustomer} disabled={actionLoading}>Create account</Button>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Withdrawal method</CardTitle>
              </CardHeader>
              <CardContent>
                {withdrawalAccount ? (
                  <div className="space-y-1">
                    <p className="font-semibold">{withdrawalAccount.bankName}</p>
                    <p className="text-xs text-muted-foreground">{withdrawalAccount.accountName}</p>
                    <p className="text-xs text-muted-foreground">{withdrawalAccount.accountNumber}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Add a bank account to withdraw.</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {tab === 'overview' && (
          <Card>
            <CardHeader>
              <CardTitle>Recent transactions</CardTitle>
              <CardDescription>Last 20 wallet activities.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.length === 0 && <p className="text-sm text-muted-foreground">No transactions yet.</p>}
                {transactions.map((tx) => (
                  <div key={String(tx.id)} className="flex items-center justify-between rounded-xl border border-border/60 bg-background p-3">
                    <div>
                      <p className="text-sm font-semibold">{String(tx.type ?? 'transaction').toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground">{String(tx.description ?? '')}</p>
                      <p className="text-[11px] text-muted-foreground">{new Date(String(tx.createdAt)).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{formatAmount(tx.amount as number)}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="secondary">{String(tx.status)}</Badge>
                        <Button variant="ghost" size="icon" onClick={() => copyReference(String(tx.reference ?? ''))}>
                          <Copy className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {tab === 'deposit' && (
          <Card className="max-w-xl">
            <CardHeader>
              <CardTitle>Deposit funds</CardTitle>
              <CardDescription>Top up your wallet using Paystack.</CardDescription>
            </CardHeader>
            <CardContent>
              <DepositForm actionLoading={actionLoading} onDeposit={deposit} setActionLoading={setActionLoading} />
            </CardContent>
          </Card>
        )}

        {tab === 'withdraw' && (
          <Card className="max-w-xl">
            <CardHeader>
              <CardTitle>Withdraw funds</CardTitle>
              <CardDescription>Minimum withdrawal is ₦500.</CardDescription>
            </CardHeader>
            <CardContent>
              <WithdrawForm actionLoading={actionLoading} onWithdraw={withdraw} setActionLoading={setActionLoading} />
            </CardContent>
          </Card>
        )}

        {tab === 'history' && (
          <Card>
            <CardHeader>
              <CardTitle>Transaction history</CardTitle>
              <CardDescription>Deposits, withdrawals, and adjustments.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.length === 0 && <p className="text-sm text-muted-foreground">No transactions yet.</p>}
                {transactions.map((tx) => (
                  <div key={String(tx.id)} className="flex items-center justify-between rounded-xl border border-border/60 bg-background p-3">
                    <div>
                      <p className="text-sm font-semibold">{String(tx.type ?? 'transaction').toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground">{String(tx.description ?? '')}</p>
                      <p className="text-[11px] text-muted-foreground">{new Date(String(tx.createdAt)).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{formatAmount(tx.amount as number)}</p>
                      <Badge variant="secondary" className="mt-1">{String(tx.status)}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {tab === 'methods' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Paystack account</CardTitle>
                <CardDescription>Payment source for deposits.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {linkedAccount ? (
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">{linkedAccount.customerCode}</p>
                    <p className="text-xs text-muted-foreground">Name: {String(withdrawalAccount?.accountName || '—')}</p>
                    <p className="text-xs text-muted-foreground">Account: {String(withdrawalAccount?.accountNumber || '—')}</p>
                    <p className="text-xs text-muted-foreground">Bank: {String(withdrawalAccount?.bankName || '—')}</p>
                    <Button size="sm" variant="outline" onClick={createDedicatedAccount} disabled={actionLoading}>Refresh dedicated account</Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Create a Paystack customer and dedicated account to fund your wallet.</p>
                    <Button size="sm" onClick={createPaystackCustomer} disabled={actionLoading}>Create payment account</Button>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Withdrawal account</CardTitle>
                <CardDescription>Destination bank for withdrawals.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Withdrawals use your linked Paystack customer details. Use the dedicated account above for Payouts.</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

function DepositForm({ actionLoading, onDeposit, setActionLoading }: { actionLoading: boolean; onDeposit: (amount: number) => Promise<void>; setActionLoading: (v: boolean) => void }) {
  const [amount, setAmount] = useState('5000');
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setActionLoading(true);
        onDeposit(Number(amount)).finally(() => setActionLoading(false));
      }}
      className="space-y-4"
    >
      <Field>
        <FieldLabel htmlFor="amount">Amount (₦)</FieldLabel>
        <Input id="amount" type="number" min={100} value={amount} onChange={(event) => setAmount(event.target.value)} required />
      </Field>
      <Button type="submit" disabled={actionLoading} className="w-full">{actionLoading ? 'Opening Paystack...' : 'Proceed to Paystack'}</Button>
    </form>
  );
}

function WithdrawForm({ actionLoading, onWithdraw, setActionLoading }: { actionLoading: boolean; onWithdraw: (amount: number, bankCode?: string, accountNumber?: string) => Promise<void>; setActionLoading: (v: boolean) => void }) {
  const [amount, setAmount] = useState('5000');
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [banks, setBanks] = useState<Array<Record<string, unknown>>>([]);
  const [accountName, setAccountName] = useState<string | null>(null);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setActionLoading(true);
        onWithdraw(Number(amount), bankCode, accountNumber).finally(() => setActionLoading(false));
      }}
      className="space-y-4"
    >
      <Field>
        <FieldLabel htmlFor="amount">Amount (₦)</FieldLabel>
        <Input id="amount" type="number" min={500} value={amount} onChange={(event) => setAmount(event.target.value)} required />
      </Field>
      <Field>
        <FieldLabel htmlFor="bank">Bank</FieldLabel>
        <select id="bank" className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" value={bankCode} onChange={(e) => setBankCode(e.target.value)} required>
          <option value="">Select bank</option>
          {banks.map((bank) => (
            <option key={String(bank.code)} value={String(bank.code)}>{String(bank.name)}</option>
          ))}
        </select>
      </Field>
      <Field>
        <FieldLabel htmlFor="accountNumber">Account number</FieldLabel>
        <Input id="accountNumber" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} required />
      </Field>
      {accountName && <p className="text-xs text-muted-foreground">Account name: {accountName}</p>}
      <Button type="submit" disabled={actionLoading} className="w-full">{actionLoading ? 'Processing...' : 'Withdraw'}</Button>
    </form>
  );
}
