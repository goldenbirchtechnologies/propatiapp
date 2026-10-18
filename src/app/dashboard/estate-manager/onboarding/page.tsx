'use client';

import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { useActiveOrganization } from '@/contexts/ActiveOrganizationContext';
import { NoOrgState } from '@/components/organizations/NoOrgState';
import {
  ShieldCheck, Check, Lock, Building2, FileText,
  Landmark, Phone, MessageCircle, AlertCircle, RefreshCw,
  BadgeCheck, Gavel, ClipboardList, MapPin
} from 'lucide-react';

// ─── Types ───
type VerificationLayerStatus = 'pending' | 'in_progress' | 'verified' | 'rejected' | 'not_applicable';
type VerificationOverallStatus = 'not_started' | 'in_progress' | 'verified' | 'rejected' | 'frozen';

interface Verification {
  id: string;
  type: string;
  overallStatus: VerificationOverallStatus;
  currentLayer: number;
  l1Status: VerificationLayerStatus;
  l2Status: VerificationLayerStatus;
  l3Status: VerificationLayerStatus;
  l4Status: VerificationLayerStatus;
  l5Status: VerificationLayerStatus;
  listingId: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  listing?: { id: string; title: string } | null;
}

function getStepStatus(v: Verification | undefined): 'cleared' | 'action_required' | 'next_up' | 'locked' {
  if (!v) return 'locked';
  if (v.overallStatus === 'verified') return 'cleared';
  if (v.overallStatus === 'in_progress') return 'action_required';
  if (v.overallStatus === 'not_started') return 'next_up';
  return 'locked';
}

function statusBadge(status: string) {
  switch (status) {
    case 'cleared': return { label: 'Verified Authentic', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' };
    case 'action_required': return { label: 'In Progress', cls: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' };
    case 'next_up': return { label: 'Next Up', cls: 'bg-zinc-100 text-zinc-600 border-zinc-200', dot: 'bg-zinc-400' };
    case 'locked': return { label: 'Locked', cls: 'bg-zinc-100 text-zinc-500 border-zinc-200', dot: 'bg-zinc-400' };
    default: return { label: 'Pending', cls: 'bg-zinc-100 text-zinc-500 border-zinc-200', dot: 'bg-zinc-400' };
  }
}

// ─── Main Component ───
export default function EstateManagerOnboardingPage() {
  const { organization, loading: orgLoading } = useActiveOrganization();
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organization) return;
    let cancelled = false;
    setLoading(true);
    fetch('/api/dashboard/estate-manager/verifications', { cache: 'no-store' })
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) {
          const raw = json?.data ?? [];
          setVerifications(raw as Verification[]);
        }
      })
      .catch(() => { if (!cancelled) setError('Failed to load verification data'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [organization]);

  if (orgLoading) return <NoOrgState title="Loading organization…" />;
  if (!organization) return <NoOrgState title="No Organization" description="Select or create an organization to view onboarding." />;

  const identityVer = verifications.find((v) => v.type === 'identity');
  const companyVer = verifications.find((v) => v.type === 'company');
  const professionalVer = verifications.find((v) => v.type === 'professional');

  const steps = [
    {
      id: 'identity',
      step: 'STEP 01',
      title: 'Government Identity & Biometric KYC',
      description: 'Verified via NIMC Federal with NIBSS BVN match and biometric telemetry.',
      status: getStepStatus(identityVer),
      icon: <ShieldCheck className="h-5 w-5" />,
    },
    {
      id: 'cac',
      step: 'STEP 02',
      title: 'Corporate Facility Management Firm Registration',
      description: 'CAC RC registration, FIRS TIN, and SCUML/AML DNFBP clearance.',
      status: getStepStatus(companyVer),
      icon: <Building2 className="h-5 w-5" />,
    },
    {
      id: 'license',
      step: 'STEP 03',
      title: 'NIESV / ESVARBON Facility Practice License & Annual Seal',
      description: 'Pursuant to ESVARBON Decree No. 24 of 1975 and LASRERA Law 2022, all lead facility managers must hold an authenticated annual practicing seal.',
      status: getStepStatus(professionalVer),
      icon: <BadgeCheck className="h-5 w-5" />,
    },
    {
      id: 'portfolio',
      step: 'STEP 04',
      title: 'Managed Estates & Commercial Portfolio Intake',
      description: 'Register all tenant rosters, communal utility lines, and facility asset schedules under the zero-diversion escrow bridge.',
      status: getStepStatus(professionalVer) === 'cleared' ? 'next_up' : 'locked',
      icon: <Building2 className="h-5 w-5" />,
    },
    {
      id: 'escrow',
      step: 'STEP 05',
      title: 'Service Charge & Sinking Fund Escrow Bridge',
      description: 'Automated non-custodial split contract routing service charges with CBN ring-fenced settlement vaults.',
      status: 'next_up',
      icon: <Landmark className="h-5 w-5" />,
    },
    {
      id: 'covenant',
      step: 'STEP 06',
      title: 'Statutory Facility Transparency Charter & Anti-Diversion Bond',
      description: 'Final covenant. Unlocks at Step 04 completion.',
      status: 'locked',
      icon: <Gavel className="h-5 w-5" />,
    },
  ];

  const clearedCount = steps.filter((s) => s.status === 'cleared').length;
  const progress = Math.round((clearedCount / steps.length) * 100);

  return (
    <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Estate Manager">
      <ErrorBoundary>
        <div className="min-h-screen bg-[#fbf8fc] p-4 md:p-6 lg:p-8">
          {/* Compliance Trust Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#006c49] animate-pulse" />
              <span className="text-[11px] font-semibold tracking-wider uppercase text-emerald-800">LASRERA CERTIFIED FACILITY MANAGER PROTOCOL</span>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1">
              <ShieldCheck className="h-3.5 w-3.5 text-[#006c49]" />
              <span className="text-[11px] font-semibold tracking-wider uppercase text-zinc-600">NIESV & IFMA NIGERIA CHAPTER</span>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1">
              <Lock className="h-3.5 w-3.5 text-zinc-400" />
              <span className="text-[11px] font-semibold tracking-wider uppercase text-zinc-600">NDPR COMPLIANT</span>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1">
              <Lock className="h-3.5 w-3.5 text-[#006c49]" />
              <span className="text-[11px] font-semibold tracking-wider uppercase text-emerald-800">ZERO SERVICE CHARGE DIVERSION ESCROW</span>
            </div>
          </div>

          {/* Header + Progress Mosaic */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6 items-start">
            <div className="lg:col-span-8 space-y-3">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
                Estate Manager & Facility Firm Cadastral Accreditation
              </h1>
              <p className="text-sm text-zinc-500 max-w-4xl">
                Complete statutory facility management licensing, corporate practice registration (CAC/FIRS), active
                managed estate portfolio onboarding, and automated service charge escrow account integration across
                Lagos State & FCT Abuja.
              </p>
              {/* Manager Profile Pill */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg bg-zinc-50 p-3 shadow-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-200 text-[#006c49]">
                    <BadgeCheck className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold text-zinc-900">ESV Gbenga Adeleke-Johnson, FNIVS</span>
                      <span className="rounded bg-[#10b981] px-1.5 py-0.5 text-[10px] font-bold text-[#00422b]">PARTNER</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <span>Braidwood & Shield Facility Partners Ltd</span>
                      <span className="text-zinc-300">•</span>
                      <span className="font-mono font-medium text-[#006c49]">RC-1694208</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 rounded bg-zinc-100 px-3 py-1 text-zinc-600">
                  <MapPin className="h-3.5 w-3.5 text-[#006c49]" />
                  <span className="text-[11px] font-medium">Lagos Hub (Ikoyi, Lekki 1, VI, Ikeja GRA)</span>
                </div>
              </div>
            </div>

            {/* Step Progress Scorecard */}
            <div className="lg:col-span-4 rounded-xl bg-white p-4 shadow-sm border border-zinc-100 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Accreditation Lifecycle</span>
                <span className="font-mono text-sm font-bold text-[#006c49]">Step {clearedCount + 1} of {steps.length} ({progress}%)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-zinc-100 overflow-hidden flex">
                <div className="h-full bg-[#006c49] transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
              <div className="flex flex-col gap-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-zinc-900">
                    <Check className="h-4 w-4 text-[#006c49]" /> Gov Identity & BVN Passed
                  </span>
                  <span className="font-mono text-[11px] text-[#006c49] font-semibold">100%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-zinc-900">
                    <Check className="h-4 w-4 text-[#006c49]" /> CAC Facility Firm Attested
                  </span>
                  <span className="font-mono text-[11px] text-[#006c49] font-semibold">100%</span>
                </div>
                <div className="flex items-center justify-between text-zinc-900">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <span className="h-2 w-2 rounded-full bg-[#006c49] animate-pulse" /> Facility Practice License
                  </span>
                  <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">IN PROGRESS</span>
                </div>
                <div className="flex items-center justify-between text-zinc-500 opacity-75">
                  <span className="flex items-center gap-1.5">
                    <span className="h-4 w-4 rounded-full border-2 border-zinc-300" /> Managed Portfolio Matrix
                  </span>
                  <span className="text-[11px]">Pending</span>
                </div>
                <div className="flex items-center justify-between text-zinc-500 opacity-75">
                  <span className="flex items-center gap-1.5">
                    <span className="h-4 w-4 rounded-full border-2 border-zinc-300" /> Service Charge Escrow
                  </span>
                  <span className="text-[11px]">Ready</span>
                </div>
              </div>
            </div>
          </div>

          {/* Two Column Workflow */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Steps */}
            <div className="lg:col-span-8 space-y-4">
              {steps.map((step) => {
                const badge = statusBadge(step.status);
                return (
                  <div
                    key={step.id}
                    className={`rounded-xl bg-white p-5 shadow-sm border border-zinc-100 flex flex-col gap-3 ${step.status === 'action_required' ? 'ring-2 ring-[#10b981]/30' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold ${
                          step.status === 'cleared' ? 'bg-emerald-100 text-emerald-700' :
                          step.status === 'action_required' ? 'bg-[#10b981]/20 text-[#00422b]' :
                          'bg-zinc-100 text-zinc-500'
                        }`}>
                          {step.status === 'cleared' ? <Check className="h-4 w-4" /> : step.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold tracking-wider uppercase text-[#006c49]">{step.step}</span>
                            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${badge.cls}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                              {badge.label}
                            </span>
                          </div>
                          <h3 className="text-base font-semibold text-zinc-900">{step.title}</h3>
                        </div>
                      </div>
                      {step.status !== 'locked' && (
                        <button className="flex items-center gap-1 rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-200 transition">
                          Configure
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-zinc-500">{step.description}</p>
                  </div>
                );
              })}
            </div>

            {/* Right Column */}
            <div className="lg:col-span-4 space-y-4">
              {/* Sovereign Guarantees */}
              <div className="rounded-xl bg-white p-5 shadow-sm border border-zinc-100">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="h-5 w-5 text-[#006c49]" />
                  <h3 className="text-base font-semibold text-zinc-900">Institutional Sovereign Guarantees</h3>
                </div>
                <span className="inline-block rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 mb-3">LEVEL 3 ENTERPRISE CLEARANCE</span>
                <div className="flex flex-col gap-2 pt-2">
                  <div className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-[#006c49] mt-0.5" />
                    <div>
                      <span className="text-sm font-semibold text-zinc-900">Zero-Diversion Escrow</span>
                      <p className="text-xs text-zinc-500">Service charges ring-fenced in CBN-regulated settlement vaults with auto-vendor distribution.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-[#006c49] mt-0.5" />
                    <div>
                      <span className="text-sm font-semibold text-zinc-900">Direct Utility Disbursement</span>
                      <p className="text-xs text-zinc-500">Independent IPP power vendors and security guards paid directly upon delivery audit.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-[#006c49] mt-0.5" />
                    <div>
                      <span className="text-sm font-semibold text-zinc-900">Alausa LASRERA Endorsement</span>
                      <p className="text-xs text-zinc-500">Instant digital registration of all lease deeds with the Lagos State Lands Bureau.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-[#006c49] mt-0.5" />
                    <div>
                      <span className="text-sm font-semibold text-zinc-900">Emergency Response Dispatch</span>
                      <p className="text-xs text-zinc-500">Integrated rapid distress link to Lagos State Fire Service & LASAMBUS networks.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assigned Cadastral Officer */}
              <div className="rounded-xl bg-white p-5 shadow-sm border border-zinc-100">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Assigned Cadastral Officer</span>
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-lg">
                    ML
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-900">ESV (Mrs.) Modupe Lawson</h4>
                    <span className="text-xs text-zinc-500">Director of Facility Accreditation</span>
                    <span className="block text-[11px] text-[#006c49] font-medium">LASRERA & Lands Bureau Liaison</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <button className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-zinc-50 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition">
                    <MessageCircle className="h-4 w-4 text-[#006c49]" /> WhatsApp
                  </button>
                  <button className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-zinc-50 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition">
                    <Phone className="h-4 w-4 text-[#006c49]" /> Direct Call
                  </button>
                </div>
              </div>

              {/* Facility Credential Vault */}
              <div className="rounded-xl bg-white p-5 shadow-sm border border-zinc-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-zinc-900">Attached Statutory Files</h3>
                  <span className="font-mono text-xs font-bold text-[#006c49]">{verifications.filter((v) => v.overallStatus === 'verified').length} of {verifications.length || 5} Attached</span>
                </div>
                {loading ? (
                  <div className="flex items-center justify-center py-4">
                    <RefreshCw className="h-5 w-5 animate-spin text-zinc-300" />
                  </div>
                ) : error ? (
                  <div className="text-center py-4">
                    <AlertCircle className="h-5 w-5 text-red-400 mx-auto" />
                    <p className="text-xs text-red-500 mt-1">{error}</p>
                  </div>
                ) : verifications.length === 0 ? (
                  <p className="text-xs text-zinc-400 text-center py-4">No files attached yet</p>
                ) : (
                  <div className="space-y-2">
                    {verifications.map((v) => (
                      <div key={v.id} className="flex items-center justify-between rounded-lg bg-zinc-50 p-2.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="h-4 w-4 text-[#006c49] shrink-0" />
                          <span className="truncate text-xs text-zinc-700">{v.type} — {v.listing?.title || 'Document'}</span>
                        </div>
                        <span className={`shrink-0 text-[11px] font-semibold ${
                          v.overallStatus === 'verified' ? 'text-[#006c49]' :
                          v.overallStatus === 'in_progress' ? 'text-zinc-500' :
                          'text-zinc-400'
                        }`}>
                          {v.overallStatus === 'verified' ? 'VERIFIED' : v.overallStatus === 'in_progress' ? 'REVIEWING' : 'PENDING'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Panel */}
              <div className="rounded-xl bg-white p-5 shadow-sm border border-zinc-100 space-y-2">
                <button className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#006c49] text-sm font-semibold text-white hover:opacity-90 transition-all shadow-sm">
                  Submit Facility Firm Docket <BadgeCheck className="h-4 w-4" />
                </button>
                <button className="flex h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-zinc-50 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 transition">
                  Save Progress & Continue Later
                </button>
                <p className="text-xs text-zinc-400 text-center pt-2">
                  Complies with ESVARBON Decree 24 of 1975, LASRERA Law 2022, and Nigeria Data Protection Act (NDPA) 2023.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom: Audit Trail */}
          <div className="mt-6 rounded-xl bg-white p-5 shadow-sm border border-zinc-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-200 text-[#006c49]">
                  <ClipboardList className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900">Institutional Cadastral Audit Trail & Telemetry</h3>
                  <span className="text-xs text-zinc-500">Cryptographic query logs to federal & state regulatory registries</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#006c49] animate-pulse" />
                <span className="font-mono text-[11px] font-semibold text-[#006c49]">ALL ENDPOINTS RESPONSIVE (18ms)</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-zinc-50 text-zinc-500 text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-4 font-semibold">Regulatory Gateway</th>
                    <th className="py-2.5 px-4 font-semibold">Query Reference</th>
                    <th className="py-2.5 px-4 font-semibold">Payload Status</th>
                    <th className="py-2.5 px-4 font-semibold">Handshake Code</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Timestamp (WAT)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  <tr className="hover:bg-zinc-50 transition-colors">
                    <td className="py-2.5 px-4 font-medium flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#006c49]" /> NIMC National Identity Gateway
                    </td>
                    <td className="py-2.5 px-4 font-mono text-zinc-500">Q-NIMC-88192-LAG</td>
                    <td className="py-2.5 px-4">
                      <span className="rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">200 OK_VERIFIED</span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-zinc-500">SHA256: 8fbc•••902a</td>
                    <td className="py-2.5 px-4 text-right font-mono text-zinc-500">Today 09:14:02</td>
                  </tr>
                  <tr className="hover:bg-zinc-50 transition-colors">
                    <td className="py-2.5 px-4 font-medium flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#006c49]" /> CAC Corporate Registry (Abuja HQ)
                    </td>
                    <td className="py-2.5 px-4 font-mono text-zinc-500">Q-CAC-RC1694208</td>
                    <td className="py-2.5 px-4">
                      <span className="rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">200 OK_GOOD_STANDING</span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-zinc-500">SHA256: 31e8•••ff12</td>
                    <td className="py-2.5 px-4 text-right font-mono text-zinc-500">Today 09:14:18</td>
                  </tr>
                  <tr className="hover:bg-zinc-50 transition-colors">
                    <td className="py-2.5 px-4 font-medium flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#006c49]" /> ESVARBON Practitioner Portal
                    </td>
                    <td className="py-2.5 px-4 font-mono text-zinc-500">ESV-REG-4419-LGS</td>
                    <td className="py-2.5 px-4">
                      <span className="rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">200 OK_ACTIVE_PRACTICE</span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-zinc-500">SHA256: 77a0•••4419</td>
                    <td className="py-2.5 px-4 text-right font-mono text-zinc-500">Today 09:15:40</td>
                  </tr>
                  <tr className="hover:bg-zinc-50 transition-colors">
                    <td className="py-2.5 px-4 font-medium flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#006c49]" /> NIBSS BVN Banking Settlement Gateway
                    </td>
                    <td className="py-2.5 px-4 font-mono text-zinc-500">Q-NIBSS-BVN-9921</td>
                    <td className="py-2.5 px-4">
                      <span className="rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">200 OK_MATCHED</span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-zinc-500">SHA256: 12de•••9921</td>
                    <td className="py-2.5 px-4 text-right font-mono text-zinc-500">Today 09:16:01</td>
                  </tr>
                  <tr className="hover:bg-zinc-50 transition-colors">
                    <td className="py-2.5 px-4 font-medium flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#006c49]" /> SCUML / EFCC DNFBP Anti-Money Registry
                    </td>
                    <td className="py-2.5 px-4 font-mono text-zinc-500">SCUML-RN-8812</td>
                    <td className="py-2.5 px-4">
                      <span className="rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">200 OK_CLEARED</span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-zinc-500">SHA256: ee02•••bb44</td>
                    <td className="py-2.5 px-4 text-right font-mono text-zinc-500">Today 09:17:11</td>
                  </tr>
                  <tr className="hover:bg-zinc-50 transition-colors">
                    <td className="py-2.5 px-4 font-medium flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-zinc-400" /> LASRERA Central Cadastral Registry
                    </td>
                    <td className="py-2.5 px-4 font-mono text-zinc-500">LSR-FM-8842-PEND</td>
                    <td className="py-2.5 px-4">
                      <span className="rounded bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold text-zinc-500">102 SYNC_WAITING</span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-zinc-400">Awaiting Docket Submit</td>
                    <td className="py-2.5 px-4 text-right font-mono text-zinc-500">Queued</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </DashboardShell>
  );
}
