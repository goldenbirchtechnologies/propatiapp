'use client';

import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import {
  ShieldCheck, Check, Lock, Building2,
  FileText, Landmark, Phone, MessageCircle,
  AlertCircle, RefreshCw, BadgeCheck, Gavel, Eye, ClipboardList
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

// ─── Helpers ───
function getStepStatus(v: Verification | undefined): 'cleared' | 'action_required' | 'next_up' | 'locked' {
  if (!v) return 'locked';
  if (v.overallStatus === 'verified') return 'cleared';
  if (v.overallStatus === 'in_progress') return 'action_required';
  if (v.overallStatus === 'not_started') return 'next_up';
  return 'locked';
}

function statusBadge(status: string) {
  switch (status) {
    case 'cleared': return { label: 'Verified & Cleared', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' };
    case 'action_required': return { label: 'Action Required', cls: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' };
    case 'next_up': return { label: 'Next Step', cls: 'bg-zinc-100 text-zinc-600 border-zinc-200', dot: 'bg-zinc-400' };
    case 'locked': return { label: 'Locked', cls: 'bg-zinc-100 text-zinc-500 border-zinc-200', dot: 'bg-zinc-400' };
    default: return { label: 'Pending', cls: 'bg-zinc-100 text-zinc-500 border-zinc-200', dot: 'bg-zinc-400' };
  }
}

// ─── Main Component ───
export default function LandlordOnboardingPage() {
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

  const propertyVer = verifications.find((v) => v.type === 'property');
  const identityVer = verifications.find((v) => v.type === 'identity');
  const companyVer = verifications.find((v) => v.type === 'company');

  const steps = [
    {
      id: 'identity',
      step: 'Step 01',
      title: 'Government Identity & Landlord NIN / BVN Validation',
      description: 'Verified against NIMC & NIBSS databases with biometric hash attestation synchronized with Alausa Real Estate Registry.',
      status: getStepStatus(identityVer),
      icon: <ShieldCheck className="h-6 w-6" />,
    },
    {
      id: 'cac',
      step: 'Step 02',
      title: 'CAC Corporate Entity & Legal Deed Ownership Documentation',
      description: 'Entity registration with CAC Status Report & Ultimate Beneficial Owner (UBO) certification.',
      status: getStepStatus(companyVer),
      icon: <Building2 className="h-6 w-6" />,
    },
    {
      id: 'title',
      step: 'Step 03',
      title: 'Property Title Registration & Deed Deposit',
      description: 'Submit primary title deeds for your initial property listing with C of O / Governor\'s Consent / Gazette.',
      status: getStepStatus(propertyVer),
      icon: <FileText className="h-6 w-6" />,
    },
    {
      id: 'escrow',
      step: 'Step 04',
      title: 'Payout & Rental Escrow Settlement Account',
      description: 'Configuration for automated Paystack / Monnify direct escrow payouts in Nigerian Naira with CBN-compliant virtual merchant account.',
      status: getStepStatus(propertyVer) === 'cleared' ? 'next_up' : 'locked',
      icon: <Landmark className="h-6 w-6" />,
    },
    {
      id: 'covenant',
      step: 'Step 05',
      title: 'Anti-Omonile Legal Protection Bond & Tenant Escrow Covenant',
      description: 'Institutional indemnity covenant certifying 0% boundary dispute, vacant possession guarantee, and automated dispute resolution.',
      status: 'locked',
      icon: <Gavel className="h-6 w-6" />,
    },
  ];

  const clearedCount = steps.filter((s) => s.status === 'cleared').length;
  const progress = Math.round((clearedCount / steps.length) * 100);

  return (
    <DashboardShell navigation={LANDLORD_NAVIGATION} userRole="landlord" userName="Landlord">
      <ErrorBoundary>
        <div className="min-h-screen bg-[#fbf8fc] p-4 md:p-6 lg:p-8">
          {/* Top Context Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2 text-xs text-zinc-500 uppercase tracking-wider">
              <span className="h-2 w-2 rounded-full bg-[#006c49] inline-block" />
              <span>Lagos State Lands Bureau • Alausa GIS Cadastral Data Pipeline v4.2</span>
              <span className="text-zinc-300">•</span>
              <span className="font-mono">NODE: NG-LOS-ALA-088</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-zinc-100 px-2 py-1 text-xs font-mono text-zinc-500">PORTFOLIO TIER: INSTITUTIONAL PRIME</span>
              <span className="flex items-center gap-1 rounded bg-[#10b981]/20 px-2 py-1 text-xs font-semibold text-[#006c49]">
                <ShieldCheck className="h-3.5 w-3.5" /> CBN ESCROW READY
              </span>
            </div>
          </div>

          {/* Master Header Banner */}
          <div className="mb-6 rounded-xl bg-white p-6 shadow-sm border border-zinc-100 relative overflow-hidden">
            <div className="absolute -right-16 -top-16 h-80 w-80 rounded-full bg-[#006c49]/5 blur-3xl pointer-events-none" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative z-10">
              <div className="lg:col-span-8 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/60 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-800">
                    <BadgeCheck className="h-3 w-3" /> LASRERA REGISTERED DEED HOLDER
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-600">
                    <RefreshCw className="h-3 w-3" /> ALAUSA LAND REGISTRY CADASTRAL SYNC
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-600">
                    <Lock className="h-3 w-3" /> NDPR COMPLIANT
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
                  Institutional Landlord Onboarding & Property Cadastral Verification
                </h1>
                <p className="text-sm text-zinc-500 max-w-3xl">
                  Complete your statutory proof of ownership, KYC credentials, and Central Bank of Nigeria (CBN) escrow
                  settlement bank account to list bonded institutional properties across Lagos and Abuja Federal Capital Territory.
                </p>
              </div>

              {/* Verification Progress Card */}
              <div className="lg:col-span-4 rounded-lg bg-zinc-50 p-4 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Protocol Phase</span>
                  <span className="font-mono text-sm font-bold text-[#006c49]">{progress}% COMPLETED</span>
                </div>
                <div className="mb-3">
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-lg font-bold text-zinc-900">{clearedCount} of {steps.length} Steps</span>
                    <span className="flex items-center gap-1 text-xs font-semibold text-[#006c49]">
                      <span className="h-2 w-2 rounded-full bg-[#006c49] animate-pulse" />
                      {steps.some((s) => s.status === 'action_required') ? 'Cadastral Audit in Progress' : 'In Progress'}
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-zinc-200 overflow-hidden">
                    <div className="h-full rounded-full bg-[#006c49] transition-all duration-500" style={{ width: `${progress}%` }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-zinc-500">
                  <div className="flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-[#006c49]" /> NIMC & BVN Cleared
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-[#006c49]" /> CAC Entity Cleared
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-700">
                    <Clock className="h-4 w-4 text-[#10b981]" /> Cadastral Title Pending
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-400">
                    <Lock className="h-4 w-4" /> Escrow Settlement
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Steps */}
            <div className="lg:col-span-8 space-y-4">
              {steps.map((step) => {
                const badge = statusBadge(step.status);
                return (
                  <div
                    key={step.id}
                    className={`rounded-xl bg-white p-5 shadow-sm border border-zinc-100 transition hover:shadow-md ${step.status === 'action_required' ? 'ring-2 ring-[#10b981]/30' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg mt-0.5 ${
                          step.status === 'cleared' ? 'bg-emerald-100/40 text-[#006c49]' :
                          step.status === 'action_required' ? 'bg-[#10b981]/20 text-[#00422b]' :
                          'bg-zinc-100 text-zinc-500'
                        }`}>
                          {step.status === 'cleared' ? <Check className="h-6 w-6" /> : step.icon}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{step.step}</span>
                            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${badge.cls}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                              {badge.label}
                            </span>
                          </div>
                          <h3 className="mt-1 text-base font-semibold text-zinc-900">{step.title}</h3>
                          <p className="mt-1 text-sm text-zinc-500">{step.description}</p>
                        </div>
                      </div>
                      {step.status !== 'locked' && (
                        <button className="flex shrink-0 items-center gap-1 rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-200 transition">
                          <Eye className="h-3.5 w-3.5" /> Inspect
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Audit Log Table */}
              <div className="rounded-xl bg-white p-5 shadow-sm border border-zinc-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-semibold text-zinc-900">Statutory Audit Log & Verification Handshakes</h3>
                    <p className="text-xs text-zinc-500">Immutable telemetry tracking governmental database validations</p>
                  </div>
                  <span className="flex items-center gap-1 font-mono text-xs text-[#006c49]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#006c49]" /> SYNC ACTIVE
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-zinc-50 text-zinc-500 text-[11px] uppercase tracking-wider">
                        <th className="py-2.5 px-4 rounded-l-lg font-semibold">Statutory Agency</th>
                        <th className="py-2.5 px-4 font-semibold">Instrument / Record</th>
                        <th className="py-2.5 px-4 font-semibold">Result / Attestation</th>
                        <th className="py-2.5 px-4 rounded-r-lg font-semibold text-right">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      <tr className="hover:bg-zinc-50/50 transition">
                        <td className="py-2.5 px-4 font-semibold text-zinc-900 flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-[#006c49]" /> NIMC Portal NG
                        </td>
                        <td className="py-2.5 px-4 font-mono text-zinc-500">NIN Hash</td>
                        <td className="py-2.5 px-4">
                          <span className="rounded bg-emerald-100/60 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">Identity Verified</span>
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono text-zinc-500">10:14 AM WAT</td>
                      </tr>
                      <tr className="hover:bg-zinc-50/50 transition">
                        <td className="py-2.5 px-4 font-semibold text-zinc-900 flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-[#006c49]" /> Corporate Affairs (CAC)
                        </td>
                        <td className="py-2.5 px-4 font-mono text-zinc-500">RC Status Report</td>
                        <td className="py-2.5 px-4">
                          <span className="rounded bg-emerald-100/60 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">Active & Good Standing</span>
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono text-zinc-500">10:19 AM WAT</td>
                      </tr>
                      <tr className="hover:bg-zinc-50/50 transition">
                        <td className="py-2.5 px-4 font-semibold text-zinc-900 flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-[#006c49]" /> NIBSS BVN Portal
                        </td>
                        <td className="py-2.5 px-4 font-mono text-zinc-500">BVN Verification</td>
                        <td className="py-2.5 px-4">
                          <span className="rounded bg-emerald-100/60 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">Director Match 100%</span>
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono text-zinc-500">10:24 AM WAT</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-4 space-y-4">
              {/* Institutional Protections */}
              <div className="rounded-xl bg-white p-5 shadow-sm border border-zinc-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#006c49]/10 text-[#006c49]">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-zinc-900">Institutional Protections</h3>
                    <p className="text-xs text-zinc-500">Bonded Sovereign Landlord Coverage</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-2.5 rounded-lg bg-zinc-50 p-3">
                    <ShieldCheck className="h-5 w-5 text-[#006c49] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-900">0% Omonile Interception Guarantee</h4>
                      <p className="text-xs text-zinc-500">Statutory police and LASRERA taskforce fast-response registry backing on all cadastral-bonded assets.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 rounded-lg bg-zinc-50 p-3">
                    <Zap className="h-5 w-5 text-[#006c49] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-900">Automated Direct Escrow Rental Yields</h4>
                      <p className="text-xs text-zinc-500">Tenant disbursements released directly to commercial bank account within 2 hours of lease execution.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 rounded-lg bg-zinc-50 p-3">
                    <Building2 className="h-5 w-5 text-[#006c49] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-900">Pre-Vetted Corporate Tenants</h4>
                      <p className="text-xs text-zinc-500">Immediate access to multinationals, expats, and high-net-worth tenants with guaranteed corporate rental payment bonds.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dedicated Conveyancer */}
              <div className="rounded-xl bg-white p-5 shadow-sm border border-zinc-100">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Dedicated Conveyancer</span>
                <div className="flex items-center gap-3 mt-3">
                  <div className="relative">
                    <div className="h-14 w-14 rounded-full bg-zinc-100 shrink-0 flex items-center justify-center">
                      <Gavel className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-[#006c49] ring-2 ring-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-900">Legal Conveyancing Desk</h4>
                    <span className="text-xs text-zinc-500">Head of Legal Conveyancing & Lands Liaison</span>
                    <span className="flex items-center gap-1 text-[11px] text-[#006c49] font-medium mt-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#006c49] animate-pulse" /> Online • Alausa Lands Bureau Office
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <button className="flex items-center justify-center gap-1.5 rounded-lg bg-zinc-50 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition">
                    <MessageCircle className="h-4 w-4 text-[#006c49]" /> WhatsApp
                  </button>
                  <button className="flex items-center justify-center gap-1.5 rounded-lg bg-zinc-50 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition">
                    <Phone className="h-4 w-4 text-[#006c49]" /> Direct Call
                  </button>
                </div>
              </div>

              {/* Cadastral Document Vault */}
              <div className="rounded-xl bg-white p-5 shadow-sm border border-zinc-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-[#006c49]" />
                    <h3 className="text-base font-semibold text-zinc-900">Cadastral Document Vault</h3>
                  </div>
                  <span className="text-xs font-mono text-zinc-400">{verifications.filter((v) => v.overallStatus === 'verified').length} OF {verifications.length || 4} SECURED</span>
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
                  <p className="text-xs text-zinc-400 text-center py-4">No documents uploaded yet</p>
                ) : (
                  <div className="space-y-2">
                    {verifications.map((v) => (
                      <div key={v.id} className="flex items-center justify-between rounded-lg bg-zinc-50 p-2.5 hover:bg-zinc-100/50 transition">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="h-5 w-5 text-[#006c49] shrink-0" />
                          <div className="min-w-0">
                            <span className="block truncate text-sm font-medium text-zinc-900">{v.listing?.title || v.type}</span>
                            <span className="block text-xs text-zinc-400 font-mono">Verification Record</span>
                          </div>
                        </div>
                        <span className={`shrink-0 rounded px-2 py-0.5 text-[11px] font-semibold ${
                          v.overallStatus === 'verified' ? 'bg-emerald-100/60 text-emerald-800' :
                          v.overallStatus === 'in_progress' ? 'bg-amber-100 text-amber-700' :
                          'bg-zinc-100 text-zinc-500'
                        }`}>
                          {v.overallStatus === 'verified' ? 'Verified' : v.overallStatus === 'in_progress' ? 'Under Review' : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <div className="rounded-xl bg-white p-4 shadow-sm border border-zinc-100 space-y-2">
                <button disabled className="w-full rounded-lg bg-zinc-200 py-2.5 text-sm font-semibold text-zinc-400 cursor-not-allowed flex items-center justify-center gap-2">
                  <Lock className="h-4 w-4" /> Submit Verification to LASRERA (Locked)
                </button>
                <button className="w-full rounded-lg bg-zinc-50 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 transition flex items-center justify-center gap-2">
                  <ClipboardList className="h-4 w-4" /> Save Progress & Continue Later
                </button>
                <p className="text-xs text-zinc-400 text-center pt-1">
                  Complies with Lagos State Real Estate Regulatory Authority (LASRERA) Law 2022 & Central Bank of Nigeria Escrow Mandate.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </DashboardShell>
  );
}
