'use client';

import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import {
  ShieldCheck, Check, Lock, Building2,
  FileText, Landmark, Phone, MessageCircle,
  AlertCircle, RefreshCw, BadgeCheck, Gavel, ClipboardList, User, ChevronRight
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
    case 'cleared': return { label: 'NIMC / NIBSS Verified', cls: 'bg-[var(--sovereign-container-bg)] text-[var(--sovereign-hover)] border-primary', dot: 'bg-primary' };
    case 'action_required': return { label: 'Action Required', cls: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' };
    case 'next_up': return { label: 'Next Up', cls: 'bg-zinc-100 text-zinc-600 border-zinc-200', dot: 'bg-zinc-400' };
    case 'locked': return { label: 'Locked', cls: 'bg-zinc-100 text-zinc-500 border-zinc-200', dot: 'bg-zinc-400' };
    default: return { label: 'Pending', cls: 'bg-zinc-100 text-zinc-500 border-zinc-200', dot: 'bg-zinc-400' };
  }
}

// ─── Main Component ───
export default function AgentOnboardingPage() {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
  }, []);

  const identityVer = verifications.find((v) => v.type === 'identity');
  const companyVer = verifications.find((v) => v.type === 'company');
  const professionalVer = verifications.find((v) => v.type === 'professional');

  const steps = [
    {
      id: 'identity',
      step: 'Step 01',
      title: 'Government Identity & Biometric KYC (NIN & BVN)',
      description: 'Direct statutory validation via National Identity Management Commission (NIMC) and Nigeria Inter-Bank Settlement System (NIBSS).',
      status: getStepStatus(identityVer),
      icon: <ShieldCheck className="h-6 w-6" />,
    },
    {
      id: 'cac',
      step: 'Step 02',
      title: 'Corporate Real Estate Firm Registration (CAC & FIRS)',
      description: 'Corporate Affairs Commission registration & beneficial ownership register (PSC) confirmed in good standing.',
      status: getStepStatus(companyVer),
      icon: <Building2 className="h-6 w-6" />,
    },
    {
      id: 'lasrera',
      step: 'Step 03',
      title: 'LASRERA Real Estate Practitioner Accreditation & Annual License',
      description: 'Mandated under Section 24 of the Lagos State Real Estate Regulatory Authority Law 2022. Every practicing individual broker must hold an authentic LASRERA accreditation.',
      status: getStepStatus(professionalVer),
      icon: <BadgeCheck className="h-6 w-6" />,
    },
    {
      id: 'affiliations',
      step: 'Step 04',
      title: 'Professional Body Affiliations (NIESV / ERCAAN / REDAN)',
      description: 'Link membership seals for premium cadastral transaction privileges and automated survey stamp verifications.',
      status: getStepStatus(professionalVer) === 'cleared' ? 'next_up' : 'locked',
      icon: <FileText className="h-6 w-6" />,
    },
    {
      id: 'commission',
      step: 'Step 05',
      title: 'Commission Settlement & Co-Broke Escrow Split Configuration',
      description: 'Designated commercial account with Central Bank of Nigeria (CBN) clearing code for automated escrow payouts upon transaction completion.',
      status: 'next_up',
      icon: <Landmark className="h-6 w-6" />,
    },
    {
      id: 'indemnity',
      step: 'Step 06',
      title: 'Code of Conduct & Anti-Omonile Statutory Indemnity Declaration',
      description: 'Final covenant step. Unlocks upon completion of all prior accreditation steps.',
      status: 'locked',
      icon: <Gavel className="h-6 w-6" />,
    },
  ];

  const clearedCount = steps.filter((s) => s.status === 'cleared').length;
  const progress = Math.round((clearedCount / steps.length) * 100);

  return (
    <DashboardShell navigation={AGENT_NAVIGATION} userRole="agent" userName="Agent">
      <ErrorBoundary>
        <div className="min-h-screen bg-[#fbf8fc] p-4 md:p-6 lg:p-8">
          {/* Regulatory Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 rounded bg-[#006c49] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
              <BadgeCheck className="h-3.5 w-3.5" /> LASRERA Certified Agent Protocol
            </span>
            <span className="inline-flex items-center gap-1.5 rounded bg-[var(--sovereign-container-bg)] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--sovereign-hover)]">
              <Landmark className="h-3.5 w-3.5" /> Alausa Real Estate Broker Clearance v4.2
            </span>
            <span className="inline-flex items-center gap-1.5 rounded bg-zinc-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-zinc-600">
              <ShieldCheck className="h-3.5 w-3.5" /> NDPR Compliant
            </span>
            <span className="inline-flex items-center gap-1.5 rounded bg-[var(--sovereign-container-bg)] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#006c49]">
              <Lock className="h-3.5 w-3.5" /> Zero Omonile Escrow Bonded
            </span>
          </div>

          {/* Header + Progress */}
          <div className="mb-6 rounded-xl bg-white p-6 shadow-sm border border-zinc-100 relative overflow-hidden">
            <div className="absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-[#006c49]/5 blur-3xl pointer-events-none" />
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 relative z-10">
              <div className="max-w-4xl space-y-3">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
                  Licensed Agent & Realtor Cadastral Accreditation
                </h1>
                <p className="text-sm text-zinc-500 max-w-3xl leading-relaxed">
                  Complete statutory broker licensing, professional body attestations (NIESV / ERCAAN), and Central Bank
                  of Nigeria (CBN) automated commission settlement bridge to list verified properties across Lagos State
                  cadastral registry and FCT Abuja.
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 rounded-lg bg-zinc-100 px-3 py-1.5">
                    <User className="h-4 w-4 text-[#006c49]" />
                    <span className="text-sm font-medium text-zinc-900">Agent</span>
                    <span className="rounded bg-[#006c49]/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-[#006c49]">Principal Broker</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg bg-zinc-100 px-3 py-1.5">
                    <Building2 className="h-4 w-4 text-zinc-400" />
                    <span className="text-sm text-zinc-700">Crestfield Realty Partners Ltd</span>
                    <span className="font-mono text-xs font-bold text-zinc-500">CAC RC-1784920</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg bg-zinc-100 px-3 py-1.5">
                    <span className="text-sm text-zinc-500">Jurisdiction: <strong className="text-zinc-900">Lagos & Abuja (FCT)</strong></span>
                  </div>
                </div>
              </div>

              {/* Live Accreditation Progress */}
              <div className="w-full lg:w-80 rounded-xl bg-zinc-50 p-4 flex flex-col justify-between shrink-0 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Clearance Progress</span>
                  <span className="font-mono text-sm font-bold text-[#006c49]">Step {clearedCount + 1} of {steps.length} ({progress}%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-zinc-200 overflow-hidden mb-3">
                  <div className="h-full rounded-full bg-[#006c49] transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-zinc-500">
                    <span className="flex items-center gap-1.5 text-[#006c49] font-semibold">
                      <Check className="h-4 w-4 text-[#006c49]" /> NIN & BVN Passed
                    </span>
                    <span className="font-mono text-[#006c49]">100%</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-500">
                    <span className="flex items-center gap-1.5 text-[#006c49] font-semibold">
                      <Check className="h-4 w-4 text-[#006c49]" /> CAC Brokerage Attested
                    </span>
                    <span className="font-mono text-[#006c49]">100%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-zinc-900 font-semibold">
                      <span className="h-2 w-2 rounded-full bg-[#006c49] animate-pulse" /> LASRERA Accreditation
                    </span>
                    <span className="rounded bg-primary/40 px-1.5 py-0.5 font-mono text-[10px] text-[var(--sovereign-hover)]">IN PROGRESS</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <span className="h-4 w-4 rounded-full border-2 border-zinc-300" /> NIESV / ERCAAN Affiliation
                    </span>
                    <span className="font-mono">Pending</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <span className="h-4 w-4 rounded-full border-2 border-zinc-300" /> Direct Commission Split
                    </span>
                    <span className="font-mono">Ready</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            {/* Left: Pipeline Stages */}
            <div className="xl:col-span-8 space-y-4">
              {steps.map((step) => {
                const badge = statusBadge(step.status);
                return (
                  <div
                    key={step.id}
                    className={`rounded-xl bg-white p-5 shadow-sm border border-zinc-100 transition-all hover:shadow-md ${step.status === 'action_required' ? 'ring-2 ring-[#006c49]/30' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                          step.status === 'cleared' ? 'bg-[var(--sovereign-container-bg)] text-[var(--sovereign-hover)]' :
                          step.status === 'action_required' ? 'bg-[#006c49] text-white' :
                          'bg-zinc-100 text-zinc-500'
                        }`}>
                          {step.status === 'cleared' ? <Check className="h-6 w-6" /> : step.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">{step.step}</span>
                            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${badge.cls}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                              {badge.label}
                            </span>
                          </div>
                          <h3 className="mt-0.5 text-base font-semibold text-zinc-900">{step.title}</h3>
                          <p className="mt-1 text-sm text-zinc-500">{step.description}</p>
                        </div>
                      </div>
                      {step.status !== 'locked' && (
                        <button className="h-8 shrink-0 rounded-lg bg-zinc-50 px-3 text-xs font-medium text-[#006c49] hover:bg-zinc-100 transition flex items-center gap-1">
                          {step.status === 'action_required' ? 'Complete' : 'Configure'} <ChevronRight className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column */}
            <div className="xl:col-span-4 space-y-4">
              {/* Accredited Broker Guarantees */}
              <div className="rounded-xl bg-white p-5 shadow-sm border border-zinc-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="flex items-center gap-1.5 text-sm font-semibold text-zinc-900">
                    <ShieldCheck className="h-5 w-5 text-[#006c49]" /> Accredited Broker Guarantees
                  </h3>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--sovereign-hover)]">Level 3 Clearance</span>
                </div>
                <p className="text-xs text-zinc-500 mb-4">
                  Once your LASRERA credentials pass cadastral verification, your brokerage profile unlocks institutional listing rights across the federation.
                </p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 rounded-lg bg-zinc-50 p-3">
                    <ShieldCheck className="h-5 w-5 text-[#006c49] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">Zero-Omonile Escrow Safeguard</p>
                      <p className="text-xs text-zinc-500">Protected inspections backed by verified cadastral coordinates and Lagos Task Force anti-extortion response.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 rounded-lg bg-zinc-50 p-3">
                    <Landmark className="h-5 w-5 text-[#006c49] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">Automated 10% / 5% Escrow Split</p>
                      <p className="text-xs text-zinc-500">Sales & rental commissions held in CBN-regulated settlement vaults and credited simultaneously at closing.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 rounded-lg bg-zinc-50 p-3">
                    <BadgeCheck className="h-5 w-5 text-[#006c49] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">Exclusive Verified Inventory</p>
                      <p className="text-xs text-zinc-500">Direct listing rights for C-of-O & Governor's Consent estates in Ikoyi, Victoria Island, Ikeja GRA, and Abuja Phase 1.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 rounded-lg bg-zinc-50 p-3">
                    <User className="h-5 w-5 text-[#006c49] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">Digital 1,420+ Co-Broke Rail</p>
                      <p className="text-xs text-zinc-500">Instant smart-contract syndication with certified NIESV and ERCAAN colleagues without client poaching risks.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compliance Officer */}
              <div className="rounded-xl bg-white p-5 shadow-sm border border-zinc-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Institutional Support</span>
                  <span className="flex items-center gap-1 text-xs text-[#006c49]">
                    <span className="h-2 w-2 rounded-full bg-[#006c49]" /> On Duty (Alausa)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-full bg-zinc-100 shrink-0 flex items-center justify-center ring-2 ring-[#006c49]/30">
                    <ShieldCheck className="h-6 w-6 text-primary dark:text-[#4edea3]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-900">Regulatory Compliance Desk</h4>
                    <p className="text-xs text-zinc-500">Senior Regulatory Compliance Officer</p>
                    <p className="text-[11px] text-[#006c49]">LASRERA Secretariat • Lands Bureau</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <button className="flex h-9 items-center justify-center gap-1 rounded-lg bg-zinc-50 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 transition">
                    <MessageCircle className="h-4 w-4 text-[#006c49]" /> WhatsApp Desk
                  </button>
                  <button className="flex h-9 items-center justify-center gap-1 rounded-lg bg-zinc-50 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 transition">
                    <Phone className="h-4 w-4 text-[#006c49]" /> Direct Call
                  </button>
                </div>
              </div>

              {/* Broker Credential Vault */}
              <div className="rounded-xl bg-white p-5 shadow-sm border border-zinc-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="flex items-center gap-1.5 text-sm font-semibold text-zinc-900">
                    <ClipboardList className="h-4 w-4 text-zinc-400" /> Broker Credential Vault
                  </h3>
                  <span className="font-mono text-xs font-semibold text-zinc-400">{verifications.filter((v) => v.overallStatus === 'verified').length} / {verifications.length || 5} Attached</span>
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
                  <p className="text-xs text-zinc-400 text-center py-4">No credentials uploaded yet</p>
                ) : (
                  <div className="space-y-2">
                    {verifications.map((v) => (
                      <div key={v.id} className="flex items-center justify-between rounded-lg bg-zinc-50 p-2.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="h-4 w-4 text-[#006c49] shrink-0" />
                          <span className="truncate text-xs font-medium text-zinc-700">{v.type} — {v.listing?.title || 'Record'}</span>
                        </div>
                        <span className={`shrink-0 text-[11px] font-semibold uppercase ${
                          v.overallStatus === 'verified' ? 'text-[#006c49]' :
                          v.overallStatus === 'in_progress' ? 'text-[var(--sovereign-hover)]' :
                          'text-zinc-400'
                        }`}>
                          {v.overallStatus === 'verified' ? 'Verified' : v.overallStatus === 'in_progress' ? 'Under Review' : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-4 space-y-2">
                  <button className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#006c49] hover:bg-[#006c49] text-sm font-semibold text-white shadow-sm transition-colors">
                    Submit Accreditation Docket
                  </button>
                  <button className="flex h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-zinc-50 hover:bg-zinc-100 text-sm font-semibold text-zinc-700 transition-colors">
                    Save Progress & Continue Later
                  </button>
                  <p className="text-xs text-zinc-400 text-center pt-1 leading-tight">
                    Strictly compliant with LASRERA Law 2022, EFCC SCUML Anti-Money Laundering Regulations, and Nigeria Data Protection Act (NDPA) 2023.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom: Audit Trail */}
          <div className="mt-6 rounded-xl bg-white p-5 shadow-sm border border-zinc-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <div>
                <h3 className="text-base font-semibold text-zinc-900">Statutory Audit Trail & Gateway Telemetry</h3>
                <p className="text-xs text-zinc-500">Real-time asynchronous cryptographic checks with Federal and Lagos State identity registries.</p>
              </div>
              <span className="flex items-center gap-1 self-start sm:self-auto rounded bg-zinc-100 px-2 py-1 font-mono text-xs text-zinc-500">
                <span className="h-2 w-2 rounded-full bg-[#006c49]" /> Ledger Block #882190-LGS
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-zinc-50 text-zinc-500 text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-4 font-semibold">Regulatory Node</th>
                    <th className="py-2.5 px-4 font-semibold">Direct Query Ref</th>
                    <th className="py-2.5 px-4 font-semibold">Response Handshake</th>
                    <th className="py-2.5 px-4 font-semibold">Status Code</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  <tr className="hover:bg-zinc-50/50 transition-colors">
                    <td className="py-2.5 px-4 flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-[#006c49]" /> <span className="font-semibold text-zinc-900">NIMC National Identity Gateway</span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-zinc-500">Q-NIMC-88192-LAG</td>
                    <td className="py-2.5 px-4 text-zinc-600">NIN Direct Hash Match (Photo & Biometrics)</td>
                    <td className="py-2.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[#006c49] font-semibold text-xs"><Check className="h-3 w-3" /> 200 OK_VERIFIED</span>
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-zinc-500">Today 09:14:22</td>
                  </tr>
                  <tr className="hover:bg-zinc-50/50 transition-colors">
                    <td className="py-2.5 px-4 flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-[#006c49]" /> <span className="font-semibold text-zinc-900">CAC Registry (Abuja FCT HQ)</span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-zinc-500">Q-CAC-RC1784920</td>
                    <td className="py-2.5 px-4 text-zinc-600">Active Company Status • Crestfield Realty Partners Ltd</td>
                    <td className="py-2.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[#006c49] font-semibold text-xs"><Check className="h-3 w-3" /> 200 OK_GOOD_STANDING</span>
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-zinc-500">Today 09:14:38</td>
                  </tr>
                  <tr className="hover:bg-zinc-50/50 transition-colors">
                    <td className="py-2.5 px-4 flex items-center gap-2">
                      <Landmark className="h-4 w-4 text-[#006c49]" /> <span className="font-semibold text-zinc-900">NIBSS BVN Banking Portal</span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-zinc-500">Q-NIBSS-BVN-9921</td>
                    <td className="py-2.5 px-4 text-zinc-600">100% Director Name Concordance</td>
                    <td className="py-2.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[#006c49] font-semibold text-xs"><Check className="h-3 w-3" /> 200 OK_MATCHED</span>
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-zinc-500">Today 09:15:02</td>
                  </tr>
                  <tr className="hover:bg-zinc-50/50 transition-colors">
                    <td className="py-2.5 px-4 flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-[#006c49]" /> <span className="font-semibold text-zinc-900">SCUML / EFCC Registry</span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-zinc-500">SCUML-RN-92840</td>
                    <td className="py-2.5 px-4 text-zinc-600">Anti-Money Laundering DNFBP Certificate Current</td>
                    <td className="py-2.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[#006c49] font-semibold text-xs"><Check className="h-3 w-3" /> 200 OK_CLEARED</span>
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-zinc-500">Today 09:15:19</td>
                  </tr>
                  <tr className="hover:bg-zinc-50/50 transition-colors">
                    <td className="py-2.5 px-4 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-primary animate-pulse" /> <span className="font-semibold text-zinc-900">LASRERA Alausa Central Server</span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-zinc-500">LSR-AGT-8842-PEND</td>
                    <td className="py-2.5 px-4 text-zinc-600">Awaiting Step 03 Practitioner Form Submission</td>
                    <td className="py-2.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[var(--sovereign-hover)] font-semibold text-xs"><RefreshCw className="h-3 w-3" /> 102 SYNC_WAITING</span>
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-zinc-500">Listening...</td>
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
