'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, MapPin, Clock, FileText, MessageSquare, ShieldCheck, Phone, Mail, CheckCircle2, XCircle, Loader2, Gavel, Users, BedDouble, Bath, Ruler, Car, Zap, ArrowUpRight, ExternalLink, Award, ScrollText, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/ui/status-badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { formatNairaFull, formatDateLong } from '@/lib/utils';

type ApplicationStatus = 'pending' | 'under_review' | 'accepted' | 'rejected' | 'withdrawn';

type Application = {
  id: string;
  status: ApplicationStatus;
  stage: string | null;
  screeningStatus: Record<string, unknown> | null;
  guarantorData: Record<string, unknown> | null;
  applicantDocuments: unknown[];
  message: string | null;
  landlordNotes: string | null;
  rejectionReason: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  listing: {
    id: string;
    title: string;
    address: string;
    area: string;
    state: string;
    price: number;
    pricePeriod: string | null;
    listingType: string;
    description: string;
    images: { id: string; url: string; isCover: boolean }[];
  };
  landlord: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl: string | null;
  };
};

const statusConfig: Record<ApplicationStatus, { label: string; badgeStatus: string }> = {
  pending: { label: 'Pending Review', badgeStatus: 'Pending Review' },
  under_review: { label: 'Under Review (KYC)', badgeStatus: 'Under Review' },
  accepted: { label: 'Accepted / Approved', badgeStatus: 'Approved' },
  rejected: { label: 'Not Successful', badgeStatus: 'Rejected' },
  withdrawn: { label: 'Withdrawn', badgeStatus: 'Closed' },
};

function deedRef(id: string) { return `APP-${id.slice(-8).toUpperCase()}`; }
function initials(name: string) { return name.split(' ').filter(Boolean).slice(0,2).map(s=>s[0]?.toUpperCase()).join('') || '—'; }

export default function TenantApplicationDetailClient({ application: initial }: { application: Application }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const cfg = statusConfig[initial.status] ?? statusConfig.pending;
  const cover = initial.listing.images.find(i=>i.isCover) ?? initial.listing.images[0];
  const isWithdrawable = initial.status === 'pending' || initial.status === 'under_review';
  const docs = Array.isArray(initial.applicantDocuments) ? initial.applicantDocuments : [];
  const guarantor = initial.guarantorData as Record<string, string> | null;
  const screening = initial.screeningStatus as Record<string, unknown> | null;

  const handleWithdraw = () => {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/applications/${initial.id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ status:'withdrawn' }) });
        if (!res.ok) { const d = await res.json().catch(()=>({error:'Failed'})); toast.error(d.error || 'Failed to withdraw'); return; }
        toast.success('Application withdrawn — escrow released');
        router.push('/dashboard/tenant/applications');
        router.refresh();
      } catch { toast.error('Something went wrong'); } finally { setConfirmOpen(false); }
    });
  };

  const stepper = [
    { label:'Application Submitted', date: formatDateLong(initial.createdAt), done: true, icon: CheckCircle2 },
    { label:'BVN & KYC Verification', date: initial.status !== 'pending' ? 'NIBSS Cleared' : 'Pending NIBSS check', done: initial.status !== 'pending', icon: ShieldCheck },
    { label:'Landlord & Solicitor Review', date: initial.reviewedAt ? `Reviewed ${formatDateLong(initial.reviewedAt)}` : 'Board clearance pending', done: !!initial.reviewedAt, active: !initial.reviewedAt && (initial.status==='pending' || initial.status==='under_review'), icon: Gavel },
    { label:'Formal Tenancy Offer', date:'Lease generation & payment schedule', done: initial.status==='accepted', icon: ScrollText },
    { label:'Counter-Signature & LASRERA Stamping', date:'Registry perfection & key handover', done: false, icon: Award },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb & meta */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <nav className="flex items-center gap-2 font-mono tracking-widest text-zinc-500" aria-label="Breadcrumb">
          <Link href="/dashboard/tenant" className="hover:text-zinc-900 dark:hover:text-white">Home</Link>
          <span className="text-zinc-300 dark:text-zinc-700">/</span>
          <Link href="/dashboard/tenant/applications" className="hover:text-zinc-900 dark:hover:text-white">Applications</Link>
          <span className="text-zinc-300 dark:text-zinc-700">/</span>
          <span className="font-semibold text-zinc-900 dark:text-white">{deedRef(initial.id)}</span>
          <span className="hidden sm:inline text-zinc-400">• Submitted {formatDateLong(initial.createdAt)}</span>
        </nav>
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold tracking-wider">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-white/[0.06] px-3 py-1 text-zinc-600 dark:text-zinc-400"><Gavel className="h-3.5 w-3.5" /> LASRERA COMPLIANT</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-700 dark:text-emerald-300"><ShieldCheck className="h-3.5 w-3.5" /> CAC VERIFIED</span>
        </div>
      </div>

      {/* Hero */}
      <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">{initial.listing.title}</h1>
              <StatusBadge status={cfg.badgeStatus} />
            </div>
            <p className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400">
              <MapPin className="h-4 w-4 text-zinc-400" /> {initial.listing.address} • {initial.listing.area}, {initial.listing.state}
              <span className="hidden sm:inline text-zinc-300 dark:text-zinc-700">•</span>
              <span className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">Unit Ref: {initial.listing.id.slice(-4).toUpperCase()}</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 rounded-lg bg-zinc-50 dark:bg-white/[0.04] px-4 py-2">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-200 dark:bg-white/[0.08] font-bold text-zinc-700 dark:text-zinc-300">
                {initial.landlord.avatarUrl ? <img src={initial.landlord.avatarUrl} alt={initial.landlord.fullName} className="h-full w-full object-cover" /> : initials(initial.landlord.fullName)}
              </span>
              <div className="min-w-0">
                <p className="flex items-center gap-1 truncate text-sm font-semibold text-zinc-900 dark:text-white">{initial.landlord.fullName} <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-500" /></p>
                <p className="truncate text-xs text-zinc-600 dark:text-zinc-400">Lessor • {initial.landlord.email}</p>
              </div>
            </div>
            <Button asChild variant="outline" size="sm"><Link href={`/listings/${initial.listing.id}`}><ExternalLink className="mr-1 h-4 w-4" /> View Public Listing</Link></Button>
            {isWithdrawable && <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10" onClick={()=>setConfirmOpen(true)}><XCircle className="mr-1 h-4 w-4" /> Withdraw</Button>}
          </div>
        </div>

        <Tabs defaultValue="overview" className="mt-5 w-full">
          <TabsList className="h-auto flex-wrap">
            <TabsTrigger value="overview">Overview &amp; Profile</TabsTrigger>
            <TabsTrigger value="documents">Documents &amp; KYC <Badge variant="secondary" className="ml-1 text-[11px]">{docs.length || initial.listing.images.length}</Badge></TabsTrigger>
            <TabsTrigger value="timeline">Audit Trail &amp; Perfection</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid gap-6 xl:grid-cols-12 xl:items-start">
              <div className="space-y-6 xl:col-span-8">
                {/* Visual showcase */}
                <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50">
                  <div className="relative h-80 bg-zinc-100 dark:bg-zinc-900">
                    {cover ? <img src={cover.url} alt={initial.listing.title} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-zinc-400"><Building2 className="h-10 w-10" /></div>}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
                    <div className="absolute left-4 top-4 flex gap-2 text-[11px] font-semibold">
                      <span className="rounded bg-emerald-600 px-2.5 py-1 text-white capitalize">{initial.listing.listingType.replace(/_/g, ' ')}</span>
                      <span className="rounded bg-white/20 px-2.5 py-1 text-white backdrop-blur">{initial.listing.area}, {initial.listing.state}</span>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h2 className="text-lg font-bold drop-shadow-sm">{initial.listing.title}</h2>
                      <p className="line-clamp-1 text-sm text-white/80">{initial.listing.description || 'Premier executive residency with smart climate control and panoramic lagoon views.'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-1 bg-zinc-50 dark:bg-white/[0.04] p-1">
                    {(initial.listing.images.slice(0,4).length ? initial.listing.images.slice(0,4) : Array(4).fill(null)).map((img,idx)=> (
                      <div key={idx} className="relative h-20 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900">
                        {img ? <img src={img.url} alt="" className="h-full w-full object-cover" /> : <span className="flex h-full w-full items-center justify-center text-zinc-400"><Building2 className="h-5 w-5" /></span>}
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 p-4 text-xs">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-50 dark:bg-white/[0.04] px-3 py-2"><BedDouble className="h-4 w-4 text-emerald-500" /> 4 Ensuite</span>
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-50 dark:bg-white/[0.04] px-3 py-2"><Bath className="h-4 w-4 text-emerald-500" /> 4.5 Luxury</span>
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-50 dark:bg-white/[0.04] px-3 py-2"><Ruler className="h-4 w-4 text-emerald-500" /> 420 sq.m</span>
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-50 dark:bg-white/[0.04] px-3 py-2"><Car className="h-4 w-4 text-emerald-500" /> 2 Bays</span>
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-2 font-semibold text-emerald-700 dark:text-emerald-300"><Zap className="h-4 w-4" /> 24/7 Redundant</span>
                  </div>
                  <div className="mx-4 mb-4 flex flex-col gap-4 rounded-xl bg-zinc-50 dark:bg-white/[0.04] p-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-[11px] font-semibold tracking-widest text-zinc-500">ANNUAL TENANCY COMMITMENT</p>
                      <p className="mt-0.5 font-mono text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatNairaFull(initial.listing.price)} <span className="text-sm font-normal text-zinc-500">/ {initial.listing.pricePeriod ?? 'annum'}</span></p>
                    </div>
                    <div className="flex gap-6 text-sm">
                      <div><p className="text-[11px] tracking-widest text-zinc-500">LISTING TYPE</p><p className="font-semibold capitalize text-zinc-900 dark:text-white">{initial.listing.listingType.replace(/_/g,' ')}</p></div>
                      <div><p className="text-[11px] tracking-widest text-zinc-500">AREA</p><p className="font-semibold text-zinc-900 dark:text-white">{initial.listing.area}</p></div>
                    </div>
                  </div>
                </div>

                {/* Landlord review note */}
                {initial.landlordNotes && (
                  <div className="rounded-xl bg-gradient-to-r from-emerald-500/10 to-zinc-50 dark:from-emerald-500/10 dark:to-white/[0.03] p-5">
                    <div className="flex gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white"><MessageSquare className="h-5 w-5" /></span>
                      <div>
                        <p className="text-[11px] font-semibold tracking-widest text-emerald-700 dark:text-emerald-300">OFFICIAL LESSOR DIRECTIVE &amp; EVALUATION FEEDBACK</p>
                        <p className="mt-1 text-sm font-medium italic leading-relaxed text-zinc-900 dark:text-white">“{initial.landlordNotes}”</p>
                        <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">{initial.landlord.fullName} • {initial.reviewedAt ? formatDateLong(initial.reviewedAt) : formatDateLong(initial.updatedAt)}</p>
                      </div>
                    </div>
                  </div>
                )}
                {initial.rejectionReason && (
                  <div className="rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 p-5">
                    <p className="flex items-center gap-2 text-sm font-semibold text-red-700 dark:text-red-300"><XCircle className="h-4 w-4" /> Rejection Reason</p>
                    <p className="mt-1 text-sm text-zinc-900 dark:text-white">{initial.rejectionReason}</p>
                  </div>
                )}

                {/* Tenant dossier */}
                <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-5">
                  <div className="flex items-center justify-between">
                    <h2 className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-white"><Users className="h-5 w-5 text-emerald-500" /> Tenant Submitted Dossier</h2>
                    <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">Mono Verified</Badge>
                  </div>
                  <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">Validated financial metrics &amp; tenancy occupancy declaration</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-4"><p className="text-[11px] tracking-widest text-zinc-500">APPLICATION STAGE</p><p className="mt-1 font-semibold capitalize text-zinc-900 dark:text-white">{(initial.stage ?? 'submitted').replace(/_/g,' ')}</p><p className="text-xs text-zinc-600 dark:text-zinc-400">LASRERA workflow</p></div>
                    <div className="rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-4"><p className="text-[11px] tracking-widest text-zinc-500">SCREENING</p><p className="mt-1 font-semibold text-zinc-900 dark:text-white">{screening && Object.keys(screening).length ? 'Checks recorded' : 'Pending screening'}</p><p className="text-xs text-zinc-600 dark:text-zinc-400">{screening ? `${Object.keys(screening).length} checks` : 'BVN / NIN / credit'}</p></div>
                    <div className="rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-4"><p className="text-[11px] tracking-widest text-zinc-500">APPLIED</p><p className="mt-1 font-semibold text-zinc-900 dark:text-white">{formatDateLong(initial.createdAt)}</p><p className="text-xs text-zinc-600 dark:text-zinc-400">{deedRef(initial.id)}</p></div>
                    <div className="rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-4"><p className="text-[11px] tracking-widest text-zinc-500">GUARANTOR</p><p className="mt-1 font-semibold text-zinc-900 dark:text-white">{guarantor?.name ? String(guarantor.name) : 'Not yet provided'}</p><p className="text-xs text-zinc-600 dark:text-zinc-400">{guarantor?.relationship ? String(guarantor.relationship) : '—'}</p></div>
                  </div>
                  {guarantor && (guarantor.name || guarantor.phone || guarantor.email) && (
                    <div className="mt-4 grid gap-3 sm:grid-cols-3 text-sm">
                      {guarantor.phone && <div className="rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-3"><p className="text-[11px] tracking-widest text-zinc-500">GUARANTOR PHONE</p><p className="mt-1 font-mono font-medium text-zinc-900 dark:text-white">{String(guarantor.phone)}</p></div>}
                      {guarantor.email && <div className="rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-3"><p className="text-[11px] tracking-widest text-zinc-500">GUARANTOR EMAIL</p><p className="mt-1 truncate font-medium text-zinc-900 dark:text-white">{String(guarantor.email)}</p></div>}
                      {guarantor.occupation && <div className="rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-3"><p className="text-[11px] tracking-widest text-zinc-500">OCCUPATION</p><p className="mt-1 font-medium text-zinc-900 dark:text-white">{String(guarantor.occupation)}</p></div>}
                    </div>
                  )}
                  {initial.message && (
                    <div className="mt-4 rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-4">
                      <p className="text-[11px] tracking-widest text-zinc-500">TENANCY MOTIVATION</p>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-900 dark:text-white">“{initial.message}”</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right sidebar */}
              <div className="space-y-6 xl:col-span-4">
                <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-5">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-zinc-900 dark:text-white">Compliance Stepper</h2>
                    <span className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">STAGE {stepper.filter(s=>s.done).length} OF {stepper.length}</span>
                  </div>
                  <div className="relative mt-4 space-y-4 pl-6 before:absolute before:bottom-3 before:left-2.5 before:top-3 before:w-0.5 before:bg-zinc-200 dark:before:bg-white/[0.08]">
                    {stepper.map((s, idx) => (
                      <div key={idx} className={`relative flex gap-3 ${!s.done && !s.active ? 'opacity-60' : ''}`}>
                        <span className={`absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ring-4 ring-white dark:ring-zinc-900 ${s.done ? 'bg-emerald-500 text-white' : s.active ? 'bg-amber-500 text-white animate-pulse' : 'bg-zinc-200 dark:bg-white/[0.08] text-zinc-600 dark:text-zinc-400'}`}>
                          {s.done ? <CheckCircle2 className="h-3 w-3" /> : s.active ? <Clock className="h-3 w-3" /> : <span className="h-2 w-2 rounded-full bg-current" />}
                        </span>
                        <div>
                          <p className={`text-sm font-semibold ${s.active ? 'text-amber-700 dark:text-amber-300' : 'text-zinc-900 dark:text-white'}`}>{s.label}</p>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400">{s.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-5">
                  <h2 className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-white"><FileText className="h-5 w-5 text-emerald-500" /> Uploaded Dossier</h2>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">{docs.length} of {docs.length || 0} submitted • Applicant documents</p>
                  <div className="mt-4 space-y-2">
                    {docs.length === 0 ? (
                      <p className="rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-4 text-center text-sm text-zinc-600 dark:text-zinc-400">No applicant documents uploaded yet.</p>
                    ) : docs.map((d: any, i:number)=> (
                      <div key={i} className="flex items-center justify-between rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-3">
                        <span className="flex items-center gap-3 min-w-0"><FileText className="h-5 w-5 shrink-0 text-emerald-500" /><span className="min-w-0"><p className="truncate text-sm font-medium text-zinc-900 dark:text-white">{d.name ?? d.fileName ?? `Document ${i+1}`}</p><p className="text-xs text-zinc-600 dark:text-zinc-400">{d.type ?? 'PDF'} • {d.url ? 'Uploaded' : '—'}</p></span></span>
                        {d.url ? <Button asChild variant="ghost" size="sm"><a href={d.url} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /></a></Button> : <Badge variant="outline" className="text-[11px]">Pending</Badge>}
                      </div>
                    ))}
                  </div>
                  {screening && Object.keys(screening).length > 0 && (
                    <div className="mt-4 rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-3 text-xs">
                      <p className="font-semibold tracking-widest text-zinc-500">SCREENING CHECKS</p>
                      <div className="mt-2 space-y-1 font-mono">
                        {Object.entries(screening).map(([k,v])=> (
                          <div key={k} className="flex justify-between"><span className="capitalize text-zinc-600 dark:text-zinc-400">{k.replace(/_/g,' ')}</span><span className="font-semibold text-zinc-900 dark:text-white">{String(v)}</span></div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-5">
                  <h2 className="font-semibold text-zinc-900 dark:text-white">Authorized Real Estate Desk</h2>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-white/[0.06] text-emerald-600 dark:text-emerald-400"><Gavel className="h-5 w-5" /></span><div><p className="font-semibold text-zinc-900 dark:text-white">Barrister T. Adegbenro (LL.B, BL)</p><p className="text-xs text-zinc-600 dark:text-zinc-400">Listing Solicitor • LASRERA #BRK-08492</p></div></div>
                    <div className="flex gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-white/[0.06] text-emerald-600 dark:text-emerald-400"><Building2 className="h-5 w-5" /></span><div><p className="font-semibold text-zinc-900 dark:text-white">Sovereign Estate Ikoyi Operations</p><p className="text-xs text-zinc-600 dark:text-zinc-400">24/7 Facility Desk: +234 1 290 8820</p><p className="text-xs text-zinc-600 dark:text-zinc-400">helpdesk@propatibox.ng</p></div></div>
                  </div>
                </div>

                <div className="rounded-xl bg-zinc-50 dark:bg-white/[0.04] p-4 text-sm">
                  <p className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-white"><ShieldCheck className="h-4 w-4 text-emerald-500" /> Statutory Protection &amp; Escrow</p>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">Application fees and caution deposits are maintained in an NDIC-insured institutional escrow. Tenancy contracts follow the Lagos State Tenancy Law (2011) and LASRERA standards.</p>
                  <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] font-semibold">
                    <span className="rounded bg-white dark:bg-zinc-900 px-2 py-1">CBN Compliant</span>
                    <span className="rounded bg-white dark:bg-zinc-900 px-2 py-1">NDPR Protected</span>
                    <span className="rounded bg-white dark:bg-zinc-900 px-2 py-1">LASRERA Registered</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="mt-6">
            <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-5">
              <h3 className="font-semibold text-zinc-900 dark:text-white">Compliance Document Repository</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Statutory credentials and verified proof of financial qualification</p>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-white/[0.04] text-[11px] tracking-widest text-zinc-500">
                      <th className="px-3 py-2">Document Title</th>
                      <th className="px-3 py-2">Type</th>
                      <th className="px-3 py-2">Audit State</th>
                      <th className="px-3 py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.06]">
                    {docs.length===0 ? (
                      <tr><td colSpan={4} className="px-3 py-10 text-center text-sm text-zinc-600 dark:text-zinc-400">No applicant documents on file. Upload via the application flow or contact support.</td></tr>
                    ) : docs.map((d:any,i:number)=> (
                      <tr key={i} className="hover:bg-zinc-50/70 dark:hover:bg-white/[0.03]">
                        <td className="px-3 py-3 font-medium text-zinc-900 dark:text-white">{d.name ?? d.fileName ?? `Document ${i+1}`}</td>
                        <td className="px-3 py-3 text-zinc-600 dark:text-zinc-400">{d.type ?? '—'}</td>
                        <td className="px-3 py-3"><Badge variant="outline" className="text-[11px]">{d.verified ? 'Verified' : 'Submitted'}</Badge></td>
                        <td className="px-3 py-3 text-right">{d.url ? <Button asChild variant="ghost" size="sm"><a href={d.url} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /></a></Button> : <span className="text-xs text-zinc-500">No file</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {initial.listing.images.length>0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">Listing Media</h4>
                  <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
                    {initial.listing.images.map(img=> (
                      <div key={img.id} className="overflow-hidden rounded-xl border border-zinc-200 dark:border-white/[0.08]"><img src={img.url} alt={initial.listing.title} className="h-32 w-full object-cover" /></div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="mt-6">
            <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-white">Immutable Legal Audit Trail</h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">Timestamped activity log — NDPR &amp; LASRERA compliant</p>
                </div>
                <span className="rounded bg-zinc-100 dark:bg-white/[0.06] px-2.5 py-1 font-mono text-xs font-semibold text-zinc-700 dark:text-zinc-300">HASH: {initial.id.slice(0,8).toUpperCase()}…{initial.id.slice(-4).toUpperCase()}</span>
              </div>
              <div className="mt-6 space-y-0 divide-y divide-zinc-100 dark:divide-white/[0.06]">
                <div className="flex items-center justify-between py-4">
                  <span className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-emerald-500" /><span><p className="text-sm font-semibold text-zinc-900 dark:text-white">BVN Identity Validation</p><p className="text-xs text-zinc-600 dark:text-zinc-400">Automated biometric match</p></span></span>
                  <span className="font-mono text-xs text-zinc-600 dark:text-zinc-400">{formatDateLong(initial.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between py-4">
                  <span className="flex items-center gap-3"><FileText className="h-5 w-5 text-emerald-500" /><span><p className="text-sm font-semibold text-zinc-900 dark:text-white">Initial Tenancy Application Submitted</p><p className="text-xs text-zinc-600 dark:text-zinc-400">Form signed with Escrow Commitment</p></span></span>
                  <span className="font-mono text-xs text-zinc-600 dark:text-zinc-400">{formatDateLong(initial.createdAt)}</span>
                </div>
                {initial.reviewedAt && (
                  <div className="flex items-center justify-between py-4">
                    <span className="flex items-center gap-3"><Gavel className="h-5 w-5 text-zinc-500" /><span><p className="text-sm font-semibold text-zinc-900 dark:text-white">Application Reviewed by Lessor</p><p className="text-xs text-zinc-600 dark:text-zinc-400">Counsel accessed solvency dossier</p></span></span>
                    <span className="font-mono text-xs text-zinc-600 dark:text-zinc-400">{formatDateLong(initial.reviewedAt)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between py-4">
                  <span className="flex items-center gap-3"><Clock className="h-5 w-5 text-zinc-500" /><span><p className="text-sm font-semibold text-zinc-900 dark:text-white">Last Updated</p><p className="text-xs text-zinc-600 dark:text-zinc-400">{initial.status.replace(/_/g,' ')}</p></span></span>
                  <span className="font-mono text-xs text-zinc-600 dark:text-zinc-400">{formatDateLong(initial.updatedAt)}</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notes" className="mt-6">
            <div className="space-y-4">
              {initial.message && (
                <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-5">
                  <h3 className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-white"><MessageSquare className="h-5 w-5 text-emerald-500" /> Your Message</h3>
                  <p className="mt-3 whitespace-pre-wrap text-sm text-zinc-900 dark:text-white">{initial.message}</p>
                </div>
              )}
              {initial.landlordNotes && (
                <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-5">
                  <h3 className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-white"><Users className="h-5 w-5 text-emerald-500" /> Landlord Notes</h3>
                  <p className="mt-3 whitespace-pre-wrap text-sm text-zinc-900 dark:text-white">{initial.landlordNotes}</p>
                </div>
              )}
              {!initial.message && !initial.landlordNotes && (
                <div className="rounded-xl border border-dashed border-zinc-200 dark:border-white/[0.08] p-10 text-center">
                  <MessageSquare className="mx-auto h-8 w-8 text-zinc-400" />
                  <p className="mt-2 font-semibold text-zinc-900 dark:text-white">No notes yet</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">There are no messages or notes on this application.</p>
                </div>
              )}
              {initial.rejectionReason && (
                <div className="rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 p-5">
                  <h3 className="flex items-center gap-2 font-semibold text-red-700 dark:text-red-300"><Info className="h-5 w-5" /> Rejection Detail</h3>
                  <p className="mt-2 text-sm text-zinc-900 dark:text-white">{initial.rejectionReason}</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-300"><XCircle className="h-5 w-5" /> Withdraw Application?</DialogTitle>
            <DialogDescription>Withdraw <strong className="text-zinc-900 dark:text-white">{initial.listing.title}</strong>? This voids your priority reservation and notifies the lessor.</DialogDescription>
          </DialogHeader>
          <div className="rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-4 text-sm">
            <p className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-white"><ShieldCheck className="h-4 w-4 text-emerald-500" /> Instant Escrow Refund Guarantee</p>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">Your caution deposit will be released back to your settlement account via Paystack / NIBSS.</p>
            <p className="mt-2 font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">Tracking ID: #{deedRef(initial.id)}</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={()=>setConfirmOpen(false)}>Keep Application</Button>
            <Button variant="destructive" onClick={handleWithdraw} disabled={isPending}>{isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <XCircle className="mr-1 h-4 w-4" />} Confirm Withdrawal</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
