'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Mail,
  MapPin,
  Lock,
  Camera,
  Briefcase,
  Check,
  ShieldCheck,
  ShieldAlert,
  IdCard,
  Phone,
  Bell,
  KeyRound,
  UserCog,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { useKycStatus, type KycStatus } from '@/lib/dojah-client';
import KycVerificationCard from '@/components/verification/KycVerificationCard';

// ─── Notification preference keys (mirrors PATCH /api/users/notification-preferences) ───
type NotifTypes = {
  maintenance: boolean;
  rent_due: boolean;
  payment: boolean;
  message: boolean;
  verification: boolean;
  agreement: boolean;
  screening: boolean;
  system: boolean;
};

interface Preferences {
  email: boolean;
  sms: boolean;
  whatsapp: boolean;
  inapp: boolean;
  types: NotifTypes;
}

const DEFAULT_PREFS: Preferences = {
  email: true,
  sms: true,
  whatsapp: false,
  inapp: true,
  types: {
    maintenance: true,
    rent_due: true,
    payment: true,
    message: true,
    verification: true,
    agreement: true,
    screening: true,
    system: true,
  },
};

// The four operational toggles, mapped onto real preference keys
const TOGGLES: Array<{ id: keyof NotifTypes; label: string; description: string }> = [
  {
    id: 'maintenance',
    label: 'Maintenance tickets',
    description: 'Get notified when new maintenance tickets are created',
  },
  {
    id: 'rent_due',
    label: 'Service charge reminders',
    description: 'Get reminded before service charge due dates',
  },
  {
    id: 'payment',
    label: 'Utility reports',
    description: 'Get weekly utility consumption summaries',
  },
  {
    id: 'verification',
    label: 'Tenant onboarding',
    description: 'Get notified when a new tenant requests onboarding',
  },
];

// ─── Style primitives (bichrome light/dark, emerald --accent) ───
const CARD =
  'rounded-xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-7 dark:border-zinc-800 dark:bg-zinc-900';
const INPUT =
  'w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 transition-all ' +
  'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 ' +
  'dark:border-zinc-800 dark:bg-zinc-900 dark:text-white';
const INPUT_READONLY =
  'w-full cursor-not-allowed rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-3.5 py-2.5 pr-9 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400';
const LABEL = 'mb-1.5 block text-xs font-medium text-zinc-900 dark:text-white';
const TITLE = 'text-base font-semibold tracking-tight text-zinc-900 dark:text-white sm:text-lg';
const SUB = 'mt-0.5 text-xs text-zinc-500 dark:text-zinc-400 sm:text-sm';
const MUTED = 'text-xs text-zinc-500 dark:text-zinc-400';
const SECTION_ICON = 'h-4 w-4 text-primary dark:text-[#4edea3]';

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'EM';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="relative inline-flex shrink-0 cursor-pointer items-center">
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-checked={checked}
        aria-label={label}
        className="peer sr-only"
      />
      <div className="h-6 w-11 rounded-full border border-zinc-200 bg-zinc-200 transition-colors duration-200 peer-checked:border-primary peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40 dark:border-zinc-700 dark:bg-zinc-700">
        <div
          className={`mt-1 ml-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </div>
    </label>
  );
}

export default function EstateManagerProfilePage() {
  const { data: kycRecord, reload: reloadKyc } = useKycStatus();
  const kyc: KycStatus = kycRecord?.status ?? 'not_started';

  // ─── Profile state, hydrated from the live session profile ───
  const [form, setForm] = useState({ fullName: '', phone: '', company: '' });
  const [initial, setInitial] = useState({ fullName: '', phone: '', company: '' });
  const [email, setEmail] = useState('');
  const [orgName, setOrgName] = useState<string | null>(null);
  const [orgAddress, setOrgAddress] = useState<string | null>(null);
  const [memberSince, setMemberSince] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFS);
  const [prefsSaving, setPrefsSaving] = useState(false);
  const [prefsError, setPrefsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/users/me/profile', { cache: 'no-store' });
        if (!res.ok) throw new Error(`Failed to load profile (${res.status})`);
        const json = await res.json();
        const u = json?.data;
        if (!u) throw new Error('Profile unavailable');
        if (cancelled) return;

        const org = u.orgMemberships?.[0]?.org ?? null;
        setEmail(u.email ?? '');
        setAvatarUrl(u.avatarUrl ?? null);
        setOrgName(org?.name ?? null);
        setOrgAddress(org?.address ?? null);
        setMemberSince(
          u.createdAt
            ? new Date(u.createdAt).toLocaleDateString('en-NG', { month: 'short', year: 'numeric' })
            : null
        );
        const next = {
          fullName: u.fullName ?? '',
          phone: u.phone ?? '',
          company: u.companyName ?? '',
        };
        setForm(next);
        setInitial(next);

        const pRes = await fetch('/api/users/notification-preferences', { cache: 'no-store' });
        if (pRes.ok) {
          const pJson = await pRes.json();
          if (!cancelled && pJson?.data) {
            setPrefs({
              email: pJson.data.email ?? DEFAULT_PREFS.email,
              sms: pJson.data.sms ?? DEFAULT_PREFS.sms,
              whatsapp: pJson.data.whatsapp ?? DEFAULT_PREFS.whatsapp,
              inapp: pJson.data.inapp ?? DEFAULT_PREFS.inapp,
              types: { ...DEFAULT_PREFS.types, ...(pJson.data.types ?? {}) },
            });
          }
        }
      } catch (e) {
        if (!cancelled) setLoadError((e as Error).message ?? 'Could not load profile');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const dirty = form.fullName !== initial.fullName || form.phone !== initial.phone || form.company !== initial.company;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSaved(false);
    if (!form.fullName.trim()) {
      setSaveError('Full name is required.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/users/me/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          companyName: form.company.trim(),
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSaveError(body?.error || `Could not save (${res.status}).`);
        setSaving(false);
        return;
      }
      setInitial(form);
      setSaved(true);
    } catch {
      setSaveError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const togglePref = useCallback(async (key: keyof NotifTypes, value: boolean) => {
    setPrefsError(null);
    const previous = prefs;
    // Optimistic, then persist one key at a time — the PATCH route merges.
    setPrefs((p) => ({ ...p, types: { ...p.types, [key]: value } }));
    setPrefsSaving(true);
    try {
      const res = await fetch('/api/users/notification-preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ types: { [key]: value } }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setPrefs(previous);
        setPrefsError(body?.error || 'Could not save preference.');
      }
    } catch {
      setPrefs(previous);
      setPrefsError('Network error. Preference not saved.');
    } finally {
      setPrefsSaving(false);
    }
  }, [prefs]);

  // Profile readiness derived from real fields
  const readiness = Math.round(
    ([
      !!form.fullName.trim(),
      !!email,
      !!form.phone.trim(),
      !!form.company.trim(),
      kyc === 'approved',
    ].filter(Boolean).length / 5) * 100
  );
  const readinessHint =
    kyc === 'approved'
      ? 'Your profile is fully verified.'
      : 'Complete identity verification to attain 100% verified status.';

  if (loading) {
    return (
      <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Estate Manager">
        <div className="mx-auto w-full max-w-[1240px] space-y-6" aria-busy="true">
          <div className="h-8 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="h-72 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
            <div className="space-y-6 lg:col-span-2">
              <div className="h-56 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-48 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
            </div>
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (loadError) {
    return (
      <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Estate Manager">
        <div className="mx-auto w-full max-w-md rounded-xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900/50 dark:bg-red-950/30">
          <AlertCircle className="mx-auto h-8 w-8 text-red-500" />
          <p className="mt-3 text-sm font-semibold text-zinc-900 dark:text-white">Could not load your profile</p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{loadError}</p>
        </div>
      </DashboardShell>
    );
  }

  const kycTone =
    kyc === 'approved'
      ? { label: 'Firm Verified', cls: 'bg-[var(--sovereign-container-bg)] border-primary text-[var(--sovereign-hover)] dark:bg-primary/10 dark:border-primary/30 dark:text-[#4edea3]', icon: ShieldCheck }
      : { label: 'Firm Pending', cls: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-400', icon: ShieldAlert };

  const KycIcon = kycTone.icon;

  return (
    <DashboardShell
      navigation={ESTATE_MANAGER_NAVIGATION}
      userRole="estate_manager"
      userName={form.fullName || 'Estate Manager'}
    >
      <main className="mx-auto w-full max-w-[1240px] p-6 lg:p-10">
        {/* Page header */}
        <div className="mb-8">
          <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary dark:text-[#4edea3]">
            <UserCog className="h-3.5 w-3.5" />
            <span>Management Profile</span>
          </div>
          <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
            My Profile
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
            Manage your personal profile, firm credentials, verification compliance, and operational notifications.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
          {/* ── LEFT: identity + readiness ── */}
          <div className="space-y-6">
            <div className={`${CARD} relative flex flex-col items-center overflow-hidden text-center`}>
              <div className="pointer-events-none absolute inset-x-0 -top-16 h-32 bg-gradient-to-b from-primary/10 to-transparent" />

              {/* Avatar */}
              <div className="relative mb-5 mt-2">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-primary/20 bg-zinc-100 p-1 shadow-sm dark:bg-zinc-800">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={form.fullName || 'Avatar'} className="h-full w-full rounded-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-primary dark:text-[#4edea3]">
                      {initialsOf(form.fullName || 'Estate Manager')}
                    </span>
                  )}
                </div>
                <span
                  className="absolute bottom-0 right-0 flex h-8 w-8 translate-x-1 translate-y-1 items-center justify-center rounded-full border border-zinc-200 bg-white text-primary shadow-sm transition-colors dark:border-zinc-700 dark:bg-zinc-900"
                  title="Avatar is managed by Clerk"
                >
                  <Camera className="h-4 w-4" />
                </span>
              </div>

              <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                {form.fullName || 'Estate Manager'}
              </h2>
              <p className={`mt-1 ${MUTED}`}>
                Estate Manager{memberSince ? ` · since ${memberSince}` : ''}
              </p>

              <div className={`mt-3.5 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 ${kycTone.cls}`}>
                <KycIcon className="h-3.5 w-3.5" />
                <span className="text-xs font-semibold uppercase tracking-wider">{kycTone.label}</span>
              </div>

              <div className="my-5 w-full border-t border-zinc-200 dark:border-zinc-800" />

              <div className="w-full space-y-2.5 text-left text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                    <Building2 className="h-3.5 w-3.5" /> Firm
                  </span>
                  <span className="font-medium text-zinc-900 dark:text-white">{orgName ?? '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                    <Mail className="h-3.5 w-3.5" /> Auth
                  </span>
                  <span className="font-medium text-zinc-900 dark:text-white">Clerk Managed</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                    <MapPin className="h-3.5 w-3.5" /> Region
                  </span>
                  <span className="font-medium text-zinc-900 dark:text-white">{orgAddress ?? 'Lagos, Nigeria'}</span>
                </div>
              </div>

              {!orgName && (
                <Link
                  href="/dashboard/estate-manager/organizations/new"
                  className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-700 transition-colors hover:border-primary hover:bg-zinc-50 hover:text-primary dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  <Building2 className="h-3.5 w-3.5 text-primary dark:text-[#4edea3]" />
                  Create Organization
                </Link>
              )}
            </div>

            {/* Readiness */}
            <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Profile Readiness
                </span>
                <span className="text-xs font-bold text-primary dark:text-[#4edea3]">{readiness}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-[#4edea3] transition-all"
                  style={{ width: `${readiness}%` }}
                />
              </div>
              <p className="mt-2.5 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">{readinessHint}</p>
            </div>
          </div>

          {/* ── RIGHT: stacked cards ── */}
          <div className="space-y-6 lg:col-span-2">
            {/* 1. Company information */}
            <section className={CARD}>
              <div className="flex items-start justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
                <div>
                  <h3 className={`${TITLE} flex items-center gap-2`}>
                    <Briefcase className={SECTION_ICON} />
                    Company Information
                  </h3>
                  <p className={SUB}>Update your company and contact details.</p>
                </div>
                <span className="hidden rounded border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 sm:inline-block dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-400">
                  Org Entity
                </span>
              </div>

              <form onSubmit={handleSave} className="mt-5 space-y-4">
                {saveError && (
                  <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>{saveError}</span>
                  </div>
                )}
                {saved && (
                  <div className="flex items-center gap-2 rounded-lg border border-primary bg-[var(--sovereign-container-bg)] px-3.5 py-2.5 text-xs text-[var(--sovereign-hover)] dark:border-primary/30 dark:bg-primary/10 dark:text-[#4edea3]">
                    <Check className="h-3.5 w-3.5" />
                    <span>Profile changes saved.</span>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={LABEL} htmlFor="fullName">
                      Full Name <span className="text-primary">*</span>
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      required
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      className={INPUT}
                    />
                  </div>

                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label className="block text-xs font-medium text-zinc-900 dark:text-white" htmlFor="email">
                        Email Address
                      </label>
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Managed by Clerk</span>
                    </div>
                    <div className="relative">
                      <input id="email" type="email" readOnly value={email} className={INPUT_READONLY} />
                      <Lock className="absolute right-3 top-3 h-3.5 w-3.5 text-zinc-400" />
                    </div>
                  </div>

                  <div>
                    <label className={LABEL} htmlFor="phone">
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="0803 456 7890"
                      className={INPUT}
                    />
                  </div>

                  <div>
                    <label className={LABEL} htmlFor="company">
                      Management Company
                    </label>
                    <input
                      id="company"
                      type="text"
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      className={INPUT}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end border-t border-zinc-200 pt-4 dark:border-zinc-800">
                  <button
                    type="submit"
                    disabled={saving || !dirty}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-xs font-medium text-white shadow-sm transition-all hover:bg-[var(--sovereign-hover)] disabled:opacity-50 sm:text-sm"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </section>

            {/* 2. Firm verification */}
            <section className={CARD}>
              <div className="border-b border-zinc-200 pb-4 dark:border-zinc-800">
                <h3 className={`${TITLE} flex items-center gap-2`}>
                  <ShieldCheck className={SECTION_ICON} />
                  Verification
                </h3>
                <p className={SUB}>Your estate management firm verification status.</p>
              </div>

              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/40">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary dark:text-[#4edea3]">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <p className={`font-medium ${MUTED}`}>Verification tier</p>
                      <p className="text-sm font-semibold tracking-wide text-zinc-900 dark:text-white">tier_2</p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${kycTone.cls}`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {kyc ?? 'pending'}
                  </span>
                </div>

                <div className="flex flex-col items-start justify-between gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3.5 sm:flex-row sm:items-center dark:border-zinc-800 dark:bg-zinc-800/40">
                  <div className="flex items-start gap-3 sm:items-center">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary sm:mt-0 dark:text-[#4edea3]">
                      <IdCard className="h-4 w-4" />
                    </div>
                    <div>
                      <p className={`font-medium ${MUTED}`}>Next step</p>
                      <p className="text-xs text-zinc-900 dark:text-white sm:text-sm">
                        Submit CAC documents to complete verification.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => reloadKyc()}
                    className="inline-flex items-center gap-1.5 self-end whitespace-nowrap rounded-lg border border-primary px-4 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/5 sm:self-auto dark:text-[#4edea3]"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    Recheck Status
                  </button>
                </div>
              </div>
            </section>

            {/* 3. Notifications */}
            <section className={CARD}>
              <div className="border-b border-zinc-200 pb-4 dark:border-zinc-800">
                <h3 className={`${TITLE} flex items-center gap-2`}>
                  <Bell className={SECTION_ICON} />
                  Notifications
                </h3>
                <p className={SUB}>Manage alerts for your portfolio operations.</p>
              </div>

              {prefsError && (
                <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>{prefsError}</span>
                </div>
              )}

              <div className={`mt-4 divide-y divide-zinc-200 dark:divide-zinc-800 ${prefsSaving ? 'opacity-60' : ''}`}>
                {TOGGLES.map((t) => (
                  <div key={t.id} className="flex items-center justify-between gap-4 py-3.5">
                    <div className="pr-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-white">
                        <span>{t.label}</span>
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      </div>
                      <p className={`mt-0.5 ${MUTED}`}>{t.description}</p>
                    </div>
                    <Toggle
                      label={t.label}
                      checked={!!prefs.types[t.id]}
                      onChange={(v) => togglePref(t.id, v)}
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* 4. Password security */}
            <section className={CARD}>
              <div className="border-b border-zinc-200 pb-4 dark:border-zinc-800">
                <h3 className={`${TITLE} flex items-center gap-2`}>
                  <KeyRound className={SECTION_ICON} />
                  Password Security
                </h3>
                <p className={SUB}>Update your account password.</p>
              </div>
              <div className="mt-5 flex flex-col items-start justify-between gap-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 sm:flex-row sm:items-center dark:border-zinc-800 dark:bg-zinc-800/40">
                <Link
                  href="/sign-in"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-medium text-white shadow-sm transition-all hover:bg-[var(--sovereign-hover)] sm:text-sm"
                >
                  <KeyRound className="h-4 w-4" />
                  Change password
                </Link>
                <div className={`flex items-center gap-1.5 ${MUTED}`}>
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Passwords are managed through Clerk.</span>
                </div>
              </div>
            </section>

            {/* 5. Identity KYC — real component, real status */}
            <KycVerificationCard
              status={kyc}
              description="Verify your personal identity to unlock payments and documents."
              onVerified={() => reloadKyc()}
            />
          </div>
        </div>
      </main>
    </DashboardShell>
  );
}
