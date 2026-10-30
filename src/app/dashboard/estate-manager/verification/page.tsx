'use client';

import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { useActiveOrganization } from '@/contexts/ActiveOrganizationContext';
import { NoOrgState } from '@/components/organizations/NoOrgState';
import {
  ShieldCheck, Building2, FileText, Landmark,
  AlertCircle, ChevronRight, RefreshCw, Search,
} from 'lucide-react';

// ─── Types from Prisma schema ───
type VerificationType = 'property' | 'identity' | 'company' | 'professional';
type VerificationLayerStatus = 'pending' | 'in_progress' | 'verified' | 'rejected' | 'not_applicable';
type VerificationOverallStatus = 'not_started' | 'in_progress' | 'verified' | 'rejected' | 'frozen';

interface Verification {
  id: string;
  type: VerificationType;
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

const TYPE_META: Record<VerificationType, { label: string; icon: JSX.Element; desc: string }> = {
  property: {
    label: 'Property Verification',
    icon: <Building2 className="h-5 w-5" />,
    desc: 'Ownership, documents, and physical inspection',
  },
  identity: {
    label: 'Identity Verification',
    icon: <ShieldCheck className="h-5 w-5" />,
    desc: 'NIN, ID, and liveness checks via Dojah',
  },
  company: {
    label: 'Company / Business',
    icon: <Landmark className="h-5 w-5" />,
    desc: 'CAC registration, TIN, and company documents',
  },
  professional: {
    label: 'Professional',
    icon: <FileText className="h-5 w-5" />,
    desc: 'Credentials, licenses, and certifications',
  },
};

const STATUS_META: Record<string, { label: string; cls: string; dot: string }> = {
  verified: { label: 'Verified', cls: 'bg-[var(--sovereign-container-bg)] text-[var(--sovereign-hover)] border-primary dark:bg-primary/10 dark:text-[#4edea3] dark:border-primary/30', dot: 'bg-primary' },
  in_progress: { label: 'In Progress', cls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30', dot: 'bg-amber-500' },
  pending: { label: 'Pending', cls: 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700', dot: 'bg-zinc-400' },
  not_started: { label: 'Not Started', cls: 'bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-500 dark:border-zinc-700', dot: 'bg-zinc-400' },
  rejected: { label: 'Rejected', cls: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30', dot: 'bg-red-500' },
  frozen: { label: 'Frozen', cls: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/30', dot: 'bg-sky-500' },
};

const LAYER_LABELS = ['Documents', 'Identity Match', 'Live Video', 'Physical Inspection', 'Admin Certification'];

function layerStatusCls(status: VerificationLayerStatus): string {
  switch (status) {
    case 'verified': return 'bg-primary';
    case 'in_progress': return 'bg-amber-500';
    case 'rejected': return 'bg-red-500';
    default: return 'bg-zinc-300 dark:bg-zinc-700';
  }
}

export default function VerificationCenterPage() {
  const { organization, loading: orgLoading } = useActiveOrganization();
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  useEffect(() => {
    if (!organization) return;
    let cancelled = false;
    setLoading(true);
    fetch('/api/dashboard/estate-manager/verifications', { cache: 'no-store' })
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) {
          const raw = json?.data ?? [];
          setVerifications(raw.map((v: any) => ({
            id: v.id,
            type: v.type,
            overallStatus: v.overallStatus,
            currentLayer: v.currentLayer,
            l1Status: v.l1Status,
            l2Status: v.l2Status,
            l3Status: v.l3Status,
            l4Status: v.l4Status,
            l5Status: v.l5Status,
            listingId: v.listingId,
            ownerId: v.ownerId,
            createdAt: v.createdAt,
            updatedAt: v.updatedAt,
            listing: v.listing ?? null,
          })));
        }
      })
      .catch(() => { if (!cancelled) setError('Failed to load verifications'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [organization]);

  if (orgLoading) return <NoOrgState title="Loading organization…" />;
  if (!organization) return <NoOrgState title="No Organization" description="Select or create an organization to view verifications." />;

  const filtered = verifications.filter((v) => {
    if (typeFilter !== 'ALL' && v.type !== typeFilter) return false;
    if (query) {
      const q = query.toLowerCase();
      const hay = [v.type, v.overallStatus, v.listing?.title ?? '', v.id].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const counts = {
    total: verifications.length,
    verified: verifications.filter((v) => v.overallStatus === 'verified').length,
    inProgress: verifications.filter((v) => v.overallStatus === 'in_progress').length,
    pending: verifications.filter((v) => v.overallStatus === 'pending' || v.overallStatus === 'not_started').length,
  };

  return (
    <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Estate Manager">
      <ErrorBoundary>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h1 className="font-heading text-2xl font-bold text-zinc-900 dark:text-white">Verification Center</h1>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Track and manage all verification workflows for {organization.name}.
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <RefreshCw className="h-[18px] w-[18px]" /> Refresh
            </button>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Total</span>
              <div className="mt-1 text-2xl font-bold font-mono text-zinc-900 dark:text-white">{counts.total}</div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Verified</span>
              <div className="mt-1 text-2xl font-bold font-mono text-primary dark:text-[#4edea3]">{counts.verified}</div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">In Progress</span>
              <div className="mt-1 text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">{counts.inProgress}</div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Pending</span>
              <div className="mt-1 text-2xl font-bold font-mono text-zinc-900 dark:text-white">{counts.pending}</div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col items-stretch justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center dark:border-zinc-800 dark:bg-zinc-900">
            <div className="relative min-w-[280px] flex-1">
              <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by type, status, or listing…"
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-primary focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-white dark:focus:bg-zinc-900"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-primary focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
            >
              <option value="ALL">All Types</option>
              <option value="property">Property</option>
              <option value="identity">Identity</option>
              <option value="company">Company</option>
              <option value="professional">Professional</option>
            </select>
          </div>

          {/* Verification list */}
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            {loading ? (
              <div className="p-6 text-center">
                <RefreshCw className="mx-auto h-6 w-6 animate-spin text-zinc-400" />
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Loading verifications…</p>
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <AlertCircle className="mx-auto h-6 w-6 text-red-400" />
                <p className="mt-2 text-sm text-red-500">{error}</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
                  <ShieldCheck className="h-9 w-9 opacity-50" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">No verifications found</h3>
                <p className="mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
                  {query || typeFilter !== 'ALL'
                    ? 'Try adjusting your search or filter.'
                    : 'Verification workflows will appear here once initiated.'}
                </p>
              </div>
            ) : (
              <div className="min-w-[900px] overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/40">
                      <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">TYPE</th>
                      <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">LISTING</th>
                      <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">STATUS</th>
                      <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">LAYER PROGRESS</th>
                      <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">UPDATED</th>
                      <th className="px-4 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
                    {filtered.map((v) => {
                      const meta = TYPE_META[v.type] ?? TYPE_META.property;
                      const sm = STATUS_META[v.overallStatus] ?? STATUS_META.pending;
                      const layers = [v.l1Status, v.l2Status, v.l3Status, v.l4Status, v.l5Status];
                      return (
                        <tr key={v.id} className="group transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                                {meta.icon}
                              </div>
                              <div>
                                <div className="font-medium text-zinc-900 dark:text-white">{meta.label}</div>
                                <div className="text-xs text-zinc-500 dark:text-zinc-400">{meta.desc}</div>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-zinc-600 dark:text-zinc-400">
                            {v.listing?.title ?? '—'}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${sm.cls}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${sm.dot}`} />
                              {sm.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              {layers.map((s, i) => (
                                <div
                                  key={i}
                                  title={`Layer ${i + 1}: ${LAYER_LABELS[i]} — ${s.replace(/_/g, ' ')}`}
                                  className={`h-2 w-8 rounded-full ${layerStatusCls(s)}`}
                                />
                              ))}
                            </div>
                            <div className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                              Layer {v.currentLayer} of 5 — {LAYER_LABELS[v.currentLayer - 1]}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-zinc-600 dark:text-zinc-400">
                            {new Date(v.updatedAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right">
                            <button className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
                              View <ChevronRight className="h-3 w-3" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </ErrorBoundary>
    </DashboardShell>
  );
}
