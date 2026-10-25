'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, AlertCircle, Phone, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import Link from 'next/link';
import { apiEndpoints } from '@/lib/api';

type ListingOpt = { id: string; title: string; address: string };

const CATEGORIES = [
  { value: 'plumbing', label: 'Plumbing & Water — RO pumps, faucets, leaks' },
  { value: 'electrical', label: 'Electrical Grid — DB boards, breakers, phase' },
  { value: 'structural', label: 'Structural & Civil — Masonry, sealing, woodwork' },
  { value: 'security', label: 'Access & Security — Biometric, intercom' },
  { value: 'cleaning', label: 'Cleaning & Upkeep' },
  { value: 'other', label: 'Other' },
] as const;

const PRIORITIES = [
  { value: 'low', label: 'Low', hint: '< 48 hrs — Scheduled cosmetic' },
  { value: 'medium', label: 'Standard', hint: '< 24 hrs — Minor disruption' },
  { value: 'high', label: 'Urgent', hint: '< 6 hrs — Severe discomfort' },
  { value: 'urgent', label: 'Emergency', hint: '< 2 hrs — Asset risk / blackout' },
] as const;

export default function TenantMaintenanceRequestClient({ listings }: { listings: ListingOpt[] }) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [listingId, setListingId] = useState<string>(listings[0]?.id ?? '');
  const [roomScope, setRoomScope] = useState('master-hvac');
  const [category, setCategory] = useState<string>('');
  const [priority, setPriority] = useState<string>('medium');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredSlot, setPreferredSlot] = useState('afternoon');
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [photoInput, setPhotoInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canContinueStep1 = category && priority && title.trim().length >= 5 && description.trim().length >= 30;

  const handleSubmit = async () => {
    if (!canContinueStep1) {
      toast.error('Please complete all required fields (title ≥5 chars, description ≥30 chars).');
      return;
    }
    setSubmitting(true);
    try {
      const json: any = await apiEndpoints.maintenance.create({
        title: title.trim(),
        description: `${description.trim()}\n\n[Scope: ${roomScope}] [Slot: ${preferredSlot}] [Date: ${preferredDate || 'not set'}]`,
        category: category as any,
        priority: priority as any,
        listingId: listingId || undefined,
        photoUrls: photoUrls.filter(Boolean),
      });
      if (json?.success === false || json?.error) {
        throw new Error(json?.error || 'Failed to submit request');
      }
      toast.success('Maintenance request submitted — dispatch will confirm shortly.');
      router.push('/dashboard/tenant/maintenance');
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const addPhotoUrl = () => {
    const url = photoInput.trim();
    if (!url) return;
    try {
      new URL(url);
    } catch {
      toast.error('Please enter a valid URL');
      return;
    }
    if (photoUrls.length >= 5) {
      toast.error('Maximum 5 photos');
      return;
    }
    setPhotoUrls((prev) => [...prev, url]);
    setPhotoInput('');
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold tracking-widest text-zinc-500">
        <Link href="/dashboard/tenant/maintenance" className="hover:text-zinc-900 dark:hover:text-white">Dashboard</Link>
        <span className="text-zinc-300 dark:text-zinc-700">›</span>
        <span>Facility &amp; Services</span>
        <span className="text-zinc-300 dark:text-zinc-700">›</span>
        <Link href="/dashboard/tenant/maintenance" className="hover:text-zinc-900 dark:hover:text-white">Maintenance Requests</Link>
        <span className="text-zinc-300 dark:text-zinc-700">›</span>
        <span className="text-emerald-600 dark:text-emerald-400">New Request</span>
      </div>

      <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Submit Maintenance Request</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Lagos Institutional Facility Dispatch &amp; MEP Incident Logging — SLA guaranteed</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-100 dark:bg-white/[0.06] px-3 py-1.5 font-semibold text-zinc-700 dark:text-zinc-300">SLA Guaranteed • ISO 41001</span>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5 font-semibold text-emerald-700 dark:text-emerald-300"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> 24/7 Response Desk</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
        {/* Left sidebar */}
        <aside className="space-y-4 lg:col-span-4">
          <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">⚙</span>
              <div>
                <h2 className="font-semibold text-zinc-900 dark:text-white">Institutional MEP Portal</h2>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">Sovereign Asset Care Protocol</p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">Provide diagnostic telemetry and site conditions. We promptly assign a certified MEP engineering partner.</p>
            <div className="mt-5 space-y-3">
              <div className="flex gap-3">
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${step >= 1 ? 'bg-emerald-600 text-white' : 'bg-zinc-200 dark:bg-white/[0.08] text-zinc-600 dark:text-zinc-400'}`}>1</span>
                <div><p className={`text-sm font-semibold ${step === 1 ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-900 dark:text-white'}`}>Diagnostics &amp; Location</p><p className="text-xs text-zinc-600 dark:text-zinc-400">Unit scope, category, description</p></div>
              </div>
              <div className="flex gap-3">
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${step >= 2 ? 'bg-emerald-600 text-white' : 'bg-zinc-200 dark:bg-white/[0.08] text-zinc-600 dark:text-zinc-400'}`}>2</span>
                <div><p className={`text-sm font-semibold ${step === 2 ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-600 dark:text-zinc-400'}`}>Photos &amp; Access Protocol</p><p className="text-xs text-zinc-600 dark:text-zinc-400">Timing &amp; evidence</p></div>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2 text-center">
              <div className="rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-3"><p className="font-mono text-sm font-bold text-red-600">&lt; 2h</p><p className="text-[11px] font-semibold tracking-widest text-zinc-500">Emergency P1</p></div>
              <div className="rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-3"><p className="font-mono text-sm font-bold text-emerald-600">&lt; 24h</p><p className="text-[11px] font-semibold tracking-widest text-zinc-500">Routine Standard</p></div>
            </div>
          </div>

          <div className="rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 p-5">
            <h3 className="flex items-center gap-2 font-semibold text-red-700 dark:text-red-300"><AlertCircle className="h-4 w-4" /> Emergency Protocol (P1)</h3>
            <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">For gas leaks, fire, structural collapse, or severe flooding, call dispatch before completing diagnostics.</p>
            <Button asChild className="mt-3 w-full bg-red-600 hover:bg-red-500 text-white"><a href="tel:+23412908820"><Phone className="mr-1 h-4 w-4" /> Call 24/7 Dispatch Hotline</a></Button>
            <p className="mt-2 text-center font-mono text-xs text-zinc-600 dark:text-zinc-400">Direct Line: +234 1 290 8820 Ext. 1</p>
            <Button asChild variant="outline" size="sm" className="mt-2 w-full"><a href="https://wa.me/2348000000000" target="_blank" rel="noreferrer">WhatsApp Duty Engineer</a></Button>
          </div>

          {listings.length > 0 && (
            <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-5">
              <p className="text-[11px] font-semibold tracking-widest text-zinc-500">ASSET UNDER COVERAGE</p>
              <p className="mt-1 font-semibold text-zinc-900 dark:text-white">{listings[0].title}</p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">{listings[0].address}</p>
            </div>
          )}
        </aside>

        {/* Main form */}
        <div className="lg:col-span-8">
          <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50">
            <div className="flex items-center justify-between bg-zinc-50 dark:bg-white/[0.04] px-6 py-4">
              <div>
                <p className="text-[11px] font-bold tracking-widest text-emerald-600 dark:text-emerald-400">STEP {step} OF 2</p>
                <h2 className="font-semibold text-zinc-900 dark:text-white">{step === 1 ? 'Issue Diagnostics & Location' : 'Photos & Access Protocol'}</h2>
              </div>
              <div className="h-2 w-24 overflow-hidden rounded-full bg-zinc-200 dark:bg-white/[0.08]"><div className="h-full bg-emerald-600 transition-all" style={{ width: step === 1 ? '50%' : '100%' }} /></div>
            </div>

            <div className="space-y-6 p-6">
              {step === 1 ? (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>Property &amp; Unit <span className="text-red-500">*</span></Label>
                      <Select value={listingId} onValueChange={setListingId}>
                        <SelectTrigger><SelectValue placeholder="Select property" /></SelectTrigger>
                        <SelectContent>
                          {listings.map((l) => (
                            <SelectItem key={l.id} value={l.id}>{l.title} — {l.address}</SelectItem>
                          ))}
                          {listings.length === 0 && <SelectItem value="" disabled>No covered units found</SelectItem>}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Specific Area / Room <span className="text-red-500">*</span></Label>
                      <Select value={roomScope} onValueChange={setRoomScope}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="master-hvac">Master Bedroom HVAC Zone</SelectItem>
                          <SelectItem value="penthouse-terrace">Penthouse Terrace &amp; Drainage</SelectItem>
                          <SelectItem value="guest-cloakroom">Guest Cloakroom</SelectItem>
                          <SelectItem value="kitchen-ro">Kitchen RO Filter &amp; Sump</SelectItem>
                          <SelectItem value="main-db">Main Electrical DB &amp; Inverter</SelectItem>
                          <SelectItem value="staff-quarters">Service Quarters Annex</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Technical Domain <span className="text-red-500">*</span></Label>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {CATEGORIES.map((c) => (
                        <label key={c.value} className="cursor-pointer">
                          <input type="radio" name="category" value={c.value} checked={category === c.value} onChange={() => setCategory(c.value)} className="peer sr-only" />
                          <div className="flex h-full flex-col gap-2 rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-white/[0.04] p-4 peer-checked:border-emerald-500 peer-checked:bg-emerald-500/10 peer-checked:ring-1 peer-checked:ring-emerald-500">
                            <span className="text-sm font-semibold text-zinc-900 dark:text-white">{c.label.split(' — ')[0]}</span>
                            <span className="text-[11px] text-zinc-600 dark:text-zinc-400">{c.label.split(' — ')[1] ?? ''}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Urgency &amp; SLA <span className="text-red-500">*</span></Label>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {PRIORITIES.map((p) => (
                        <label key={p.value} className="cursor-pointer">
                          <input type="radio" name="priority" value={p.value} checked={priority === p.value} onChange={() => setPriority(p.value)} className="peer sr-only" />
                          <div className={`flex h-24 flex-col justify-between rounded-xl border p-3 peer-checked:border-emerald-500 peer-checked:bg-emerald-500/10 peer-checked:ring-1 peer-checked:ring-emerald-500 ${p.value === 'urgent' ? 'border-red-200 dark:border-red-500/20 bg-red-50/50 dark:bg-red-500/5' : 'border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-white/[0.04]'}`}>
                            <div className="flex items-center justify-between"><span className={`text-sm font-semibold ${p.value === 'urgent' ? 'text-red-600 dark:text-red-400' : 'text-zinc-900 dark:text-white'}`}>{p.label}</span><span className="font-mono text-[11px] font-semibold text-zinc-500">{p.hint.split(' — ')[0]}</span></div>
                            <span className="text-[11px] text-zinc-600 dark:text-zinc-400">{p.hint.split(' — ')[1] ?? p.hint}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="req-title">Request Summary Title <span className="text-red-500">*</span></Label>
                    <Input id="req-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Master Bedroom Inverter Chiller flashing E4" maxLength={200} />
                    <p className="text-right font-mono text-xs text-zinc-500">{title.length}/200</p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between"><Label htmlFor="req-desc">Detailed Diagnostic Symptoms <span className="text-red-500">*</span></Label><span className="text-xs text-zinc-500">Min 30 characters</span></div>
                    <Textarea id="req-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe symptoms, when it started, error codes, sounds, smells…" rows={4} maxLength={5000} />
                    <p className="text-right font-mono text-xs text-zinc-500">{description.length}/5000</p>
                  </div>

                  <div className="flex items-center gap-2 rounded-lg bg-zinc-50 dark:bg-white/[0.04] p-3 text-xs text-zinc-600 dark:text-zinc-400">
                    <AlertCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                    <span><strong>Nigerian Tenancy Covenant Sec 14:</strong> Routine repairs require photographic evidence and symptom logs prior to dispatch.</span>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={() => setStep(2)} disabled={!canContinueStep1}>Continue <ChevronRight className="ml-1 h-4 w-4" /></Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-3">
                    <Label>Preferred Inspection Date &amp; Slot</Label>
                    <div className="grid gap-3 md:grid-cols-2">
                      <Input type="date" value={preferredDate} onChange={(e) => setPreferredDate(e.target.value)} />
                      <Select value={preferredSlot} onValueChange={setPreferredSlot}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="morning">Morning (8:00 AM – 12:00 PM)</SelectItem>
                          <SelectItem value="afternoon">Afternoon (12:00 PM – 4:00 PM)</SelectItem>
                          <SelectItem value="evening">Evening (4:00 PM – 7:00 PM)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Media Evidence &amp; Visuals</Label>
                    <div className="rounded-xl border-2 border-dashed border-zinc-200 dark:border-white/[0.08] bg-zinc-50/50 dark:bg-white/[0.02] p-6 text-center">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-white">Add diagnostic photos (URLs)</p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">Paste image URLs — Max 5 (server validates URLs)</p>
                      <div className="mx-auto mt-3 flex max-w-lg gap-2">
                        <Input value={photoInput} onChange={(e) => setPhotoInput(e.target.value)} placeholder="https://..." onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPhotoUrl())} />
                        <Button type="button" variant="outline" onClick={addPhotoUrl}>Add</Button>
                      </div>
                      {photoUrls.length > 0 && (
                        <div className="mt-4 grid gap-2 sm:grid-cols-2">
                          {photoUrls.map((url, idx) => (
                            <div key={idx} className="flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 p-2 text-left">
                              <img src={url} alt={`Evidence ${idx + 1}`} className="h-12 w-12 shrink-0 rounded object-cover" onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')} />
                              <span className="min-w-0 flex-1 truncate font-mono text-xs text-zinc-600 dark:text-zinc-400">{url}</span>
                              <Button type="button" variant="ghost" size="sm" onClick={() => setPhotoUrls((prev) => prev.filter((_, i) => i !== idx))}>Remove</Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                    <Button onClick={handleSubmit} disabled={submitting || !canContinueStep1}>
                      {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                      {submitting ? 'Submitting…' : 'Submit Request'}
                    </Button>
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-col items-center justify-between gap-3 bg-zinc-50 dark:bg-white/[0.04] px-6 py-4 text-xs text-zinc-600 dark:text-zinc-400 sm:flex-row">
              <span>Technicians are LASRERA-certified with biometric digital passes.</span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/tenant/maintenance')}>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
