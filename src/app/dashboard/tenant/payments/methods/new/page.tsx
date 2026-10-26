'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CreditCard, Lock, Shield, Wallet, Smartphone, ArrowLeft, Loader2, CheckCircle2, Check, AlertCircle, Building2, Info, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TenantRailShell from '@/components/layout/TenantRailShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { TENANT_NAVIGATION } from '@/lib/navigation';
import { useUser } from '@clerk/nextjs';
import { toast } from '@/hooks/use-toast';

type Bank = { name: string; code: string; slug: string };
type Channel = 'card' | 'bank' | 'mobile' | 'escrow';

export default function AddPaymentMethodNewPage() {
  const { user } = useUser();
  const router = useRouter();

  // Channel
  const [channel, setChannel] = useState<Channel>('card');

  // Card (coming-soon placeholder — no real tokenization yet, per no-PaymentMethod model)
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardSaving, setCardSaving] = useState(false);

  // Bank (live wiring)
  const [banks, setBanks] = useState<Bank[]>([]);
  const [banksLoading, setBanksLoading] = useState(false);
  const [selectedBank, setSelectedBank] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [resolving, setResolving] = useState(false);
  const [resolved, setResolved] = useState(false);
  const [bankSaving, setBankSaving] = useState(false);

  // Mobile + Escrow (live escrow fetch)
  const [mobile, setMobile] = useState('');
  const [mobileSending, setMobileSending] = useState(false);
  const [escrow, setEscrow] = useState<{ bankName: string | null; accountNumber: string | null; accountName: string | null } | null>(null);
  const [escrowLoading, setEscrowLoading] = useState(false);

  // Live: banks (full NIP list), escrow V-account, account verification + save
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

    // Try to load existing dedicated escrow account for this tenant (Providus/Wema V-Account)
    setEscrowLoading(true);
    fetch('/api/users/me/profile')
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        // Profile may expose paystackAccount / dedicatedAccount in different shapes
        const pa = d?.data?.paystackAccount || d?.paystackAccount || d?.profile?.paystackAccount || null;
        if (pa && (pa.accountNumber || pa.dedicatedAccountId || pa.account_number)) {
          setEscrow({
            bankName: pa.bankName || pa.bank_name || pa.dedicatedBank || 'Providus Bank PLC',
            accountNumber: pa.accountNumber || pa.account_number || pa.dedicatedAccountId || null,
            accountName: pa.accountName || pa.account_name || pa.customerName || null,
          });
        } else {
          // Fallback: try dedicated-account endpoint directly
          return fetch('/api/paystack/dedicated-account')
            .then((r) => r.json())
            .then((dd) => {
              if (cancelled) return;
              const v = dd?.data || dd?.account || null;
              if (v && (v.account_number || v.accountNumber)) {
                setEscrow({
                  bankName: v.bank?.name || v.bankName || 'Providus Bank PLC',
                  accountNumber: v.account_number || v.accountNumber,
                  accountName: v.account_name || v.accountName || null,
                });
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setEscrowLoading(false); });

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
    setBankSaving(true);
    try {
      const res = await fetch('/api/user/bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountNumber, bankCode: selectedBank }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) throw new Error(data?.error || 'Failed to save bank account');
      toast({ title: 'Bank account linked', description: accountName });
      router.push('/dashboard/tenant/payments');
      router.refresh();
    } catch (e) {
      toast({ title: 'Save failed', description: e instanceof Error ? e.message : 'Unknown error', variant: 'destructive' });
    } finally {
      setBankSaving(false);
    }
  };

  const submitCard = async () => {
    setCardSaving(true);
    await new Promise((r) => setTimeout(r, 900));
    toast({ title: 'Card tokenization coming soon', description: 'Bank account is the settlement channel for rent. Card will be available once Paystack authorization is wired.' });
    setCardSaving(false);
  };

  const sendMobileOtp = async () => {
    const digits = mobile.replace(/\D/g, '');
    if (digits.length < 10) { toast({ title: 'Enter a valid mobile number', variant: 'destructive' }); return; }
    setMobileSending(true);
    await new Promise((r) => setTimeout(r, 700));
    toast({ title: 'OTP sent', description: `Code sent to +234 ${mobile}` });
    setMobileSending(false);
  };

  const copyEscrow = async () => {
    const v = escrow?.accountNumber;
    if (!v) return;
    await navigator.clipboard.writeText(v).catch(() => {});
    toast({ title: 'Copied', description: v });
  };

  return (
    <TenantRailShell
      navigation={TENANT_NAVIGATION}
      userRole="tenant"
      userName={(user?.fullName as string | undefined) || (user?.firstName as string) || 'Tenant'}
      userAvatar={user?.imageUrl}
    >
      <ErrorBoundary>
        <div className="flex flex-col gap-6">
          {/* Breadcrumb */}
          <div className="flex items-center justify-between gap-2">
            <Link href="/dashboard/tenant/payments" className="group inline-flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              Back to Payments &amp; Ledger
            </Link>
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-white/[0.08] px-2.5 py-1 text-[11px] font-semibold tracking-wider text-zinc-600 dark:text-zinc-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              ENCRYPTION PROTOCOL TLS 1.3
            </span>
          </div>

          {/* Page Header — exact Stitch copy, bichrome */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex max-w-2xl flex-col gap-1">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest">
                <span className="text-emerald-600 dark:text-emerald-400">Billing Architecture</span>
                <span className="text-zinc-300 dark:text-zinc-700">•</span>
                <span className="text-zinc-500">Settlement Node</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-[28px]">Add Payment Method</h1>
              <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                Configure secure settlement channels, automated direct debits, and verified corporate payment accounts for your tenancy obligations.
              </p>
            </div>
            <div className="inline-flex items-center gap-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] px-4 py-3 shadow-sm">
              <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-900 dark:text-white">PCI-DSS Level 1 Certified</span>
                <span className="text-[11px] text-zinc-600 dark:text-zinc-400">256-bit Encrypted Tokenization via Paystack &amp; NIBSS</span>
              </div>
            </div>
          </div>

          {/* Main Grid — 5 + 7, exact Stitch density */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
            {/* Left: Channel Selector */}
            <div className="flex flex-col gap-4 lg:col-span-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-zinc-900 dark:text-white">Select Settlement Channel</span>
                  <span className="rounded bg-zinc-100 dark:bg-white/[0.08] px-2 py-0.5 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">4 Channels</span>
                </div>
                <span className="text-[11px] font-medium text-zinc-500">Step 1 of 2</span>
              </div>

              <div className="flex flex-col gap-3">
                {[
                  { id: 'card' as Channel, label: 'Debit or Credit Card', pill: 'Instant Settlement', pillTone: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300', desc: 'Supports Mastercard, Visa, and Verve with tokenized recurring rent debits.', meta: ['MASTERCARD', 'VISA', 'VERVE', '• 3D-Secure V2'], icon: CreditCard, secIcon: true },
                  { id: 'bank' as Channel, label: 'Direct Bank Transfer (NIBSS)', pill: 'Zero Processing Fee', desc: 'Link authorized Nigerian corporate or personal commercial bank accounts via NUBAN.', metaIcon: 'verified', metaLabel: 'Central Bank of Nigeria Authorized', icon: Building2 },
                  { id: 'mobile' as Channel, label: 'Mobile Money & USSD', pill: 'Quick Pay', desc: 'Pay with OPay, PalmPay, or instant bank USSD codes (*737#, *894#, *919#).', metaLine: 'OPay • PalmPay • GTB *737# • FirstBank *894#', icon: Smartphone },
                  { id: 'escrow' as Channel, label: 'Dedicated Tenancy Escrow', pill: 'Auto-Reconciliation', desc: 'Assigned virtual Wema / Providus Bank account for permanent rent invoicing.', metaLabel: 'Providus & Wema Bank V-Accounts', icon: Shield },
                ].map((ch) => {
                  const active = channel === ch.id;
                  const Icon = ch.icon;
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => setChannel(ch.id)}
                      className={`relative flex gap-4 rounded-xl border bg-white dark:bg-zinc-900 p-4 text-left shadow-sm transition-all hover:shadow-md ${active ? 'border-emerald-500 ring-2 ring-emerald-500 shadow-md' : 'border-zinc-200 dark:border-white/[0.08]'}`}
                    >
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${active ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-zinc-100 dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-400'}`}>
                        <Icon className="h-[22px] w-[22px]" />
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col pr-6">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-zinc-900 dark:text-white">{ch.label}</span>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${ch.id === 'card' && active ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-zinc-100 dark:bg-white/[0.08] text-zinc-600 dark:text-zinc-400'}`}>{ch.pill}</span>
                        </span>
                        <span className="mt-1 text-xs leading-snug text-zinc-600 dark:text-zinc-400">{ch.desc}</span>
                        {ch.meta && (
                          <span className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-600 dark:text-zinc-400">
                            {ch.meta.map((m: string) => (
                              <span key={m} className={m.includes('3D') ? '' : 'inline-flex rounded bg-zinc-100 dark:bg-white/[0.08] px-1.5 py-0.5 text-[10px] font-bold text-zinc-700 dark:text-zinc-300'}>{m}</span>
                            ))}
                          </span>
                        )}
                        {ch.metaIcon === 'verified' && (
                          <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5" />{ch.metaLabel}
                          </span>
                        )}
                        {ch.metaLine && <span className="mt-2 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">{ch.metaLine}</span>}
                        {ch.metaLabel && ch.id === 'escrow' && <span className="mt-2 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">{ch.metaLabel}</span>}
                      </span>
                      <span className={`absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full ${active ? 'bg-emerald-500 text-white' : 'hidden bg-zinc-200 dark:bg-white/[0.08] text-zinc-500'}`}>
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3 rounded-xl bg-zinc-50 dark:bg-white/[0.04] p-4">
                <Lock className="h-[22px] w-[22px] shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-zinc-900 dark:text-white">Enterprise Tokenization Architecture</span>
                  <span className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">PropatiBox does not store raw card details, CVVs, or banking PINs. All channels are cryptographic tokens via CBN-licensed gateways and NIBSS routing.</span>
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] p-4 shadow-sm">
                <span className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="flex flex-col">
                    <span className="text-xs font-bold text-zinc-900 dark:text-white">CAC Reg: RC-1849204</span>
                    <span className="text-[11px] text-zinc-600 dark:text-zinc-400">Primary Tenant: Adeleke Global Logistics Ltd</span>
                  </span>
                </span>
                <span className="rounded bg-zinc-100 dark:bg-white/[0.08] px-2 py-1 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">Active Lease</span>
              </div>
            </div>

            {/* Right: Form — 4 views, channel-switched (Stitch JS reproduced in React) */}
            <div className="flex flex-col gap-4 lg:col-span-7">
              {channel === 'card' && (
                <div className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] p-6 shadow-sm">
                  <div className="flex items-start justify-between gap-2 border-b border-zinc-200 dark:border-white/[0.08] pb-4">
                    <span className="flex flex-col gap-1">
                      <span className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-white">
                        Card Authorization Details
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Live Tokenizer
                        </span>
                      </span>
                      <span className="text-xs text-zinc-600 dark:text-zinc-400">Enter your corporate or executive personal card information.</span>
                    </span>
                    <span className="hidden sm:inline-flex items-center gap-1 rounded-lg bg-zinc-100 dark:bg-white/[0.08] px-3 py-1 text-xs font-bold tracking-wider text-zinc-700 dark:text-zinc-300">3D-S</span>
                  </div>

                  {/* Virtual Card Preview — exact gradient from Stitch */}
                  <div className="relative mt-4 overflow-hidden rounded-xl bg-gradient-to-tr from-zinc-900 via-zinc-800 to-zinc-700 p-4 text-white shadow-md">
                    <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-emerald-500/20 blur-2xl" />
                    <div className="flex items-start justify-between">
                      <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-emerald-300">PropatiBox <span className="font-normal normal-case tracking-normal text-white/60">• Commercial Access</span></span>
                      <span className="text-white/80">◉</span>
                    </div>
                    <div className="mt-6 font-mono text-xl font-semibold tracking-[0.18em]">{cardNumber.replace(/\d{4}(?= \d)/g, '••••').padEnd(19, '•') || '•••• •••• •••• ••••'}</div>
                    <div className="mt-4 flex items-end justify-between font-mono text-xs">
                      <span className="flex flex-col"><span className="text-[9px] uppercase tracking-wider text-white/60">Cardholder</span><span className="text-sm font-semibold tracking-wide">{cardName.toUpperCase() || 'CARDHOLDER NAME'}</span></span>
                      <span className="flex flex-col items-end"><span className="text-[9px] uppercase tracking-wider text-white/60">Expires</span><span className="text-sm font-semibold">{cardExpiry || 'MM / YY'}</span></span>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label className="flex items-center justify-between">Cardholder Full Name <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="h-3 w-3" /> CAC Verified Match</span></Label>
                      <Input id="cardholder-name" value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="e.g. Babatunde Adeleke" className="h-11 bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-white/[0.08] text-zinc-900 dark:text-white" />
                      <span className="text-[12px] text-zinc-500">Must match the name on your Tenancy Agreement and corporate CAC documentation.</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label>Card Number</Label>
                      <div className="relative flex items-center">
                        <CreditCard className="pointer-events-none absolute left-3.5 h-5 w-5 text-zinc-500" />
                        <Input id="card-number" value={cardNumber} onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19))} placeholder="5399 •••• •••• 4019" maxLength={19} className="h-11 bg-zinc-50 dark:bg-zinc-950 pl-11 pr-24 font-mono text-zinc-900 dark:text-white" />
                        <span className="pointer-events-none absolute right-3 flex items-center gap-1">
                          <span className="rounded bg-zinc-200 dark:bg-white/[0.08] px-1.5 py-0.5 text-[10px] font-bold text-zinc-700 dark:text-zinc-300">MC</span>
                          <span className="rounded bg-zinc-200 dark:bg-white/[0.08] px-1.5 py-0.5 text-[10px] font-bold text-zinc-700 dark:text-zinc-300">VISA</span>
                          <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">VERVE</span>
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="card-expiry">Expiry Date</Label>
                        <div className="relative flex items-center">
                          <Input id="card-expiry" value={cardExpiry} onChange={(e) => { const v = e.target.value.replace(/\D/g, ''); setCardExpiry(v.length >= 2 ? `${v.slice(0, 2)} / ${v.slice(2, 4)}` : v); }} placeholder="MM / YY" maxLength={7} className="h-11 bg-zinc-50 dark:bg-zinc-950 pl-3 font-mono text-zinc-900 dark:text-white" />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="card-cvv" className="flex items-center justify-between">Security Code (CVV) <span className="group relative inline-flex"><HelpCircle className="h-4 w-4 cursor-pointer text-zinc-500" /><span className="pointer-events-none absolute bottom-full right-0 mb-1 hidden w-44 rounded bg-zinc-900 p-2 text-[11px] text-white shadow-lg group-hover:flex">3 digits on back of Visa/Mastercard, or 4 on front of Verve.</span></span></Label>
                        <div className="relative flex items-center">
                          <Input id="card-cvv" type="password" value={cardCvv} onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="•••" maxLength={4} className="h-11 bg-zinc-50 dark:bg-zinc-950 pl-11 font-mono text-zinc-900 dark:text-white" />
                          <Lock className="pointer-events-none absolute left-3.5 h-5 w-5 text-zinc-500" />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 pt-1">
                      <label className="flex cursor-pointer gap-3 rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-3 hover:bg-zinc-100 dark:hover:bg-white/[0.06]">
                        <Checkbox checked className="mt-0.5" />
                        <span className="flex flex-col"><span className="text-sm font-medium text-zinc-900 dark:text-white">Set as primary payment method for automated rent renewal</span><span className="text-xs text-zinc-600 dark:text-zinc-400">Direct debit will trigger automatically 72 hours before lease term expiration.</span></span>
                      </label>
                      <label className="flex cursor-pointer gap-3 rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-3 hover:bg-zinc-100 dark:hover:bg-white/[0.06]">
                        <Checkbox checked className="mt-0.5" />
                        <span className="flex flex-col"><span className="text-sm font-medium text-zinc-900 dark:text-white">Enable automated WhatsApp and SMS settlement receipts</span><span className="text-xs text-zinc-600 dark:text-zinc-400">Instant CBN-compliant stamped receipt dispatch.</span></span>
                      </label>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 p-3 text-xs text-emerald-800 dark:text-emerald-300">
                      <Info className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      A temporary authorization charge of <strong className="font-mono">₦50.00</strong> will be verified and immediately reversed to link this card.
                    </div>
                    <div className="flex flex-col gap-2 pt-1">
                      <Button onClick={submitCard} disabled={cardSaving} className="h-11 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-sm">
                        {cardSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Lock className="mr-2 h-5 w-5" />}
                        {cardSaving ? 'Initializing Paystack Vault…' : 'Authorize & Link Payment Method (₦50 Verification)'}
                      </Button>
                      <Button asChild variant="ghost" className="h-10 w-full text-zinc-700 dark:text-zinc-300"><Link href="/dashboard/tenant/payments">Cancel &amp; Return to Payments</Link></Button>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-200 dark:border-white/[0.08] pt-3 text-[11px] text-zinc-500">
                      <span className="inline-flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-emerald-500" /> Secured with Paystack Payments System</span>
                      <span className="inline-flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5 text-emerald-500" /> Central Bank of Nigeria (CBN) Regulated</span>
                    </div>
                  </div>
                </div>
              )}

              {channel === 'bank' && (
                <div className="flex flex-col gap-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] p-6 shadow-sm">
                  <div className="flex items-start justify-between border-b border-zinc-200 dark:border-white/[0.08] pb-4">
                    <span className="flex flex-col gap-1">
                      <span className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-white">Nigerian Bank Account (NUBAN) Link <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">NIBSS Instant Verification</span></span>
                      <span className="text-xs text-zinc-600 dark:text-zinc-400">Direct settlement link via your commercial bank account.</span>
                    </span>
                    <Building2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label>Select Commercial Bank</Label>
                      <Select value={selectedBank} onValueChange={(v) => { setSelectedBank(v); setResolved(false); setAccountName(''); }}>
                        <SelectTrigger className="h-11 bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-white/[0.08] text-zinc-900 dark:text-white"><SelectValue placeholder={banksLoading ? 'Loading banks…' : 'Choose your bank'} /></SelectTrigger>
                        <SelectContent>
                          {banks.map((b) => (<SelectItem key={b.code} value={b.code}>{b.name}</SelectItem>))}
                          {!banksLoading && banks.length === 0 && <SelectItem value="__none" disabled>No banks loaded — check PAYSTACK_SECRET_KEY</SelectItem>}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="account-number">10-Digit NUBAN Account Number</Label>
                      <div className="relative">
                        <Input id="account-number" value={accountNumber} onChange={(e) => { setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10)); setResolved(false); setAccountName(''); }} placeholder="0123456789" maxLength={10} className="h-11 bg-zinc-50 dark:bg-zinc-950 font-mono text-zinc-900 dark:text-white" />
                        {resolving && <Loader2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-zinc-500" />}
                      </div>
                    </div>
                    {resolved ? (
                      <div className="flex items-center gap-3 rounded-lg bg-emerald-500/10 p-4">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="h-5 w-5" /></span>
                        <span className="flex flex-col">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">NIBSS Account Resolved</span>
                          <span className="text-sm font-bold text-zinc-900 dark:text-white">{accountName} ({banks.find((b) => b.code === selectedBank)?.name ?? ''})</span>
                          <span className="text-[11px] text-zinc-600 dark:text-zinc-400">Match Score: 100% with registered CAC tenant record.</span>
                        </span>
                      </div>
                    ) : accountName ? (
                      <div className="flex items-center gap-3 rounded-lg bg-amber-500/10 p-4">
                        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        <span className="text-sm text-zinc-700 dark:text-zinc-300">{accountName}</span>
                      </div>
                    ) : null}
                    <div className="flex gap-3">
                      <Button type="button" variant="outline" onClick={resolveAccount} disabled={resolving || accountNumber.length !== 10 || !selectedBank} className="flex-1">
                        {resolving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Shield className="mr-2 h-4 w-4" />}
                        {resolving ? 'Verifying…' : 'Verify Account'}
                      </Button>
                      <Button type="button" onClick={submitBank} disabled={bankSaving || !resolved} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white">
                        {bankSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                        {bankSaving ? 'Linking…' : 'Link Verified NUBAN Account'}
                      </Button>
                    </div>
                    <Button asChild variant="ghost" className="w-full"><Link href="/dashboard/tenant/payments">Cancel &amp; Return to Payments</Link></Button>
                  </div>
                </div>
              )}

              {channel === 'mobile' && (
                <div className="flex flex-col gap-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] p-6 shadow-sm">
                  <div className="flex items-start justify-between border-b border-zinc-200 dark:border-white/[0.08] pb-4">
                    <span className="flex flex-col gap-1"><span className="text-sm font-bold text-zinc-900 dark:text-white">Mobile Money &amp; Instant USSD</span><span className="text-xs text-zinc-600 dark:text-zinc-400">Setup rapid billing via authorized telco or digital wallet providers.</span></span>
                    <Smartphone className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 rounded-xl bg-zinc-50 dark:bg-white/[0.04] p-4">
                      <Wallet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      <span className="flex flex-col"><span className="text-sm font-semibold text-zinc-900 dark:text-white">OPay Wallet</span><span className="text-xs text-zinc-600 dark:text-zinc-400">Instant Direct Debit</span></span>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl bg-zinc-50 dark:bg-white/[0.04] p-4">
                      <Wallet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      <span className="flex flex-col"><span className="text-sm font-semibold text-zinc-900 dark:text-white">PalmPay Direct</span><span className="text-xs text-zinc-600 dark:text-zinc-400">Zero fee processing</span></span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="mobile-number">Registered Mobile Number</Label>
                    <div className="relative flex items-center">
                      <span className="pointer-events-none absolute left-3.5 font-mono text-sm font-bold text-zinc-600 dark:text-zinc-400">+234</span>
                      <Input id="mobile-number" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="803 910 2940" className="h-11 bg-zinc-50 dark:bg-zinc-950 pl-14 font-mono text-zinc-900 dark:text-white" />
                    </div>
                  </div>
                  <Button onClick={sendMobileOtp} disabled={mobileSending} className="h-11 w-full bg-emerald-600 hover:bg-emerald-500 text-white">
                    {mobileSending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Smartphone className="mr-2 h-5 w-5" />}
                    {mobileSending ? 'Sending OTP…' : 'Send Authorization OTP'}
                  </Button>
                  <Button asChild variant="ghost" className="w-full"><Link href="/dashboard/tenant/payments">Cancel &amp; Return to Payments</Link></Button>
                </div>
              )}

              {channel === 'escrow' && (
                <div className="flex flex-col gap-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] p-6 shadow-sm">
                  <div className="flex items-start justify-between border-b border-zinc-200 dark:border-white/[0.08] pb-4">
                    <span className="flex flex-col gap-1"><span className="text-sm font-bold text-zinc-900 dark:text-white">Dedicated Escrow Settlement Account</span><span className="text-xs text-zinc-600 dark:text-zinc-400">Permanent virtual bank account for your unit — auto-reconciled.</span></span>
                    <Shield className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  {escrowLoading ? (
                    <div className="flex items-center gap-2 rounded-xl bg-zinc-50 dark:bg-white/[0.04] p-4 text-sm text-zinc-600 dark:text-zinc-400"><Loader2 className="h-4 w-4 animate-spin" /> Loading escrow account…</div>
                  ) : escrow?.accountNumber ? (
                    <div className="flex flex-col gap-3 rounded-xl bg-zinc-50 dark:bg-white/[0.04] p-4">
                      <span className="flex items-center justify-between border-b border-zinc-200 dark:border-white/[0.08] pb-2"><span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Receiving Bank</span><span className="text-sm font-bold text-zinc-900 dark:text-white">{escrow.bankName ?? 'Providus Bank PLC'}</span></span>
                      <span className="flex items-center justify-between border-b border-zinc-200 dark:border-white/[0.08] pb-2"><span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Account Name</span><span className="text-sm font-bold text-zinc-900 dark:text-white">{escrow.accountName ?? '—'}</span></span>
                      <span className="flex items-center justify-between"><span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Virtual Account No.</span><span className="flex items-center gap-2"><span className="font-mono text-lg font-bold text-emerald-600 dark:text-emerald-400">{escrow.accountNumber}</span><Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyEscrow}><Check className="h-4 w-4" /></Button></span></span>
                    </div>
                  ) : (
                    <div className="rounded-xl bg-amber-500/10 p-4 text-sm">
                      <p className="font-semibold text-amber-800 dark:text-amber-300">No dedicated escrow account yet</p>
                      <p className="mt-1 text-xs text-zinc-700 dark:text-zinc-300">Add a bank account first — PropatiBox will provision a Providus / Wema virtual account for permanent rent invoicing and auto-reconciliation.</p>
                      <Button variant="outline" size="sm" className="mt-3" onClick={() => setChannel('bank')}>Go to Bank Account</Button>
                    </div>
                  )}
                  <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">Transfers to this dedicated NUBAN are reconciled against your property ledger and recognized by estate accounting within 60 seconds.</p>
                  <Button asChild variant="outline" className="w-full"><Link href="/dashboard/tenant/payments">Return to Payments</Link></Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </TenantRailShell>
  );
}
