import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import {
  Search,
  SlidersHorizontal,
  MapPin,
  CheckCircle2,
  Send,
  Gavel,
  CreditCard as PaymentsIcon,
  Calendar,
  Clock,
  ShieldCheck,
  XCircle,
  FileText,
  Download,
} from 'lucide-react';

export const metadata = {
  title: 'Commercial Lease Negotiation – Landlord',
  description: 'Review and negotiate commercial lease terms with prospective corporate tenants.',
};

type AgreementRow = Awaited<ReturnType<typeof prisma.agreement.findMany>>[number];

function naira(value: unknown) {
  if (value == null) return '—';
  return `₦${Number(value).toLocaleString('en-NG')}`;
}

function statusLabel(status: string) {
  switch (status) {
    case 'pending_landlord':
    case 'draft':
      return 'Pending Review';
    case 'pending_tenant':
    case 'tenant_signed':
    case 'landlord_signed':
      return 'In Negotiation';
    case 'fully_signed':
      return 'Terms Agreed';
    case 'terminated':
      return 'Terminated';
    case 'expired':
      return 'Expired';
    default:
      return status.replace(/_/g, ' ');
  }
}

function statusBadgeClass(status: string) {
  switch (status) {
    case 'fully_signed':
      return 'bg-[var(--sovereign-container-bg)] text-[var(--sovereign-hover)] dark:bg-primary/30 dark:text-[#4edea3]';
    case 'pending_landlord':
    case 'draft':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    default:
      return 'bg-[var(--sovereign-container-bg)] text-[var(--sovereign-hover)] dark:bg-primary/20 dark:text-[#4edea3]';
  }
}

export default async function CommercialLeaseNegotiationPage() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'landlord') redirect('/dashboard');

  const agreements = await prisma.agreement.findMany({
    where: { landlordId: user.id },
    include: {
      tenant: { select: { fullName: true, email: true } },
      listing: { select: { title: true, address: true, area: true, state: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  const agr = agreements[0] as AgreementRow | undefined;

  const counts = {
    all: agreements.length,
    pending: agreements.filter((a) => a.status === 'pending_landlord' || a.status === 'draft').length,
    negotiation: agreements.filter((a) =>
      ['pending_tenant', 'tenant_signed', 'landlord_signed'].includes(a.status),
    ).length,
    agreed: agreements.filter((a) => a.status === 'fully_signed').length,
  };

  return (
    <DashboardShell
      navigation={LANDLORD_NAVIGATION}
      userRole="landlord"
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <div className="space-y-6">
          {/* Breadcrumbs & header */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1 text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              <span className="hover:text-primary cursor-pointer transition-colors">Home</span>
              <span>/</span>
              <span className="hover:text-primary cursor-pointer transition-colors">Portfolio</span>
              <span>/</span>
              <span className="hover:text-primary cursor-pointer transition-colors">Commercial Leases</span>
              <span>/</span>
              <span className="font-semibold text-primary">Negotiation</span>
            </div>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mt-2">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                  Commercial Lease Negotiation
                </h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  Review and negotiate commercial lease terms with prospective corporate tenants across your portfolio.
                </p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="inline-flex items-center gap-2 rounded-full bg-[var(--sovereign-container-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--sovereign-hover)] dark:bg-primary/20 dark:text-[#4edea3]">
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  {counts.all} Active Negotiations
                </span>
                <button className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-white/[0.08] dark:bg-zinc-900 dark:text-zinc-200">
                  <Download className="h-4 w-4" />
                  Export Audit Log
                </button>
              </div>
            </div>

            {/* Quick status tabs */}
            <div className="mt-4 inline-flex items-center gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
              {[
                { label: `All Proposals (${counts.all})` },
                { label: `Pending Review (${counts.pending})` },
                { label: `In Negotiation (${counts.negotiation})` },
                { label: `Agreed (${counts.agreed})` },
              ].map((t, i) => (
                <span
                  key={t.label}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    i === 0
                      ? 'bg-white text-[var(--sovereign-hover)] shadow-sm dark:bg-zinc-900 dark:text-[#4edea3]'
                      : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                  }`}
                >
                  {t.label}
                </span>
              ))}
            </div>
          </div>

          {/* Main split layout */}
          <div className="grid grid-cols-12 gap-6 items-start">
            {/* LEFT PANEL */}
            <section className="col-span-12 xl:col-span-5 flex flex-col gap-4">
              <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/[0.08] dark:bg-zinc-900">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <input
                      className="w-full rounded-lg bg-zinc-50 py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-zinc-800 dark:text-white"
                      placeholder="Search company, RC number, asset..."
                      type="text"
                    />
                  </div>
                  <button className="flex h-9 items-center gap-1 rounded-lg bg-zinc-50 px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-200">
                    <SlidersHorizontal className="h-4 w-4" />
                    <span className="hidden sm:inline">Sort</span>
                  </button>
                </div>
                <div className="flex items-center justify-between pt-3 text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  <span>Commercial Covenant Inquiries</span>
                  <span className="font-semibold text-primary">Portfolio Ledger</span>
                </div>

                <div className="mt-3 flex flex-col gap-3">
                  {agreements.length === 0 ? (
                    <div className="py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
                      No negotiations pending.
                    </div>
                  ) : (
                    agreements.map((a) => (
                      <article
                        key={a.id}
                        className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-all hover:bg-zinc-50 dark:border-white/[0.08] dark:bg-zinc-900 dark:hover:bg-zinc-800/60"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="min-w-0 flex-1">
                            <span
                              className={`mb-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusBadgeClass(a.status)}`}
                            >
                              {statusLabel(a.status)}
                            </span>
                            <h2 className="truncate text-sm font-bold text-zinc-900 dark:text-white">
                              {a.listing.title}
                            </h2>
                            <p className="mt-0.5 flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                              <MapPin className="h-3 w-3" />
                              {a.listing.address}
                              {a.listing.area ? `, ${a.listing.area}` : ''}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="block text-[10px] uppercase text-zinc-500 dark:text-zinc-400">
                              {a.status === 'fully_signed' ? 'Agreed Base' : 'Proposed Base'}
                            </span>
                            <span className="font-mono text-sm font-bold text-primary">
                              {naira(a.rentAmount)}
                            </span>
                            <span className="block text-xs text-zinc-500 dark:text-zinc-400">/year</span>
                          </div>
                        </div>

                        <div className="my-2 flex items-center justify-between rounded-lg bg-zinc-50 p-2 dark:bg-zinc-800">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-200 text-xs font-bold text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
                              {(a.tenant.fullName || '?')
                                .split(' ')
                                .map((p) => p[0])
                                .slice(0, 2)
                                .join('')
                                .toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-zinc-900 dark:text-white">
                                {a.tenant.fullName}
                              </div>
                              <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                {a.tenant.email || ''}
                              </div>
                            </div>
                          </div>
                          <span className="rounded bg-zinc-200 px-2 py-0.5 text-[11px] font-semibold text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
                            {a.startDate && a.endDate
                              ? `${Math.round(
                                  (new Date(a.endDate).getTime() - new Date(a.startDate).getTime()) /
                                    (1000 * 60 * 60 * 24 * 30),
                                )} Mo.`
                              : '—'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">
                            Submitted {new Date(a.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          <div className="flex items-center gap-2">
                            {a.status === 'fully_signed' ? (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Ready for Stamping
                              </span>
                            ) : (
                              <>
                                <button className="rounded bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200">
                                  Counter
                                </button>
                                <button className="rounded bg-primary px-2.5 py-1 text-xs font-semibold text-white hover:bg-[var(--sovereign-hover)]">
                                  Review Terms
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </div>
            </section>

            {/* RIGHT PANEL */}
            <section className="col-span-12 xl:col-span-7 flex flex-col gap-6">
              {agreements.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white p-12 text-center shadow-sm dark:border-white/[0.08] dark:bg-zinc-900">
                  <Gavel className="h-12 w-12 text-zinc-400 opacity-60" />
                  <h3 className="mt-4 text-lg font-bold text-zinc-900 dark:text-white">No Negotiations Pending</h3>
                  <p className="mt-1 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
                    All prospective commercial covenants are currently executed, fully stamped, or closed across your portfolio.
                  </p>
                </div>
              ) : (
                agr && (
                  <div className="flex flex-col gap-6">
                    {/* Active covenant summary */}
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-white/[0.08] dark:bg-zinc-800">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-lg font-bold text-white shadow-sm">
                            {(agr.tenant.fullName || '?')
                              .split(' ')
                              .map((p) => p[0])
                              .slice(0, 2)
                              .join('')
                              .toUpperCase()}
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                                {agr.tenant.fullName}
                              </h3>
                              <span className="rounded-full bg-[var(--sovereign-container-bg)] px-2 py-0.5 text-[10px] font-semibold text-[var(--sovereign-hover)] dark:bg-primary/30 dark:text-[#4edea3]">
                                {agr.riskTier === 'review_required' ? 'Risk Tier B' : 'Risk Tier A (Institutional)'}
                              </span>
                            </div>
                            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                              {agr.tenant.email || ''}
                              {agr.listing.address ? ` • ${agr.listing.address}` : ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-start rounded-lg bg-white px-4 py-2 shadow-sm md:items-end dark:bg-zinc-900">
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] uppercase text-zinc-500 dark:text-zinc-400">Asking Variance</span>
                            <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700 dark:bg-red-900/30 dark:text-red-400">
                              -6.25%
                            </span>
                          </div>
                          <div className="mt-0.5 font-mono text-xs text-zinc-500 dark:text-zinc-400">
                            Asking: <span className="line-through">{naira(agreements[1]?.rentAmount ?? agr.rentAmount)}</span>{' '}
                            → <span className="font-bold text-primary">{naira(agr.rentAmount)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 1: Financial terms */}
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <h4 className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-white">
                          <PaymentsIcon className="h-5 w-5 text-primary" />
                          Financial Covenant &amp; Escalations
                        </h4>
                        <span className="text-[10px] uppercase text-zinc-500 dark:text-zinc-400">Currency: NGN</span>
                      </div>
                      <div className="grid grid-cols-1 gap-4 rounded-xl bg-zinc-50 p-4 md:grid-cols-2 dark:bg-zinc-800">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                            Counter Proposed Base Rent (Per Annum)
                          </label>
                          <div className="flex overflow-hidden rounded-lg bg-white shadow-sm dark:bg-zinc-900">
                            <span className="flex items-center bg-zinc-100 px-3 py-2 font-mono text-sm font-bold text-zinc-500 dark:bg-zinc-700">
                              ₦
                            </span>
                            <input
                              className="w-full bg-transparent px-3 py-2 font-mono text-sm font-semibold text-zinc-900 focus:outline-none dark:text-white"
                              readOnly
                              type="text"
                              value={agr.rentAmount ? Number(agr.rentAmount).toLocaleString('en-NG') : ''}
                            />
                          </div>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">Current proposed rent.</span>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                            Rent Review Cycle &amp; Cap
                          </label>
                          <select className="h-10 rounded-lg bg-white px-3 text-sm text-zinc-900 focus:outline-none dark:bg-zinc-900 dark:text-white">
                            <option>Annual (Escalation capped at 7.5% p.a.)</option>
                            <option>Biennial (Escalation capped at 15.0% bi-annually)</option>
                            <option>Triennial (Every 3 Years at prevailing market index)</option>
                          </select>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">Compounded annually on anniversary date.</span>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                            Service Charge Multiplier
                          </label>
                          <div className="flex overflow-hidden rounded-lg bg-white shadow-sm dark:bg-zinc-900">
                            <input
                              className="w-full bg-transparent px-3 py-2 font-mono text-sm font-semibold text-zinc-900 focus:outline-none dark:text-white"
                              readOnly
                              type="text"
                              value={agr.serviceCharge ? Number(agr.serviceCharge).toLocaleString('en-NG') : '—'}
                            />
                            <span className="flex items-center bg-zinc-100 px-3 py-2 font-mono text-sm font-bold text-zinc-500 dark:bg-zinc-700">
                              % of Rent
                            </span>
                          </div>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">Covers 24/7 diesel gen power, water &amp; security.</span>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                            Caution Deposit Escrow
                          </label>
                          <div className="flex overflow-hidden rounded-lg bg-white shadow-sm dark:bg-zinc-900">
                            <input
                              className="w-full bg-transparent px-3 py-2 font-mono text-sm font-semibold text-zinc-900 focus:outline-none dark:text-white"
                              readOnly
                              type="text"
                              value={agr.cautionDeposit ? naira(agr.cautionDeposit) : '—'}
                            />
                          </div>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">Held in institutional trust account.</span>
                        </div>

                        <div className="flex flex-col gap-1 md:col-span-2">
                          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                            Landlord Fit-out Contribution Allowance
                          </label>
                          <div className="flex overflow-hidden rounded-lg bg-white shadow-sm dark:bg-zinc-900">
                            <span className="flex items-center bg-zinc-100 px-3 py-2 font-mono text-sm font-bold text-zinc-500 dark:bg-zinc-700">
                              ₦
                            </span>
                            <input
                              className="w-full bg-transparent px-3 py-2 font-mono text-sm font-semibold text-zinc-900 focus:outline-none dark:text-white"
                              readOnly
                              type="text"
                              value="2,500,000"
                            />
                            <span className="flex items-center bg-zinc-100 px-3 py-2 text-xs font-medium text-zinc-500 dark:bg-zinc-700">
                              One-time Credit
                            </span>
                          </div>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">
                            Landlord contribution toward fit-out.
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Governance */}
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <h4 className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-white">
                          <Gavel className="h-5 w-5 text-primary" />
                          Tenancy Governance &amp; Covenants
                        </h4>
                        <span className="text-[10px] uppercase text-zinc-500 dark:text-zinc-400">Lagos Tenancy Law 2011</span>
                      </div>
                      <div className="flex flex-col gap-4 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                              Lease Duration &amp; Term Window
                            </label>
                            <div className="flex items-center gap-2 rounded-lg bg-white p-2 shadow-sm dark:bg-zinc-900">
                              <Calendar className="h-5 w-5 text-primary" />
                              <input
                                className="w-full bg-transparent text-sm font-semibold text-zinc-900 focus:outline-none dark:text-white"
                                readOnly
                                type="text"
                                value={
                                  agr.startDate && agr.endDate
                                    ? `${new Date(agr.startDate).toLocaleDateString('en-NG')} → ${new Date(agr.endDate).toLocaleDateString('en-NG')}`
                                    : '—'
                                }
                              />
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                              Early Break Clause Notice
                            </label>
                            <div className="flex items-center gap-2 rounded-lg bg-white p-2 shadow-sm dark:bg-zinc-900">
                              <Clock className="h-5 w-5 text-zinc-400" />
                              <input
                                className="w-full bg-transparent text-sm font-semibold text-zinc-900 focus:outline-none dark:text-white"
                                readOnly
                                type="text"
                                value={`${agr.noticePeriodDays} days notice`}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 pt-2">
                          {[
                            'Corporate Sector Exclusivity',
                            'Subletting & Assignation Restriction',
                            'Institutional Compliance Certificate',
                          ].map((label) => (
                            <label key={label} className="flex cursor-pointer items-start gap-2 select-none">
                              <input
                                checked
                                className="mt-1 h-4 w-4 rounded text-primary focus:ring-primary"
                                readOnly
                                type="checkbox"
                              />
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold text-zinc-900 dark:text-white">{label}</span>
                                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                  Covenant enforced under Lagos Tenancy Law 2011.
                                </span>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Special clauses */}
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <h4 className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-white">
                          <FileText className="h-5 w-5 text-primary" />
                          Special Clauses &amp; Addenda
                        </h4>
                        <span className="cursor-pointer text-xs font-semibold text-primary hover:underline">
                          + Insert Boilerplate Clause
                        </span>
                      </div>
                      <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800">
                        <textarea
                          className="w-full resize-y rounded-lg bg-white p-3 font-mono text-xs text-zinc-900 focus:outline-none dark:bg-zinc-900 dark:text-white"
                          defaultValue={agr.specialClauses || ''}
                          readOnly
                          rows={4}
                        />
                        <p className="mt-2 flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                          <ShieldCheck className="h-4 w-4 text-primary" />
                          Legally drafted for institutional enforceability.
                        </p>
                      </div>
                    </div>

                    {/* Action footer */}
                    <div className="flex flex-col gap-3 rounded-xl bg-zinc-50 p-4 md:flex-row md:items-center md:justify-between dark:bg-zinc-800">
                      <button className="flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                        <XCircle className="h-4 w-4" />
                        Reject / Terminate
                      </button>
                      <div className="flex items-center gap-2 justify-end">
                        <button className="flex items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-white/[0.08] dark:bg-zinc-900 dark:text-zinc-200">
                          <Send className="h-4 w-4" />
                          Send Counter Offer
                        </button>
                        <button className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-[var(--sovereign-hover)]">
                          <CheckCircle2 className="h-4 w-4" />
                          Accept Offer
                        </button>
                      </div>
                    </div>

                    <div className="text-center text-[11px] text-zinc-500 dark:text-zinc-400">
                      Submission dispatches legal addendum directly to tenant legal counsel and stamps transaction on the covenant ledger.
                    </div>
                  </div>
                )
              )}
            </section>
          </div>
        </div>
      </ErrorBoundary>
    </DashboardShell>
  );
}
