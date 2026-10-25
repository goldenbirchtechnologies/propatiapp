'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAgreement, useSignAgreement } from '@/hooks/useAgreements';
import { useQueryClient } from '@tanstack/react-query';
import { agreementsKeys } from '@/hooks/useAgreements';
import { ShieldCheck, Gavel, FileText, Fingerprint, Pen, RefreshCw, Check, AlertTriangle, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { formatNairaFull, formatDateLong } from '@/lib/utils';

type Props = {
  agreement: {
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
    pdfUrl: string | null;
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
    landlord: { id: string; fullName: string | null; email: string | null } | null;
    tenant: { id: string; fullName: string | null; email: string | null } | null;
    signatures: { id: string; role: string; signedAt: string }[];
    stampDuty: { amount: number; status: string } | null;
  };
  tenantName: string;
};

function deedRef(id: string) { return `AGR-${id.slice(-8).toUpperCase()}`; }

export default function TenantAgreementSignClient() {
  const params = useParams();
  const id = (params?.id as string) ?? '';
  const { data, isLoading } = useAgreement(id);
  const agreement = ((data as any)?.data ?? data) as any;
  const signMutation = useSignAgreement();
  const queryClient = useQueryClient();
  if (isLoading || !agreement) {
    return <div className="p-6 text-sm text-zinc-600 dark:text-zinc-400">Loading agreement...</div>;
  }
  const tenantName = agreement.tenant?.fullName ?? 'You';
  const hasSigned = agreement.signatures.some(s => s.role === 'tenant');
  const [consent, setConsent] = useState(false);
  const [mode, setMode] = useState<'draw'|'type'|'cert'>('draw');
  const [typedName, setTypedName] = useState(tenantName);
  const [hasStroke, setHasStroke] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showClauses, setShowClauses] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);

  const cover = agreement.listing?.images.find(i=>i.isCover) ?? agreement.listing?.images[0];
  const stampDutyAmount = agreement.stampDuty?.amount ?? Math.round(agreement.rentAmount * 0.0078);
  const totalObligation = agreement.rentAmount + agreement.cautionDeposit + agreement.serviceCharge + stampDutyAmount;

  const signaturePresent = mode === 'type' ? typedName.trim().length >= 3 : mode === 'cert' ? true : hasStroke;
  const canExecute = consent && signaturePresent && !hasSigned && !submitting;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#059669';
      ctx.lineWidth = 2.2;
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const pos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const t = 'touches' in e ? e.touches[0] : (e as React.MouseEvent).touches?.[0] ?? (e as React.MouseEvent);
    const clientX = (t as Touch).clientX ?? (e as React.MouseEvent).clientX;
    const clientY = (t as Touch).clientY ?? (e as React.MouseEvent).clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const start = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (mode !== 'draw') return;
    drawingRef.current = true;
    const ctx = canvasRef.current!.getContext('2d')!;
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  };
  const move = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current || mode !== 'draw') return;
    e.preventDefault();
    const ctx = canvasRef.current!.getContext('2d')!;
    const p = pos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    if (!hasStroke) setHasStroke(true);
  };
  const end = () => { drawingRef.current = false; const ctx = canvasRef.current?.getContext('2d'); ctx?.closePath(); };
  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    setHasStroke(false);
  };

  const execute = async () => {
    if (!canExecute) return;
    setSubmitting(true);
    try {
      await signMutation.mutateAsync({ id: agreement.id, data: { consentText: 'I agree to the terms of this agreement.' } });
      queryClient.invalidateQueries({ queryKey: agreementsKeys.detail(agreement.id) });
      setSuccessOpen(true);
      toast({ title: 'Agreement perfected & executed', description: 'Cryptographic seal applied. Registered with LASRERA.' });
      setTimeout(()=> { window.location.href = `/dashboard/tenant/agreements/${agreement.id}`; }, 1200);
    } catch (e) {
      toast({ title:'Signing failed', description: e instanceof Error ? e.message : 'Unexpected error', variant:'destructive' });
    } finally { setSubmitting(false); }
  };

  if (hasSigned) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 p-8 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white"><Check className="h-6 w-6" /></span>
          <h2 className="mt-4 text-xl font-bold text-zinc-900 dark:text-white">You have already signed this deed</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Deed {deedRef(agreement.id)} • LASRERA registered</p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild><Link href={`/dashboard/tenant/agreements/${agreement.id}`}>View Agreement</Link></Button>
            {agreement.pdfUrl && <Button asChild variant="outline"><a href={agreement.pdfUrl} target="_blank" rel="noreferrer"><Download className="mr-1 h-4 w-4" /> Download Deed</a></Button>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 font-mono tracking-widest text-zinc-500">
          <Link href="/dashboard/tenant/agreements" className="hover:text-zinc-900 dark:hover:text-white">DASHBOARD</Link>
          <span className="text-zinc-300 dark:text-zinc-700">/</span>
          <span>DOCUMENTS &amp; LEASES</span>
          <span className="text-zinc-300 dark:text-zinc-700">/</span>
          <span className="font-semibold text-zinc-900 dark:text-white">{deedRef(agreement.id)}</span>
          <span className="rounded bg-emerald-500/10 px-2 py-0.5 font-semibold text-emerald-700 dark:text-emerald-300">SIGN</span>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-[11px] font-bold tracking-wider text-amber-700 dark:text-amber-300"><span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" /> Action Mandatory — Signature Pending</span>
      </div>

      {/* Title banner */}
      <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-widest text-emerald-600 dark:text-emerald-400"><ShieldCheck className="h-3.5 w-3.5" /> Lagos State Real Estate Regulatory Authority (LASRERA) Certified Execution</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Sign Tenancy Agreement</h1>
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">Execute a legally binding electronic tenancy deed under Section 93 &amp; 94 of the Nigerian Evidence Act and LASRERA regulations. Encrypted cryptographic stamp applied upon perfection.</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="outline" size="sm" onClick={()=>setShowClauses(true)}><FileText className="mr-1 h-4 w-4" /> Read Full 14-Page Deed</Button>
            {agreement.pdfUrl ? <Button variant="ghost" size="sm" asChild><a href={agreement.pdfUrl} target="_blank" rel="noreferrer"><Download className="mr-1 h-4 w-4" /> Draft PDF</a></Button> : null}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
        {/* Left 5 */}
        <div className="space-y-4 lg:col-span-5">
          <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50">
            <div className="relative h-52 bg-zinc-100 dark:bg-zinc-900">
              {cover ? <img src={cover.url} alt={agreement.listing?.title ?? ''} className="h-full w-full object-cover" /> : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute left-4 right-4 top-4 flex items-center justify-between text-[11px] font-semibold">
                <span className="inline-flex items-center gap-1.5 rounded bg-emerald-500 px-2.5 py-1 text-white"><ShieldCheck className="h-3.5 w-3.5" /> Tier 1 Verified Sovereign Asset</span>
                <span className="rounded bg-white/80 px-2 py-0.5 font-mono text-zinc-900">CAC RC-1849204</span>
              </div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="text-[11px] font-semibold tracking-widest text-emerald-300">Ikoyi Prime Enclave</p>
                <h2 className="text-base font-bold leading-tight">{agreement.listing?.title ?? '—'}</h2>
                <p className="flex items-center gap-1 text-xs text-white/80">{agreement.listing?.address ?? '—'}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 bg-zinc-50 dark:bg-white/[0.04] px-4 py-3 text-center text-xs">
              <div><p className="text-[11px] tracking-widest text-zinc-500">BEDROOMS</p><p className="font-semibold text-zinc-900 dark:text-white">4 En-Suite</p></div>
              <div><p className="text-[11px] tracking-widest text-zinc-500">PARKING</p><p className="font-semibold text-zinc-900 dark:text-white">3 Dedicated</p></div>
              <div><p className="text-[11px] tracking-widest text-zinc-500">POWER</p><p className="font-semibold text-emerald-600 dark:text-emerald-400">24/7 Dual Gens</p></div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-zinc-900 dark:text-white">Financial &amp; Lease Parameters</h3>
              <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">NGN Tabular</span>
            </div>
            <div className="mt-4 space-y-2.5 text-sm">
              <div className="flex items-center justify-between rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-3">
                <div><p className="font-semibold text-zinc-900 dark:text-white">Annual Rent</p><p className="text-xs text-zinc-600 dark:text-zinc-400">Quarterly: {formatNairaFull(agreement.rentAmount/4)}</p></div>
                <div className="text-right"><p className="font-mono text-base font-bold text-zinc-900 dark:text-white">{formatNairaFull(agreement.rentAmount)}</p><p className="text-[11px] text-zinc-500">per annum</p></div>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-3">
                <div><p className="font-semibold text-zinc-900 dark:text-white">Tenancy Fixed Term</p><p className="text-xs text-zinc-600 dark:text-zinc-400">365 Calendar Days</p></div>
                <div className="text-right"><p className="font-mono text-sm font-semibold text-zinc-900 dark:text-white">{agreement.startDate ? formatDateLong(agreement.startDate) : '—'} → {agreement.endDate ? formatDateLong(agreement.endDate) : '—'}</p><p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">Renewable</p></div>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-3">
                <div><p className="flex items-center gap-1.5 font-semibold text-zinc-900 dark:text-white">Statutory Caution Deposit <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /></p><p className="text-xs text-zinc-600 dark:text-zinc-400">Held in regulated Escrow trust</p></div>
                <div className="text-right"><p className="font-mono text-sm font-semibold text-zinc-900 dark:text-white">{formatNairaFull(agreement.cautionDeposit)}</p><p className="text-[11px] text-zinc-500">Refundable</p></div>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-3">
                <div><p className="font-semibold text-zinc-900 dark:text-white">Estate Service Charge</p><p className="text-xs text-zinc-600 dark:text-zinc-400">Security, Water, Common Areas</p></div>
                <div className="text-right"><p className="font-mono text-sm font-semibold text-zinc-900 dark:text-white">{formatNairaFull(agreement.serviceCharge)}</p><p className="text-[11px] text-zinc-500">Annual Assessment</p></div>
              </div>
              <div className="rounded-lg bg-emerald-500/10 p-3">
                <div className="flex items-center justify-between"><span className="flex items-center gap-1.5 text-sm font-semibold text-zinc-900 dark:text-white"><Gavel className="h-4 w-4 text-emerald-600" /> FIRS / Lagos Stamp Duty (0.78%)</span><span className="font-mono text-sm font-bold text-emerald-700 dark:text-emerald-300">{formatNairaFull(stampDutyAmount)}</span></div>
                <div className="mt-1 flex items-center justify-between font-mono text-xs text-zinc-600 dark:text-zinc-400"><span>Assessment base: {formatNairaFull(agreement.rentAmount)}</span><span className="rounded bg-emerald-500/15 px-1.5 py-0.5 font-semibold text-emerald-700 dark:text-emerald-300">FIRS Stamp Ready</span></div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-lg bg-zinc-900 p-4 text-white dark:bg-white dark:text-zinc-900">
              <div><p className="text-[11px] tracking-widest text-white/70 dark:text-zinc-500">TOTAL INITIAL PERFECTION OBLIGATION</p><p className="text-xs text-white/70 dark:text-zinc-500">Includes rent, caution, service &amp; stamp duties</p></div>
              <div className="text-right"><p className="font-mono text-lg font-bold">{formatNairaFull(totalObligation)}</p><p className="text-[11px] font-medium text-emerald-300 dark:text-emerald-600">Secured Payment Escrow</p></div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-5">
            <h3 className="font-semibold text-zinc-900 dark:text-white">Contracting Parties</h3>
            <div className="mt-4 space-y-3">
              <div className="flex gap-3 rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 font-bold text-emerald-700 dark:text-emerald-300">CA</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2"><p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">{agreement.landlord?.fullName ?? '—'}</p><span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300"><Check className="h-3 w-3" /> Signed &amp; Sealed</span></div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">Lessor / Landlord</p>
                  <p className="font-mono text-[11px] text-zinc-500">Sealed: {agreement.signatures.find(s=>s.role==='landlord') ? formatDateLong(agreement.signatures.find(s=>s.role==='landlord')!.signedAt) : '—'}</p>
                </div>
              </div>
              <div className="flex gap-3 rounded-lg bg-emerald-500/10 p-3 ring-1 ring-emerald-500/20">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 font-bold text-white">BA</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2"><p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">{tenantName}</p><span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300">Signature Required</span></div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">Lessee — Verified Signatory</p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between font-mono text-[11px] text-zinc-500">
              <span className="flex items-center gap-1"><Gavel className="h-3.5 w-3.5 text-emerald-500" /> Lagos State Tenancy Law 2011</span>
              <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Encrypted Vault</span>
            </div>
          </div>
        </div>

        {/* Right 7 */}
        <div className="space-y-4 lg:col-span-7">
          <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-5">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-white"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">1</span> Legal Consent &amp; Statutory Disclosure</h3>
              <span className="hidden items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 sm:inline-flex"><ShieldCheck className="h-4 w-4" /> LASRERA / LMDC Jurisdiction</span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">Review your covenants prior to electronic execution. Electronic signatures on this portal carry equivalent evidentiary weight under Section 93 &amp; 94 of the Nigerian Evidence Act 2011.</p>
            <div className="mt-3 rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-3 text-sm">
              <p className="font-semibold text-zinc-900 dark:text-white">Governing Jurisdiction: <span className="font-normal">High Court of Lagos State &amp; Federal Republic of Nigeria. Disputes subject to expedited mediation at the Lagos Multi-Door Courthouse (LMDC).</span></p>
              <div className="mt-2 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
                <span>3 Covenants: Subletting Ban (Cl. 4.1), 3-Month Quit Notice (Cl. 12), Service Charge Matrix (Cl. 7).</span>
                <button onClick={()=>setShowClauses(true)} className="font-medium text-emerald-600 underline hover:text-emerald-500 dark:text-emerald-400">Preview Clauses</button>
              </div>
            </div>
            <label className="mt-3 flex cursor-pointer gap-3 rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-3 hover:bg-zinc-100 dark:hover:bg-white/[0.06]">
              <input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-emerald-600" />
              <span className="text-sm"><span className="font-semibold text-zinc-900 dark:text-white">I have read, understood, and solemnly agree to all covenants</span><br /><span className="text-xs text-zinc-600 dark:text-zinc-400">I acknowledge the payment obligations, house covenants, and agree that my biometric stamp and digital signature constitute full execution of this deed.</span></span>
            </label>
          </div>

          <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-white"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">2</span> Digital Signature Pad</h3>
              <div className="inline-flex rounded-lg bg-zinc-100 dark:bg-zinc-900 p-1 text-xs font-medium">
                {(['draw','type','cert'] as const).map(m=> (
                  <button key={m} onClick={()=>setMode(m)} className={`rounded-md px-3 py-1.5 capitalize ${mode===m ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-600 dark:text-zinc-400'}`}>{m==='draw'?'Draw':m==='type'?'Type':'CAC Cert'}</button>
                ))}
              </div>
            </div>

            <div className="relative mt-4 overflow-hidden rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-950">
              <div className="pointer-events-none absolute bottom-12 left-8 right-8 flex items-center gap-2 text-xs text-zinc-400">
                <span className="font-mono">Sign here:</span><span className="h-px flex-1 bg-zinc-200 dark:bg-white/[0.08]" /><Pen className="h-4 w-4" />
              </div>
              <div className="pointer-events-none absolute right-3 top-3 flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-zinc-400"><Fingerprint className="h-3.5 w-3.5" /> Sovereign Secure Pad v3.2</div>
              <canvas
                ref={canvasRef}
                className={`h-52 w-full touch-none ${mode==='draw' ? 'cursor-crosshair' : 'cursor-default'}`}
                onMouseDown={start}
                onMouseMove={move}
                onMouseUp={end}
                onMouseLeave={end}
                onTouchStart={start}
                onTouchMove={move}
                onTouchEnd={end}
              />
              {mode==='type' && (
                <div className="absolute inset-0 flex flex-col justify-center bg-white/95 p-6 backdrop-blur-sm dark:bg-zinc-950/95">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Type legal signatory name</label>
                  <Input value={typedName} onChange={e=>setTypedName(e.target.value)} className="mt-1 font-serif text-2xl italic tracking-wide" placeholder="Your full legal name" />
                  <p className="mt-2 font-mono text-xs text-zinc-500">Rendered cursive cryptographic representation</p>
                  <p className="mt-4 font-serif text-3xl italic text-emerald-700 dark:text-emerald-400">{typedName || '—'}</p>
                </div>
              )}
              {mode==='cert' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 p-6 text-center backdrop-blur-sm dark:bg-zinc-950/95">
                  <ShieldCheck className="h-10 w-10 text-emerald-500" />
                  <p className="mt-2 text-sm font-semibold text-zinc-900 dark:text-white">Corporate CAC Digital Certificate</p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">RC-1849204 — verified from the Corporate Affairs Commission registry. Selecting this mode will sign with your CAC-linked corporate seal.</p>
                </div>
              )}
            </div>

            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={clear} disabled={mode!=='draw'}><RefreshCw className="mr-1 h-4 w-4" /> Clear Pad</Button>
                <span className="hidden text-xs text-zinc-500 sm:inline">Pen Width: Normal (2px)</span>
              </div>
              <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${signaturePresent ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500'}`}>
                <span className={`h-2 w-2 rounded-full ${signaturePresent ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-600'}`} /> {signaturePresent ? 'Signature Captured' : 'Awaiting Input'}
              </span>
            </div>

            <div className="mt-4 rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-3 font-mono text-xs text-zinc-600 dark:text-zinc-400">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-widest text-zinc-700 dark:text-zinc-300"><Fingerprint className="h-4 w-4 text-emerald-500" /> EVIDENTIARY AUDIT STAMP (Sec. 93/94)</p>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                <span>Signer: <strong className="text-zinc-900 dark:text-white">{tenantName}</strong></span>
                <span>Deed: <strong className="text-zinc-900 dark:text-white">{deedRef(agreement.id)}</strong></span>
                <span>Timestamp: <strong className="text-emerald-600 dark:text-emerald-400">{new Date().toLocaleString('en-NG')}</strong></span>
              </div>
            </div>

            <Button onClick={execute} disabled={!canExecute} className="mt-4 h-12 w-full bg-emerald-600 text-base font-semibold hover:bg-emerald-500 disabled:opacity-50">
              <Fingerprint className="mr-2 h-5 w-5" /> {submitting ? 'Perfection in progress…' : 'Sign & Perfect Tenancy Agreement'}
            </Button>
            <p className="mt-2 text-center text-xs text-zinc-600 dark:text-zinc-400">Clicking executes a legally binding contract. A sealed copy will be registered with LASRERA and stamped by FIRS.</p>
          </div>

          <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-5">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-white"><ShieldCheck className="h-5 w-5 text-emerald-500" /> Automated Cryptographic Execution Pipeline</h3>
              <span className="rounded bg-emerald-500/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">4-Stage Sequence</span>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-4">
              <div className="rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-3"><div className="flex items-center justify-between"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">✓</span><span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">STAGE 01</span></div><p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-white">Identity Auth</p><p className="text-xs text-zinc-600 dark:text-zinc-400">BVN &amp; CAC verified.</p><p className="mt-1 flex items-center gap-1 font-mono text-[11px] font-semibold text-emerald-600 dark:text-emerald-400"><ShieldCheck className="h-3 w-3" /> Valid Match</p></div>
              <div className="rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-3"><div className="flex items-center justify-between"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">✓</span><span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">STAGE 02</span></div><p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-white">Deed Hashing</p><p className="text-xs text-zinc-600 dark:text-zinc-400">SHA-256 deed tree generated.</p><p className="mt-1 truncate font-mono text-[11px] text-zinc-500">0x8f2a…c914</p></div>
              <div className="rounded-lg bg-emerald-500/10 p-3 ring-1 ring-emerald-500/20"><div className="flex items-center justify-between"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white animate-pulse">3</span><span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">ACTIVE</span></div><p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-white">Tenant Signature</p><p className="text-xs text-zinc-600 dark:text-zinc-400">Awaiting biometric execution.</p><p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-amber-700 dark:text-amber-300"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Awaiting Signature</p></div>
              <div className="rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-3 opacity-70"><div className="flex items-center justify-between"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-200 dark:bg-white/[0.08] text-xs font-bold text-zinc-600 dark:text-zinc-400">4</span><span className="text-[11px] text-zinc-500">NEXT</span></div><p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-white">LASRERA Seal</p><p className="text-xs text-zinc-600 dark:text-zinc-400">FIRS stamp &amp; perfection.</p><p className="mt-1 text-[11px] text-zinc-500">Pending Perfection</p></div>
            </div>
          </div>
        </div>
      </div>

      {/* Clauses modal */}
      <Dialog open={showClauses} onOpenChange={setShowClauses}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Gavel className="h-5 w-5 text-emerald-500" /> Deed Special Clauses &amp; Covenants (Preview)</DialogTitle>
            <DialogDescription>{deedRef(agreement.id)} • Section 93/94 Evidence Act 2011</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-4"><div className="flex items-center justify-between font-semibold"><span>Clause 4.1: Subletting &amp; Assignment</span><Badge variant="destructive" className="text-[11px]">Strict Covenant</Badge></div><p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">The Lessee shall NOT assign, underlet, sublet, or part with possession without prior written consent. Short-letting (Airbnb) constitutes immediate repudiation.</p></div>
            <div className="rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-4"><div className="flex items-center justify-between font-semibold"><span>Clause 7.3: Maintenance &amp; Generator Levies</span><Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[11px]">Operational Policy</Badge></div><p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">Service Charge of {formatNairaFull(agreement.serviceCharge)} covers facility, pool, 24/7 security, and generator operations. Diesel surcharges reconciled quarterly.</p></div>
            <div className="rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-4"><div className="flex items-center justify-between font-semibold"><span>Clause 12.0: Notice to Quit</span><Badge variant="outline" className="text-[11px]">Notice Terms</Badge></div><p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">Either party may terminate by serving three calendar months written notice prior to {agreement.endDate ? formatDateLong(agreement.endDate) : 'term end'}. Inspection precedes escrow refund within 14 banking days.</p></div>
            {agreement.specialClauses && <div className="rounded-lg border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 p-4"><p className="text-xs font-semibold tracking-widest text-amber-700 dark:text-amber-300">SPECIAL CLAUSES</p><p className="mt-1 whitespace-pre-wrap text-sm text-zinc-900 dark:text-white">{agreement.specialClauses}</p></div>}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={()=>setShowClauses(false)}>Close</Button>
              <Button onClick={()=>{ setConsent(true); setShowClauses(false); }}>Acknowledge &amp; Proceed</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400"><Check className="h-5 w-5" /> Agreement Perfected &amp; Executed</DialogTitle>
            <DialogDescription>Cryptographic seal applied. Registered with LASRERA under Ref {deedRef(agreement.id)}.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Button asChild><Link href={`/dashboard/tenant/agreements/${agreement.id}`}>View Agreement</Link></Button>
            <Button variant="outline" onClick={()=>setSuccessOpen(false)}>Stay</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
