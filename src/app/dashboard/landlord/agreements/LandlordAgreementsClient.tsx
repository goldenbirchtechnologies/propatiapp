'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Gavel,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Download,
  Eye,
  PenLine,
  Plus,
  ShieldCheck,
  Building2,
  RefreshCw,
} from 'lucide-react';
import { useAgreements } from '@/hooks/useAgreements';

type AgreementRow = {
  id: string;
  type: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  rentAmount: number | null;
  rentPeriod: string | null;
  createdAt: string;
  listing: { id: string; title: string; area: string | null } | null;
  tenant: { id: string; fullName: string | null; email: string | null } | null;
};

const STATUS_META: Record<string, { label: string; cls: string; dot: string }> = {
  draft: { label: 'Draft', cls: 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700', dot: 'bg-zinc-400' },
  pending_landlord: { label: 'Pending Landlord', cls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30', dot: 'bg-amber-500' },
  pending_tenant: { label: 'Pending Tenant', cls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30', dot: 'bg-amber-500' },
  tenant_signed: { label: 'Tenant Signed', cls: 'bg-[var(--sovereign-container-bg)] text-[var(--sovereign-hover)] border-primary dark:bg-primary/10 dark:text-[#4edea3] dark:border-primary/30', dot: 'bg-primary' },
  landlord_signed: { label: 'Landlord Signed', cls: 'bg-[var(--sovereign-container-bg)] text-[var(--sovereign-hover)] border-primary dark:bg-primary/10 dark:text-[#4edea3] dark:border-primary/30', dot: 'bg-primary' },
  fully_signed: { label: 'Active', cls: 'bg-[var(--sovereign-container-bg)] text-[var(--sovereign-hover)] border-primary dark:bg-primary/10 dark:text-[#4edea3] dark:border-primary/30', dot: 'bg-primary' },
  terminated: { label: 'Terminated', cls: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30', dot: 'bg-rose-500' },
  expired: { label: 'Expired', cls: 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700', dot: 'bg-zinc-400' },
};

function formatDate(value: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' });
}

function ngn(amount: number | null): string {
  if (amount === null || amount === undefined) return '—';
  return `₦${Math.round(amount).toLocaleString('en-NG')}`;
}

function deedRef(id: string) {
  return `AGR-${id.slice(-8).toUpperCase()}`;
}

export default function LandlordAgreementsClient() {
  const { data, isLoading, refetch } = useAgreements();
  const agreements = useMemo(() => {
    const raw = (data as any)?.data ?? (Array.isArray(data) ? data : []);
    return raw as AgreementRow[];
  }, [data]);

  const [q, setQ] = useState('');

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const a of agreements) c[a.status] = (c[a.status] ?? 0) + 1;
    const total = agreements.length;
    const active = c.fully_signed ?? 0;
    const pending = (c.pending_landlord ?? 0) + (c.pending_tenant ?? 0) + (c.tenant_signed ?? 0) + (c.landlord_signed ?? 0) + (c.draft ?? 0);
    const lapsed = (c.terminated ?? 0) + (c.expired ?? 0);
    return { total, active, pending, lapsed };
  }, [agreements]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return agreements.filter((a) => {
      if (!term) return true;
      return [a.listing?.title, a.listing?.area, a.tenant?.fullName, a.tenant?.email, a.type, deedRef(a.id)]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term));
    });
  }, [agreements, q]);

  const exportCsv = () => {
    const header = ['Reference', 'Type', 'Property', 'Area', 'Tenant', 'Rent', 'Period', 'Status', 'Created'];
    const rows = filtered.map((a) => [
      deedRef(a.id),
      a.type,
      a.listing?.title ?? '',
      a.listing?.area ?? '',
      a.tenant?.fullName ?? '',
      a.rentAmount ?? '',
      a.rentPeriod ?? '',
      a.status,
      a.createdAt,
    ]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'agreements.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <main className="w-full px-6 py-8 lg:px-10">
        <div className="flex flex-col w-full max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">Legal &amp; Tenancy Governance</span>
                <span className="text-zinc-400 text-xs">•</span>
                <span className="inline-flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                  FIRS Stamp Duty &amp; E-Sign Compliant
                </span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Agreements</h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                View, execute, and monitor institutional lease covenants across portfolios.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={exportCsv}
                className="h-10 px-4 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
              <Link
                href="/dashboard/landlord/agreements/new"
                className="h-10 px-5 rounded-lg bg-primary text-white hover:bg-[var(--sovereign-hover)] text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Create Agreement
              </Link>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 shadow-sm border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Total Agreements</span>
                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
                  <Gavel className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{counts.total}</span>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">Records</span>
              </div>
              <div className="mt-2 flex items-center gap-1 text-xs text-primary">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Indexed to Lagos Land Bureau</span>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 shadow-sm border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Active &amp; Enforced</span>
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-primary">{counts.active}</span>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">Agreements</span>
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-primary">
                <span className="inline-block w-2 h-2 rounded-full bg-primary" />
                <span>Enforceable</span>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 shadow-sm border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Pending Signature</span>
                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-zinc-100">
                  <PenLine className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{counts.pending}</span>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">Awaiting Execution</span>
              </div>
              <div className="mt-2 flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                <Clock className="w-3.5 h-3.5" />
                <span>Awaiting signatures</span>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-xl p-5 shadow-sm border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Lapsed &amp; Terminated</span>
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-600">
                  <XCircle className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-rose-600">{counts.lapsed}</span>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">Historical Archive</span>
              </div>
              <div className="mt-2 flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                <FileText className="w-3.5 h-3.5" />
                <span>Full audit logs preserved</span>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col">
            <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-semibold">Covenant Ledger</span>
                <span className="bg-primary/10 text-primary text-xs px-2.5 py-0.5 rounded-full font-medium">
                  All ({filtered.length} Records)
                </span>
                <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-primary" />
                  Prisma Decrypted
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="w-full h-9 pl-9 pr-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Filter property or tenant..."
                  />
                </div>
                <button
                  onClick={() => refetch()}
                  className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 flex items-center justify-center transition-colors"
                  title="Reload Data"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="p-6 space-y-3">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-12 w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mb-4">
                  <FileText className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-semibold">No agreements yet.</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm">
                  No institutional lease agreements match this view. Draft or import a new agreement to start e-signature workflows.
                </p>
                <Link
                  href="/dashboard/landlord/agreements/new"
                  className="mt-6 h-10 px-5 rounded-lg bg-primary text-white hover:bg-[var(--sovereign-hover)] text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Create your first agreement
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-[11px] font-semibold uppercase tracking-wider">
                      <th className="py-3 px-6">Title / Property Asset</th>
                      <th className="py-3 px-4">Tenant &amp; RC / NIN</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Executed / Created</th>
                      <th className="py-3 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {filtered.map((a) => {
                      const meta = STATUS_META[a.status] ?? STATUS_META.draft;
                      const propertyTitle = a.listing?.title || deedRef(a.id);
                      const area = a.listing?.area;
                      const tenantName = a.tenant?.fullName || 'Not assigned';
                      const tenantSub = a.tenant?.email || '—';
                      const signable = ['pending_landlord', 'pending_tenant', 'tenant_signed', 'landlord_signed'].includes(a.status);
                      const fullySigned = a.status === 'fully_signed';
                      return (
                        <tr key={a.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer group border-t border-zinc-100 dark:border-zinc-800">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-primary">
                                <Building2 className="w-5 h-5" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold group-hover:text-primary transition-colors">{propertyTitle}</span>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">{a.type}</span>
                                  {area && <span className="text-[11px] text-zinc-500 dark:text-zinc-400">{area}</span>}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold">{tenantName}</span>
                              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">{tenantSub}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${meta.cls}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                              {meta.label}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-mono text-xs text-zinc-500 dark:text-zinc-400">
                            {formatDate(a.createdAt)}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="inline-flex items-center gap-1">
                              <Link
                                href={`/dashboard/landlord/agreements/${a.id}`}
                                className="w-8 h-8 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-primary flex items-center justify-center transition-colors"
                                title="View Agreement"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                              {signable && (
                                <Link
                                  href={`/dashboard/landlord/agreements/${a.id}/sign`}
                                  className="w-8 h-8 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center justify-center transition-colors"
                                  title="Sign"
                                >
                                  <PenLine className="w-4 h-4" />
                                </Link>
                              )}
                              {fullySigned && (
                                <Link
                                  href={`/api/agreements/${a.id}/pdf`}
                                  className="w-8 h-8 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center justify-center transition-colors"
                                  title="Download PDF"
                                >
                                  <Download className="w-4 h-4" />
                                </Link>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>Lagos State Tenancy Law 2011 &amp; Supreme Court Precedent compliant</span>
              </div>
              <span>Showing {filtered.length} of {agreements.length} records</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
