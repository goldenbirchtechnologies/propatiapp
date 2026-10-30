'use client';

import { useEffect, useMemo, useState } from 'react';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import {
  BadgeCheck, Building2, LayoutGrid, Users, FileText, Wrench, Wallet, Settings, User,
  Upload, FilePenLine, UploadCloud, Eye, Trash2, CheckCircle2, Shield, Calendar, CalendarCheck,
  Scale, ArrowLeft, ArrowRight, Bookmark, Pencil, ShieldCheck, Check, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { useToast } from '@/hooks/use-toast';
import { useCreateAgreement } from '@/hooks/useAgreements';
import { createAgreementSchema } from '@/lib/validators';
import { cn } from '@/lib/utils';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';

type FormData = z.infer<typeof createAgreementSchema>;

export default function NewAgreementPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [proceeding, setProceeding] = useState(false);
  const [listings, setListings] = useState<
    { id: string; title: string; address: string; area: string; state: string; price: number; pricePeriod: string | null; coverImage: string | null }[]
  >([]);
  const [listingsLoading, setListingsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/listings?ownerId=me&limit=50', { cache: 'no-store' });
        const json = await res.json();
        const rows = Array.isArray(json?.data) ? json.data : [];
        if (!cancelled) {
          setListings(
            rows.map((l: Record<string, unknown>) => ({
              id: String(l.id),
              title: String(l.title ?? 'Untitled property'),
              address: String(l.address ?? ''),
              area: String(l.area ?? ''),
              state: String(l.state ?? ''),
              price: Number(l.price ?? 0),
              pricePeriod: (l.pricePeriod as string | null) ?? null,
              coverImage: Array.isArray(l.images) ? ((l.images[0] as { url?: string })?.url ?? null) : null,
            }))
          );
        }
      } catch {
        if (!cancelled) setListings([]);
      } finally {
        if (!cancelled) setListingsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const createAgreement = useCreateAgreement();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(createAgreementSchema) as unknown,
    defaultValues: {
      type: 'rental',
      rentPeriod: 'monthly',
      noticePeriodDays: 30,
    },
  } as unknown);

  const watchedValues = watch();
  const selectedListing = useMemo(
    () => listings.find((l) => l.id === watchedValues.listingId) ?? null,
    [listings, watchedValues.listingId]
  );

  const onSubmit = async (data: unknown) => {
    try {
      const agreement = await createAgreement.mutateAsync(data as unknown);
      toast({
        title: 'Agreement Created',
        description: 'The agreement has been created successfully.',
      } as unknown);
      router.push(`/dashboard/landlord/agreements/${agreement.id}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create agreement. Please try again.',
        variant: 'destructive',
      } as unknown);
    }
  };

  const calculateLeaseDuration = () => {
    const { startDate, endDate } = watchedValues;
    if (
      !startDate ||
      !endDate ||
      isNaN(Date.parse(startDate)) ||
      isNaN(Date.parse(endDate))
    ) {
      return null;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return null;
    }
    const diffTime = end.getTime() - start.getTime();
    if (diffTime <= 0) {
      return null;
    }
    const months = Math.round(diffTime / (1000 * 60 * 60 * 24 * 30));
    return isNaN(months) ? null : months;
  };

  const validateStep = async (step: number): Promise<boolean> => {
    const fieldsToValidate: Record<number, string[]> = {
      1: ['listingId', 'tenantId', 'type'],
      2: ['startDate', 'endDate', 'rentAmount', 'rentPeriod'],
    };

    const fields = fieldsToValidate[step];
    if (!fields) return true;

    const promises = fields.map(async (field) => {
      const input = document.querySelector(`[name="${field}"]`) as HTMLInputElement | null;
      if (input) {
        input.dispatchEvent(new Event('blur', { bubbles: true }));
      }
      return await trigger(field as keyof FormData);
    });

    const results = await Promise.all(promises);
    return results.every((valid) => valid);
  };

  const nextStep = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid) {
      setCurrentStep(currentStep + 1);
    }
  };

  const proceedToStepTwo = async () => {
    setProceeding(true);
    await new Promise((r) => setTimeout(r, 700));
    const isValid = await validateStep(currentStep);
    setProceeding(false);
    if (isValid) {
      setCurrentStep(2);
    }
  };

  return (
    <DashboardShell navigation={LANDLORD_NAVIGATION} userRole="landlord" userName="Landlord" userAvatar={undefined}>
      <ErrorBoundary>
        <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6">
          {/* Header Block */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1 text-primary dark:text-[#4edea3] text-[11px] font-semibold uppercase tracking-wider">
                <BadgeCheck className="h-[16px] w-[16px]" />
                <span>LASRERA &amp; CAC Compliant Framework</span>
              </div>
              <h1 className="text-[32px] leading-[40px] tracking-tight font-bold text-zinc-900 dark:text-white">Create New Agreement</h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl">
                Generate an institutional-grade tenancy agreement or commercial lease, legally stamped and provisioned for electronic verification via NIN, BVN, or CAC.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start md:self-auto">
              <div className="flex items-center gap-1 px-2 py-1.5 bg-zinc-50 dark:bg-white/[0.04] rounded-lg text-zinc-600 dark:text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[11px] font-medium">Draft Autosaved (14:32 WAT)</span>
              </div>
              <button type="button" className="px-3 py-2 rounded-lg bg-zinc-50 dark:bg-white/[0.04] hover:bg-zinc-100 dark:hover:bg-white/[0.08] text-zinc-900 dark:text-white text-sm font-semibold flex items-center gap-1 transition-colors">
                <Bookmark className="h-[18px] w-[18px]" />
                <span>Load Template</span>
              </button>
            </div>
          </div>

          {/* Multi-Step Progress Tracker */}
          <div className="w-full bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-white/[0.08]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center relative">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center font-semibold shrink-0 shadow-sm">1</div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-zinc-900 dark:text-white">Tenant &amp; Property</span>
                  <span className="text-[11px] text-primary dark:text-[#4edea3] font-medium flex items-center gap-1">
                    <Pencil className="h-[14px] w-[14px]" /> In Progress
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 opacity-60">
                <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-400 flex items-center justify-center font-semibold shrink-0">2</div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-zinc-900 dark:text-white">Terms, Pricing &amp; Escrow</span>
                  <span className="text-[11px] text-zinc-600 dark:text-zinc-400">Service charges &amp; rent</span>
                </div>
              </div>
              <div className="flex items-center gap-4 opacity-60">
                <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-400 flex items-center justify-center font-semibold shrink-0">3</div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-zinc-900 dark:text-white">Legal Review &amp; Dispatch</span>
                  <span className="text-[11px] text-zinc-600 dark:text-zinc-400">Digital execution &amp; stamp duty</span>
                </div>
              </div>
            </div>
            <div className="mt-4 w-full h-1.5 bg-zinc-100 dark:bg-white/[0.06] rounded-full overflow-hidden flex">
              <div className="h-full bg-primary w-1/3 transition-all duration-300" />
              <div className="h-full bg-transparent w-2/3" />
            </div>
          </div>

          {/* Main Step Canvas */}
          {currentStep === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Primary Form Container (7 cols) */}
              <div className="lg:col-span-7 bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-white/[0.08] flex flex-col gap-6">
                <div>
                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-white tracking-tight">Agreement Mode &amp; Document Upload</h2>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">Upload your custom tenancy agreement or lease for digital field tagging, counter-party verification, and multi-party e-signature.</p>
                </div>
                <form className="flex flex-col gap-4" id="agreement-step-form">
                  <div className="flex flex-col gap-2 pb-4 border-b border-zinc-200 dark:border-white/[0.08]">
                    <label className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center justify-between">
                      <span>Agreement Creation Method <span className="text-red-500">*</span></span>
                      <span className="text-[11px] text-primary dark:text-[#4edea3] font-medium flex items-center gap-1">
                        <BadgeCheck className="h-[14px] w-[14px]" /> Electronic Evidence Act Ready
                      </span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button type="button" className="flex items-center gap-2 p-2 rounded-lg border-2 border-primary bg-[var(--sovereign-container-bg)] dark:bg-primary/10 text-left transition-all">
                        <div className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center shrink-0"><Upload className="h-[20px] w-[20px]" /></div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-zinc-900 dark:text-white">Upload Custom Agreement</span>
                          <span className="text-[11px] text-zinc-600 dark:text-zinc-400">PDF or DOCX for binding E-Sign</span>
                        </div>
                      </button>
                      <button type="button" className="flex items-center gap-2 p-2 rounded-lg bg-zinc-50 dark:bg-white/[0.04] hover:bg-zinc-100 dark:hover:bg-white/[0.08] text-left transition-colors opacity-70 hover:opacity-100">
                        <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-400 flex items-center justify-center shrink-0"><FilePenLine className="h-[20px] w-[20px]" /></div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-zinc-900 dark:text-white">Generate from Template</span>
                          <span className="text-[11px] text-zinc-600 dark:text-zinc-400">Standard LASRERA institutional clause</span>
                        </div>
                      </button>
                    </div>
                    <div className="mt-1 flex flex-col gap-1">
                      <label className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center justify-between">
                        <span>Contract Document (PDF/DOCX) <span className="text-red-500">*</span></span>
                        <span className="text-[11px] text-primary dark:text-[#4edea3] font-medium">Max 25MB</span>
                      </label>
                      <div className="border-2 border-dashed border-zinc-200 dark:border-white/[0.08] hover:border-primary bg-zinc-50/50 dark:bg-white/[0.02] hover:bg-zinc-50 dark:hover:bg-white/[0.04] rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all gap-1">
                        <div className="w-11 h-11 rounded-full bg-zinc-100 dark:bg-white/[0.06] flex items-center justify-center text-primary dark:text-[#4edea3]">
                          <UploadCloud className="h-[24px] w-[24px]" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-zinc-900 dark:text-white">Click to upload or drag and drop tenancy agreement</span>
                          <span className="text-xs text-zinc-600 dark:text-zinc-400">PDF, DOCX up to 25MB • Automated signature anchor &amp; field detection</span>
                        </div>
                      </div>
                      <div className="bg-zinc-50 dark:bg-white/[0.04] p-2 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-1 mt-1">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0"><FileText className="h-[20px] w-[20px]" /></div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-semibold text-zinc-900 dark:text-white">Tenancy_Contract_VictoriaCrest_2025.pdf</span>
                              <span className="px-1.5 py-0.5 rounded text-[11px] bg-[var(--sovereign-container-bg)] dark:bg-primary/10 text-[var(--sovereign-hover)] dark:text-[#4edea3] font-semibold">E-Sign Fields Ready</span>
                            </div>
                            <span className="text-xs text-zinc-600 dark:text-zinc-400">2.4 MB • 8 Pages • 2 Signatories detected (Landlord, Tenant)</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 self-end sm:self-auto">
                          <button type="button" className="px-2 py-1 rounded bg-zinc-100 dark:bg-white/[0.06] hover:bg-zinc-200 dark:hover:bg-white/[0.1] text-zinc-900 dark:text-white text-[11px] flex items-center gap-1 transition-colors">
                            <Eye className="h-[16px] w-[16px]" /> Preview
                          </button>
                          <button type="button" className="p-1 text-zinc-600 dark:text-zinc-400 hover:text-red-500 transition-colors" title="Remove">
                            <Trash2 className="h-[18px] w-[18px]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Managed Property & Unit */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center justify-between" htmlFor="property-select">
                      <span>Managed Property &amp; Unit <span className="text-red-500">*</span></span>
                      <span className="text-[11px] text-primary dark:text-[#4edea3] flex items-center gap-0.5">
                        <CheckCircle2 className="h-[14px] w-[14px]" /> 42 Active Units
                      </span>
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 dark:text-zinc-400 h-[20px] w-[20px] pointer-events-none" />
                      <Select value={watchedValues.listingId} onValueChange={(value) => setValue('listingId', value)}>
                        <SelectTrigger className="w-full h-11 pl-10 pr-10 bg-white dark:bg-zinc-900 rounded-lg text-sm text-zinc-900 dark:text-white shadow-sm">
                          <SelectValue placeholder="Select a property" />
                        </SelectTrigger>
                        <SelectContent>
                          {listingsLoading ? (
                            <SelectItem value="__loading" disabled>Loading properties…</SelectItem>
                          ) : listings.length === 0 ? (
                            <SelectItem value="__empty" disabled>No properties yet — add one first</SelectItem>
                          ) : (
                            listings.map((l) => (
                              <SelectItem key={l.id} value={l.id}>
                                {l.title} — {[l.area, l.state].filter(Boolean).join(', ') || l.address} [₦{l.price.toLocaleString()}/{l.pricePeriod ?? 'yr'}]
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    {errors.listingId && <p className="text-xs text-red-500 mt-1">{errors.listingId.message}</p>}
                    <span className="text-xs text-zinc-600 dark:text-zinc-400">Listing includes automated service charge schedule and verified Lagos State title documentation.</span>
                  </div>

                  {/* Tenant Email/RC */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center justify-between" htmlFor="tenant-identifier">
                      <span>Tenant Email or Corporate RC Number <span className="text-red-500">*</span></span>
                      <span className="text-[11px] text-zinc-600 dark:text-zinc-400">NIN / BVN / RC sync</span>
                    </label>
                    <div className="relative">
                      <BadgeCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 dark:text-zinc-400 h-[20px] w-[20px] pointer-events-none" />
                      <Input id="tenant-identifier" className="w-full h-11 pl-10 pr-28" placeholder="e.g. tenant@domain.ng or RC-1892834" {...register('tenantId')} />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-[var(--sovereign-container-bg)] dark:bg-primary/10 text-[var(--sovereign-hover)] dark:text-[#4edea3] rounded text-[11px] font-semibold flex items-center gap-1">
                        <BadgeCheck className="h-[14px] w-[14px]" /> CAC VALID
                      </span>
                    </div>
                    {errors.tenantId && <p className="text-xs text-red-500 mt-1">{errors.tenantId.message}</p>}
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      The tenant will receive an authenticated dispatch payload to execute the agreement via legal e-sign with SMS OTP validation (Nigerian Tier-1 Gateways).
                    </p>
                  </div>

                  {/* Agreement Classification */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-zinc-900 dark:text-white">Agreement Classification <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { value: 'rental', label: 'Standard Residential', sub: 'Annual tenancy under LASRERA' },
                        { value: 'commercial', label: 'Commercial Corporate Lease', sub: 'Multi-year institution contract' },
                        { value: 'serviced', label: 'Serviced Executive Flat', sub: 'Includes 24/7 power & security' },
                        { value: 'short_let', label: 'Institutional Short-Let', sub: 'Flexible rolling quarterly terms' },
                      ].map((opt) => (
                        <label key={opt.value} className="flex items-center gap-2 p-2 rounded-lg bg-zinc-50 dark:bg-white/[0.04] hover:bg-zinc-100 dark:hover:bg-white/[0.08] cursor-pointer transition-colors">
                          <input type="radio" name="type" value={opt.value} checked={watchedValues.type === opt.value} onChange={() => setValue('type', opt.value as never)} className="w-4 h-4 text-primary focus:ring-primary" />
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-zinc-900 dark:text-white leading-tight">{opt.label}</span>
                            <span className="text-[11px] text-zinc-600 dark:text-zinc-400">{opt.sub}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                    {errors.type && <p className="text-xs text-red-500 mt-1">{errors.type.message}</p>}
                  </div>

                  {/* Duration + Commencement */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-semibold text-zinc-900 dark:text-white" htmlFor="tenancy-duration">Tenancy Duration</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 dark:text-zinc-400 h-[20px] w-[20px] pointer-events-none" />
                        <select id="tenancy-duration" className="w-full h-11 pl-10 pr-8 bg-white dark:bg-zinc-900 rounded-lg text-sm text-zinc-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer transition-all appearance-none border border-zinc-200 dark:border-white/[0.08]">
                          <option value="1yr">1 Year (Standard Annual)</option>
                          <option value="2yr">2 Years (Locked Fixed Rate)</option>
                          <option value="3yr">3 Years (Corporate Triennial)</option>
                          <option value="6mo">6 Months (Executive Transitional)</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-semibold text-zinc-900 dark:text-white" htmlFor="commencement-date">Proposed Commencement</label>
                      <div className="relative">
                        <CalendarCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 dark:text-zinc-400 h-[20px] w-[20px] pointer-events-none" />
                        <Input id="commencement-date" type="date" className="w-full h-11 pl-10 pr-3" defaultValue="2025-11-01" {...register('startDate')} />
                      </div>
                      {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate.message}</p>}
                    </div>
                  </div>

                  {/* Corporate Guarantor */}
                  <div className="bg-zinc-50 dark:bg-white/[0.04] p-4 rounded-lg flex items-start gap-2 mt-1">
                    <input type="checkbox" id="legal-guarantor" defaultChecked className="mt-1 w-4 h-4 text-primary focus:ring-primary rounded" />
                    <div className="flex flex-col">
                      <label className="text-sm font-semibold text-zinc-900 dark:text-white cursor-pointer" htmlFor="legal-guarantor">Enforce Corporate Guarantor &amp; Legal Co-Signer</label>
                      <span className="text-xs text-zinc-600 dark:text-zinc-400">
                        Requires an attested Letter of Indemnity and verification of employer payroll or CAC Form 7 before handover.
                      </span>
                    </div>
                  </div>
                </form>
              </div>

              {/* Right preview col */}
              <div className="lg:col-span-5 flex flex-col gap-4 sticky top-20">
                {/* Property Spotlight */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 shadow-sm border border-zinc-200 dark:border-white/[0.08] flex flex-col gap-4 overflow-hidden relative">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-[11px] font-semibold tracking-wider text-zinc-600 dark:text-zinc-400 uppercase">Property Specification</span>
                    <span className="px-1.5 py-0.5 rounded text-[11px] bg-[var(--sovereign-container-bg)] dark:bg-primary/10 text-[var(--sovereign-hover)] dark:text-[#4edea3] font-semibold">Ready for Lease</span>
                  </div>
                  <div className="relative rounded-lg overflow-hidden h-44 w-full bg-zinc-100 dark:bg-white/[0.04]">
                    {selectedListing?.coverImage ? (
                      <img className="w-full h-full object-cover" alt={selectedListing.title} src={selectedListing.coverImage} />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-zinc-400">
                        <Building2 className="h-10 w-10" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4">
                      <div className="flex flex-col text-white">
                        <span className="text-base font-bold leading-snug">
                          {selectedListing ? selectedListing.title : 'No property selected'}
                        </span>
                        <span className="text-xs text-gray-200">
                          {selectedListing
                            ? [selectedListing.address, selectedListing.area, selectedListing.state].filter(Boolean).join(', ')
                            : 'Choose a managed property to preview it here'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 bg-zinc-50 dark:bg-white/[0.04] p-2 rounded-lg">
                    <div className="flex flex-col">
                      <span className="text-[11px] text-zinc-600 dark:text-zinc-400">Base Rent (Annual)</span>
                      <span className="text-xl font-bold text-primary dark:text-[#4edea3] font-mono">
                        {selectedListing ? `₦${selectedListing.price.toLocaleString()}` : '—'}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] text-zinc-600 dark:text-zinc-400">Caution &amp; Damages</span>
                      <span className="text-xl font-bold text-zinc-900 dark:text-white font-mono">₦750,000</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] text-zinc-600 dark:text-zinc-400">Service Charge (Est.)</span>
                      <span className="text-sm font-semibold text-zinc-900 dark:text-white font-mono">₦1,200,000 / yr</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] text-zinc-600 dark:text-zinc-400">Legal &amp; Stamp Duty</span>
                      <span className="text-sm font-semibold text-zinc-900 dark:text-white font-mono">10% (₦750,000)</span>
                    </div>
                  </div>
                  {/* Tenant Verification */}
                  <div className="p-2 rounded-lg bg-zinc-50 dark:bg-white/[0.04] flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-zinc-900 dark:text-white">Prospective Tenant Identity</span>
                      <span className="flex items-center gap-1 text-[11px] text-primary dark:text-[#4edea3] font-medium">
                        <Shield className="h-[14px] w-[14px]" /> Pre-screened
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                        {(watchedValues.tenantId || '?').toString().slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-semibold leading-none text-zinc-900 dark:text-white">
                          {watchedValues.tenantId ? String(watchedValues.tenantId) : 'No tenant identified yet'}
                        </span>
                        <span className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                          {watchedValues.tenantId
                            ? 'Identity is verified at dispatch'
                            : 'Enter the tenant email or RC number to continue'}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Statutory */}
                  <div className="flex items-start gap-2 p-2 bg-zinc-100 dark:bg-white/[0.06] rounded-lg">
                    <Scale className="text-primary dark:text-[#4edea3] h-[20px] w-[20px] shrink-0 mt-0.5" />
                    <div className="flex flex-col text-zinc-900 dark:text-white">
                      <span className="text-sm font-semibold leading-tight">Statutory Lagos Tenancy Law 2011</span>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                        Agreement terms will automatically inject Section 13 covenants, statutory 7-day abandonment protocols, and standard dispute mediation clauses.
                      </p>
                    </div>
                  </div>
                </div>

                {/* E-Sign Flow */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 shadow-sm border border-zinc-200 dark:border-white/[0.08] flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold tracking-wider text-zinc-600 dark:text-zinc-400 uppercase">E-Sign Flow &amp; Execution</span>
                    <span className="flex items-center gap-1 text-[11px] text-primary dark:text-[#4edea3] font-medium">
                      <BadgeCheck className="h-[14px] w-[14px]" /> 2-Party Flow
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 p-1 rounded-lg bg-zinc-50 dark:bg-white/[0.04]">
                      <div className="w-6 h-6 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center shrink-0">1</div>
                      <div className="flex flex-col flex-1">
                        <span className="text-sm font-semibold text-zinc-900 dark:text-white leading-tight">Landlord E-Signature</span>
                        <span className="text-xs text-zinc-600 dark:text-zinc-400">Executes upon review with RC seal</span>
                      </div>
                      <span className="text-[11px] text-primary dark:text-[#4edea3] font-medium">You First</span>
                    </div>
                    <div className="flex items-center gap-2 p-1 rounded-lg bg-zinc-50 dark:bg-white/[0.04]">
                      <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-400 text-[11px] font-bold flex items-center justify-center shrink-0">2</div>
                      <div className="flex flex-col flex-1">
                        <span className="text-sm font-semibold text-zinc-900 dark:text-white leading-tight">Tenant SMS OTP &amp; Signature</span>
                        <span className="text-xs text-zinc-600 dark:text-zinc-400">Authenticated via NIN / BVN match</span>
                      </div>
                      <span className="text-[11px] text-zinc-600 dark:text-zinc-400">Second</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-1 p-1 bg-[var(--sovereign-container-bg)] dark:bg-primary/10 rounded-lg text-[var(--sovereign-hover)] dark:text-[#4edea3]">
                    <Shield className="text-primary dark:text-[#4edea3] h-[18px] w-[18px] shrink-0 mt-0.5" />
                    <p className="text-[11px]">Admissible in Nigerian courts per Evidence Act 2011 §93 &amp; Lagos State Tenancy Law digital audit log.</p>
                  </div>
                </div>

                <div className="bg-zinc-50 dark:bg-white/[0.04] rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="text-zinc-600 dark:text-zinc-400 h-[22px] w-[22px]" />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-zinc-900 dark:text-white">Need a bespoke clause?</span>
                      <span className="text-xs text-zinc-600 dark:text-zinc-400">Request Sovereign Legal Counsel review</span>
                    </div>
                  </div>
                  <button type="button" className="text-[11px] font-semibold text-primary dark:text-[#4edea3] hover:underline uppercase">Consult Legal</button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-white/[0.08] space-y-6">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">Agreement Terms</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input id="startDate" type="datetime-local" {...register('startDate')} />
                    {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date *</Label>
                    <Input id="endDate" type="datetime-local" {...register('endDate')} />
                    {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate.message}</p>}
                  </div>
                </div>
                <div>
                  <Label htmlFor="rentAmount">Rent Amount (NGN) *</Label>
                  <Input id="rentAmount" type="number" {...register('rentAmount', { valueAsNumber: true })} placeholder="e.g., 500000" />
                  {errors.rentAmount && <p className="text-xs text-red-500 mt-1">{errors.rentAmount.message}</p>}
                </div>
                <div>
                  <Label htmlFor="rentPeriod">Payment Schedule *</Label>
                  <Select value={watchedValues.rentPeriod} onValueChange={(value) => setValue('rentPeriod', value as never)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="annually">Annually</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.rentPeriod && <p className="text-xs text-red-500 mt-1">{errors.rentPeriod.message}</p>}
                </div>
                <div>
                  <Label htmlFor="cautionDeposit">Caution Deposit (NGN)</Label>
                  <Input id="cautionDeposit" type="number" {...register('cautionDeposit', { valueAsNumber: true })} placeholder="Optional" />
                </div>
                <div>
                  <Label htmlFor="serviceCharge">Service Charge (NGN)</Label>
                  <Input id="serviceCharge" type="number" {...register('serviceCharge', { valueAsNumber: true })} placeholder="Optional" />
                </div>
                <div>
                  <Label htmlFor="terms">Additional Terms</Label>
                  <Textarea id="terms" {...register('terms')} placeholder="Enter additional terms..." rows={4} />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>Back</Button>
                  <Button type="submit" disabled={createAgreement.isPending}>
                    {createAgreement.isPending ? 'Creating...' : 'Create Agreement'}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Footer action deck */}
          <div className="pt-4 border-t border-zinc-200 dark:border-white/[0.08] flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
            <button type="button" onClick={() => router.back()} className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-zinc-50 dark:bg-white/[0.04] hover:bg-zinc-100 dark:hover:bg-white/[0.08] text-zinc-900 dark:text-white text-sm font-semibold flex items-center justify-center gap-1 transition-colors shadow-sm">
              <ArrowLeft className="h-[18px] w-[18px]" /> Back to Agreements
            </button>
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <button type="button" className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-zinc-50 dark:bg-white/[0.04] hover:bg-zinc-100 dark:hover:bg-white/[0.08] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-sm font-semibold transition-colors text-center">
                Save Draft Only
              </button>
              <button type="button" onClick={proceedToStepTwo} disabled={proceeding} className="w-full sm:w-auto px-8 py-2.5 rounded-lg bg-primary text-white hover:bg-primary text-sm font-semibold flex items-center justify-center gap-1 transition-all shadow-md active:scale-[0.99] disabled:opacity-60">
                {proceeding ? (<><Loader2 className="h-[18px] w-[18px] animate-spin" /> Validating...</>) : (<>Proceed to Signature Fields <ArrowRight className="h-[18px] w-[18px]" /></>)}
              </button>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </DashboardShell>
  );
}
