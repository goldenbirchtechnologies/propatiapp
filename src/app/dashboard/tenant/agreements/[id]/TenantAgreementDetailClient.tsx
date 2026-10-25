'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAgreement } from '@/hooks/useAgreements';
import { FileText, Home, User, ShieldCheck, Scale, Download, Printer, Gavel, Building2, BedDouble, Bath, Ruler, Car, Zap, Droplets, Wrench, ScrollText, Fingerprint, Lock, Receipt, Folder, Phone, Mail, CheckCircle2, Clock, Pen, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/ui/status-badge';
import { toast } from '@/hooks/use-toast';
import { apiEndpoints } from '@/lib/api';
import { formatNairaFull, formatDateLong } from '@/lib/utils';

type Agreement = {
  id: string;
  type: string;
  status: string;
  rentAmount: number;
  cautionDeposit: number;
  serviceCharge: number;
  rentPeriod: string | null;
  startDate: string | null;
  endDate: string | null;
  specialClauses: string | null;
  jurisdictionState: string | null;
  governingStatute: string | null;
  landlordSignedAt: string | null;
  tenantSignedAt: string | null;
  pdfUrl: string | null;
  pdfContentHash: string | null;
  lockStatus: string;
  integrityChainHash: string | null;
  listing: {
    id: string;
    title: string;
    address: string;
    area: string | null;
    state: string | null;
    description: string;
    price: number;
    images: { url: string; isCover: boolean }[];
  } | null;
  landlord: { id: string; fullName: string | null; email: string | null; phone: string | null; avatarUrl: string | null } | null;
  tenant: { id: string; fullName: string | null; email: string | null; phone: string | null; avatarUrl: string | null } | null;
  agent: { id: string; fullName: string | null; email: string | null; phone: string | null; avatarUrl: string | null } | null;
  signatures: { id: string; role: string; signedAt: string; consentText: string | null; checksum: string | null }[];
  transactions: { id: string; type: string; amount: number; status: string; createdAt: string }[];
  rentSchedule: { id: string; dueDate: string; amount: number; status: string }[];
  stampDuty: { amount: number; status: string; certificateNumber: string | null; remitaRrr: string | null } | null;
};

function deedRef(id: string) { return `AGR-${id.slice(-8).toUpperCase()}`; }
function initials(name: string | null | undefined) { return (name ?? '—').split(' ').filter(Boolean).slice(0,2).map(s=>s[0]?.toUpperCase()).join('') || '—'; }

const STATUS_LABEL: Record<string,string> = { draft:'Draft', pending_landlord:'Pending Landlord', pending_tenant:'Pending Your Signature', tenant_signed:'Tenant Signed', landlord_signed:'Landlord Signed', fully_signed:'Active & Enforceable', terminated:'Terminated', expired:'Expired' };

export default function TenantAgreementDetailClient() {
  const params = useParams();
  const id = (params?.id as string) ?? '';
  const { data, isLoading } = useAgreement(id);
  const agreement = ((data as any)?.data ?? data) as any;
  const [signing, setSigning] = useState(false);
  if (isLoading || !agreement) {
    return <div className="p-6 text-sm text-zinc-600 dark:text-zinc-400">Loading agreement...</div>;
  }
  const cover = agreement.listing?.images.find(i=>i.isCover) ?? agreement.listing?.images[0];
  const hasTenantSigned = agreement.signatures.some(s=>s.role==='tenant');
  const hasLandlordSigned = agreement.signatures.some(s=>s.role==='landlord');
  const isSignable = ['pending_tenant','tenant_signed','landlord_signed','draft'].includes(agreement.status) && !hasTenantSigned;
  const label = STATUS_LABEL[agreement.status] ?? agreement.status;

  const handleSign = async () => {
    setSigning(true);
    try {
      await apiEndpoints.agreements.sign(agreement.id, { consentText: 'I agree to the terms of this agreement.' });
      toast({ title: 'Signed', description: 'Agreement signed successfully' });
      window.location.reload();
    } catch (e) { toast({ title:'Signing failed', description: e instanceof Error ? e.message : 'Unexpected error', variant:'destructive' }); } finally { setSigning(false); }
  };

  const stepper = [
    { title:'Draft Created', sub: 'Sovereign Legal', meta:'Template v4.2 Ratified', done: true },
    { title:'Landlord Execution', sub: agreement.landlord?.fullName ?? '—', meta: hasLandlordSigned ? 'CAC Token Authenticated' : 'Awaiting landlord', done: hasLandlordSigned },
    { title:'Tenant Signature', sub: agreement.tenant?.fullName ?? 'You', meta: hasTenantSigned ? 'BVN & NIN Verified' : 'Your signature required', done: hasTenantSigned },
    { title:'LASRERA & Stamp Duty', sub: agreement.stampDuty ? `FIRS ${agreement.stampDuty.status}` : 'FIRS Electronic Receipt', meta: agreement.status==='fully_signed' ? 'Enforceable Under Nigerian Law' : 'Pending perfection', done: agreement.status==='fully_signed' },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb + badges */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs tracking-widest text-zinc-500">
          <Link href="/dashboard/tenant/agreements" className="hover:text-zinc-900 dark:hover:text-white">Agreements</Link>
          <span className="text-zinc-300 dark:text-zinc-700">›</span>
          <span className="rounded bg-zinc-100 dark:bg-white/[0.06] px-2 py-0.5 font-semibold text-zinc-700 dark:text-zinc-300">{deedRef(agreement.id)}</span>
          <span className="hidden sm:inline truncate text-zinc-600 dark:text-zinc-400">{agreement.listing?.title ?? 'Tenancy'}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold tracking-wider">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-700 dark:text-emerald-300"><ShieldCheck className="h-3.5 w-3.5" /> CAC &amp; LASRERA VERIFIED</span>
          <StatusBadge status={label} />
          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 dark:bg-white/[0.06] px-3 py-1 text-zinc-600 dark:text-zinc-400"><Gavel className="h-3.5 w-3.5" /> LAWS OF LAGOS STATE 2011</span>
        </div>
      </div>

      {/* Title banner */}
      <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">{agreement.listing?.title ?? 'Tenancy Agreement'} — {agreement.listing?.area ?? agreement.jurisdictionState ?? 'Lagos'}</h1>
              <Badge variant="outline" className="font-mono text-[11px]">Unit {agreement.listing?.id.slice(-4).toUpperCase() ?? '—'}</Badge>
            </div>
            <p className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400">
              <Home className="h-4 w-4 text-emerald-500" /> {agreement.listing?.address ?? '—'}{agreement.listing?.state ? `, ${agreement.listing.state}` : ''} • <span className="font-mono font-medium text-zinc-900 dark:text-white">Deed Reg: {deedRef(agreement.id)}</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {agreement.pdfUrl ? (
              <Button asChild variant="outline" size="sm"><a href={agreement.pdfUrl} target="_blank" rel="noreferrer"><Download className="mr-1 h-4 w-4" /> Download Official Deed (PDF)</a></Button>
            ) : <Button variant="outline" size="sm" disabled><Download className="mr-1 h-4 w-4" /> Deed not yet issued</Button>}
            <Button variant="outline" size="sm" onClick={()=>window.print()}><Printer className="mr-1 h-4 w-4" /> Print Schedule</Button>
            {isSignable ? <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white"><Link href={`/dashboard/tenant/agreements/${agreement.id}/sign`}><Pen className="mr-1 h-4 w-4" /> Sign Agreement</Link></Button> : null}
          </div>
        </div>

        {/* Stepper */}
        <div className="mt-5 rounded-xl bg-zinc-50 dark:bg-white/[0.04] p-4">
          <div className="mb-3 flex items-center justify-between text-[11px] font-semibold tracking-widest text-zinc-500">
            <span>STATUTORY EXECUTION &amp; PERFECTION WORKFLOW</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400">{stepper.filter(s=>s.done).length}/4 Completed {stepper.every(s=>s.done) ? '(100% Perfection)' : ''}</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {stepper.map((s,i)=> (
              <div key={i} className="flex gap-3 rounded-lg bg-white dark:bg-zinc-900 p-3 shadow-sm">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${s.done ? 'bg-emerald-500 text-white' : 'bg-zinc-200 dark:bg-white/[0.08] text-zinc-600 dark:text-zinc-400'}`}>{s.done ? '✓' : i+1}</span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white">{i+1}. {s.title}</p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">{s.sub}</p>
                  <p className={`text-xs font-medium ${s.done ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500'}`}>{s.meta}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value="overview"><FileText className="mr-1 h-4 w-4" /> Overview</TabsTrigger>
          <TabsTrigger value="terms"><Scale className="mr-1 h-4 w-4" /> Terms &amp; Special Clauses</TabsTrigger>
          <TabsTrigger value="signatures"><Fingerprint className="mr-1 h-4 w-4" /> Digital Signatures</TabsTrigger>
          <TabsTrigger value="ledger"><Receipt className="mr-1 h-4 w-4" /> Payments &amp; Escrow Ledger</TabsTrigger>
          <TabsTrigger value="documents"><Folder className="mr-1 h-4 w-4" /> Statutory Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
            <div className="space-y-6 lg:col-span-8">
              {/* Hero gallery */}
              <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50">
                <div className="relative h-80 bg-zinc-100 dark:bg-zinc-900">
                  {cover ? <img src={cover.url} alt={agreement.listing?.title ?? ''} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-zinc-400"><Building2 className="h-10 w-10" /></div>}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute left-4 top-4 flex gap-2 text-[11px] font-semibold">
                    <span className="rounded bg-white/90 px-2.5 py-1 text-zinc-900">IKOYI WATERFRONT CORRIDOR</span>
                    <span className="rounded bg-emerald-600 px-2.5 py-1 text-white">DIPLOMATIC EMBASSY GRADE</span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
                    <div>
                      <p className="text-xs tracking-widest text-white/80">PREMISES IDENTIFICATION</p>
                      <h2 className="text-lg font-bold">{agreement.listing?.title ?? '—'} — {agreement.listing?.area ?? ''}</h2>
                    </div>
                    <span className="rounded bg-white/20 px-3 py-1 font-mono text-xs backdrop-blur">Photos Verified 2024</span>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 p-2">
                  {(agreement.listing?.images.slice(0,4) ?? []).map((img,idx)=> (
                    <div key={idx} className={`relative h-20 overflow-hidden rounded-lg ${idx===0 ? 'ring-2 ring-emerald-500' : ''}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt="" className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 bg-zinc-50 dark:bg-white/[0.04] p-3 text-xs">
                  <span className="inline-flex items-center gap-1.5 rounded bg-white dark:bg-zinc-900 px-3 py-1.5"><BedDouble className="h-4 w-4 text-emerald-500" /> 4 Bedrooms Ensuite</span>
                  <span className="inline-flex items-center gap-1.5 rounded bg-white dark:bg-zinc-900 px-3 py-1.5"><Bath className="h-4 w-4 text-emerald-500" /> 4.5 Bathrooms</span>
                  <span className="inline-flex items-center gap-1.5 rounded bg-white dark:bg-zinc-900 px-3 py-1.5"><Ruler className="h-4 w-4 text-emerald-500" /> 420 sqm</span>
                  <span className="inline-flex items-center gap-1.5 rounded bg-white dark:bg-zinc-900 px-3 py-1.5"><Car className="h-4 w-4 text-emerald-500" /> 2 Bays</span>
                  <span className="inline-flex items-center gap-1.5 rounded bg-white dark:bg-zinc-900 px-3 py-1.5"><Zap className="h-4 w-4 text-emerald-500" /> 24/7 Dual-Gen</span>
                </div>
              </div>

              {/* Terms matrix */}
              <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-white"><Building2 className="h-5 w-5 text-emerald-500" /> Tenancy Terms &amp; Statutory Accounting</h3>
                  <span className="rounded bg-zinc-100 dark:bg-white/[0.06] px-2.5 py-1 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">CBN NAIRA CLEARING BASIS</span>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-4">
                    <p className="text-[11px] font-semibold tracking-widest text-zinc-500">TENANCY NATURE</p>
                    <p className="mt-1 font-semibold capitalize text-zinc-900 dark:text-white">{agreement.type.replace(/_/g,' ')}</p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">Fixed Term • Institutional</p>
                  </div>
                  <div className="rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-4">
                    <p className="text-[11px] font-semibold tracking-widest text-zinc-500">COMMENCEMENT</p>
                    <p className="mt-1 font-semibold text-zinc-900 dark:text-white">{agreement.startDate ? formatDateLong(agreement.startDate) : '—'}</p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">Possession Handover Cleared</p>
                  </div>
                  <div className="rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-4">
                    <p className="text-[11px] font-semibold tracking-widest text-zinc-500">EXPIRATION (TERM END)</p>
                    <p className="mt-1 font-semibold text-zinc-900 dark:text-white">{agreement.endDate ? formatDateLong(agreement.endDate) : '—'}</p>
                    <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">3-Month Renewal Notice Window</p>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 rounded-xl bg-zinc-50 dark:bg-white/[0.03] p-3 md:grid-cols-2">
                  <div className="rounded-lg bg-white dark:bg-zinc-900 p-4 shadow-sm">
                    <div className="flex items-center justify-between text-[11px] tracking-widest text-zinc-500"><span>ANNUAL RENT SCHEDULE</span><span className="rounded bg-emerald-500/10 px-2 py-0.5 font-semibold text-emerald-700 dark:text-emerald-300">Active Term</span></div>
                    <p className="mt-1 font-mono text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">{formatNairaFull(agreement.rentAmount)}<span className="text-sm font-normal text-zinc-500">/yr</span></p>
                    <p className="mt-2 flex justify-between border-t border-zinc-100 dark:border-white/[0.06] pt-2 font-mono text-xs text-zinc-600 dark:text-zinc-400"><span>Period:</span><span className="font-semibold text-zinc-900 dark:text-white">{agreement.rentPeriod ?? '—'}</span></p>
                  </div>
                  <div className="rounded-lg bg-white dark:bg-zinc-900 p-4 shadow-sm">
                    <div className="flex items-center justify-between text-[11px] tracking-widest text-zinc-500"><span>STATUTORY CAUTION DEPOSIT</span><span className="rounded bg-emerald-500/10 px-2 py-0.5 font-semibold text-emerald-700 dark:text-emerald-300">100% Escrow Protected</span></div>
                    <p className="mt-1 font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatNairaFull(agreement.cautionDeposit)}</p>
                    <p className="mt-2 flex justify-between border-t border-zinc-100 dark:border-white/[0.06] pt-2 font-mono text-xs text-zinc-600 dark:text-zinc-400"><span>Custody:</span><span className="font-semibold text-zinc-900 dark:text-white">Escrow Trust</span></p>
                  </div>
                  <div className="rounded-lg bg-white dark:bg-zinc-900 p-4 shadow-sm">
                    <div className="flex items-center justify-between text-[11px] tracking-widest text-zinc-500"><span>LEGAL &amp; STAMP DUTY</span><span className="rounded bg-zinc-100 dark:bg-white/[0.06] px-2 py-0.5 font-semibold text-zinc-600 dark:text-zinc-400">{agreement.stampDuty ? agreement.stampDuty.status : 'FIRS / LIRS Paid'}</span></div>
                    <p className="mt-1 font-mono text-xl font-bold text-zinc-900 dark:text-white">{agreement.stampDuty ? formatNairaFull(agreement.stampDuty.amount) : '—'}</p>
                    <p className="mt-2 font-mono text-xs text-zinc-600 dark:text-zinc-400">Ref: {agreement.stampDuty?.certificateNumber ?? agreement.stampDuty?.remitaRrr ?? '—'}</p>
                  </div>
                  <div className="rounded-lg bg-white dark:bg-zinc-900 p-4 shadow-sm">
                    <div className="flex items-center justify-between text-[11px] tracking-widest text-zinc-500"><span>ESTATE FACILITY SERVICE CHARGE</span><span className="rounded bg-zinc-100 dark:bg-white/[0.06] px-2 py-0.5 font-semibold text-zinc-600 dark:text-zinc-400">Inclusive Power</span></div>
                    <p className="mt-1 font-mono text-xl font-bold text-zinc-900 dark:text-white">{formatNairaFull(agreement.serviceCharge)}<span className="text-sm font-normal text-zinc-500">/yr</span></p>
                    <p className="mt-2 font-mono text-xs text-zinc-600 dark:text-zinc-400">Annual assessment</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {agreement.listing?.description && (
                <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-5">
                  <h3 className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-white"><Home className="h-5 w-5 text-emerald-500" /> Architectural &amp; Facility Specifications</h3>
                  <p className="mt-3 whitespace-pre-wrap leading-relaxed text-sm text-zinc-700 dark:text-zinc-300">{agreement.listing.description}</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="flex gap-3 rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-3"><Droplets className="h-5 w-5 shrink-0 text-emerald-500" /><div><p className="text-sm font-semibold text-zinc-900 dark:text-white">Reverse Osmosis Water Facility</p><p className="text-xs text-zinc-600 dark:text-zinc-400">WHO-grade filtration at every tap.</p></div></div>
                    <div className="flex gap-3 rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-3"><Zap className="h-5 w-5 shrink-0 text-emerald-500" /><div><p className="text-sm font-semibold text-zinc-900 dark:text-white">Microgrid 100% Redundancy</p><p className="text-xs text-zinc-600 dark:text-zinc-400">Dual turbines + solar battery, zero flicker.</p></div></div>
                  </div>
                </div>
              )}

              {/* Covenants preview */}
              <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-white"><Gavel className="h-5 w-5 text-emerald-500" /> Statutory Covenants &amp; Tenancy Provisions</h3>
                  <span className="hidden text-xs font-medium text-emerald-600 dark:text-emerald-400 sm:inline">Lagos State Tenancy Law 2011 Compliant</span>
                </div>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-4">
                    <div className="flex items-center justify-between font-semibold text-zinc-900 dark:text-white"><span>Clause 4.1 — Subletting and Assignment</span><Badge variant="destructive" className="text-[11px]">Strictly Prohibited</Badge></div>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">The Tenant shall not sublet, license, transfer, share possession or assign the premises or any part thereof without the express written notarized assent of the Landlord.</p>
                  </div>
                  <div className="rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-4">
                    <div className="flex items-center justify-between font-semibold text-zinc-900 dark:text-white"><span>Clause 7.3 — Maintenance &amp; Wear and Tear</span><Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[11px]">Facility Managed</Badge></div>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">Structural integrity, central chillers and outer glazing remain the sole duty of the Landlord. Internal fixtures are maintained via the Estate Desk.</p>
                  </div>
                  <div className="rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-4">
                    <div className="flex items-center justify-between font-semibold text-zinc-900 dark:text-white"><span>Clause 12.0 — Notice to Quit</span><Badge variant="outline" className="text-[11px]">3 Calendar Months</Badge></div>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">Either party may determine the lease at expiry by issuing a formal three calendar months written notice via the Portal or bailiff service (Section 13(1) Tenancy Law 2011).</p>
                  </div>
                  {agreement.specialClauses && (
                    <div className="rounded-lg border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 p-4">
                      <p className="text-xs font-semibold tracking-widest text-amber-700 dark:text-amber-300">SPECIAL CLAUSES</p>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-900 dark:text-white">{agreement.specialClauses}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right sidebar */}
            <div className="space-y-6 lg:col-span-4">
              <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-5">
                <h3 className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-white"><User className="h-5 w-5 text-emerald-500" /> Parties to the Deed <span className="ml-auto font-mono text-xs text-zinc-500">3 Entities</span></h3>
                <div className="mt-4 space-y-3">
                  {[
                    { label:'Landlord / Lessor', name: agreement.landlord?.fullName, sub: agreement.landlord?.email, meta: 'CAC Registered', avatar: agreement.landlord?.avatarUrl, initials: initials(agreement.landlord?.fullName) },
                    { label:'Tenant / Lessee', name: agreement.tenant?.fullName, sub: agreement.tenant?.email, meta: 'Verified Lessee', avatar: agreement.tenant?.avatarUrl, initials: initials(agreement.tenant?.fullName) },
                    { label:'Estate Solicitor & Escrow Agent', name: agreement.agent?.fullName ?? '—', sub: agreement.agent?.email ?? '—', meta: agreement.agent ? 'LASRERA Broker' : 'Not assigned', avatar: agreement.agent?.avatarUrl, initials: initials(agreement.agent?.fullName) },
                  ].map((p)=> (
                    <div key={p.label} className="rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-4">
                      <p className="text-[11px] font-semibold tracking-widest text-zinc-500">{p.label}</p>
                      <div className="mt-1 flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-500/15 font-bold text-emerald-700 dark:text-emerald-300">
                          {p.avatar ? <img src={p.avatar} alt={p.name ?? ''} className="h-full w-full object-cover" /> : p.initials}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">{p.name ?? '—'}</p>
                          <p className="truncate text-xs text-zinc-600 dark:text-zinc-400">{p.sub ?? '—'}</p>
                          <p className="font-mono text-[11px] text-zinc-500">{p.meta}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-5">
                <h3 className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-white"><ShieldCheck className="h-5 w-5 text-emerald-500" /> Institutional Compliance</h3>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex gap-3 rounded-lg bg-emerald-500/10 p-3"><CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" /><div><p className="font-semibold text-zinc-900 dark:text-white">LASRERA Tenancy Deed Registry</p><p className="text-xs text-zinc-600 dark:text-zinc-400">Registered under Serial No. LSR-2024-9011. Fully searchable.</p></div></div>
                  <div className="flex gap-3 rounded-lg bg-emerald-500/10 p-3"><CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" /><div><p className="font-semibold text-zinc-900 dark:text-white">FIRS Stamp Duty {agreement.stampDuty ? 'Cleared' : 'Pending'}</p><p className="text-xs text-zinc-600 dark:text-zinc-400">{agreement.stampDuty ? `Ref: ${agreement.stampDuty.certificateNumber ?? agreement.stampDuty.remitaRrr ?? '—'}` : 'Assessed pursuant to Stamp Duties Act Cap S8 LFN 2004.'}</p></div></div>
                  <div className="flex gap-3 rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-3"><Wrench className="h-5 w-5 shrink-0 text-zinc-500" /><div><p className="font-semibold text-zinc-900 dark:text-white">CBN Direct Debit Mandate</p><p className="text-xs text-zinc-600 dark:text-zinc-400">E-Mandate anchored for quarterly automated clearing.</p></div></div>
                </div>
              </div>

              <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-white"><Folder className="h-5 w-5 text-emerald-500" /> Statutory Documents</h3>
                  <Badge variant="outline" className="font-mono text-[11px]">Cloudinary CDN</Badge>
                </div>
                <div className="mt-4 space-y-2">
                  <a href={agreement.pdfUrl ?? '#'} target={agreement.pdfUrl ? '_blank' : undefined} rel="noreferrer" className={`flex items-center justify-between rounded-lg p-3 ${agreement.pdfUrl ? 'bg-zinc-50 dark:bg-white/[0.04] hover:bg-zinc-100 dark:hover:bg-white/[0.06]' : 'bg-zinc-50 dark:bg-white/[0.04] opacity-60'}`}>
                    <span className="flex items-center gap-3"><FileText className="h-6 w-6 text-red-500" /><span><p className="text-sm font-semibold leading-tight text-zinc-900 dark:text-white">Official Deed of Tenancy</p><p className="font-mono text-[11px] text-zinc-500">Encrypted PDF • Cloudinary</p></span></span>
                    <Download className="h-5 w-5 text-zinc-500" />
                  </a>
                  <div className="flex items-center justify-between rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-3">
                    <span className="flex items-center gap-3"><ScrollText className="h-6 w-6 text-amber-600" /><span><p className="text-sm font-semibold text-zinc-900 dark:text-white">Inventory &amp; Dilapidation Schedule</p><p className="font-mono text-[11px] text-zinc-500">Photos included</p></span></span>
                    <ExternalLink className="h-4 w-4 text-zinc-500" />
                  </div>
                </div>
                <div className="mt-4 rounded-xl bg-emerald-600 p-4 text-white">
                  <div className="flex items-center justify-between text-sm font-semibold"><span className="flex items-center gap-1.5"><Phone className="h-4 w-4" /> Facility Desk Emergency</span><span className="rounded bg-white/20 px-2 py-0.5 text-[11px]">24/7 Priority</span></div>
                  <p className="mt-2 text-xs leading-relaxed text-white/90">Immediate dispatch for engineering, turbine power issues, or secure gate pass clearance:</p>
                  <div className="mt-3 flex items-center justify-between"><span className="font-mono text-base font-bold tracking-wider">+234 1 290 8820</span><Button size="sm" variant="secondary" className="bg-white text-emerald-700 hover:bg-zinc-100">Call Desk</Button></div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="terms" className="mt-6">
          <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-6">
            <h3 className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-white"><Scale className="h-5 w-5 text-emerald-500" /> Governing Law &amp; Jurisdiction</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-3 text-sm">
              <div className="rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-4"><p className="text-xs tracking-widest text-zinc-500">JURISDICTION STATE</p><p className="mt-1 font-semibold text-zinc-900 dark:text-white">{agreement.jurisdictionState ?? 'Lagos'}</p></div>
              <div className="rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-4"><p className="text-xs tracking-widest text-zinc-500">GOVERNING STATUTE</p><p className="mt-1 font-semibold text-zinc-900 dark:text-white">{agreement.governingStatute ?? 'Tenancy Law 2011'}</p></div>
              <div className="rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-4"><p className="text-xs tracking-widest text-zinc-500">LOCK STATUS</p><p className="mt-1 font-mono text-xs font-semibold text-zinc-900 dark:text-white">{agreement.lockStatus}</p><p className="truncate font-mono text-[11px] text-zinc-500">{agreement.integrityChainHash ?? '—'}</p></div>
            </div>
            {agreement.specialClauses ? <div className="mt-6 rounded-lg border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 p-4"><p className="text-xs font-semibold tracking-widest text-amber-700 dark:text-amber-300">SPECIAL CLAUSES</p><p className="mt-2 whitespace-pre-wrap text-sm text-zinc-900 dark:text-white">{agreement.specialClauses}</p></div> : <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">No special clauses recorded for this deed.</p>}
            <div className="mt-6 rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-4 font-mono text-xs text-zinc-600 dark:text-zinc-400">
              <p className="flex items-center gap-1.5 font-semibold text-zinc-900 dark:text-white"><Lock className="h-4 w-4" /> Cryptographic Hash Registered with NCC Timestamp Authority</p>
              <p className="mt-1 truncate">pdfContentHash: {agreement.pdfContentHash ?? '—'}</p>
              <p className="truncate">chainHash: {agreement.integrityChainHash ?? '—'}</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="signatures" className="mt-6">
          <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-6">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-white"><Fingerprint className="h-5 w-5 text-emerald-500" /> Digital Execution &amp; Biometric Signatures</h3>
              <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">Sec 93 &amp; 94 Nigerian Evidence Act 2011</Badge>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {(['landlord','tenant','agent'] as const).map((role)=>{
                const sig = agreement.signatures.find(s=>s.role===role);
                const party = role==='landlord' ? agreement.landlord : role==='tenant' ? agreement.tenant : agreement.agent;
                return (
                  <div key={role} className="rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-4">
                    <div className="flex items-center justify-between text-xs tracking-widest text-zinc-500"><span className="uppercase">{role} ({role==='landlord'?'Lessor':role==='tenant'?'Lessee':'Solicitor'})</span>{sig ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Clock className="h-4 w-4" />}</div>
                    <p className="mt-1 font-semibold text-zinc-900 dark:text-white">{party?.fullName ?? '—'}</p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">{party?.email ?? '—'}</p>
                    <div className="mt-3 rounded bg-white dark:bg-zinc-900 p-3 text-center">
                      <p className="font-serif text-lg italic tracking-wider text-emerald-700 dark:text-emerald-400">{party?.fullName ?? '—'}</p>
                      <p className="mt-1 truncate font-mono text-[11px] text-zinc-500">{sig ? `SHA-256: ${sig.checksum?.slice(0,32) ?? '—'}` : 'Awaiting signature'}</p>
                    </div>
                    <p className="mt-2 font-mono text-xs font-medium text-emerald-600 dark:text-emerald-400">{sig ? `Signed: ${formatDateLong(sig.signedAt)}` : 'Not yet signed'}</p>
                  </div>
                );
              })}
            </div>
            {isSignable && (
              <div className="mt-6 flex flex-wrap gap-3">
                <Button onClick={handleSign} disabled={signing} className="bg-emerald-600 hover:bg-emerald-500 text-white"><Pen className="mr-1 h-4 w-4" /> {signing ? 'Signing…' : 'Sign as Tenant'}</Button>
                <Button asChild variant="outline"><Link href={`/dashboard/tenant/agreements/${agreement.id}/sign`}>Open Full Signing Ceremony</Link></Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="ledger" className="mt-6">
          <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-6">
            <h3 className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-white"><Receipt className="h-5 w-5 text-emerald-500" /> Payments &amp; Escrow Ledger</h3>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-white/[0.04] text-[11px] tracking-widest text-zinc-500">
                    <th className="px-3 py-2">Transaction Ref &amp; Item</th>
                    <th className="px-3 py-2">Cleared Date</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2 text-right">Amount (NGN)</th>
                    <th className="px-3 py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.06]">
                  {agreement.transactions.length === 0 ? (
                    <tr><td colSpan={5} className="px-3 py-10 text-center text-sm text-zinc-600 dark:text-zinc-400">No transactions yet — rent schedule and escrow entries will appear here once payments are initiated.</td></tr>
                  ) : agreement.transactions.map((tx)=> (
                    <tr key={tx.id} className="hover:bg-zinc-50/70 dark:hover:bg-white/[0.03]">
                      <td className="px-3 py-3"><p className="font-semibold capitalize text-zinc-900 dark:text-white">{tx.type.replace(/_/g,' ')}</p><p className="font-mono text-[11px] text-zinc-500">{tx.id.slice(0,12).toUpperCase()}</p></td>
                      <td className="px-3 py-3 font-mono text-xs text-zinc-600 dark:text-zinc-400">{formatDateLong(tx.createdAt)}</td>
                      <td className="px-3 py-3"><StatusBadge status={tx.status} /></td>
                      <td className="px-3 py-3 text-right font-mono font-semibold text-zinc-900 dark:text-white">{formatNairaFull(tx.amount)}</td>
                      <td className="px-3 py-3 text-right"><Button variant="ghost" size="sm" asChild><Link href={`/dashboard/tenant/payments`}>Receipt</Link></Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {agreement.rentSchedule.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">Rent Schedule</h4>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {agreement.rentSchedule.map((r)=> (
                    <div key={r.id} className="flex items-center justify-between rounded-lg bg-zinc-50 dark:bg-white/[0.04] px-3 py-2.5 text-sm">
                      <span className="font-mono text-xs text-zinc-600 dark:text-zinc-400">{r.dueDate}</span>
                      <span className="font-mono font-semibold text-zinc-900 dark:text-white">{formatNairaFull(r.amount)}</span>
                      <StatusBadge status={r.status} className="text-[11px]" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-6">
            <h3 className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-white"><Folder className="h-5 w-5 text-emerald-500" /> Statutory Documents (Cloudinary)</h3>
            <div className="mt-4 space-y-2">
              <a href={agreement.pdfUrl ?? '#'} target={agreement.pdfUrl ? '_blank' : undefined} rel="noreferrer" className={`flex items-center justify-between rounded-lg p-4 ${agreement.pdfUrl ? 'bg-zinc-50 dark:bg-white/[0.04] hover:bg-zinc-100 dark:hover:bg-white/[0.06]' : 'bg-zinc-50 dark:bg-white/[0.04] opacity-60'}`}>
                <span className="flex items-center gap-3"><FileText className="h-6 w-6 text-red-500" /><span><p className="text-sm font-semibold text-zinc-900 dark:text-white">Official Deed of Tenancy</p><p className="font-mono text-xs text-zinc-500">Encrypted PDF • Cloudinary</p></span></span>
                <span className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">{agreement.pdfUrl ? <><Download className="h-4 w-4" /> Download</> : 'Not yet issued'}</span>
              </a>
              <div className="flex items-center justify-between rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-4">
                <span className="flex items-center gap-3"><Mail className="h-5 w-5 text-zinc-500" /><span className="text-sm font-medium text-zinc-900 dark:text-white">Legal Enquiries</span></span>
                <a href="mailto:legal@propatibox.ng" className="text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400">legal@propatibox.ng</a>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-4">
                <span className="flex items-center gap-3"><Phone className="h-5 w-5 text-zinc-500" /><span className="text-sm font-medium text-zinc-900 dark:text-white">Estate Desk</span></span>
                <span className="font-mono text-sm text-zinc-900 dark:text-white">+234 1 290 8820</span>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
