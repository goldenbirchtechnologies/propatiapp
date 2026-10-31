'use client';

import * as React from 'react';
import { BadgeCheck, Building2, Clock3, Lock, ShieldCheck, UserRound } from 'lucide-react';
import { DCard, DPill } from './primitives';
import { formatNaira, maskPhone } from './role-meta';

/**
 * The sticky summary rail.
 *
 * Everything printed here is read-only context the user has already given us —
 * jurisdiction, verified phone, KYC state, the role's own settlement facts. It
 * exists so a user filling in step five can still see what they told us in
 * step one without navigating back, which the Stitch references call out as the
 * core of the "dossier" metaphor.
 */

export interface RailFacts {
  fullName: string;
  email: string;
  countryCode: string | null;
  countryName: string | null;
  jurisdictionName: string | null;
  city: string | null;
  phone: string | null;
  phoneVerified: boolean;
  idType: string | null;
  idVerified: boolean;
  employmentStatus: string | null;
  employerName: string | null;
  jobTitle: string | null;
  yearlyIncome: number | null;
  guarantorName: string | null;
  guarantorRelationship: string | null;
}

const ROLE_BLURB: Record<string, string> = {
  tenant: 'Verified prospective tenant',
  landlord: 'Verified asset owner',
  agent: 'Accredited broker',
  estate_manager: 'Registered property firm',
};

const STATUS_TONE: Record<string, { label: string; tone: 'primary' | 'muted' | 'danger' | 'mint' }> = {
  not_started: { label: 'Not started', tone: 'muted' },
  in_progress: { label: 'In progress', tone: 'primary' },
  blocked: { label: 'Action needed', tone: 'danger' },
  completed: { label: 'Complete', tone: 'mint' },
};

export function DossierRail({
  role,
  facts,
  status,
  stepIndex,
  stepCount,
}: {
  role: string;
  facts: RailFacts;
  status: string;
  stepIndex: number;
  stepCount: number;
}) {
  const badge = STATUS_TONE[status] ?? STATUS_TONE.not_started;

  return (
    <div className="flex flex-col gap-3">
      {/* ── Identity ────────────────────────────────────────────────── */}
      <DCard className="p-4">
        <div className="flex items-start gap-3">
          <span
            aria-hidden
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[rgba(0,108,73,0.08)] text-[var(--accent)]"
          >
            {role === 'tenant' || role === 'agent' ? (
              <UserRound className="h-5 w-5" />
            ) : (
              <Building2 className="h-5 w-5" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="dossier-eyebrow text-[var(--on-surface-variant)]">Applicant</p>
            <p className="truncate text-[14px] font-semibold leading-5 text-[var(--on-surface)]">
              {facts.fullName}
            </p>
            <p className="truncate text-[12px] leading-4 text-[var(--on-surface-variant)]">
              {facts.email}
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <DPill tone={badge.tone}>{badge.label}</DPill>
          <DPill tone="neutral">
            Step {stepIndex + 1} of {stepCount}
          </DPill>
        </div>

        <p className="mt-3 border-t border-[var(--surface-container-high)] pt-3 text-[11px] leading-[15px] text-[var(--on-surface-variant)]">
          {ROLE_BLURB[role] ?? 'Propati account'}
        </p>
      </DCard>

      {/* ── Jurisdiction & contact ──────────────────────────────────── */}
      <DCard className="p-4">
        <RailGroup title="Jurisdiction" />
        <RailRow label="Country" value={facts.countryName ?? '—'} />
        <RailRow label="State / region" value={facts.jurisdictionName ?? '—'} />
        <RailRow label="City" value={facts.city ?? '—'} />

        <RailDivider />

        <RailGroup title="Contact" />
        <RailRow
          label="GSM number"
          value={facts.phone ? maskPhone(facts.phone) : '—'}
          trailing={
            facts.phoneVerified ? (
              <CheckTag label="Verified" />
            ) : (
              <PendingTag label="Unverified" />
            )
          }
        />
      </DCard>

      {/* ── Role-specific dossier ──────────────────────────────────── */}
      {role === 'tenant' ? (
        <DCard className="p-4">
          <RailGroup title="Solvency & sponsor" />
          <RailRow label="Employment" value={titleCase(facts.employmentStatus)} />
          <RailRow label="Employer" value={facts.employerName ?? '—'} />
          <RailRow label="Role" value={facts.jobTitle ?? '—'} />
          <RailRow
            label="Annual income"
            value={facts.yearlyIncome == null ? '—' : formatNaira(facts.yearlyIncome)}
          />

          <RailDivider />

          <RailGroup title="Guarantor" />
          <RailRow label="Name" value={facts.guarantorName ?? '—'} />
          <RailRow label="Relationship" value={titleCase(facts.guarantorRelationship)} />
        </DCard>
      ) : null}

      {role === 'landlord' ? (
        <DCard className="p-4">
          <RailGroup title="Asset mandate" />
          <RailRow label="Ownership entity" value={facts.fullName} />
          <RailRow label="Settlement" value="NUBAN account" />
          <RailRow label="Caution deposit" value="Ring-fenced" />
          <RailRow label="Management fee" value="Auto-deducted" />
        </DCard>
      ) : null}

      {role === 'agent' ? (
        <DCard className="p-4">
          <RailGroup title="Brokerage" />
          <RailRow label="Accreditation" value="REDAN / LASRERA" />
          <RailRow label="Territory" value={facts.jurisdictionName ?? '—'} />
          <RailRow label="Commission" value="Split escrow" />
          <RailRow label="Indemnity" value="Required" />
        </DCard>
      ) : null}

      {role === 'estate_manager' ? (
        <DCard className="p-4">
          <RailGroup title="Firm mandate" />
          <RailRow label="Operator" value={facts.fullName} />
          <RailRow label="Registration" value="CAC / NIESV" />
          <RailRow label="Authority" value="Power of Attorney" />
          <RailRow label="Settlement" value="Client trust escrow" />
        </DCard>
      ) : null}

      {/* ── KYC ─────────────────────────────────────────────────────── */}
      <DCard className="p-4">
        <div className="flex items-center justify-between gap-2">
          <RailGroup title="Identity" />
          {facts.idVerified ? (
            <DPill tone="mint">
              <BadgeCheck className="h-3 w-3" /> Verified
            </DPill>
          ) : (
            <DPill tone="muted">
              <Clock3 className="h-3 w-3" /> Pending
            </DPill>
          )}
        </div>
        <RailRow label="Document" value={idTypeLabel(facts.idType)} />
        <p className="mt-3 flex items-start gap-1.5 border-t border-[var(--surface-container-high)] pt-3 text-[11px] leading-[15px] text-[var(--on-surface-variant)]">
          <Lock className="mt-px h-3 w-3 shrink-0" />
          Identity numbers are encrypted at rest and never printed back to the browser.
        </p>
      </DCard>

      <p className="flex items-center justify-center gap-1.5 px-2 text-center text-[11px] text-[var(--on-surface-variant)]">
        <ShieldCheck className="h-3 w-3" /> NDPR-compliant statutory intake
      </p>
    </div>
  );
}

/* ── Rail atoms ───────────────────────────────────────────────────────── */

function RailGroup({ title }: { title: string }) {
  return (
    <p className="dossier-eyebrow mb-2 text-[var(--on-surface-variant)]">{title}</p>
  );
}

function RailRow({
  label,
  value,
  trailing,
}: {
  label: string;
  value: React.ReactNode;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-[3px]">
      <span className="shrink-0 text-[12px] leading-[18px] text-[var(--on-surface-variant)]">
        {label}
      </span>
      <span className="flex min-w-0 items-center justify-end gap-1.5 text-right">
        <span className="truncate text-[12px] font-semibold leading-[18px] text-[var(--on-surface)]">
          {value}
        </span>
        {trailing}
      </span>
    </div>
  );
}

function RailDivider() {
  return <div className="my-3 h-px w-full bg-[var(--surface-container-high)]" />;
}

function CheckTag({ label }: { label: string }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-0.5 rounded bg-[rgba(0,108,73,0.1)] px-1.5 py-px text-[10px] font-semibold uppercase tracking-[0.04em] text-[var(--accent)]">
      {label}
    </span>
  );
}

function PendingTag({ label }: { label: string }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-0.5 rounded bg-[var(--surface-container-high)] px-1.5 py-px text-[10px] font-semibold uppercase tracking-[0.04em] text-[var(--on-surface-variant)]">
      {label}
    </span>
  );
}

/* ── Formatting ───────────────────────────────────────────────────────── */

function titleCase(value?: string | null): string {
  if (!value) return '—';
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function idTypeLabel(value?: string | null): string {
  if (!value) return 'Not submitted';
  const map: Record<string, string> = {
    nin: 'NIN slip',
    bvn: 'BVN',
    passport: 'International passport',
    drivers_license: "Driver's licence",
    drivers_licence: "Driver's licence",
    voters_card: "Voter's card",
    cac: 'CAC certificate',
  };
  return map[value] ?? titleCase(value);
}
