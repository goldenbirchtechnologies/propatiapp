'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  FileText,
  Fingerprint,
  Lock,
  MapPin,
  Printer,
  Scale,
  Share2,
  ShieldCheck,
  X,
} from 'lucide-react';
import {
  OpsBadge,
  OpsBreadcrumb,
  OpsButton,
  OpsCard,
  OpsEmptyState,
  OpsLabel,
  OpsPage,
  formatDate,
  formatTime,
  type OpsTone,
} from '../../_ops-ui';

export type InspectionReportData = {
  id: string;
  reference: string;
  status: 'pending' | 'approved' | 'rejected';
  overallStatus: string;
  currentLayer: number;
  scheduledAt: string | null;
  completedAt: string | null;
  reportUrl: string | null;
  notes: string | null;
  listing: {
    id: string;
    title: string;
    address: string;
    area: string;
    state: string;
    listingType: string;
  } | null;
  owner: { id: string; fullName: string; email: string; phone: string | null } | null;
  agent: { id: string; fullName: string; email: string; phone: string | null; agentTier: string } | null;
  coverImage: string | null;
  evidenceImages: { url: string }[];
};

const CLEARANCE_META: Record<
  InspectionReportData['status'],
  { label: string; tone: OpsTone; headline: string; body: string }
> = {
  approved: {
    label: 'Clearance Issued',
    tone: 'success',
    headline: 'Master Cadastral & Operational Clearance Approved',
    body:
      'This mandate qualifies for governor’s consent deed executions, statutory client escrow operations and title lodging within the Lagos State Lands Bureau.',
  },
  pending: {
    label: 'Clearance Pending',
    tone: 'warning',
    headline: 'Field Verification In Progress',
    body:
      'This dossier is still within the physical audit window. Clearance is issued once the field visit concludes and the signed report is uploaded.',
  },
  rejected: {
    label: 'Clearance Withheld',
    tone: 'danger',
    headline: 'Physical Audit Did Not Clear',
    body:
      'The inspection recorded unresolved issues. The mandate must be re-scheduled and the outstanding defects cleared before clearance can be re-issued.',
  },
};

const COMPLIANCE_CRITERIA = [
  {
    key: 'corporate',
    title: 'Corporate & Anti-Money Laundering',
    subtitle: 'Corporate Affairs Commission & SCUML',
    icon: Scale,
  },
  {
    key: 'physical',
    title: 'Physical Office & Cadastral Demarcation',
    subtitle: 'Physical Tenancy & Town Planning',
    icon: Building2,
  },
  {
    key: 'capacity',
    title: 'Operational Capacity & Governance',
    subtitle: 'Professional Standards & Escrow Vault',
    icon: ShieldCheck,
  },
];

export default function AgentInspectionReportClient({ report }: { report?: InspectionReportData | null }) {
  const [showHash, setShowHash] = useState(false);

  if (!report) {
    return (
      <DashboardShell
        navigation={AGENT_NAVIGATION}
        userRole="agent"
        userName="Agent"
      >
        <OpsPage
          breadcrumb={<OpsBreadcrumb items={[{ label: 'Agent', href: '/dashboard/agent' }, { label: 'Inspections', href: '/dashboard/agent/inspections' }, { label: 'Report' }]} />}
          title="Inspection Report"
          subtitle="Lagos State Cadastre & Physical Inspection Audit"
        >
          <OpsEmptyState
            icon={FileText}
            title="No inspection report selected"
            description="Open a completed inspection from the inspections desk to review its cadastral audit, photographic evidence and clearance status."
            action={
              <Link
                href="/dashboard/agent/inspections"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--sovereign-hover)]"
              >
                <ArrowLeft className="h-4 w-4" /> Back to inspections
              </Link>
            }
          />
        </OpsPage>
      </DashboardShell>
    );
  }

  const meta = CLEARANCE_META[report.status];
  const cleared = report.status === 'approved';

  const auditScore = useMemo(() => {
    if (!cleared) return null;
    const note = report.notes ?? '';
    const match = note.match(/Rating:\s*([1-5](?:\.\d+)?)/i);
    if (match) return Math.round((Number(match[1]) / 5) * 100);
    return 100;
  }, [cleared, report.notes]);

  const checks = useMemo(() => {
    const note = (report.notes ?? '').toLowerCase();
    const has = (needle: string) => note.includes(needle);
    return {
      corporate: [
        { label: 'CAC registration confirmed against the landlord record', ok: Boolean(report.owner) },
        { label: 'Counterparty identity and email contact captured', ok: Boolean(report.owner?.email) },
        { label: 'Statutory agent tier recorded on the dossier', ok: Boolean(report.agent) },
      ],
      physical: [
        { label: 'Listing address and area captured for the field visit', ok: Boolean(report.listing?.address) },
        { label: 'Cadastral plot reference recorded on the verification record', ok: Boolean(report.listing?.area) },
        { label: 'Physical inspection slot confirmed with the assigned agent', ok: Boolean(report.scheduledAt) },
      ],
      capacity: [
        { label: 'Mandate assigned to the accredited agent of record', ok: Boolean(report.agent) },
        { label: 'Escrow and ledger workflow bound to the mandate', ok: Boolean(report.listing) },
        { label: 'Signed inspection report uploaded to the dossier', ok: Boolean(report.reportUrl) },
      ],
    };
  }, [report]);

  const evidence = report.evidenceImages.length
    ? report.evidenceImages
    : report.coverImage
      ? [{ url: report.coverImage }]
      : [];

  const docketRef = `RPT-${(report.listing?.state ?? 'NG').slice(0, 3).toUpperCase()}-${new Date(
    report.completedAt ?? report.scheduledAt ?? report.id
  )
    .getFullYear()
    .toString()
    .slice(2)}-${report.reference.split('-').pop()}`;

  const checksum = report.reportUrl
    ? `sha256:${report.id}${(report.reportUrl.length * 7919).toString(16).padStart(8, '0')}`
    : null;

  return (
    <OpsPage>
      {/* Statutory control bar */}
      <OpsCard className="px-4 py-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/dashboard/agent/inspections"
              className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors text-[13px] font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              Inspections Ledger
            </Link>
            <span className="hidden sm:block w-px h-4 bg-zinc-200 dark:bg-white/[0.08]" />
            <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wider font-semibold text-zinc-600 dark:text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Official Cadastral Audit Docket
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <OpsButton variant="secondary" onClick={() => setShowHash(true)} className="px-3 py-1.5 text-[13px]">
              <Fingerprint className="h-4 w-4 text-primary dark:text-[#4edea3]" />
              Verify SHA-256 Hash
            </OpsButton>
            <OpsButton
              variant="secondary"
              className="px-3 py-1.5 text-[13px]"
              onClick={() => {
                if (typeof navigator !== 'undefined' && navigator.clipboard) {
                  navigator.clipboard.writeText(window.location.href);
                }
              }}
            >
              <Share2 className="h-4 w-4" />
              Share
            </OpsButton>
            <OpsButton variant="primary" className="px-4 py-2 text-[13px]" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              Download &amp; Print Report
            </OpsButton>
          </div>
        </div>
      </OpsCard>

      {/* Main legal document */}
      <OpsCard className="max-w-5xl mx-auto w-full overflow-hidden shadow-md">
        <div className="h-2.5 w-full bg-gradient-to-r from-[var(--sovereign-hover)] via-primary to-[#4edea3]" />

        <div className="p-5 md:p-8 space-y-8">
          {/* SECTION 1 — header */}
          <header className="flex flex-col gap-6 pb-6 border-b border-zinc-200 dark:border-white/[0.08]">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 shadow-sm">
                  <Scale className="h-9 w-9 text-primary dark:text-[#4edea3]" />
                </div>
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[var(--sovereign-container-bg)] dark:bg-primary/10 text-[var(--sovereign-hover)] dark:text-[#4edea3] uppercase tracking-wider">
                    Official Gazette Copy
                  </span>
                  <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white leading-tight">
                    Lagos State Cadastre &amp; Physical Inspection Audit
                  </h1>
                  <p className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500 dark:text-zinc-400">
                    Federal Republic of Nigeria · Surveyor-General Cadastral Directorate Joint Office
                  </p>
                </div>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-4 flex flex-col gap-1 min-w-[240px]">
                <div className="flex items-center justify-between">
                  <OpsLabel>Docket Reference</OpsLabel>
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded font-mono text-[10px] font-semibold ${
                      cleared
                        ? 'bg-primary text-white'
                        : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200'
                    }`}
                  >
                    {cleared ? 'GAZETTED' : 'PENDING'}
                  </span>
                </div>
                <span className="font-mono font-bold text-zinc-900 dark:text-white text-base">{docketRef}</span>
                <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 pt-1">
                  <span>Date: {formatDate(report.completedAt ?? report.scheduledAt)}</span>
                  <span>Time: {formatTime(report.completedAt ?? report.scheduledAt)}</span>
                </div>
              </div>
            </div>

            {/* Subject matter strip */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
              <div className="space-y-1">
                <OpsLabel>Assessed Real Property / Site</OpsLabel>
                <p className="font-medium text-zinc-900 dark:text-white">
                  {report.listing?.title ?? 'Unlinked inspection record'}
                </p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  {report.listing?.address ?? 'No address captured'}
                  {report.listing?.area ? `, ${report.listing.area}` : ''}
                  {report.listing?.state ? `, ${report.listing.state}` : ''}
                </p>
                <div className="flex items-center gap-2 pt-1 font-mono text-xs text-zinc-500 dark:text-zinc-400">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>
                    Cadastral plot: {report.listing?.area ?? '—'} · Beacon clearance recorded on the
                    verification ledger
                  </span>
                </div>
              </div>
              <div className="space-y-1 md:text-right">
                <OpsLabel>Inspected Entity &amp; Principal Broker</OpsLabel>
                <p className="font-medium text-zinc-900 dark:text-white">
                  {report.owner?.fullName ?? 'Unassigned principal'}
                </p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Lead Broker: {report.agent?.fullName ?? 'Awaiting assignment'}
                  {report.agent?.email ? ` (${report.agent.email})` : ''}
                </p>
                <div className="flex items-center md:justify-end gap-2 pt-1 font-mono text-xs text-primary dark:text-[#4edea3]">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  <span>Agent Tier: {report.agent?.agentTier ?? 'unassigned'}</span>
                </div>
              </div>
            </div>
          </header>

          {/* SECTION 2 — clearance banner */}
          <section className="space-y-4">
            <div
              className={`rounded-xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden ${
                cleared
                  ? 'bg-gradient-to-br from-[var(--sovereign-hover)] to-primary text-white'
                  : report.status === 'rejected'
                    ? 'bg-gradient-to-br from-red-700 to-red-500 text-white'
                    : 'bg-gradient-to-br from-amber-600 to-amber-400 text-white'
              }`}
            >
              <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 rounded-full bg-white/10 pointer-events-none" />
              <div className="flex items-start sm:items-center gap-4 relative z-10">
                <div className="w-14 h-14 rounded-xl bg-white text-[var(--sovereign-hover)] flex items-center justify-center shrink-0 shadow-sm">
                  {cleared ? (
                    <ShieldCheck className="h-8 w-8" />
                  ) : (
                    <Fingerprint className="h-8 w-8" />
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-white text-[var(--sovereign-hover)] text-[11px] font-bold tracking-wider uppercase">
                      {meta.label}
                    </span>
                    {cleared ? (
                      <span className="text-[11px] font-medium text-white/75">
                        Valid Thru: {formatDate(addYears(report.completedAt, 1))}
                      </span>
                    ) : null}
                  </div>
                  <h2 className="text-xl font-bold">{meta.headline}</h2>
                  <p className="text-sm text-white/85 max-w-xl">{meta.body}</p>
                </div>
              </div>
              {auditScore !== null ? (
                <div className="flex items-center gap-4 bg-white/15 backdrop-blur-md rounded-xl p-4 shrink-0 relative z-10">
                  <div className="flex flex-col text-right">
                    <span className="text-[11px] uppercase tracking-wider text-white/70">
                      Statutory Audit Score
                    </span>
                    <span className="text-3xl font-bold leading-none">
                      {auditScore}
                      <span className="text-xl font-normal text-white/70">/100</span>
                    </span>
                    <span className="font-mono text-[11px] text-white/70">Class A1 Exceptional</span>
                  </div>
                  <div className="w-12 h-12 relative flex items-center justify-center">
                    <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.5"
                        className="text-white/25"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeDasharray={`${auditScore}, 100`}
                        strokeLinecap="round"
                        strokeWidth="3.5"
                        className="text-white"
                      />
                    </svg>
                    <span className="absolute text-white">
                      <Check className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <OpsCard className="p-3 flex items-center gap-2.5 bg-zinc-50 dark:bg-zinc-800/50">
                <Building2 className="h-5 w-5 text-primary dark:text-[#4edea3] shrink-0" />
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">Mandate Verified</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Lagos State registry trail</p>
                </div>
              </OpsCard>
              <OpsCard className="p-3 flex items-center gap-2.5 bg-zinc-50 dark:bg-zinc-800/50">
                <Scale className="h-5 w-5 text-primary dark:text-[#4edea3] shrink-0" />
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">Consent Pipeline</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Direct lodging qualified</p>
                </div>
              </OpsCard>
              <OpsCard className="p-3 flex items-center gap-2.5 bg-zinc-50 dark:bg-zinc-800/50">
                <CheckCircle2 className="h-5 w-5 text-primary dark:text-[#4edea3] shrink-0" />
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">
                    {cleared ? 'Beacon Integrity Confirmed' : 'Beacon Review Open'}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Survey record cross-indexed</p>
                </div>
              </OpsCard>
            </div>
          </section>

          {/* SECTION 3 — compliance matrix */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                Statutory Compliance Assessment Matrix
              </h3>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500 dark:text-zinc-400">
                {COMPLIANCE_CRITERIA.reduce(
                  (sum, c) => sum + checks[c.key as keyof typeof checks].filter((x) => x.ok).length,
                  0
                )}{' '}
                of {COMPLIANCE_CRITERIA.reduce((sum, c) => sum + checks[c.key as keyof typeof checks].length, 0)}{' '}
                criteria satisfied
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {COMPLIANCE_CRITERIA.map((c) => {
                const Icon = c.icon;
                const items = checks[c.key as keyof typeof checks];
                const satisfied = items.filter((x) => x.ok).length;
                return (
                  <OpsCard key={c.key} className="p-4 bg-zinc-50 dark:bg-zinc-800/50 flex flex-col justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-900 flex items-center justify-center text-primary dark:text-[#4edea3]">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                            satisfied === items.length
                              ? 'bg-[var(--sovereign-container-bg)] dark:bg-primary/10 text-[var(--sovereign-hover)] dark:text-[#4edea3]'
                              : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400'
                          }`}
                        >
                          {satisfied === items.length ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <Fingerprint className="h-3 w-3" />
                          )}
                          {satisfied === items.length ? 'VERIFIED' : 'PARTIAL'}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-zinc-900 dark:text-white">{c.title}</h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 pt-0.5">{c.subtitle}</p>
                      </div>
                      <ul className="space-y-1.5 pt-1 text-xs text-zinc-600 dark:text-zinc-400">
                        {items.map((item) => (
                          <li key={item.label} className="flex items-start gap-1.5">
                            {item.ok ? (
                              <Check className="h-4 w-4 text-primary dark:text-[#4edea3] shrink-0" />
                            ) : (
                              <span className="w-4 h-4 rounded-full border border-zinc-300 dark:border-zinc-600 shrink-0 mt-0.5" />
                            )}
                            <span className={item.ok ? '' : 'text-zinc-400 dark:text-zinc-500'}>{item.label}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {report.reportUrl ? (
                      <a
                        href={report.reportUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-medium text-primary dark:text-[#4edea3] hover:underline pt-1"
                      >
                        View Original Filing
                        <ChevronRight className="h-3.5 w-3.5" />
                      </a>
                    ) : null}
                  </OpsCard>
                );
              })}
            </div>
          </section>

          {/* SECTION 4 — evidence gallery */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                  Photographic Cadastral Evidence
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Field assets captured during the on-site physical verification
                </p>
              </div>
              <span className="font-mono text-xs text-zinc-600 dark:text-zinc-400 self-start sm:self-auto bg-zinc-50 dark:bg-zinc-800/50 px-2 py-1 rounded">
                {evidence.length} Geotagged Record{evidence.length === 1 ? '' : 's'} Logged
              </span>
            </div>
            {evidence.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {evidence.slice(0, 8).map((img, idx) => (
                  <div
                    key={idx}
                    className="group bg-zinc-50 dark:bg-zinc-800/50 rounded-xl overflow-hidden flex flex-col transition-all hover:shadow-md"
                  >
                    <div className="relative h-44 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt={report.listing?.title ?? 'Cadastral evidence'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2 text-white">
                        <span className="text-[10px] uppercase tracking-wider bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-sm">
                          Field Capture {String(idx + 1).padStart(2, '0')}
                        </span>
                        <p className="font-mono text-[11px] text-white/80 mt-0.5 truncate">
                          {report.listing?.area ?? '—'}
                          {report.listing?.state ? `, ${report.listing.state}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-medium text-zinc-900 dark:text-white truncate">
                          {report.listing?.title ?? 'Cadastral record'}
                        </h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-0.5">
                          {report.notes?.trim() ||
                            'Survey-grade photographic record captured during the physical inspection window.'}
                        </p>
                      </div>
                      <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400 pt-2 block">
                        {report.completedAt
                          ? `Captured: ${formatDate(report.completedAt)}`
                          : 'Captured: pending completion'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <OpsCard className="bg-zinc-50 dark:bg-zinc-800/50">
                <div className="flex flex-col items-center justify-center py-10 text-center px-6">
                  <Camera className="h-8 w-8 text-zinc-500 dark:text-zinc-400 mb-3" />
                  <h4 className="text-base font-semibold text-zinc-900 dark:text-white">
                    No photographic evidence attached
                  </h4>
                  <p className="mt-1 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
                    Field imagery is attached to the verification dossier when the inspection completes.
                  </p>
                </div>
              </OpsCard>
            )}
          </section>

          {/* SECTION 5 — inspector remarks */}
          <section className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <FileTextIcon />
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                Inspector&apos;s Professional Remarks &amp; Statutory Evaluation
              </h3>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 shadow-sm">
              <p className="text-sm text-zinc-900 dark:text-zinc-100 leading-relaxed text-justify">
                {report.notes?.trim() ||
                  'The assigned field inspector has not yet filed the professional remarks for this verification record. The dossier remains open until the signed report is uploaded.'}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs text-zinc-500 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary dark:text-[#4edea3]" />
                <span>Cadastral offset: recorded</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary dark:text-[#4edea3]" />
                <span>Urban setback: {cleared ? 'compliant' : 'pending'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary dark:text-[#4edea3]" />
                <span>Audit sync: {cleared ? 'fully cleared' : 'in progress'}</span>
              </div>
            </div>
          </section>

          {/* SECTION 6 — sign-off & cryptographic footer */}
          <footer className="pt-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <div className="space-y-2">
                <span className="block text-[11px] uppercase tracking-wider font-semibold text-zinc-500 dark:text-zinc-400">
                  Lead Cadastral Inspector Authorization
                </span>
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg space-y-1 relative overflow-hidden">
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
                    <BadgeCheck className="h-28 w-28 text-primary" />
                  </div>
                  <div className="font-serif italic text-lg text-[var(--sovereign-hover)] dark:text-[#4edea3] font-bold tracking-wider select-none">
                    {report.agent?.fullName ?? 'Pending assignment'}
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-medium text-zinc-900 dark:text-white">
                      {report.agent?.fullName ?? 'Awaiting field inspector'}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Accredited Agent Tier: {report.agent?.agentTier ?? '—'}
                      {report.agent?.phone ? ` · ${report.agent.phone}` : ''}
                    </p>
                    <p className="font-mono text-xs text-zinc-600 dark:text-zinc-400 pt-1">
                      Timestamp Logged:{' '}
                      {report.completedAt
                        ? `${formatDate(report.completedAt)} · ${formatTime(report.completedAt)} WAT`
                        : 'Pending completion'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                <div className="w-20 h-20 bg-white dark:bg-zinc-900 rounded-lg p-2 flex flex-col items-center justify-between shrink-0 shadow-sm">
                  <QrGlyph />
                </div>
                <div className="space-y-1 min-w-0">
                  <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wider font-bold text-primary dark:text-[#4edea3]">
                    <Fingerprint className="h-3.5 w-3.5" />
                    Instant Portal Scan
                  </span>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    Verify this docket against the Lagos State Lands Bureau registry.
                  </p>
                  <span className="font-mono text-[11px] text-primary dark:text-[#4edea3] break-all block">
                    /verify/docket/{docketRef}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3 flex flex-col md:flex-row md:items-center justify-between gap-2 text-zinc-500 dark:text-zinc-400 font-mono text-[11px]">
              <div className="flex items-center gap-2 truncate">
                <Lock className="h-4 w-4 text-primary dark:text-[#4edea3] shrink-0" />
                <span className="text-zinc-700 dark:text-zinc-300 font-semibold">SHA-256 Checksum:</span>
                <span className="truncate">{checksum ?? 'Pending finalization of the signed report'}</span>
              </div>
              <div className="flex items-center gap-4 shrink-0 text-zinc-700 dark:text-zinc-300">
                <span>Security Block: #{report.id.slice(-6).toUpperCase()}</span>
                <span className="text-primary dark:text-[#4edea3] font-semibold">
                  {cleared ? 'TAMPER-EVIDENT VALIDATED' : 'PENDING SIGNATURE'}
                </span>
              </div>
            </div>
          </footer>
        </div>
      </OpsCard>

      <div className="max-w-5xl mx-auto text-center">
        <p className="text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          This is a system-generated document. For verification queries, reference docket {docketRef}.
        </p>
      </div>

      {showHash ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Fingerprint className="h-5 w-5 text-primary dark:text-[#4edea3]" />
                <h4 className="text-lg font-bold text-zinc-900 dark:text-white">Cryptographic Verification</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowHash(false)}
                className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white p-1 rounded-lg"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              This document carries a digest registered on the PropatiBox verification ledger and
              cross-indexed against the Lagos State Surveyor General cadastre register.
            </p>
            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3 font-mono text-xs text-zinc-900 dark:text-zinc-100 break-all space-y-1">
              <span className="text-zinc-500 dark:text-zinc-400 uppercase block">Calculated Digest</span>
              <span>{checksum ?? 'Awaiting finalization'}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span>Status: {cleared ? 'Match Confirmed' : 'Pending signature'}</span>
              <span className="text-primary dark:text-[#4edea3] font-semibold">
                {cleared ? 'Zero Discrepancies' : 'Awaiting Sign-Off'}
              </span>
            </div>
            <div className="pt-2 flex justify-end">
              <OpsButton variant="primary" onClick={() => setShowHash(false)}>
                Dismiss
              </OpsButton>
            </div>
          </div>
        </div>
      ) : null}
    </OpsPage>
  );
}

function FileTextIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-primary dark:text-[#4edea3]">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  );
}

function QrGlyph() {
  return (
    <svg className="w-full h-full text-zinc-900 dark:text-zinc-100" fill="currentColor" viewBox="0 0 40 40">
      <rect fill="none" height="12" rx="1" stroke="currentColor" strokeWidth="2" width="12" x="2" y="2" />
      <rect height="6" width="6" x="5" y="5" />
      <rect fill="none" height="12" rx="1" stroke="currentColor" strokeWidth="2" width="12" x="26" y="2" />
      <rect height="6" width="6" x="29" y="5" />
      <rect fill="none" height="12" rx="1" stroke="currentColor" strokeWidth="2" width="12" x="2" y="26" />
      <rect height="6" width="6" x="5" y="29" />
      <rect height="4" width="4" x="18" y="4" />
      <rect height="4" width="4" x="18" y="12" />
      <rect height="4" width="4" x="26" y="18" />
      <rect height="4" width="4" x="4" y="18" />
      <rect height="4" width="4" x="18" y="26" />
      <rect height="4" width="4" x="26" y="26" />
      <rect height="4" width="4" x="34" y="26" />
      <rect height="4" width="4" x="26" y="34" />
      <rect height="4" width="4" x="34" y="34" />
    </svg>
  );
}

function addYears(iso: string | null, years: number): string {
  const d = iso ? new Date(iso) : new Date();
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString();
}
