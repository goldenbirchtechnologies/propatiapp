'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { FileText, Gavel, ScrollText, Archive, Search, Download, Eye, MoreVertical, ShieldCheck, Scale } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PageHeader, StatCard, StatusBadge } from '@/components/ui';
import { formatNairaFull, formatDateLong } from '@/lib/utils';
import { useAgreements } from '@/hooks/useAgreements';

type AgreementRow = {
  id: string;
  type: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  rentAmount: number;
  cautionDeposit: number;
  serviceCharge: number;
  createdAt: string;
  landlordSignedAt: string | null;
  tenantSignedAt: string | null;
  pdfUrl: string | null;
  listing: {
    id: string;
    title: string;
    address: string;
    area: string | null;
    state: string | null;
    images: { url: string; isCover: boolean }[];
  } | null;
  landlord: { id: string; fullName: string | null; email: string | null; avatarUrl?: string | null } | null;
  agent: { id: string; fullName: string | null } | null;
  signatures: { id: string; role: string; signedAt: string }[];
  rentSchedule: { id: string; dueDate: string; amount: number; status: string }[];
  stampDuty: { amount: number; status: string; certificateNumber: string | null } | null;
};

function daysLeft(end: string | null): number | null {
  if (!end) return null;
  const d = new Date(end).getTime() - Date.now();
  return Math.ceil(d / 86400000);
}

function deedRef(id: string) {
  return `AGR-${id.slice(-8).toUpperCase()}`;
}

const STATUS_LABEL: Record<string, string> = {
  draft: 'Draft',
  pending_landlord: 'Pending Landlord',
  pending_tenant: 'Pending Your Signature',
  tenant_signed: 'Tenant Signed',
  landlord_signed: 'Landlord Signed',
  fully_signed: 'Active & Enforceable',
  terminated: 'Terminated',
  expired: 'Expired',
};

export default function TenantAgreementsClient() {
  const { data, isLoading } = useAgreements();
  const agreements = ((data as any)?.data ?? (Array.isArray(data) ? data : [])) as AgreementRow[];
  const [q, setQ] = useState('');
  const [tab, setTab] = useState<'all' | 'active' | 'pending' | 'past'>('all');

  const counts = useMemo(() => {
    const active = agreements.filter((a) => a.status === 'fully_signed').length;
    const pending = agreements.filter((a) => ['pending_tenant', 'pending_landlord', 'draft', 'tenant_signed', 'landlord_signed'].includes(a.status)).length;
    const past = agreements.filter((a) => ['expired', 'terminated'].includes(a.status)).length;
    return { active, pending, past, total: agreements.length };
  }, [agreements]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return agreements.filter((a) => {
      const byTab =
        tab === 'all' ? true : tab === 'active' ? a.status === 'fully_signed' : tab === 'pending' ? ['pending_tenant', 'pending_landlord', 'draft', 'tenant_signed', 'landlord_signed'].includes(a.status) : ['expired', 'terminated'].includes(a.status);
      if (!byTab) return false;
      if (!term) return true;
      const hay = [a.listing?.title ?? '', a.listing?.address ?? '', a.listing?.area ?? '', a.id, deedRef(a.id), a.type].join(' ').toLowerCase();
      return hay.includes(term);
    });
  }, [agreements, q, tab]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 font-mono text-[11px] tracking-widest text-zinc-500 dark:text-zinc-500">
          <span>DASHBOARD</span><span className="text-zinc-300 dark:text-zinc-700">/</span>
          <span>DOCUMENTS &amp; LEASES</span><span className="text-zinc-300 dark:text-zinc-700">/</span>
          <span className="font-semibold text-primary dark:text-[#4edea3]">MY AGREEMENTS</span>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 px-3 py-1 text-[11px] font-semibold tracking-wider text-zinc-600 dark:text-zinc-400">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" /> CAC &amp; LASRERA REGISTERED • STAMP DUTY VERIFIED
        </span>
      </div>

      <PageHeader
        title="My Agreements"
        description="Your active and past tenancy agreements, legal deed documentation, and statutory Lagos State tenancy schedules."
        actions={
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
              <Link href="/dashboard/tenant/agreements">Upload Executed Deed</Link>
            </Button>
            <Button asChild size="sm" className="bg-primary hover:bg-primary text-white">
              <Link href="/listings">Browse Listings</Link>
            </Button>
          </div>
        }
      />

      {/* KPI cards — Stitch 3-up */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold tracking-widest text-zinc-500">ACTIVE AGREEMENTS</p>
              <p className="mt-1 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">{counts.active} Active</p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary dark:text-[#4edea3]"><Gavel className="h-5 w-5" /></span>
          </div>
          <div className="mt-4 flex items-center justify-between rounded-lg bg-zinc-50 dark:bg-white/[0.04] px-3 py-2 text-xs">
            <span className="text-zinc-600 dark:text-zinc-400">{counts.active} enforceable</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-semibold text-[var(--sovereign-hover)] dark:text-[#6ffbbe]"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> In Legal Standing</span>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold tracking-widest text-zinc-500">PENDING EXECUTION</p>
              <p className="mt-1 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">{counts.pending} Pending</p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-white/[0.06] text-zinc-700 dark:text-zinc-300"><ScrollText className="h-5 w-5" /></span>
          </div>
          <div className="mt-4 flex items-center justify-between rounded-lg bg-zinc-50 dark:bg-white/[0.04] px-3 py-2 text-xs">
            <span className="truncate text-zinc-600 dark:text-zinc-400">{counts.pending ? 'Awaiting signatures' : 'Nothing pending'}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300">{counts.pending ? 'Action Required' : 'Clear'}</span>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold tracking-widest text-zinc-500">EXPIRED / TERMINATED</p>
              <p className="mt-1 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">{counts.past} Archived</p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-white/[0.06] text-zinc-500"><Archive className="h-5 w-5" /></span>
          </div>
          <div className="mt-4 flex items-center justify-between rounded-lg bg-zinc-50 dark:bg-white/[0.04] px-3 py-2 text-xs">
            <span className="text-zinc-600 dark:text-zinc-400">Past tenancies</span>
            <span className="rounded-full bg-zinc-200 dark:bg-white/[0.08] px-2 py-0.5 text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">Fully Discharged</span>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative max-w-lg flex-1">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by property name, tenancy ID, address, or deed ref…" className="h-10 pl-9 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-white/[0.08]" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-lg bg-zinc-100 dark:bg-zinc-900 p-1 text-xs font-medium">
              {(['all', 'active', 'pending', 'past'] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => setTab(k)}
                  className={`rounded-md px-3 py-1.5 capitalize ${tab === k ? 'bg-white dark:bg-zinc-800 text-primary dark:text-[#4edea3] shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}
                >
                  {k} ({k === 'all' ? counts.total : k === 'active' ? counts.active : k === 'pending' ? counts.pending : counts.past})
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const rows = filtered.map((a) => [deedRef(a.id), a.listing?.title ?? '', a.status, a.startDate ?? '', a.endDate ?? '', String(a.rentAmount)].join(','));
                const csv = ['Deed Ref,Property,Status,Start,End,Annual Rent', ...rows].join('\n');
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const el = document.createElement('a');
                el.href = url; el.download = 'agreements.csv'; el.click(); URL.revokeObjectURL(url);
              }}
            >
              <Download className="mr-1 h-4 w-4" /> Export
            </Button>
          </div>
        </div>
      </div>

      {/* Ledger table */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-zinc-50 dark:bg-white/[0.04] text-[11px] font-semibold tracking-widest text-zinc-500">
                <th className="px-4 py-3">Property &amp; Unit</th>
                <th className="px-4 py-3">Type &amp; Term</th>
                <th className="px-4 py-3">Start Date</th>
                <th className="px-4 py-3">End Date</th>
                <th className="px-4 py-3 text-right">Annual Rent</th>
                <th className="px-4 py-3">Statutory Status</th>
                <th className="px-4 py-3 text-center">Deed Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.06]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <FileText className="mx-auto h-10 w-10 text-zinc-400" />
                    <p className="mt-3 font-semibold text-zinc-900 dark:text-white">No agreements found</p>
                    <p className="mx-auto mt-1 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
                      {q || tab !== 'all' ? 'No agreements match your filters. Try clearing search or switching tabs.' : 'You don’t have any lease agreements yet. Agreements appear here once a landlord issues one for you.'}
                    </p>
                    {(q || tab !== 'all') && (
                      <Button variant="outline" size="sm" className="mt-4" onClick={() => { setQ(''); setTab('all'); }}>Clear filters</Button>
                    )}
                  </td>
                </tr>
              ) : (
                filtered.map((a) => {
                  const cover = a.listing?.images[0]?.url;
                  const dl = daysLeft(a.endDate);
                  const label = STATUS_LABEL[a.status] ?? a.status;
                  return (
                    <tr key={a.id} className="hover:bg-zinc-50/70 dark:hover:bg-white/[0.03]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900">
                            {cover ? <img src={cover} alt={a.listing?.title ?? ''} className="h-full w-full object-cover" /> : <span className="flex h-full w-full items-center justify-center text-zinc-400"><FileText className="h-5 w-5" /></span>}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">{a.listing?.title ?? '—'}</p>
                            <p className="truncate text-xs text-zinc-600 dark:text-zinc-400">{a.listing?.address ?? ''}{a.listing?.area ? ` • ${a.listing.area}` : ''}</p>
                            <p className="font-mono text-[11px] font-medium tracking-tight text-primary dark:text-[#4edea3]">Ref: {deedRef(a.id)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium capitalize text-zinc-900 dark:text-white">{a.type.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">{a.startDate && a.endDate ? `${formatDateLong(a.startDate)} → ${formatDateLong(a.endDate)}` : 'Term not set'}</p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-sm text-zinc-900 dark:text-white">{a.startDate ? formatDateLong(a.startDate) : '—'}</td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <p className="font-mono text-sm text-zinc-900 dark:text-white">{a.endDate ? formatDateLong(a.endDate) : '—'}</p>
                        {dl !== null && a.status === 'fully_signed' && dl >= 0 && dl <= 90 && (
                          <span className="mt-1 inline-flex rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-[var(--sovereign-hover)] dark:text-[#6ffbbe]">{dl} days left</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-mono text-sm font-semibold text-zinc-900 dark:text-white">{formatNairaFull(a.rentAmount)}</td>
                      <td className="whitespace-nowrap px-4 py-3"><StatusBadge status={label} /></td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                            <Link href={`/dashboard/tenant/agreements/${a.id}`} aria-label="View agreement"><Eye className="h-4 w-4" /></Link>
                          </Button>
                          {a.pdfUrl ? (
                            <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                              <a href={a.pdfUrl} target="_blank" rel="noreferrer" aria-label="Download deed"><Download className="h-4 w-4" /></a>
                            </Button>
                          ) : (
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-40" disabled aria-label="No deed yet"><Download className="h-4 w-4" /></Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="More"><MoreVertical className="h-4 w-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col items-center justify-between gap-3 border-t border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-white/[0.03] px-4 py-3 text-xs text-zinc-600 dark:text-zinc-400 sm:flex-row">
          <span>Showing {filtered.length} of {agreements.length} legal agreements</span>
          <span className="inline-flex items-center gap-1.5"><Scale className="h-3.5 w-3.5" /> Lagos State Tenancy Law 2011</span>
        </div>
      </div>

      {/* Legal notice */}
      <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary dark:text-[#4edea3]"><Scale className="h-5 w-5" /></span>
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-white">Lagos State Tenancy Law &amp; E-Signature Legal Enforceability <span className="ml-2 rounded bg-primary/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-[var(--sovereign-hover)] dark:text-[#6ffbbe]">Evidence Act Sec 93 &amp; 94</span></p>
              <p className="mt-1 max-w-3xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">All digital tenancy deeds executed on PropatiBox comply with the Nigerian Evidence Act (Sections 93 &amp; 94) and LASRERA. Documents bear tamper-proof SHA-256 timestamps and are registered for Stamp Duty attestation.</p>
            </div>
          </div>
          <div className="shrink-0 rounded-lg bg-zinc-50 dark:bg-white/[0.04] px-4 py-3 text-xs">
            <p className="font-semibold tracking-widest text-zinc-500">STATUTORY INQUIRIES DESK</p>
            <p className="mt-1 font-semibold text-zinc-900 dark:text-white">Barrister T. Adegbenro (LL.B, BL)</p>
            <a href="mailto:legal@propatibox.ng" className="text-primary hover:underline dark:text-[#4edea3]">legal@propatibox.ng</a>
          </div>
        </div>
      </div>
    </div>
  );
}
