'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Check,
  Building2,
  MapPin,
  Home,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { useActiveOrganization, useActiveOrganizationId } from '@/contexts/ActiveOrganizationContext';
import { NoOrgState } from '@/components/organizations/NoOrgState';

// ─── Real PropertyType + ListingType enums from prisma/schema.prisma ───
const PROPERTY_TYPES = ['apartment', 'house', 'duplex', 'office', 'shop', 'warehouse', 'land'] as const;

const TYPE_LABELS: Record<string, string> = {
  apartment: 'Apartment',
  house: 'House / Villa',
  duplex: 'Duplex',
  office: 'Executive Office',
  shop: 'Retail Shop',
  warehouse: 'Warehouse',
  land: 'Commercial Land',
};

const CLASSIFICATIONS = [
  { value: 'residential', label: 'Multi-Family Residential Complex', listingType: 'rent' as const },
  { value: 'commercial_office', label: 'Commercial Office Tower', listingType: 'commercial' as const },
  { value: 'retail', label: 'Retail / Shopping Complex', listingType: 'commercial' as const },
  { value: 'mixed', label: 'Mixed-Use Development', listingType: 'commercial' as const },
];

interface UnitDraft {
  key: string;
  unitNumber: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  sizeSqm: string;
  rent: string;
}

const emptyUnit = (n: number): UnitDraft => ({
  key: `u${n}-${Date.now()}`,
  unitNumber: '',
  type: 'apartment',
  bedrooms: 0,
  bathrooms: 0,
  sizeSqm: '',
  rent: '',
});
const CARD = 'rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900';
const LABEL = 'mb-1 block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400';
const MUTED = 'text-xs text-zinc-500 dark:text-zinc-400';
const INPUT =
  'w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white';
const BTN_PRIMARY =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 disabled:opacity-50 active:scale-[0.98]';
const BTN_GHOST =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800';

function ngn(amount: number): string {
  return `₦${Math.round(amount).toLocaleString('en-NG')}`;
}

export default function AddPropertyAndUnitsPage() {
  const router = useRouter();
  const { organization, loading: orgLoading } = useActiveOrganization();
  const { orgId } = useActiveOrganizationId();

  // Step 1: property
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [classification, setClassification] = useState(CLASSIFICATIONS[0].value);
  const [projectedUnits, setProjectedUnits] = useState('');

  // Step 2: unit matrix
  const [units, setUnits] = useState<UnitDraft[]>([emptyUnit(1)]);

  // Flow state
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listingId, setListingId] = useState<string | null>(null);
  const [createdUnits, setCreatedUnits] = useState<Array<{ unitNumber: string; rent: number }>>([]);

  const updateUnit = (key: string, patch: Partial<UnitDraft>) =>
    setUnits((prev) => prev.map((u) => (u.key === key ? { ...u, ...patch } : u)));

  const addUnit = () => setUnits((prev) => [...prev, emptyUnit(prev.length + 1)]);
  const removeUnit = (key: string) => setUnits((prev) => (prev.length > 1 ? prev.filter((u) => u.key !== key) : prev));

  const classificationMeta = useMemo(
    () => CLASSIFICATIONS.find((c) => c.value === classification) ?? CLASSIFICATIONS[0],
    [classification]
  );

  const step1Valid = title.trim().length >= 5 && address.trim().length >= 5;

  const step2Valid = useMemo(
    () =>
      units.length > 0 &&
      units.every(
        (u) =>
          u.unitNumber.trim().length > 0 &&
          Number(u.rent) >= 0 &&
          Number.isFinite(Number(u.rent)) &&
          u.bedrooms >= 0 &&
          u.bathrooms >= 0
      ),
    [units]
  );

  const projectedRevenue = useMemo(
    () => units.reduce((sum, u) => sum + (Number(u.rent) || 0), 0),
    [units]
  );

  // Step 1 → 2: create the Listing, link it to the org
  const createProperty = useCallback(async () => {
    if (!orgId) return;
    setSubmitting(true);
    setError(null);
    try {
      // 1. Create the master listing (property). Price is required and positive;
      //    use the first unit's rent or 1 as a placeholder that step-2 units override.
      const firstRent = Number(units[0]?.rent) || 0;
      const lRes = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          address: address.trim(),
          area: address.trim(),
          listingType: classificationMeta.listingType,
          propertyType: units[0]?.type || 'apartment',
          price: firstRent > 0 ? firstRent : 1,
          pricePeriod: 'month',
          status: 'active',
          allowShortlet: false,
          ownerEmail: ownerEmail.trim() || undefined,
        }),
      });
      const lBody = await lRes.json().catch(() => ({}));
      if (!lRes.ok) {
        setError(lBody?.error || `Could not create property (${lRes.status}).`);
        setSubmitting(false);
        return;
      }
      const newListingId = lBody?.data?.id ?? lBody?.id;
      if (!newListingId) {
        setError('Property created but no id returned.');
        setSubmitting(false);
        return;
      }

      // 2. Link the listing to the org
      const linkRes = await fetch(`/api/orgs/${orgId}/listings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: newListingId }),
      });
      if (!linkRes.ok) {
        const linkBody = await linkRes.json().catch(() => ({}));
        // Non-fatal: the listing exists and is owned by the EM; note but continue.
        console.warn('Org listing link failed:', linkBody?.error ?? linkRes.status);
      }

      setListingId(newListingId);
      setStep(2);
    } catch (e) {
      setError((e as Error).message ?? 'Network error creating property.');
    } finally {
      setSubmitting(false);
    }
  }, [orgId, title, address, ownerEmail, classificationMeta, units]);

  // Step 2 → 3: create each unit under the listing
  const createUnits = useCallback(async () => {
    if (!orgId || !listingId) return;
    setSubmitting(true);
    setError(null);
    const created: Array<{ unitNumber: string; rent: number }> = [];
    try {
      for (const u of units) {
        const payload: Record<string, unknown> = {
          listingId,
          listingType: classificationMeta.listingType,
          unitNumber: u.unitNumber.trim(),
          type: u.type,
          bedrooms: Number(u.bedrooms) || 0,
          bathrooms: Number(u.bathrooms) || 0,
          rent: Number(u.rent) || 0,
          pricePeriod: 'month',
        };
        if (u.sizeSqm && Number(u.sizeSqm) > 0) payload.sizeSqm = Number(u.sizeSqm);

        const res = await fetch(`/api/orgs/${orgId}/units`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          // Surface the first hard failure and stop; partial creation is reported.
          setError(
            `Unit "${u.unitNumber}" failed: ${body?.error ?? res.status}. ` +
              (created.length ? `${created.length} unit(s) were created before the failure.` : '')
          );
          setSubmitting(false);
          if (created.length) {
            setCreatedUnits(created);
            setStep(3);
          }
          return;
        }
        created.push({ unitNumber: u.unitNumber.trim(), rent: Number(u.rent) || 0 });
      }
      setCreatedUnits(created);
      setStep(3);
    } catch (e) {
      setError((e as Error).message ?? 'Network error creating units.');
      if (created.length) {
        setCreatedUnits(created);
        setStep(3);
      }
    } finally {
      setSubmitting(false);
    }
  }, [orgId, listingId, units, classificationMeta]);

  if (orgLoading) {
    return (
      <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Estate Manager">
        <div className="mx-auto w-full max-w-3xl" aria-busy="true">
          <div className="h-64 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </DashboardShell>
    );
  }

  if (!organization || !orgId) {
    return (
      <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Estate Manager">
        <div className="mx-auto w-full max-w-3xl">
          <NoOrgState
            title="No Organization"
            description="You need an organization before you can add properties and units."
            actionLabel="Create Organization"
            actionHref="/dashboard/estate-manager/organizations/new"
          />
        </div>
      </DashboardShell>
    );
  }

  const steps = [
    { n: 1, label: 'Property Details', done: step > 1 },
    { n: 2, label: 'Unit Details', done: step > 2 },
    { n: 3, label: 'Complete', done: false },
  ];

  return (
    <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Estate Manager">
      <main className="mx-auto w-full max-w-3xl p-6 lg:p-10">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard/estate-manager/units"
            className="group mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 transition-colors hover:text-emerald-600 dark:text-zinc-400"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Units
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Portfolio Onboarding
            </span>
            <span className="text-zinc-300 dark:text-zinc-600">•</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              {organization.name}
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Add Property &amp; Units
          </h1>
        </div>

        {/* Step progress */}
        <div className="mb-6 flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-3.5 dark:border-zinc-800 dark:bg-zinc-800/40">
          {steps.map((s, i) => (
            <div key={s.n} className="flex items-center gap-2.5">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shadow-sm ${
                  s.done
                    ? 'bg-emerald-600 text-white'
                    : step === s.n
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-500/20'
                      : 'bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400'
                }`}
              >
                {s.done ? <Check className="h-4 w-4" strokeWidth={3} /> : s.n}
              </div>
              <div className="flex flex-col">
                <span className={`text-xs font-semibold ${step === s.n ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-400'}`}>
                  {s.n}. {s.label}
                </span>
                {s.done && <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Completed</span>}
              </div>
              {i < steps.length - 1 && (
                <div className={`mx-3 h-0.5 w-8 sm:w-16 ${s.done ? 'bg-emerald-500' : 'bg-zinc-200 dark:bg-zinc-700'}`} />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ── STEP 1: Property Details ── */}
        {step === 1 && (
          <div className={`${CARD} space-y-5 p-6`}>
            <div>
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-white">
                  <Building2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  Step 1: Property Identification
                </h2>
                <span className="rounded bg-zinc-100 px-2 py-0.5 font-mono text-[11px] text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                  POST /api/listings
                </span>
              </div>
              <p className={`mt-0.5 ${MUTED}`}>
                Define the master building profile, address, and classification.
              </p>
            </div>

            <div>
              <label className={LABEL} htmlFor="title">
                Property Name / Development Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Sovereign Heights Ikoyi"
                className={INPUT}
              />
            </div>

            <div>
              <label className={LABEL} htmlFor="address">
                Physical Street Address <span className="text-red-500">*</span>
              </label>
              <textarea
                id="address"
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g., 12 Admiralty Way, off Alexander Avenue, Ikoyi, Lagos"
                className={INPUT}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={LABEL} htmlFor="classification">
                  Master Property Classification
                </label>
                <select
                  id="classification"
                  value={classification}
                  onChange={(e) => setClassification(e.target.value)}
                  className={INPUT}
                >
                  {CLASSIFICATIONS.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL} htmlFor="projectedUnits">
                  Projected Unit Count (optional)
                </label>
                <input
                  id="projectedUnits"
                  type="number"
                  min="0"
                  value={projectedUnits}
                  onChange={(e) => setProjectedUnits(e.target.value)}
                  placeholder="e.g., 4"
                  className={INPUT}
                />
              </div>
            </div>

            <div>
              <label className={LABEL} htmlFor="ownerEmail">
                Property Owner Email (optional)
              </label>
              <input
                id="ownerEmail"
                type="email"
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
                placeholder="owner@example.com"
                className={INPUT}
              />
              <p className={`mt-1 ${MUTED}`}>
                If the property belongs to a landlord, enter their email. An owner
                invite will be sent so they can claim this property and become the
                listing owner. If left empty, you remain the listing owner.
              </p>
            </div>

            <div className="flex items-center justify-end border-t border-zinc-200 pt-4 dark:border-zinc-800">
              <button onClick={createProperty} disabled={!step1Valid || submitting} className={BTN_PRIMARY}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                Continue to Unit Builder
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Unit Matrix Builder ── */}
        {step === 2 && (
          <div className="space-y-4">
            {/* Context banner */}
            <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3.5 sm:flex-row sm:items-center dark:border-zinc-800 dark:bg-zinc-800/40">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-zinc-900 dark:text-white">{title}</span>
                    <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                      Property created
                    </span>
                  </div>
                  <p className={`mt-0.5 ${MUTED}`}>
                    <MapPin className="mr-1 inline h-3 w-3" />
                    {address}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Configure Unit Matrix</h3>
              <p className={MUTED}>
                Specify individual units, rental tariffs, and architectural dimensions.
              </p>
            </div>

            {/* Unit rows */}
            <div className="space-y-4">
              {units.map((u, idx) => (
                <div key={u.key} className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/30">
                  <div className="mb-3 flex items-center justify-between border-b border-zinc-200 pb-3 dark:border-zinc-800">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-600 text-xs font-bold text-white">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-medium text-zinc-900 dark:text-white">
                        {u.unitNumber.trim() || `Unit ${idx + 1}`}
                      </span>
                    </div>
                    {units.length > 1 && (
                      <button
                        onClick={() => removeUnit(u.key)}
                        className="flex items-center gap-1 rounded px-2 py-1 text-xs text-rose-600 transition-colors hover:bg-rose-500/10 dark:text-rose-400"
                      >
                        <Trash2 className="h-4 w-4" /> Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
                    <div className="lg:col-span-2">
                      <label className={LABEL}>Unit Number / Code <span className="text-red-500">*</span></label>
                      <input
                        value={u.unitNumber}
                        onChange={(e) => updateUnit(u.key, { unitNumber: e.target.value })}
                        placeholder="e.g., Suite 401A"
                        className={INPUT}
                      />
                    </div>
                    <div className="lg:col-span-2">
                      <label className={LABEL}>Type <span className="text-red-500">*</span></label>
                      <select value={u.type} onChange={(e) => updateUnit(u.key, { type: e.target.value })} className={INPUT}>
                        {PROPERTY_TYPES.map((t) => (
                          <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={LABEL}>Bedrooms</label>
                      <input
                        type="number"
                        min="0"
                        value={u.bedrooms}
                        onChange={(e) => updateUnit(u.key, { bedrooms: Number(e.target.value) })}
                        className={INPUT}
                      />
                    </div>
                    <div>
                      <label className={LABEL}>Bathrooms</label>
                      <input
                        type="number"
                        min="0"
                        value={u.bathrooms}
                        onChange={(e) => updateUnit(u.key, { bathrooms: Number(e.target.value) })}
                        className={INPUT}
                      />
                    </div>
                    <div className="lg:col-span-2">
                      <label className={LABEL}>Floor Size (m²)</label>
                      <input
                        type="number"
                        min="0"
                        value={u.sizeSqm}
                        onChange={(e) => updateUnit(u.key, { sizeSqm: e.target.value })}
                        placeholder="e.g., 240"
                        className={INPUT}
                      />
                    </div>
                    <div className="lg:col-span-4">
                      <label className={LABEL}>Expected Monthly Rent <span className="text-red-500">*</span></label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-sm font-bold text-zinc-500">₦</span>
                        <input
                          type="number"
                          min="0"
                          value={u.rent}
                          onChange={(e) => updateUnit(u.key, { rent: e.target.value })}
                          placeholder="0"
                          className={`${INPUT} pl-8 pr-16 font-mono`}
                        />
                        <span className="absolute right-3 text-xs text-zinc-400">/ month</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addUnit}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white py-3 text-sm font-medium text-emerald-600 transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-emerald-400 dark:hover:bg-zinc-800"
            >
              <Plus className="h-4 w-4" /> Add another unit
            </button>

            {/* Projected revenue + actions */}
            <div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 sm:flex-row dark:border-zinc-800 dark:bg-zinc-800/40">
              <span className={MUTED}>
                Projected monthly revenue:{' '}
                <strong className="font-mono text-sm text-zinc-900 dark:text-white">{ngn(projectedRevenue)}</strong>
                {' '}across {units.length} unit{units.length === 1 ? '' : 's'}
              </span>
              <div className="flex items-center gap-2">
                <button onClick={() => setStep(1)} className={BTN_GHOST} disabled={submitting}>
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button onClick={createUnits} disabled={!step2Valid || submitting} className={BTN_PRIMARY}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Create {units.length} Unit{units.length === 1 ? '' : 's'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3: Complete ── */}
        {step === 3 && (
          <div className={`${CARD} space-y-5 p-6`}>
            <div className="flex flex-col items-start gap-4 rounded-xl border border-zinc-200 bg-zinc-50 p-5 sm:flex-row sm:items-center dark:border-zinc-800 dark:bg-zinc-800/40">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Check className="h-7 w-7" strokeWidth={2.5} />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Property &amp; Units Configured</h3>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                    {createdUnits.length} Unit{createdUnits.length === 1 ? '' : 's'} Created
                  </span>
                </div>
                <p className={`mt-1 ${MUTED}`}>
                  {title} is now managed under {organization.name}.
                </p>
              </div>
            </div>

            {/* Created units summary */}
            <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3 dark:border-zinc-800">
                <div>
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">
                    Created Units ({createdUnits.length})
                  </h4>
                  <p className={`mt-0.5 ${MUTED}`}>{title} • {address}</p>
                </div>
                <div className="text-right">
                  <span className={`block ${LABEL}`}>Total Monthly Revenue</span>
                  <span className="font-mono text-base font-bold text-emerald-600 dark:text-emerald-400">
                    {ngn(createdUnits.reduce((s, u) => s + u.rent, 0))}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                {createdUnits.map((u, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-800/40"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {u.unitNumber.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-zinc-900 dark:text-white">{u.unitNumber}</span>
                    </div>
                    <span className="font-mono text-sm text-zinc-700 dark:text-zinc-300">{ngn(u.rent)} / month</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
              <button
                onClick={() => {
                  setStep(1);
                  setTitle('');
                  setAddress('');
                  setOwnerEmail('');
                  setProjectedUnits('');
                  setUnits([emptyUnit(1)]);
                  setCreatedUnits([]);
                  setListingId(null);
                  setError(null);
                }}
                className={BTN_GHOST}
              >
                <Home className="h-4 w-4" /> Add Another Property
              </button>
              <button onClick={() => { router.push('/dashboard/estate-manager/units'); router.refresh(); }} className={BTN_PRIMARY}>
                Go to Units <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </main>
    </DashboardShell>
  );
}
