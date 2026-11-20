'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, ArrowLeft, Banknote, Check, CheckCircle2, ChevronDown, CreditCard, ExternalLink, Info, Landmark, Loader2, LockKeyhole, Search, ShieldCheck } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import TenantRailShell from '@/components/layout/TenantRailShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { TENANT_NAVIGATION } from '@/lib/navigation';
import { toast } from '@/hooks/use-toast';

type Bank = { name: string; code: string; slug: string };
type Method = 'card' | 'bank';
type BankPayload = { name?: string; code?: string | number; slug?: string };

export default function AddPaymentMethodNewPage() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [method, setMethod] = useState<Method>(() => searchParams.get('method') === 'bank' ? 'bank' : 'card');
  const [banks, setBanks] = useState<Bank[]>([]);
  const [banksLoading, setBanksLoading] = useState(true);
  const [bankSearch, setBankSearch] = useState('');
  const [bankOpen, setBankOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [resolving, setResolving] = useState(false);
  const [resolved, setResolved] = useState(false);
  const [saveInfo, setSaveInfo] = useState(true);
  const [saving, setSaving] = useState(false);
  const bankPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/paystack/banks')
      .then((response) => response.json())
      .then((payload) => {
        if (cancelled) return;
        const list = Array.isArray(payload?.data) ? payload.data : [];
        setBanks(list.map((bank: BankPayload) => ({ name: bank.name || 'Unknown bank', code: String(bank.code || ''), slug: bank.slug || '' })).filter((bank: Bank) => bank.code));
      })
      .catch(() => { if (!cancelled) toast({ title: 'Could not load banks', description: 'Please try again shortly.', variant: 'destructive' }); })
      .finally(() => { if (!cancelled) setBanksLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const close = (event: MouseEvent) => { if (!bankPickerRef.current?.contains(event.target as Node)) setBankOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const bank = banks.find((item) => item.code === selectedBank);
  const filteredBanks = useMemo(() => {
    const query = bankSearch.trim().toLowerCase();
    return query ? banks.filter((item) => item.name.toLowerCase().includes(query)) : banks;
  }, [bankSearch, banks]);
  const accountNumberValid = /^\d{10}$/.test(accountNumber);
  const canVerify = Boolean(selectedBank && accountNumberValid && !resolving);
  const canSave = Boolean(saveInfo && selectedBank && accountNumberValid && resolved && accountName && !saving);

  const resetVerification = (nextAccount = accountNumber) => {
    setAccountNumber(nextAccount);
    setResolved(false);
    setAccountName('');
    setVerificationError('');
  };

  const resolveAccount = async () => {
    if (!canVerify) return;
    setResolving(true);
    setResolved(false);
    setAccountName('');
    setVerificationError('');
    try {
      const response = await fetch(`/api/paystack/resolve-account?accountNumber=${encodeURIComponent(accountNumber)}&bankCode=${encodeURIComponent(selectedBank)}`);
      const payload = await response.json();
      if (!response.ok || !payload?.status || !payload?.data?.account_name) throw new Error(payload?.message || payload?.error || 'We could not verify this account.');
      setAccountName(payload.data.account_name);
      setResolved(true);
      toast({ title: 'Account verified', description: payload.data.account_name });
    } catch (error) {
      setVerificationError(error instanceof Error ? error.message : 'We could not verify this account.');
    } finally {
      setResolving(false);
    }
  };

  const saveBank = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const response = await fetch('/api/user/bank', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ accountNumber, bankCode: selectedBank }) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.success) throw new Error(payload?.error || 'We could not save this account.');
      toast({ title: 'Payment method saved', description: `${bank?.name || 'Bank account'} ending in ${accountNumber.slice(-4)}` });
      router.push('/dashboard/tenant/payments');
      router.refresh();
    } catch (error) {
      toast({ title: 'Save failed', description: error instanceof Error ? error.message : 'Please try again.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <TenantRailShell navigation={TENANT_NAVIGATION} userRole="tenant" userName={user?.fullName || user?.firstName || 'Tenant'} userAvatar={user?.imageUrl}>
      <ErrorBoundary>
        <main className="mx-auto w-full max-w-6xl space-y-7 pb-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400"><Link href="/dashboard/tenant/payments" className="inline-flex items-center gap-2 transition-colors hover:text-zinc-950 dark:hover:text-white"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Payments</Link><span aria-hidden="true">/</span><span className="text-zinc-900 dark:text-white">Add payment method</span></nav>
          <header className="max-w-2xl space-y-2"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Payment settings</p><h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white md:text-4xl">Add a payment method</h1><p className="max-w-xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">Save a method to make future rent and tenancy payments easier. You are adding a tenant payment method, not a landlord payout account.</p></header>

          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.9fr)_minmax(280px,0.9fr)]">
            <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/[0.09] dark:bg-zinc-900/70 sm:p-7" aria-labelledby="payment-form-title">
              <div className="space-y-1 border-b border-zinc-200 pb-5 dark:border-white/[0.09]"><h2 id="payment-form-title" className="text-lg font-semibold text-zinc-950 dark:text-white">Choose how you want to pay</h2><p className="text-sm text-zinc-600 dark:text-zinc-400">Select one option. You can add another method later.</p></div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Payment method">
                {([{ id: 'card' as const, icon: CreditCard, title: 'Debit / Credit Card', description: 'Pay securely through Paystack checkout.' }, { id: 'bank' as const, icon: Landmark, title: 'Bank Account', description: 'Verify a Nigerian 10-digit NUBAN.' }]).map((item) => { const Icon = item.icon; const active = method === item.id; return <button key={item.id} type="button" role="radio" aria-checked={active} onClick={() => setMethod(item.id)} className={`group flex min-h-[112px] items-start gap-3 rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900 ${active ? 'border-primary bg-primary/[0.06] dark:bg-primary/[0.09]' : 'border-zinc-200 bg-zinc-50/60 hover:border-zinc-300 dark:border-white/[0.09] dark:bg-white/[0.03] dark:hover:border-white/20'}`}><span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${active ? 'bg-primary text-white' : 'bg-zinc-200/70 text-zinc-600 dark:bg-white/[0.08] dark:text-zinc-300'}`}><Icon className="h-5 w-5" aria-hidden="true" /></span><span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><span className="text-sm font-semibold text-zinc-950 dark:text-white">{item.title}</span><span className={`flex h-5 w-5 items-center justify-center rounded-full border ${active ? 'border-primary bg-primary text-white' : 'border-zinc-300 dark:border-zinc-600'}`}>{active && <Check className="h-3.5 w-3.5" aria-hidden="true" />}</span></span><span className="mt-1 block text-xs leading-5 text-zinc-600 dark:text-zinc-400">{item.description}</span></span></button>; })}
              </div>

              {method === 'card' ? <div className="mt-6 space-y-5 rounded-xl border border-zinc-200 bg-zinc-50/70 p-5 dark:border-white/[0.09] dark:bg-white/[0.03]"><div className="flex items-start gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/[0.12] text-primary"><CreditCard className="h-5 w-5" aria-hidden="true" /></span><div><h3 className="font-semibold text-zinc-950 dark:text-white">Card payments use Paystack checkout</h3><p className="mt-1 text-sm leading-5 text-zinc-600 dark:text-zinc-400">PropatiBox does not collect raw card numbers or CVV on this page. Card authorization is currently available when you start a rent payment.</p></div></div><div className="flex items-start gap-3 rounded-lg border border-amber-300/70 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-400/20 dark:bg-amber-400/[0.08] dark:text-amber-200"><Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /><span>Saving a reusable card method needs a Paystack authorization-code flow and a payment-method record, which this application does not currently expose.</span></div><Button asChild className="h-11 w-full bg-primary font-semibold text-white hover:bg-primary/90 sm:w-auto"><Link href="/dashboard/tenant/payments"><CreditCard className="mr-2 h-4 w-4" />Go to rent payments</Link></Button></div> : <div className="mt-6 space-y-5">
                <div className="space-y-2" ref={bankPickerRef}><Label htmlFor="bank-search">Bank</Label><div className="relative"><button type="button" id="bank-search" aria-haspopup="listbox" aria-expanded={bankOpen} onClick={() => setBankOpen((open) => !open)} className="flex h-11 w-full items-center justify-between rounded-lg border border-zinc-300 bg-white px-3 text-left text-sm text-zinc-950 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:border-white/[0.12] dark:bg-zinc-950 dark:text-white"><span className={bank ? 'font-medium' : 'text-zinc-500'}>{bank?.name || (banksLoading ? 'Loading banks...' : 'Search for your bank')}</span><ChevronDown className="h-4 w-4 text-zinc-500" aria-hidden="true" /></button>{bankOpen && <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-zinc-200 bg-white p-2 shadow-xl dark:border-white/[0.12] dark:bg-zinc-900"><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" aria-hidden="true" /><Input autoFocus value={bankSearch} onChange={(event) => setBankSearch(event.target.value)} placeholder="Search banks" className="h-10 pl-9" aria-label="Search banks" /></div><div role="listbox" className="mt-2 max-h-56 overflow-y-auto">{filteredBanks.map((item) => <button key={item.code} type="button" role="option" aria-selected={item.code === selectedBank} onClick={() => { setSelectedBank(item.code); setBankOpen(false); setBankSearch(''); resetVerification(); }} className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm text-zinc-800 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-white/[0.08]"><span>{item.name}</span>{item.code === selectedBank && <Check className="h-4 w-4 text-primary" aria-hidden="true" />}</button>)}{!banksLoading && filteredBanks.length === 0 && <p className="px-3 py-3 text-sm text-zinc-500">No matching banks.</p>}</div></div>}</div></div>
                <div className="space-y-2"><Label htmlFor="account-number">Account number</Label><div className="relative"><Input id="account-number" inputMode="numeric" autoComplete="off" value={accountNumber} onChange={(event) => resetVerification(event.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="0123456789" maxLength={10} aria-describedby="account-number-help" className="h-11 pr-10 font-mono tracking-wider" />{resolving && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-zinc-500" aria-hidden="true" />}</div><p id="account-number-help" className={`text-xs ${accountNumber.length > 0 && !accountNumberValid ? 'text-red-600 dark:text-red-400' : 'text-zinc-500 dark:text-zinc-400'}`}>{accountNumber.length > 0 && !accountNumberValid ? 'Enter all 10 digits of your NUBAN account number.' : 'Your account number is used only to verify the account name and save the linked recipient.'}</p></div>
                <div className="space-y-2"><Label htmlFor="account-name">Account name</Label><div id="account-name" role="status" aria-live="polite" className={`flex min-h-11 items-center gap-2 rounded-lg border px-3 text-sm ${resolved ? 'border-primary/50 bg-primary/[0.06] text-zinc-950 dark:bg-primary/[0.09] dark:text-white' : verificationError ? 'border-red-300 bg-red-50 text-red-800 dark:border-red-400/30 dark:bg-red-400/[0.08] dark:text-red-200' : 'border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-white/[0.09] dark:bg-white/[0.03]'}`}>{resolved ? <><CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" /><span className="font-medium">{accountName}</span></> : verificationError ? <><AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" /><span>{verificationError}</span></> : <span>Verify your account to fetch the account name</span>}</div></div>
                <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-white/[0.09] dark:bg-white/[0.03]"><div className="flex items-start gap-3"><Checkbox id="save-account" checked={saveInfo} onCheckedChange={(checked) => setSaveInfo(checked === true)} className="mt-0.5" /><div><Label htmlFor="save-account" className="cursor-pointer text-sm font-medium text-zinc-950 dark:text-white">Save this payment method</Label><p className="mt-1 text-xs leading-5 text-zinc-600 dark:text-zinc-400">Use this verified account for future tenant payments. It is not a payout or escrow settlement account.</p></div></div></div>
                <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:justify-end"><Button type="button" variant="outline" onClick={resolveAccount} disabled={!canVerify} className="h-11 sm:min-w-36">{resolving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}{resolving ? 'Verifying...' : 'Verify account'}</Button><Button type="button" onClick={saveBank} disabled={!canSave} className="h-11 bg-primary font-semibold text-white hover:bg-primary/90 sm:min-w-40">{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LockKeyhole className="mr-2 h-4 w-4" />}{saving ? 'Saving...' : 'Save payment method'}</Button></div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400" aria-live="polite">{!selectedBank ? 'Choose a bank to continue.' : !accountNumberValid ? 'Enter a valid 10-digit account number to enable verification.' : !resolved ? 'Verify the account name before saving.' : !saveInfo ? 'Select “Save this payment method” to enable saving.' : 'Your account is ready to be saved.'}</p>
              </div>}
            </section>

            <aside className="space-y-4" aria-label="Payment information"><div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/[0.09] dark:bg-zinc-900/70"><div className="flex items-start gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/[0.12] text-primary"><ShieldCheck className="h-5 w-5" aria-hidden="true" /></span><div><h2 className="font-semibold text-zinc-950 dark:text-white">Payment security</h2><p className="mt-1 text-sm leading-5 text-zinc-600 dark:text-zinc-400">Paystack handles provider-side payment processing. PropatiBox does not ask for your banking PIN or store raw card details here.</p></div></div></div><div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/[0.09] dark:bg-zinc-900/70"><div className="flex items-start gap-3"><Banknote className="mt-0.5 h-5 w-5 shrink-0 text-zinc-700 dark:text-zinc-300" aria-hidden="true" /><div><h2 className="font-semibold text-zinc-950 dark:text-white">How verification works</h2><p className="mt-1 text-sm leading-5 text-zinc-600 dark:text-zinc-400">We send your bank code and 10-digit account number to Paystack’s account-resolution endpoint. The returned name is shown for you to confirm before saving.</p></div></div></div><div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-5 dark:border-white/[0.09] dark:bg-white/[0.03]"><h2 className="font-semibold text-zinc-950 dark:text-white">Need a saved method?</h2><p className="mt-1 text-sm leading-5 text-zinc-600 dark:text-zinc-400">View or manage tenant payment methods from Rent &amp; Payments.</p><Link href="/dashboard/tenant/payments" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">Open Rent &amp; Payments <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></Link></div><div className="flex items-start gap-2 px-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400"><LockKeyhole className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />Tenant payment methods are separate from landlord payout accounts and escrow settlement accounts.</div></aside>
          </div>
        </main>
      </ErrorBoundary>
    </TenantRailShell>
  );
}
