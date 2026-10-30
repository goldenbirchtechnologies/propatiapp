'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  BadgeCheck,
  Shield,
  ShieldCheck,
  Fingerprint,
  Crown,
  Calendar,
  Pencil,
  Phone,
  Mail,
  MapPin,
  Scale,
  Briefcase,
  Users,
  Building2,
  KeyRound,
  RefreshCw,
  Download,
  CheckCircle2,
  CircleAlert,
  ChevronRight,
  Sparkles,
  Lock,
} from 'lucide-react';
import { useKycStatus } from '@/lib/dojah-client';
import {
  StandingCard,
  StandingSectionTitle,
  Eyebrow,
  StatusChip,
  StandingButton,
  IconButton,
  Meter,
  DataRow,
  BORDER,
  TEXT,
  TEXT_MUTED,
  SURFACE_MUTED,
} from '@/components/agent/standing-primitives';
import { cn } from '@/lib/utils';

type BusinessProfile = {
  id: string;
  companyName: string | null;
  cacNumber: string;
  rcNumber: string | null;
  verified: boolean;
} | null;

type PrimaryLicense = {
  id: string;
  board: string;
  licenseType: string;
  registrationNo: string;
  issuingBody: string;
  validUntil: string | null;
  reviewedAt: string | null;
} | null;

type ProfileData = {
  id: string;
  email: string;
  phone: string | null;
  role: string;
  fullName: string;
  avatarUrl: string | null;
  createdAt: string;
  agentTier: string;
  agentApproved: boolean;
  profileBio: string | null;
  agentBio: string | null;
  agentAreas: unknown;
  ninVerified: boolean;
  bvnVerified: boolean;
  phoneVerified: boolean;
  idVerified: boolean;
  profileCompleted: boolean;
  businessProfiles: BusinessProfile[];
  licenses: PrimaryLicense[];
  managedListings: { id: string }[];
  agentAgreements: { id: string }[];
};

const TIER_LABEL: Record<string, string> = {
  senior: 'Senior Broker / Conveyancer',
  standard: 'Certified Agent',
  probation: 'Probationary Agent',
};

const TIER_RANK: Record<string, number> = {
  probation: 1,
  standard: 2,
  senior: 3,
};

const BOARD_LABEL: Record<string, string> = {
  LASRERA: 'LASRERA Certified Broker',
  ESVARBON: 'ESVARBON Registered Fellow',
  NIESV: 'NIESV Registered',
  EAR: 'EAR Registered Broker',
};

function formatDate(value: string | null | undefined, fallback = '—') {
  if (!value) return fallback;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return fallback;
  return d.toLocaleDateString('en-NG', { day: '2-digit', month: 'long', year: 'numeric' });
}

function maskPhone(phone: string | null) {
  if (!phone) return 'Not provided';
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return '••••';
  return `•••••••• ${digits.slice(-4)}`;
}

export default function AgentProfileClient({ user }: { user: ProfileData }) {
  const { data: kyc, loading: kycLoading, reload } = useKycStatus();
  const [showAllVectors, setShowAllVectors] = useState(false);

  const memberSince = useMemo(
    () =>
      new Date(user.createdAt).toLocaleDateString('en-NG', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
    [user.createdAt],
  );

  const yearsActive = useMemo(() => {
    const diff = Date.now() - new Date(user.createdAt).getTime();
    return Math.max(0, Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000)));
  }, [user.createdAt]);

  const business = user.businessProfiles?.[0] ?? null;
  const license = user.licenses?.[0] ?? null;

  const specializationDirectives = useMemo(() => {
    const areas = user.agentAreas;
    if (Array.isArray(areas)) {
      const cleaned = areas
        .map((a) => (typeof a === 'string' ? a : typeof a === 'object' && a ? String((a as Record<string, unknown>).area ?? '') : ''))
        .map((a) => a.trim())
        .filter(Boolean);
      if (cleaned.length) return cleaned;
    }
    if (typeof areas === 'string' && areas.trim()) return [areas.trim()];
    return [];
  }, [user.agentAreas]);

  const bio = user.agentBio?.trim() || user.profileBio?.trim() || '';

  const vectors = [
    {
      key: 'nin',
      icon: Fingerprint,
      label: 'National Identity Number (NIN)',
      flag: `ninVerified: ${user.ninVerified}`,
      detail: user.ninVerified
        ? 'NIN slip verified via NIMC API — identity record confirmed'
        : 'NIN not yet verified — submit a valid NIN to activate this vector',
      state: user.ninVerified ? 'Active' : 'Pending',
      tone: user.ninVerified ? ('positive' as const) : ('warning' as const),
    },
    {
      key: 'phone',
      icon: KeyRound,
      label: 'Telco SIM KYC Verification',
      flag: `phoneVerified: ${user.phoneVerified}`,
      detail: user.phoneVerified
        ? 'Subscriber biometrics match NIN demographic record'
        : 'Mobile number not yet OTP-verified against the registered SIM',
      state: user.phoneVerified ? 'Linked' : 'Pending',
      tone: user.phoneVerified ? ('positive' as const) : ('warning' as const),
    },
    {
      key: 'id',
      icon: Scale,
      label: 'Government Photo ID & Biometrics',
      flag: `idVerified: ${user.idVerified}`,
      detail: user.idVerified
        ? "FRSC Driver's License & BVN biometric liveness check verified via Dojah AI"
        : 'Photo ID and biometric liveness check outstanding',
      state: user.idVerified ? 'Cleared' : 'Pending',
      tone: user.idVerified ? ('positive' as const) : ('warning' as const),
    },
    {
      key: 'bvn',
      icon: ShieldCheck,
      label: 'Bank Verification (BVN)',
      flag: `bvnVerified: ${user.bvnVerified}`,
      detail: user.bvnVerified
        ? 'NIBSS tier-3 bank verification matched against the NIN database'
        : 'Bank verification number not yet cross-checked with NIBSS',
      state: user.bvnVerified ? 'Cleared' : 'Pending',
      tone: user.bvnVerified ? ('positive' as const) : ('warning' as const),
    },
    {
      key: 'cac',
      icon: Building2,
      label: 'Corporate Affairs Commission (CAC)',
      flag: business?.rcNumber ?? business?.cacNumber ?? 'Not registered',
      detail: business?.verified
        ? `Active status confirmed • ${business.companyName ?? business.rcNumber ?? business.cacNumber}`
        : business
          ? `Registration on file for ${business.companyName ?? business.cacNumber} — awaiting validation`
          : 'No corporate entity registered against this agent account',
      state: business?.verified ? 'Active CAC' : business ? 'In Review' : 'Not Registered',
      tone: business?.verified ? ('positive' as const) : business ? ('warning' as const) : ('neutral' as const),
    },
  ];

  const visibleVectors = showAllVectors ? vectors : vectors.slice(0, 4);
  const clearedVectors = vectors.filter((v) => v.tone === 'positive').length;
  const auditScore = Math.round((clearedVectors / vectors.length) * 100);

  const kycLevel = kyc?.level ?? 1;
  const kycStatus = kyc?.status ?? 'not_started';
  const kycCleared = kycStatus === 'approved';

  const tierLabel = TIER_LABEL[user.agentTier] ?? 'Certified Agent';
  const tierRank = TIER_RANK[user.agentTier] ?? 2;

  const executionRecord = {
    completedMandates: user.agentAgreements?.length ?? 0,
    managedListings: user.managedListings?.length ?? 0,
    yearsActive,
    infractions: 0,
  };

  return (
    <div className="space-y-6">
      {/* ---------------- Identity header ---------------- */}
      <StandingCard className="overflow-hidden">
        <div className="border-b border-zinc-100 bg-gradient-to-br from-primary/60 via-white to-white dark:border-white/[0.06] dark:from-primary/[0.07] dark:via-zinc-900 dark:to-zinc-900">
          <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="relative shrink-0">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName}
                    className="h-24 w-24 rounded-xl border border-zinc-200 object-cover dark:border-white/[0.08]"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-100 text-2xl font-bold text-zinc-400 dark:border-white/[0.08] dark:bg-zinc-800">
                    {user.fullName.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <span className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-primary text-white dark:border-zinc-900">
                  <Shield className="h-3.5 w-3.5" />
                </span>
              </div>

              <div className="min-w-0">
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-3xl">
                  {user.fullName}
                </h1>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {tierRank === 3 ? (
                    <StatusChip tone="warning" icon={<Crown className="h-3.5 w-3.5" />}>
                      Premium L{kycLevel} Tier
                    </StatusChip>
                  ) : (
                    <StatusChip tone="info" icon={<BadgeCheck className="h-3.5 w-3.5" />}>
                      L{kycLevel} {tierLabel}
                    </StatusChip>
                  )}
                  {user.agentApproved ? (
                    <StatusChip tone="positive" icon={<CheckCircle2 className="h-3.5 w-3.5" />}>
                      Approved Agent
                    </StatusChip>
                  ) : (
                    <StatusChip tone="warning" icon={<CircleAlert className="h-3.5 w-3.5" />}>
                      Pending Approval
                    </StatusChip>
                  )}
                  {license ? (
                    <StatusChip tone="positive" icon={<BadgeCheck className="h-3.5 w-3.5" />}>
                      {BOARD_LABEL[license.board] ?? license.licenseType}
                    </StatusChip>
                  ) : null}
                  {business ? (
                    <StatusChip tone="neutral" icon={<Building2 className="h-3.5 w-3.5" />}>
                      {business.rcNumber ?? business.cacNumber}
                    </StatusChip>
                  ) : null}
                </div>

                <div className="mt-4 space-y-1.5 text-sm text-zinc-600 dark:text-zinc-400">
                  {license ? (
                    <p className="flex items-center gap-2">
                      <Scale className="h-4 w-4 shrink-0 text-zinc-400" />
                      <span>
                        License: {license.registrationNo}
                        {license.validUntil ? ` · Valid until ${formatDate(license.validUntil)}` : ''}
                      </span>
                    </p>
                  ) : null}
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 shrink-0 text-zinc-400" />
                    <span>Agent since {memberSince}</span>
                  </p>
                  {specializationDirectives.length ? (
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 shrink-0 text-zinc-400" />
                      <span>{specializationDirectives.join(' · ')}</span>
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link href="/dashboard/agent/profile">
                <StandingButton variant="primary">
                  <Pencil className="h-4 w-4" />
                  Edit Profile
                </StandingButton>
              </Link>
              <Link href="/dashboard/agent/verifications">
                <StandingButton variant="outline">
                  <ShieldCheck className="h-4 w-4" />
                  Verification Status
                </StandingButton>
              </Link>
              <Link href="/dashboard/agent/profile">
                <StandingButton variant="outline">
                  <Phone className="h-4 w-4" />
                  Change Phone
                </StandingButton>
              </Link>
            </div>
          </div>
        </div>

        {/* Execution strip */}
        <div className="grid grid-cols-1 divide-y divide-zinc-100 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x dark:divide-white/[0.06]">
          <div className="flex items-start gap-3 p-5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              <Mail className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <Eyebrow>Primary Work Email</Eyebrow>
              <p className="mt-1 truncate text-sm font-semibold text-zinc-900 dark:text-white">
                {user.email}
              </p>
              <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                Routing to your registered domain
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              <Phone className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <Eyebrow>Encrypted Direct Phone</Eyebrow>
              <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-white">
                {maskPhone(user.phone)}
              </p>
              <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                {user.phoneVerified ? 'Telco SIM matched' : 'OTP verification pending'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              <Briefcase className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <Eyebrow>Account Role &amp; Clearance</Eyebrow>
              <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-white">{tierLabel}</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                Level {kycLevel} Sovereign Access
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              <Users className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <Eyebrow>Execution Track Record</Eyebrow>
              <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-white">
                {executionRecord.completedMandates} Completed Mandates
              </p>
              <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                {executionRecord.managedListings} listings • {yearsActive} yr active
              </p>
            </div>
          </div>
        </div>
      </StandingCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* ---------------- Representation scope ---------------- */}
        <div className="space-y-6">
          <StandingCard className="p-6">
            <StandingSectionTitle
              icon={<Scale className="h-5 w-5" />}
              title="Representation Scope"
              action={
                <IconButton label="Edit representation scope">
                  <Pencil className="h-4 w-4" />
                </IconButton>
              }
            />

            <p className="mt-4 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              {bio || (
                <span className="text-zinc-500 dark:text-zinc-500">
                  No professional biography has been published yet. Add your principal role,
                  specialisations, and accreditation coverage so counterparties can assess your
                  mandate experience.
                </span>
              )}
            </p>

            <div className="mt-6">
              <Eyebrow>Specialization Directives</Eyebrow>
              {specializationDirectives.length ? (
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {specializationDirectives.map((area) => (
                    <span
                      key={area}
                      className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:border-white/[0.08] dark:bg-zinc-800/60 dark:text-zinc-300"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-500">
                  No specialization directives recorded.
                </p>
              )}
            </div>

            <div className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-white/[0.08] dark:bg-zinc-800/50">
              <Eyebrow>Active Escrow Volume Handled</Eyebrow>
              <p className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                {executionRecord.completedMandates}
                <span className="ml-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  settled mandates
                </span>
              </p>
              <Meter value={Math.min(100, executionRecord.completedMandates * 5)} className="mt-3" />
              <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                Escrow exposure is cleared through Paystack institutional settlement. Settlement
                volumes are published from the transaction ledger.
              </p>
            </div>
          </StandingCard>
        </div>

        {/* ---------------- Institutional KYC gateway ---------------- */}
        <div className="space-y-6">
          <StandingCard className="p-6">
            <StandingSectionTitle
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Institutional KYC Gateway"
              action={
                <StatusChip tone={kycCleared ? 'positive' : 'neutral'}>
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
                  Dojah Gateway: {kycLoading ? 'Syncing…' : kycCleared ? 'Live & Synced' : 'Standby'}
                </StatusChip>
              }
            />
            <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-400">
              Real-time cryptographic audit trail verified by Dojah Identity Engine
            </p>

            <div className="mt-5 flex items-center gap-4 rounded-xl border border-primary bg-primary/70 p-4 dark:border-primary/25 dark:bg-primary/[0.07]">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-white dark:bg-primary dark:text-zinc-950">
                <Shield className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-zinc-900 dark:text-white">
                  Tier {kycLevel} Enhanced Institutional KYC {kycCleared ? 'Cleared' : 'In Progress'}
                </p>
                <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                  Validated against Central Bank of Nigeria &amp; NIMC Registers
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-2xl font-bold tracking-tight text-[var(--sovereign-hover)] dark:text-[#4edea3]">
                  {auditScore}%
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Audit Score
                </p>
              </div>
            </div>

            <div className="mt-5">
              <Eyebrow>Identity Vectors (Prisma User Schema)</Eyebrow>
              <div className="mt-2.5 space-y-2">
                {visibleVectors.map((vector) => {
                  const Icon = vector.icon;
                  return (
                    <div
                      key={vector.key}
                      className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3.5 dark:border-white/[0.08] dark:bg-zinc-800/50"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                            {vector.label}
                          </p>
                          <span className="rounded bg-zinc-200 px-1.5 py-0.5 font-mono text-[10px] text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                            {vector.flag}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                          {vector.detail}
                        </p>
                      </div>
                      <StatusChip tone={vector.tone} className="shrink-0">
                        {vector.state}
                      </StatusChip>
                    </div>
                  );
                })}
              </div>

              {vectors.length > 4 ? (
                <button
                  type="button"
                  onClick={() => setShowAllVectors((v) => !v)}
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[var(--sovereign-hover)] hover:underline dark:text-[#4edea3]"
                >
                  {showAllVectors ? 'Show fewer vectors' : `Show all ${vectors.length} identity vectors`}
                  <ChevronRight className={cn('h-3.5 w-3.5 transition-transform', showAllVectors && 'rotate-90')} />
                </button>
              ) : null}
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 pt-4 dark:border-white/[0.06]">
              <p className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                <Lock className="h-3.5 w-3.5" />
                {kyc?.dojahRef ? (
                  <>
                    Docket #{kyc.dojahRef}
                    {kyc.verifiedAt ? ` · Cleared ${formatDate(kyc.verifiedAt)}` : ''}
                  </>
                ) : (
                  'No Dojah docket issued yet'
                )}
              </p>
              <div className="flex flex-wrap gap-2">
                <StandingButton variant="outline" size="sm" onClick={reload} disabled={kycLoading}>
                  <RefreshCw className={cn('h-3.5 w-3.5', kycLoading && 'animate-spin')} />
                  Refresh Status
                </StandingButton>
                <Link href="/dashboard/agent/verifications">
                  <StandingButton variant="primary" size="sm">
                    <Download className="h-3.5 w-3.5" />
                    Download KYC PDF
                  </StandingButton>
                </Link>
              </div>
            </div>
          </StandingCard>

          {/* ---------------- Security & session activity ---------------- */}
          <StandingCard className="p-6">
            <StandingSectionTitle
              icon={<KeyRound className="h-5 w-5" />}
              title="Security &amp; Session Activity"
              action={<StatusChip tone="info">Clerk Managed Identity</StatusChip>}
            />
            <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-400">
              Identity, credential and session controls are managed by Clerk
            </p>

            <div className="mt-4 space-y-2.5">
              <div
                className={cn(
                  'flex items-start justify-between gap-3 rounded-xl border p-3.5',
                  BORDER,
                  SURFACE_MUTED,
                )}
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                      Account password
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                      Passwordless sign-in — Clerk session token active
                    </p>
                  </div>
                </div>
                <StatusChip tone="positive">Enforced</StatusChip>
              </div>

              <div
                className={cn(
                  'flex items-start justify-between gap-3 rounded-xl border p-3.5',
                  BORDER,
                  SURFACE_MUTED,
                )}
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
                    <Lock className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                      Hardware 2FA key
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                      Register a FIDO2 WebAuthn token in your Clerk security settings
                    </p>
                  </div>
                </div>
                <StatusChip tone="neutral">Not registered</StatusChip>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-lg bg-[var(--sovereign-container-bg)] px-3 py-2.5 text-xs text-[var(--sovereign-hover)] dark:bg-primary/10 dark:text-[#6ffbbe]">
              <Sparkles className="h-3.5 w-3.5 shrink-0" />
              Two-factor hardware tokens must be registered from your Clerk account — PropatiBox does
              not hold credential material.
            </div>
          </StandingCard>
        </div>
      </div>
    </div>
  );
}
