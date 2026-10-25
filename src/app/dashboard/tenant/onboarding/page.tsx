'use client';

import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/layout/TenantRailShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { TENANT_NAVIGATION } from '@/lib/navigation';
import {
  ShieldCheck, Check, Lock, FileText, User, CreditCard,
  MapPin, Zap, Phone, MessageCircle, AlertCircle, RefreshCw,
  BadgeCheck, Landmark
} from 'lucide-react';

// ─── Types from Prisma schema ───
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

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  status: 'cleared' | 'action_required' | 'next_up' | 'locked';
  icon: React.ReactNode;
  credentials?: { label: string; value: string }[];
}

// ─── Status helpers ───
function getStepStatus(v: Verification | undefined): 'cleared' | 'action_required' | 'next_up' | 'locked' {
  if (!v) return 'locked';
  if (v.overallStatus === 'verified') return 'cleared';
  if (v.overallStatus === 'in_progress') return 'action_required';
  if (v.overallStatus === 'not_started') return 'next_up';
  return 'locked';
}

function statusBadge(status: string) {
  switch (status) {
    case 'cleared':
      return { label: 'Cleared', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' };
    case 'action_required':
      return { label: 'Action Required', cls: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' };
    case 'next_up':
      return { label: 'Next Up', cls: 'bg-zinc-100 text-zinc-600 border-zinc-200', dot: 'bg-zinc-400' };
    case 'locked':
      return { label: 'Locked', cls: 'bg-zinc-100 text-zinc-500 border-zinc-200', dot: 'bg-zinc-400' };
    default:
      return { label: 'Pending', cls: 'bg-zinc-100 text-zinc-500 border-zinc-200', dot: 'bg-zinc-400' };
  }
}

// ─── Main Component ───
export default function TenantOnboardingPage() {
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

  // Derive step statuses from real verification data
  const identityVer = verifications.find((v) => v.type === 'identity');

  const steps: OnboardingStep[] = [
    {
      id: 'identity',
      title: 'Government Identity & NIN Validation',
      description: 'Verified via NIMC Database Engine with biometric hash attestation synchronized with LASRERA.',
      status: getStepStatus(identityVer, 'identity'),
      icon: <ShieldCheck className="h-5 w-5" />,
      credentials: identityVer ? [
        { label: 'NIN', value: '•••• •••• ••••' },
        { label: 'Status', value: identityVer.overallStatus.replace(/_/g, ' ') },
      ] : undefined,
    },
    {
      id: 'contact',
      title: 'Contact & Biometric Photo Alignment',
      description: 'Live facial geometry matched against registered NIMC profile with WhatsApp 2FA verification.',
      status: getStepStatus(identityVer, 'identity') === 'cleared' ? 'cleared' : 'next_up',
      icon: <User className="h-5 w-5" />,
    },
    {
      id: 'funds',
      title: 'Proof of Funds & Employment Clearance',
      description: 'CBN-Compliant Tenant Affordability Index (TAI). Provide certified 3-month account activity or corporate pay verification.',
      status: getStepStatus(identityVer, 'identity') === 'cleared' ? 'action_required' : 'locked',
      icon: <CreditCard className="h-5 w-5" />,
    },
    {
      id: 'preferences',
      title: 'Tenancy Preferences & Search Criteria',
      description: 'Configure location preferences, budget range, and property specifications for matched listings.',
      status: 'next_up',
      icon: <MapPin className="h-5 w-5" />,
    },
    {
      id: 'guarantor',
      title: 'Guarantor / Corporate Bond Declaration',
      description: 'Requires completion of financial verification. Generates automated WhatsApp verification dispatch.',
      status: 'locked',
      icon: <FileText className="h-5 w-5" />,
    },
  ];

  const clearedCount = steps.filter((s) => s.status === 'cleared').length;
  const progress = Math.round((clearedCount / steps.length) * 100);

  return (
    <TenantRailShell navigation={TENANT_NAVIGATION} userRole="tenant" userName={userName}>
      <ErrorBoundary>
        <div className="min-h-screen bg-[#fbf8fc] p-4 md:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#006c49] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                <BadgeCheck className="h-3.5 w-3.5" /> Bonded Tenant Protocol
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-800">
                <ShieldCheck className="h-3.5 w-3.5" /> LASRERA
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-zinc-600">
                <Lock className="h-3.5 w-3.5" /> NDPR Compliant
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
              Welcome to PropatiBox, <span className="text-[#006c49]">{userName}</span>
            </h1>
            <p className="mt-2 text-sm text-zinc-500 max-w-2xl">
              Complete your high-assurance sovereign clearance to access pre-vetted corporate residential portfolios
              across Lagos State with escrow-backed deposit guarantees.
            </p>
          </div>

          {/* Progress Meter */}
          <div className="mb-6 rounded-xl bg-white p-5 shadow-sm border border-zinc-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-zinc-600">Checklist Progress</span>
              <span className="text-sm font-bold font-mono text-[#006c49]">{progress}% Completed</span>
            </div>
            <div className="h-2 w-full rounded-full bg-zinc-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#10b981] transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-zinc-500">{clearedCount} of {steps.length} Steps Finalized</span>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${steps.some((s) => s.status === 'action_required') ? 'bg-amber-50 text-amber-700' : 'bg-zinc-100 text-zinc-600'}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${steps.some((s) => s.status === 'action_required') ? 'bg-amber-500 animate-pulse' : 'bg-zinc-400'}`} />
                {steps.some((s) => s.status === 'action_required') ? 'Clearance Pending' : 'In Progress'}
              </span>
            </div>
          </div>

          {/* Steps Grid */}
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
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                          step.status === 'cleared' ? 'bg-emerald-100 text-emerald-700' :
                          step.status === 'action_required' ? 'bg-[#10b981]/20 text-[#00422b]' :
                          'bg-zinc-100 text-zinc-500'
                        }`}>
                          {step.status === 'cleared' ? <Check className="h-5 w-5" /> : step.icon}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-semibold text-zinc-900">{step.title}</h3>
                            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${badge.cls}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                              {badge.label}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-zinc-500">{step.description}</p>
                          {step.credentials && (
                            <div className="mt-3 flex flex-wrap gap-3">
                              {step.credentials.map((c) => (
                                <div key={c.label} className="rounded-lg bg-zinc-50 px-3 py-2">
                                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400">{c.label}</span>
                                  <span className="block text-sm font-mono font-semibold text-zinc-900">{c.value}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      {step.status !== 'locked' && (
                        <button className="shrink-0 rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-200 transition">
                          {step.status === 'action_required' ? 'Complete' : 'Details'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Institutional Protections */}
            <div className="lg:col-span-4 space-y-4">
              {/* Institutional Clearance Card */}
              <div className="rounded-xl bg-white p-5 shadow-sm border border-zinc-100">
                <div className="flex items-center gap-2 mb-3">
                  <Landmark className="h-5 w-5 text-[#006c49]" />
                  <h3 className="text-base font-semibold text-zinc-900">Institutional Clearance</h3>
                </div>
                <p className="text-sm text-zinc-500 mb-4">
                  PropatiBox bonded clearances eliminate typical non-statutory rental friction in prime Lagos and Abuja metropolitan districts.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-2.5 rounded-lg bg-zinc-50 p-3">
                    <ShieldCheck className="h-5 w-5 text-[#006c49] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-900">0% Omonile Harassment Guarantee</h4>
                      <p className="text-xs text-zinc-500">Protected legal boundary warranty registered under Lagos State Tenancy Law.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 rounded-lg bg-zinc-50 p-3">
                    <CreditCard className="h-5 w-5 text-[#006c49] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-900">Direct Escrow Security</h4>
                      <p className="text-xs text-zinc-500">Caution deposits held in automated yields escrow until verified checkout audit.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 rounded-lg bg-zinc-50 p-3">
                    <Zap className="h-5 w-5 text-[#006c49] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-900">4-Hour Fast Track Access</h4>
                      <p className="text-xs text-zinc-500">Corporate and verified landlords issue instant private inspect keys without agency delays.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assigned Officer Card */}
              <div className="rounded-xl bg-white p-5 shadow-sm border border-zinc-100">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Assigned Success Specialist</span>
                <div className="flex items-center gap-3 mt-3">
                  <div className="h-12 w-12 rounded-full bg-zinc-100 shrink-0 flex items-center justify-center">
                    <User className="h-6 w-6 text-zinc-400" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-zinc-900 truncate">Tunde Bakare</h4>
                    <span className="text-xs text-zinc-500">Senior Leasing & Verification Lead</span>
                    <span className="flex items-center gap-1 text-[11px] text-[#006c49] font-medium mt-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" /> Online • Victoria Island Hub
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

              {/* Document Vault */}
              <div className="rounded-xl bg-white p-5 shadow-sm border border-zinc-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#006c49]" />
                    <h4 className="text-sm font-semibold text-zinc-900">Document Vault</h4>
                  </div>
                  <span className="text-xs font-mono text-zinc-400">{verifications.length} Records</span>
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
                    {verifications.slice(0, 3).map((v) => (
                      <div key={v.id} className="flex items-center justify-between rounded-lg bg-zinc-50 p-2.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="h-4 w-4 text-[#006c49] shrink-0" />
                          <span className="truncate text-xs text-zinc-700">{v.listing?.title || v.type}</span>
                        </div>
                        <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                          v.overallStatus === 'verified' ? 'bg-emerald-100 text-emerald-700' :
                          v.overallStatus === 'in_progress' ? 'bg-amber-100 text-amber-700' :
                          'bg-zinc-100 text-zinc-500'
                        }`}>
                          {v.overallStatus === 'verified' ? 'Verified' : v.overallStatus === 'in_progress' ? 'In Progress' : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button className="w-full rounded-lg bg-zinc-100 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-200 transition text-center">
                  Save Progress & Exit
                </button>
                <button disabled className="w-full rounded-lg bg-zinc-200 py-2.5 text-sm font-semibold text-zinc-400 cursor-not-allowed text-center">
                  Complete All Tasks (Locked)
                </button>
              </div>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </TenantRailShell>
  );
}
