'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  MapPin,
  ShieldCheck,
  Mail,
  Check,
  AlertCircle,
  Loader2,
  ArrowRight,
  Users,
  DoorClosed,
  Receipt,
  Info,
  BadgeCheck,
  MessageSquare,
  Headset,
  Landmark,
} from 'lucide-react';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';

// Mirrors createOrganisationSchema (src/lib/validators.ts:497)
type PlanTier = 'starter' | 'growth' | 'enterprise';

// Limits applied by POST /api/orgs — starter 20/1, growth 100/5, else unlimited
const PLANS: Array<{
  id: PlanTier;
  name: string;
  price: string;
  blurb: string;
  badge?: string;
  badgeTone?: 'primary' | 'success';
  perks: Array<{ icon: typeof DoorClosed; text: string }>;
}> = [
  {
    id: 'starter',
    name: 'Starter',
    price: '₦25,000',
    blurb: 'Ideal for single private estates, duplex courts, and boutique compounds.',
    perks: [
      { icon: DoorClosed, text: 'Up to 20 Units' },
      { icon: BadgeCheck, text: '1 Seat (Manager)' },
      { icon: Receipt, text: 'Automated Naira Invoices' },
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    price: '₦85,000',
    blurb: 'For mid-sized multi-court developments, gated communities, and schemes.',
    badge: 'Popular',
    badgeTone: 'primary',
    perks: [
      { icon: DoorClosed, text: 'Up to 100 Units' },
      { icon: Users, text: '5 Seats (Admin/Staff)' },
      { icon: MessageSquare, text: 'Direct WhatsApp Reminders' },
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '₦240,000',
    blurb: 'Institutional property firms managing extensive regional portfolios.',
    badge: 'Full Scale',
    badgeTone: 'success',
    perks: [
      { icon: Landmark, text: 'Unlimited Units' },
      { icon: Users, text: 'Unlimited Seats' },
      { icon: Headset, text: 'Dedicated Portfolio Lead' },
    ],
  },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function FieldError({ id, message }: { id: string; message: string }) {
  return (
    <span id={id} className="mt-1 flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
      <AlertCircle className="h-4 w-4 shrink-0" /> {message}
    </span>
  );
}

const inputBase =
  'w-full h-11 rounded-lg border bg-white px-3 pr-10 text-sm text-zinc-900 placeholder:text-zinc-400 transition-all ' +
  'focus:outline-none focus:ring-2 focus:ring-primary/30 ' +
  'dark:bg-zinc-900 dark:text-white ' +
  'border-zinc-200 focus:border-primary dark:border-zinc-800';
const labelBase = 'mb-1.5 flex items-center justify-between text-sm font-medium text-zinc-900 dark:text-white';
const hintBase = 'mt-1.5 text-xs text-zinc-500 dark:text-zinc-400';
const iconBase = 'absolute right-3 top-3 h-5 w-5 text-zinc-400 pointer-events-none';

export default function CreateOrganizationPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [cacNumber, setCacNumber] = useState('');
  const [address, setAddress] = useState('');
  const [billingEmail, setBillingEmail] = useState('');
  const [planTier, setPlanTier] = useState<PlanTier>('starter');
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ name?: string; billingEmail?: string }>({});

  const validate = () => {
    const next: { name?: string; billingEmail?: string } = {};
    const trimmedName = name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 100) {
      next.name = 'Organization name must be at least 2 characters.';
    }
    const trimmedEmail = billingEmail.trim();
    if (trimmedEmail !== '' && !EMAIL_RE.test(trimmedEmail)) {
      next.billingEmail = 'Please enter a valid billing email address.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/orgs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          ...(billingEmail.trim() ? { billingEmail: billingEmail.trim() } : {}),
          ...(address.trim() ? { address: address.trim() } : {}),
          ...(cacNumber.trim() ? { cacNumber: cacNumber.trim() } : {}),
          planTier,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setServerError(body?.error || `Could not create organization (${res.status}).`);
        setSubmitting(false);
        return;
      }
      router.push('/dashboard/estate-manager');
      router.refresh();
    } catch {
      setServerError('Network error. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Estate Manager">
      <div className="mx-auto w-full max-w-4xl pb-10">
        {/* Breadcrumb / progress */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/dashboard/estate-manager"
            className="group inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-primary dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            Back to Dashboard
          </Link>
          <div className="hidden items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 sm:flex dark:border-zinc-800 dark:bg-zinc-900">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Compliance Step 1 of 2</span>
          </div>
        </div>

        {/* Editorial header */}
        <div className="relative mb-6 overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="max-w-xl">
              <div className="mb-1 flex items-center gap-2 text-primary dark:text-[#4edea3]">
                <Building2 className="h-5 w-5" />
                <span className="text-xs font-semibold uppercase tracking-wider">Institutional Entity Onboarding</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">Create Organization</h1>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Set up your estate management organization to start managing properties, units, and residents
                across Lagos, Abuja, and nationwide.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-800/50">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary dark:text-[#4edea3]">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-zinc-900 dark:text-white">CAC Verification Ready</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Instant corporate deed indexing</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">
          {serverError && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Group 1 — Organization Details */}
          <section className="flex flex-col gap-4">
            <div className="flex items-start justify-between border-b border-zinc-200 pb-3 dark:border-zinc-800">
              <div>
                <div className="flex items-center gap-2 text-zinc-900 dark:text-white">
                  <Building2 className="h-5 w-5 text-primary dark:text-[#4edea3]" />
                  <h2 className="text-lg font-semibold">Organization Details</h2>
                </div>
                <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                  Legal structure, principal headquarters, and corporate registry in Nigeria.
                </p>
              </div>
              <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">Core Record</span>
            </div>

            <div className="mt-1 grid grid-cols-1 gap-4">
              {/* Name */}
              <div className="flex flex-col md:col-span-2">
                <label className={labelBase} htmlFor="orgName">
                  <span>Organization Legal Name <span className="text-red-500">*</span></span>
                  <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">2-100 characters</span>
                </label>
                <div className="relative">
                  <input
                    id="orgName"
                    type="text"
                    required
                    maxLength={100}
                    minLength={2}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'nameError' : undefined}
                    placeholder="e.g., Lekki Crest Estate Management Ltd."
                    className={`${inputBase} ${errors.name ? 'border-red-500' : ''}`}
                  />
                  <Building2 className={iconBase} />
                </div>
                {errors.name && <FieldError id="nameError" message={errors.name} />}
              </div>

              {/* CAC */}
              <div className="flex flex-col md:col-span-2">
                <label className={labelBase} htmlFor="cacNumber">
                  <span>CAC / RC Number</span>
                  <span className="text-xs font-semibold uppercase text-primary dark:text-[#4edea3]">Optional verification</span>
                </label>
                <div className="relative">
                  <input
                    id="cacNumber"
                    type="text"
                    value={cacNumber}
                    onChange={(e) => setCacNumber(e.target.value)}
                    placeholder="e.g., RC 1849204 or BN 948201"
                    className={`${inputBase} uppercase`}
                  />
                  <ShieldCheck className={iconBase} />
                </div>
                <p className={hintBase}>
                  Enter your Corporate Affairs Commission Registration (RC) or Business Name (BN) number.
                </p>
              </div>

              {/* Address */}
              <div className="flex flex-col md:col-span-2">
                <label className={labelBase} htmlFor="officeAddress">
                  <span>Management / Office Address</span>
                  <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">Official estate secretariat</span>
                </label>
                <div className="relative">
                  <textarea
                    id="officeAddress"
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g., Suite 402, Admiralty Way, Lekki Phase 1, Lagos, Nigeria"
                    className={`${inputBase} h-auto resize-none py-2 pr-10`}
                  />
                  <MapPin className={iconBase} />
                </div>
                <p className={hintBase}>
                  Used for resident tenancy deeds, utility invoices, and official physical notices.
                </p>
              </div>
            </div>
          </section>

          {/* Group 2 — Billing & Plan Tier */}
          <section className="flex flex-col gap-4">
            <div className="flex items-start justify-between border-b border-zinc-200 pb-3 dark:border-zinc-800">
              <div>
                <div className="flex items-center gap-2 text-zinc-900 dark:text-white">
                  <Receipt className="h-5 w-5 text-primary dark:text-[#4edea3]" />
                  <h2 className="text-lg font-semibold">Billing &amp; Plan Tier</h2>
                </div>
                <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                  Select your capacity tier. Limits apply immediately on provisioning.
                </p>
              </div>
            </div>

            {/* Billing email */}
            <div className="flex flex-col">
              <label className={labelBase} htmlFor="billingEmail">
                <span>Billing Email Address</span>
                <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">Default finance contact</span>
              </label>
              <div className="relative">
                <input
                  id="billingEmail"
                  type="email"
                  value={billingEmail}
                  onChange={(e) => setBillingEmail(e.target.value)}
                  aria-invalid={!!errors.billingEmail}
                  aria-describedby={errors.billingEmail ? 'emailError' : undefined}
                  placeholder="billing@lekki-crest.ng"
                  className={`${inputBase} ${errors.billingEmail ? 'border-red-500' : ''}`}
                />
                <Mail className={iconBase} />
              </div>
              {errors.billingEmail && <FieldError id="emailError" message={errors.billingEmail} />}
              <p className={hintBase}>
                E-receipts, VAT withholding summaries, and monthly statements will be dispatched to this address.
              </p>
            </div>

            {/* Plan cards */}
            <div className="mt-2 flex flex-col gap-2">
              <span className="text-sm font-medium text-zinc-900 dark:text-white">Select Capacity Tier</span>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {PLANS.map((plan) => {
                  const active = planTier === plan.id;
                  return (
                    <label
                      key={plan.id}
                      className={`relative flex cursor-pointer select-none flex-col justify-between rounded-xl border-2 p-4 transition-all ${
                        active
                          ? 'border-primary bg-primary/50 ring-2 ring-primary/20 dark:bg-primary/5'
                          : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="planTier"
                        value={plan.id}
                        checked={active}
                        onChange={() => setPlanTier(plan.id)}
                        className="sr-only"
                      />
                      <div>
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-base font-bold text-zinc-900 dark:text-white">{plan.name}</span>
                            {plan.badge && (
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide ${
                                  plan.badgeTone === 'primary'
                                    ? 'bg-primary text-white'
                                    : 'bg-[var(--sovereign-container-bg)] text-[var(--sovereign-hover)] dark:bg-primary/15 dark:text-[#4edea3]'
                                }`}
                              >
                                {plan.badge}
                              </span>
                            )}
                          </div>
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded-full ${
                              active ? 'bg-primary text-white' : 'border border-zinc-300 text-transparent dark:border-zinc-700'
                            }`}
                          >
                            <Check className="h-3.5 w-3.5" strokeWidth={3} />
                          </span>
                        </div>
                        <div className="mb-1 font-mono text-2xl font-bold text-zinc-900 dark:text-white">
                          {plan.price}
                          <span className="ml-0.5 text-xs font-normal text-zinc-500 dark:text-zinc-400">/mo</span>
                        </div>
                        <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">{plan.blurb}</p>
                      </div>
                      <div className="flex flex-col gap-1.5 border-t border-zinc-200 pt-3 text-sm text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
                        {plan.perks.map((perk) => (
                          <div key={perk.text} className="flex items-center gap-2">
                            <perk.icon className="h-4 w-4 shrink-0 text-primary dark:text-[#4edea3]" />
                            <span>{perk.text}</span>
                          </div>
                        ))}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Provisions notice — mirrors real backend side effects */}
            <div className="mt-2 flex items-start gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
                <Landmark className="h-5 w-5" />
              </div>
              <div className="flex flex-col gap-1.5">
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">Important Billing &amp; Member Provisions</h4>
                <ul className="flex flex-col gap-1 text-sm text-zinc-500 dark:text-zinc-400">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>You will immediately become the verified <strong className="font-semibold text-zinc-700 dark:text-zinc-300">Organization Owner</strong> and primary estate operations manager.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>Unit capacity and member allocation quotas are bound immediately upon provisioning.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Info className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                    <span>No payment is charged at signup — billing begins when you subscribe to a plan later.</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="flex flex-col-reverse items-center justify-between gap-4 border-t border-zinc-200 pt-5 sm:flex-row dark:border-zinc-800">
            <Link
              href="/dashboard/estate-manager"
              className="w-full rounded-lg border border-zinc-200 px-6 py-2.5 text-center text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 sm:w-auto dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancel &amp; Return
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-11 w-full min-w-[200px] items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[var(--sovereign-hover)] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-60 sm:w-auto"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Provisioning...
                </>
              ) : (
                <>
                  Create Organization
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}
