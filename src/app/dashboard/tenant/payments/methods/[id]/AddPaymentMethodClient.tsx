'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CreditCard, Lock, Eye, EyeOff, Shield, HelpCircle, Loader2, CheckCircle2, AlertCircle, Building2, Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useKycStatus } from '@/lib/dojah-client';

type Bank = { name: string; code: string; slug: string };

export default function AddPaymentMethodClient({ methodType }: { methodType: string }) {
  const router = useRouter();
  const { data: kyc } = useKycStatus();

  const [activeTab, setActiveTab] = useState<'card' | 'bank'>(methodType === 'bank' ? 'bank' : 'card');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [showCvv, setShowCvv] = useState(false);
  const [saveInfo, setSaveInfo] = useState(true);

  const [banks, setBanks] = useState<Bank[]>([]);
  const [banksLoading, setBanksLoading] = useState(false);
  const [selectedBank, setSelectedBank] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [resolving, setResolving] = useState(false);
  const [resolved, setResolved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Bank list from Paystack (real, full NIP list — not a hardcoded 4-bank array)
  useEffect(() => {
    let cancelled = false;
    setBanksLoading(true);
    fetch('/api/paystack/banks')
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        const list = Array.isArray(d?.data) ? d.data : Array.isArray(d?.banks) ? d.banks : [];
        setBanks(list.map((b: any) => ({ name: b.name, code: String(b.code), slug: b.slug || '' })));
      })
      .catch(() => { if (!cancelled) toast({ title: 'Could not load banks', variant: 'destructive' }); })
      .finally(() => { if (!cancelled) setBanksLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const resolveAccount = async () => {
    if (!selectedBank || accountNumber.length !== 10) {
      toast({ title: 'Select bank and enter 10-digit account number', variant: 'destructive' });
      return;
    }
    setResolving(true);
    setResolved(false);
    setAccountName('');
    try {
      const res = await fetch(`/api/paystack/resolve-account?accountNumber=${encodeURIComponent(accountNumber)}&bankCode=${encodeURIComponent(selectedBank)}`);
      const data = await res.json();
      if (!res.ok || !data?.status) throw new Error(data?.message || 'Unable to resolve account');
      const name = data?.data?.account_name;
      if (!name) throw new Error('No account name returned');
      setAccountName(name);
      setResolved(true);
      toast({ title: 'Account verified', description: name });
    } catch (e) {
      setResolved(false);
      toast({ title: 'Verification failed', description: e instanceof Error ? e.message : 'Unknown error', variant: 'destructive' });
    } finally {
      setResolving(false);
    }
  };

  const submitBank = async () => {
    if (!selectedBank || !resolved || !accountName) {
      toast({ title: 'Verify account first', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/user/bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountNumber, bankCode: selectedBank }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) throw new Error(data?.error || 'Failed to save bank account');
      toast({ title: 'Bank account saved', description: `${accountName}` });
      router.push('/dashboard/tenant/payments');
      router.refresh();
    } catch (e) {
      toast({ title: 'Save failed', description: e instanceof Error ? e.message : 'Unknown error', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const formatCard = (val: string) => val.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);

  return (
    <div className="max-w-4xl space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-mono tracking-widest text-zinc-500">
        <Link href="/dashboard/tenant/payments" className="hover:text-zinc-900 dark:hover:text-white">PAYMENTS</Link>
        <span className="text-zinc-300 dark:text-zinc-700">›</span>
        <Link href="/dashboard/tenant/payments" className="hover:text-zinc-900 dark:hover:text-white">SAVED METHODS</Link>
        <span className="text-zinc-300 dark:text-zinc-700">›</span>
        <span className="font-semibold text-zinc-900 dark:text-white">ADD PAYMENT METHOD</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50">
            <div className="border-b border-zinc-200 dark:border-white/[0.08] px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white"><CreditCard className="h-5 w-5" /></span>
                <div>
                  <h1 className="font-semibold text-zinc-900 dark:text-white">Add Payment Method</h1>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Securely link your card or bank details for rent &amp; escrow payments.</p>
                </div>
              </div>
            </div>
            <div className="space-y-5 p-6">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'card' | 'bank')} className="space-y-5">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="card">Debit / Credit Card</TabsTrigger>
                  <TabsTrigger value="bank">Bank Account</TabsTrigger>
                </TabsList>

                <TabsContent value="card" className="space-y-4">
                  <div className="rounded-lg border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 p-4 text-sm">
                    <p className="flex items-center gap-2 font-semibold text-amber-800 dark:text-amber-300"><AlertCircle className="h-4 w-4" /> Card tokenization coming soon</p>
                    <p className="mt-1 text-xs text-zinc-700 dark:text-zinc-300">PropatiBox currently stores payout bank accounts via Paystack. Card saving will be enabled once Paystack card authorization is wired. Use the Bank Account tab to add a payout method now.</p>
                  </div>
                  <div className="grid gap-4 opacity-50 pointer-events-none">
                    <div className="space-y-1.5">
                      <Label>Cardholder Name</Label>
                      <Input value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="Name on card" disabled />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Card Number</Label>
                      <Input value={cardNumber} onChange={(e) => setCardNumber(formatCard(e.target.value))} placeholder="0000 0000 0000 0000" disabled />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label>Expiry (MM/YY)</Label>
                        <Input value={expiry} onChange={(e) => setExpiry(e.target.value)} placeholder="MM/YY" disabled />
                      </div>
                      <div className="space-y-1.5">
                        <Label>CVV</Label>
                        <div className="relative">
                          <Input type={showCvv ? 'text' : 'password'} value={cvv} onChange={(e) => setCvv(e.target.value)} placeholder="***" disabled />
                          <button type="button" onClick={() => setShowCvv(!showCvv)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"><Eye className="h-4 w-4" /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="bank" className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>Select Bank</Label>
                    <Select value={selectedBank} onValueChange={(v) => { setSelectedBank(v); setResolved(false); setAccountName(''); }}>
                      <SelectTrigger><SelectValue placeholder={banksLoading ? 'Loading banks…' : 'Choose your bank'} /></SelectTrigger>
                      <SelectContent>
                        {banks.map((b) => (
                          <SelectItem key={b.code} value={b.code}>{b.name}</SelectItem>
                        ))}
                        {!banksLoading && banks.length === 0 && <SelectItem value="__none" disabled>No banks loaded — check PAYSTACK_SECRET_KEY</SelectItem>}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Account Number</Label>
                    <div className="relative">
                      <Input type="text" value={accountNumber} onChange={(e) => { setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10)); setResolved(false); setAccountName(''); }} placeholder="0123456789" className="pr-10" />
                      {resolving && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-zinc-500" />}
                    </div>
                    <p className="text-xs text-zinc-500">10-digit NUBAN. Paystack resolves the account name.</p>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Account Name</Label>
                    <div className={`flex h-11 items-center gap-2 rounded-lg border px-4 text-sm ${resolved ? 'border-primary/40 bg-primary/5' : 'border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-zinc-950'}`}>
                      <span className={resolved ? 'font-semibold text-[var(--sovereign-hover)] dark:text-[#6ffbbe]' : 'text-zinc-500'}>{accountName || 'Verify account to fetch name'}</span>
                      {resolved && <CheckCircle2 className="h-4 w-4 text-primary" />}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox id="save" checked={saveInfo} onCheckedChange={(c) => setSaveInfo(c === true)} />
                    <Label htmlFor="save" className="text-sm leading-relaxed">Save this account for future payments</Label>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button variant="outline" onClick={() => router.push('/dashboard/tenant/payments')}>Cancel</Button>
                    <Button onClick={resolveAccount} variant="outline" disabled={resolving || accountNumber.length !== 10 || !selectedBank}>
                      {resolving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Shield className="mr-2 h-4 w-4" />}
                      {resolving ? 'Verifying…' : 'Verify Account'}
                    </Button>
                    <Button onClick={submitBank} disabled={submitting || !resolved} className="bg-primary hover:bg-primary text-white">
                      {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
                      {submitting ? 'Saving…' : 'Securely Add'}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-5 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-white/[0.06]"><Lock className="h-7 w-7 text-zinc-700 dark:text-zinc-300" /></span>
            <h4 className="mt-3 font-semibold text-zinc-900 dark:text-white">Trust Shield</h4>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Financial data secured by 256-bit SSL encryption and Paystack PCI-DSS.</p>
          </div>
          <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-white/[0.06]"><Shield className="h-5 w-5 text-zinc-700 dark:text-zinc-300" /></span>
              <div>
                <p className="text-sm font-bold text-zinc-900 dark:text-white">PCI-DSS Compliant</p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">Paystack handles all card/bank data; PropatiBox never stores raw PAN.</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-5 text-sm">
            <h4 className="font-semibold text-zinc-900 dark:text-white">Saved Methods</h4>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">Your saved payout account appears on the Rent &amp; Payments page. No card is stored — Paystack tokenizes on demand.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
