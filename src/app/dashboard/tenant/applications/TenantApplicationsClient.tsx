'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, Clock, CheckCircle, XCircle, Eye, Loader2, ShieldCheck, Search, Download, Filter, ArrowUpRight, Mail, Phone, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { formatNairaFull, formatDateLong } from '@/lib/utils';

type AppStatus = 'pending' | 'under_review' | 'accepted' | 'rejected' | 'withdrawn';

type Application = {
  id: string;
  status: AppStatus;
  stage: string | null;
  message: string | null;
  landlordNotes: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  reviewedAt: string | null;
  listing: {
    id: string;
    title: string;
    address: string;
    area: string;
    state: string;
    price: string;
    pricePeriod: string | null;
    listingType: string;
    images: { url: string; isCover: boolean }[];
  };
  landlord: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl: string | null;
  };
};

const STATUS_META: Record<AppStatus, { label: string; badgeStatus: string; hint: string }> = {
  pending: { label: 'Pending Review', badgeStatus: 'Pending Review', hint: 'Escrow deposit secured' },
  under_review: { label: 'Under Review (KYC)', badgeStatus: 'Under Review', hint: 'Credit bureau verification' },
  accepted: { label: 'Accepted / Approved', badgeStatus: 'Approved', hint: 'Tenancy Deed Issued' },
  rejected: { label: 'Not Successful', badgeStatus: 'Rejected', hint: 'Let to earlier applicant' },
  withdrawn: { label: 'Withdrawn', badgeStatus: 'Closed', hint: 'Escrow released' },
};

function deedRef(id: string) { return `APP-${id.slice(-8).toUpperCase()}`; }
function initials(name: string) { return name.split(' ').filter(Boolean).slice(0,2).map(s=>s[0]?.toUpperCase()).join('') || '—'; }

export default function TenantApplicationsClient({ applications: initial }: { applications: Application[] }) {
  const [applications, setApplications] = useState(initial);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'all'|'pending'|'under_review'|'accepted'|'rejected'>('all');
  const [isPending, startTransition] = useTransition();
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [withdrawTarget, setWithdrawTarget] = useState<Application | null>(null);
  const router = useRouter();

  const counts = useMemo(() => ({
    pending: applications.filter(a=>a.status==='pending').length,
    underReview: applications.filter(a=>a.status==='under_review').length,
    accepted: applications.filter(a=>a.status==='accepted').length,
    rejected: applications.filter(a=>a.status==='rejected').length,
    total: applications.length,
  }), [applications]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return applications.filter(a => {
      const byStatus = filter==='all' ? true : a.status===filter;
      if (!byStatus) return false;
      if (!term) return true;
      const hay = [a.listing.title, a.listing.area, a.listing.address, a.landlord.fullName, a.id, deedRef(a.id)].join(' ').toLowerCase();
      return hay.includes(term);
    });
  }, [applications, filter, q]);

  function handleWithdraw(id: string) {
    setWithdrawingId(id);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/applications/${id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ status:'withdrawn' }) });
        if (!res.ok) { const d = await res.json().catch(()=>({error:'Failed'})); toast.error(d.error || 'Failed to withdraw'); return; }
        setApplications(prev => prev.map(a=> a.id===id ? { ...a, status:'withdrawn' as AppStatus } : a));
        toast.success('Application withdrawn — escrow released');
        router.refresh();
      } catch { toast.error('Something went wrong'); } finally { setWithdrawingId(null); setWithdrawTarget(null); }
    });
  }

  const exportCsv = () => {
    const rows = filtered.map(a => [deedRef(a.id), a.listing.title, a.listing.area, a.landlord.fullName, a.status, a.createdAt, a.listing.price].join(','));
    const csv = ['Deed Ref,Property,Area,Landlord,Status,Applied,Price', ...rows].join('\n');
    const blob = new Blob([csv], { type:'text/csv' });
    const url = URL.createObjectURL(blob);
    const el = document.createElement('a'); el.href=url; el.download='applications.csv'; el.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb + badges */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-widest text-zinc-500">
          <span>Dashboard</span><span className="text-zinc-300 dark:text-zinc-700">›</span>
          <span>Applications &amp; Screening</span><span className="text-zinc-300 dark:text-zinc-700">›</span>
          <span className="text-zinc-900 dark:text-white">My Applications</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium">
          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 dark:bg-white/[0.06] px-2.5 py-1 text-zinc-600 dark:text-zinc-400"><ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> CAC Verified Tenants</span>
          <span className="hidden text-zinc-300 dark:text-zinc-700 sm:inline">•</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 dark:bg-white/[0.06] px-2.5 py-1 text-zinc-600 dark:text-zinc-400">LASRERA Leasing Framework</span>
          <span className="hidden text-zinc-300 dark:text-zinc-700 sm:inline">•</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 dark:bg-white/[0.06] px-2.5 py-1 text-zinc-600 dark:text-zinc-400">Credit &amp; KYC Vetted</span>
        </div>
      </div>

      {/* Title */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">My Applications</h1>
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-300">{counts.total} Total</span>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">Track the real-time vetting and approval status of your rental applications across prime Lagos and Abuja residential and commercial estates.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm"><Link href="/listings"><Building2 className="mr-1 h-4 w-4" /> Browse Verified Properties <ArrowUpRight className="h-4 w-4" /></Link></Button>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-5">
          <div className="absolute inset-x-0 top-0 h-1 bg-amber-400" />
          <div className="flex items-start justify-between">
            <div><p className="text-[11px] font-semibold tracking-widest text-zinc-500">PENDING REVIEW</p><p className="mt-1 text-xl font-bold text-zinc-900 dark:text-white">{counts.pending} Applications</p></div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300"><Clock className="h-5 w-5" /></span>
          </div>
          <p className="mt-4 flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400"><span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" /> Awaiting estate desk &amp; agent review</p>
        </div>
        <div className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-5">
          <div className="absolute inset-x-0 top-0 h-1 bg-blue-500" />
          <div className="flex items-start justify-between">
            <div><p className="text-[11px] font-semibold tracking-widest text-zinc-500">UNDER REVIEW</p><p className="mt-1 text-xl font-bold text-zinc-900 dark:text-white">{counts.underReview} In Vetting</p></div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300"><ShieldCheck className="h-5 w-5" /></span>
          </div>
          <p className="mt-4 flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400"><span className="h-2 w-2 rounded-full bg-blue-500" /> BVN, CAC &amp; employment cross-check</p>
        </div>
        <div className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-5">
          <div className="absolute inset-x-0 top-0 h-1 bg-emerald-500" />
          <div className="flex items-start justify-between">
            <div><p className="text-[11px] font-semibold tracking-widest text-zinc-500">APPROVED</p><p className="mt-1 text-xl font-bold text-emerald-600 dark:text-emerald-400">{counts.accepted} Offer Ready</p></div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"><CheckCircle className="h-5 w-5" /></span>
          </div>
          <p className="mt-4 flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400"><CheckCircle className="h-4 w-4" /> Tenancy deeds waiting for signature</p>
        </div>
        <div className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-5">
          <div className="absolute inset-x-0 top-0 h-1 bg-red-500" />
          <div className="flex items-center justify-between">
            <div><p className="text-[11px] font-semibold tracking-widest text-zinc-500">NOT SUCCESSFUL</p><p className="mt-1 text-xl font-bold text-zinc-900 dark:text-white">{counts.rejected} Archived</p></div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400"><XCircle className="h-5 w-5" /></span>
          </div>
          <p className="mt-4 flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400"><span className="h-2 w-2 rounded-full bg-red-500" /> Caution escrow released instantly</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-3">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-1 text-xs font-medium">
            {([
              ['all','All Applications', counts.total],
              ['pending','Pending', counts.pending],
              ['under_review','Under Review', counts.underReview],
              ['accepted','Accepted', counts.accepted],
              ['rejected','Not Successful', counts.rejected],
            ] as const).map(([k,label,n])=> (
              <button key={k} onClick={()=>setFilter(k as any)} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 ${filter===k ? 'bg-emerald-600 text-white shadow-sm' : 'bg-zinc-100 dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-white/[0.08]'}`}>
                {label} <span className={`rounded-full px-1.5 py-0.5 font-mono text-[11px] ${filter===k ? 'bg-white/20 text-white' : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'}`}>{n}</span>
              </button>
            ))}
          </div>
          <div className="flex flex-1 items-center gap-2 xl:max-w-md">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <Input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search property, area, landlord, or ID…" className="h-10 pl-9 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-white/[0.08]" />
            </div>
            <Button variant="outline" size="sm" onClick={exportCsv}><Download className="mr-1 h-4 w-4" /> Export</Button>
          </div>
        </div>
      </div>

      {/* Ledger */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-zinc-50 dark:bg-white/[0.04] text-[11px] font-semibold tracking-widest text-zinc-500">
                <th className="px-4 py-3">Property &amp; Unit Details</th>
                <th className="px-4 py-3">Landlord / Principal</th>
                <th className="px-4 py-3">Applied Date &amp; Tracking</th>
                <th className="px-4 py-3">Compliance Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.06]">
              {filtered.length===0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <Building2 className="mx-auto h-10 w-10 text-zinc-400" />
                    <p className="mt-3 font-semibold text-zinc-900 dark:text-white">No applications found</p>
                    <p className="mx-auto mt-1 max-w-md text-sm text-zinc-600 dark:text-zinc-400">No applications match your filters. Try clearing search or switching tabs.</p>
                    <Button variant="outline" size="sm" className="mt-4" onClick={()=>{ setQ(''); setFilter('all'); }}>Clear filters</Button>
                  </td>
                </tr>
              ) : filtered.map(app => {
                const cover = app.listing.images[0]?.url;
                const meta = STATUS_META[app.status] ?? STATUS_META.pending;
                const isWithdrawable = app.status==='pending' || app.status==='under_review';
                const isWithdrawing = withdrawingId===app.id && isPending;
                const isAccepted = app.status==='accepted';
                return (
                  <tr key={app.id} className={`hover:bg-zinc-50/70 dark:hover:bg-white/[0.03] ${isAccepted ? 'bg-emerald-500/[0.03]' : ''}`}>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900">
                          {cover ? <img src={cover} alt={app.listing.title} className="h-full w-full object-cover" /> : <span className="flex h-full w-full items-center justify-center text-zinc-400"><Building2 className="h-6 w-6" /></span>}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">{app.listing.title}</p>
                          <p className="flex items-center gap-1 truncate text-xs text-zinc-600 dark:text-zinc-400">{app.listing.area}, {app.listing.state}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">{formatNairaFull(Number(app.listing.price))}</span>
                            <span className="text-[11px] text-zinc-500">/ {app.listing.pricePeriod ?? 'annum'}</span>
                            <Badge variant="outline" className="text-[10px] uppercase">{app.listing.listingType.replace(/_/g,' ')}</Badge>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-100 dark:bg-white/[0.08] font-semibold text-zinc-700 dark:text-zinc-300">
                          {app.landlord.avatarUrl ? <img src={app.landlord.avatarUrl} alt={app.landlord.fullName} className="h-full w-full object-cover" /> : initials(app.landlord.fullName)}
                        </span>
                        <div className="min-w-0">
                          <p className="flex items-center gap-1 truncate text-sm font-semibold text-zinc-900 dark:text-white">{app.landlord.fullName} <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-500" /></p>
                          <p className="flex items-center gap-1 truncate text-xs text-zinc-600 dark:text-zinc-400"><Mail className="h-3 w-3" /> {app.landlord.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">{formatDateLong(app.createdAt)}</p>
                      <p className="font-mono text-xs tracking-wider text-zinc-500">#{deedRef(app.id)}</p>
                      <p className="flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400"><Clock className="h-3 w-3" /> {app.reviewedAt ? `Reviewed ${formatDateLong(app.reviewedAt)}` : 'Awaiting review'}</p>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={meta.badgeStatus} />
                      <p className="mt-1 text-[11px] text-zinc-600 dark:text-zinc-400">{meta.hint}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button asChild variant="outline" size="sm" className="h-8"><Link href={`/dashboard/tenant/applications/${app.id}`}><Eye className="mr-1 h-4 w-4" /> View</Link></Button>
                        {isAccepted ? (
                          <Button asChild size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-500 text-white"><Link href={`/dashboard/tenant/applications/${app.id}`}>Review Lease <ArrowUpRight className="h-3.5 w-3.5" /></Link></Button>
                        ) : isWithdrawable ? (
                          <Button variant="ghost" size="sm" className="h-8 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10" onClick={()=>setWithdrawTarget(app)} disabled={isWithdrawing}>
                            {isWithdrawing ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <XCircle className="mr-1 h-3 w-3" />} Withdraw
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" className="h-8" asChild><Link href={`/dashboard/tenant/applications/${app.id}`}><Info className="mr-1 h-4 w-4" /> Details</Link></Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col items-center justify-between gap-3 border-t border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-white/[0.03] px-4 py-3 text-xs text-zinc-600 dark:text-zinc-400 sm:flex-row">
          <span>Showing {filtered.length} of {applications.length} entries • <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400"><ShieldCheck className="h-3.5 w-3.5" /> Paystack Escrow Protection Active</span></span>
          <span className="font-mono text-[11px] text-zinc-500">LASRERA • NDPR • NIBSS</span>
        </div>
      </div>

      {/* Regulatory assurance + help */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-5 lg:col-span-2">
          <div className="flex gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"><ShieldCheck className="h-5 w-5" /></span>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Nigerian Real Estate Tenancy &amp; Screening Standards (LASRERA &amp; NDPR)</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">Regulated under Lagos State Real Estate Regulatory Authority Law &amp; Data Protection Framework</p>
              <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">All tenancy applications adhere to biometric BVN and NIN KYC compliance. Caution deposits are retained in audited NIBSS escrow and released within 60 minutes if an application is closed or withdrawn.</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-3 text-xs">
                <span className="flex items-center gap-2 rounded-lg bg-zinc-50 dark:bg-white/[0.04] px-3 py-2.5"><ShieldCheck className="h-4 w-4 text-emerald-500" /> NIBSS / CBN Escrow</span>
                <span className="flex items-center gap-2 rounded-lg bg-zinc-50 dark:bg-white/[0.04] px-3 py-2.5"><Building2 className="h-4 w-4 text-emerald-500" /> LASRERA Tenancy Bill</span>
                <span className="flex items-center gap-2 rounded-lg bg-zinc-50 dark:bg-white/[0.04] px-3 py-2.5"><Filter className="h-4 w-4 text-emerald-500" /> NDPR Protected</span>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-5">
          <p className="flex items-center gap-2 text-[11px] font-bold tracking-widest text-emerald-600 dark:text-emerald-400"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> Estate Screening Desk Online</p>
          <h3 className="mt-2 font-semibold text-zinc-900 dark:text-white">Need help with your application?</h3>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Speak with our compliance liaison officers regarding document verification or CAC guarantor requirements.</p>
          <div className="mt-4 space-y-2 text-sm">
            <a href="mailto:support@propatibox.ng" className="flex items-center justify-between rounded-lg bg-zinc-50 dark:bg-white/[0.04] px-3 py-2.5 hover:bg-zinc-100 dark:hover:bg-white/[0.06]"><span className="flex items-center gap-2"><Mail className="h-4 w-4 text-emerald-500" /> support@propatibox.ng</span><ArrowUpRight className="h-4 w-4 text-zinc-500" /></a>
            <a href="tel:+23412908820" className="flex items-center justify-between rounded-lg bg-zinc-50 dark:bg-white/[0.04] px-3 py-2.5 hover:bg-zinc-100 dark:hover:bg-white/[0.06]"><span className="flex items-center gap-2"><Phone className="h-4 w-4 text-emerald-500" /> +234 1 290 8820 (Ext. 4)</span><span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">24/7 Desk</span></a>
          </div>
        </div>
      </div>

      <Dialog open={!!withdrawTarget} onOpenChange={(o)=> !o && setWithdrawTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-300"><XCircle className="h-5 w-5" /> Withdraw Application?</DialogTitle>
            <DialogDescription>Are you sure you want to withdraw your application for <strong className="text-zinc-900 dark:text-white">{withdrawTarget?.listing.title}</strong>? This will void your priority reservation.</DialogDescription>
          </DialogHeader>
          <div className="rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-4 text-sm">
            <p className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-white"><ShieldCheck className="h-4 w-4 text-emerald-500" /> Instant Escrow Refund Guarantee</p>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">Your caution deposit will be instantly released back to your original settlement account via Paystack / NIBSS.</p>
            <p className="mt-2 font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">Tracking ID: #{withdrawTarget ? deedRef(withdrawTarget.id) : '—'}</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={()=>setWithdrawTarget(null)}>Keep Application</Button>
            <Button variant="destructive" onClick={()=> withdrawTarget && handleWithdraw(withdrawTarget.id)} disabled={isPending}><XCircle className="mr-1 h-4 w-4" /> Confirm Withdrawal</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
