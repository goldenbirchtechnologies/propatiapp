'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Search,
  ChevronDown,
  CheckCircle2,
  Building2,
  BedDouble,
  Bath,
  Maximize2,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Check,
} from 'lucide-react';

interface Unit {
  id: string;
  title: string;
  beds: number;
  baths: number;
  size: string;
  floor: string;
  price: number;
  pricePeriod: string;
  available: boolean;
}

interface Development {
  id: string;
  name: string;
  address: string;
  unitCount: number;
  image: string;
  units: Unit[];
}

interface Props {
  initialDevelopments: Development[];
}


const LISTING_INTENTS = [
  { value: 'rent', label: 'For Rent (Long-term)' },
  { value: 'sale', label: 'For Sale (Outright Acquisition)' },
  { value: 'short_let', label: 'Short Let / Serviced Corporate Stay' },
];

const PROPERTY_TYPES = [
  { value: 'penthouse', label: 'Luxury High-Rise Penthouse' },
  { value: 'villa', label: 'Fully Detached Villa' },
  { value: 'duplex', label: 'Serviced Executive Duplex' },
  { value: 'office', label: 'Commercial Prime Office' },
];

const PLANNING_PERIODS = [
  { value: 'yearly', label: 'Yearly (Per Annum)' },
  { value: 'biannual', label: 'Bi-Annually' },
  { value: 'monthly', label: 'Monthly (Corporate Escrow only)' },
];

const TARGET_TENANTS = [
  { value: 'corporate', label: 'Corporate Multinational and Expats' },
  { value: 'verified', label: 'Verified Private Individuals' },
  { value: 'institutional', label: 'All Institutional Applicants' },
];

export default function ChooseDevelopmentClient({ initialDevelopments }: Props) {
  const router = useRouter();
  const developments = initialDevelopments;
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedDev, setSelectedDev] = useState<string | null>(null);
  const [selectedUnits, setSelectedUnits] = useState<Set<string>>(new Set());
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [intent, setIntent] = useState('rent');
  const [propertyType, setPropertyType] = useState('penthouse');
  const [period, setPeriod] = useState('yearly');
  const [targetTenant, setTargetTenant] = useState('corporate');

  const activeDev = developments.find((d) => d.id === selectedDev);
  const filteredUnits = activeDev?.units.filter(
    (u) => u.title.toLowerCase().includes(search.toLowerCase()) || u.id.includes(search.toLowerCase())
  ) ?? [];

  const handleSelectDev = (id: string) => {
    setSelectedDev(id);
    setSelectedUnits(new Set());
  };

  const toggleUnit = (unitId: string) => {
    setSelectedUnits((prev) => {
      const next = new Set(prev);
      if (next.has(unitId)) next.delete(unitId);
      else next.add(unitId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (!activeDev) return;
    setSelectedUnits((prev) => {
      const next = new Set(prev);
      const allSelected = activeDev.units.every((u) => next.has(u.id));
      if (allSelected) activeDev.units.forEach((u) => next.delete(u.id));
      else activeDev.units.forEach((u) => next.add(u.id));
      return next;
    });
  };

  const canProceedStep1 = !!activeDev && selectedUnits.size > 0;

  const handleContinueStep1 = () => {
    if (!canProceedStep1) {
      toast({ title: 'Select units', description: 'Choose at least one vacant unit to continue.', variant: 'destructive' });
      return;
    }
    setStep(2);
  };

  const handleBack = () => setStep(1);

  const handleSubmit = async () => {
    if (!title.trim() || !selectedDev || selectedUnits.size === 0) {
      toast({ title: 'Missing details', description: 'Please enter a listing title and select units.', variant: 'destructive' });
      return;
    }
    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          developmentId: selectedDev,
          unitIds: Array.from(selectedUnits),
          title: title.trim(),
          description: description.trim(),
          listingType: intent,
          propertyType,
          pricePeriod: period,
          targetTenant,
        }),
      });
      const data = await res.json().catch(() => ({ success: false }));
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to create listing');
      }
      toast({ title: 'Listing created', description: 'Your public listing is now syndicated to the marketplace.' });
      router.push('/dashboard/landlord/listings');
    } catch (error) {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to create listing', variant: 'destructive' });
    }
  };

  const formatPrice = (n: number) => `NGN ${n.toLocaleString()}`;

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6 bg-white dark:bg-zinc-950 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-primary/10 text-primary dark:text-[#4edea3] font-label-sm text-label-sm uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full">
              Marketplace Syndication
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Create Public Listing</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Choose a registered development and vacant units to syndicate to the Propati marketplace.
          </p>
        </div>
        <div className="bg-zinc-100 dark:bg-zinc-800 rounded-xl p-3 text-right shrink-0">
          <span className="text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold block">Active Pipeline</span>
          <span className="text-title-sm text-title-sm font-bold text-zinc-900 dark:text-white">
            {developments.length} Developments, {developments.reduce((acc, d) => acc + d.units.length, 0)} Vacant Units
          </span>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-4 bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl shadow-sm">
        {[
          { num: 1, label: 'Select Property and Vacant Units', desc: 'Admiralty Way, Lekki Phase 1', badge: 'Active' },
          { num: 2, label: 'Listing Details and Media Syndication', desc: 'Pricing, amenities, photo gallery, escrow terms', badge: step >= 2 ? 'Active' : 'Pending' },
        ].map((s) => (
          <div key={s.num} className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${step >= s.num ? 'bg-primary text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500'}`}>
              {step > s.num ? <Check size={16} /> : s.num}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-xs uppercase tracking-wider font-bold ${step >= s.num ? 'text-primary dark:text-[#4edea3]' : 'text-zinc-500 dark:text-zinc-400'}`}>
                  Phase {String(s.num).padStart(2, '0')}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${s.badge === 'Active' ? 'bg-primary/10 text-primary dark:text-[#4edea3]' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400'}`}>
                  {s.badge}
                </span>
              </div>
              <span className="text-sm font-semibold text-zinc-900 dark:text-white truncate block">{s.label}</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate block">{s.desc}</span>
            </div>
          </div>
        ))}
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div>
              <h2 className="text-title-sm text-title-sm font-semibold text-zinc-900 dark:text-white">Choose Registered Development</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Select the target real estate asset to syndicate.</p>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search titles, units, tenants, RC numbers..." className="pl-9 bg-zinc-50 dark:bg-zinc-800" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {developments.map((dev) => (
                <button
                  key={dev.id}
                  onClick={() => handleSelectDev(dev.id)}
                  className={`text-left rounded-xl border-2 p-4 transition-all ${selectedDev === dev.id ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-zinc-200 dark:border-zinc-700 hover:border-primary'}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary dark:text-[#4edea3] flex items-center justify-center">
                      <Building2 size={20} />
                    </div>
                    {selectedDev === dev.id && <CheckCircle2 size={20} className="text-primary dark:text-[#4edea3]" />}
                  </div>
                  <span className="text-sm font-semibold text-zinc-900 dark:text-white block truncate">{dev.name}</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
                    <MapPin size={12} /> {dev.address}
                  </span>
                  <span className="text-xs text-primary dark:text-[#4edea3] font-medium mt-1 block">{dev.unitCount} available units</span>
                </button>
              ))}
            </div>
          </div>

          {activeDev && (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-title-sm text-title-sm font-semibold text-zinc-900 dark:text-white">Select Vacant Units</h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {activeDev.name}, {filteredUnits.length} units
                  </p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={activeDev.units.length > 0 && activeDev.units.every((u) => selectedUnits.has(u.id))}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-zinc-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-zinc-700 dark:text-zinc-300 font-medium">Select All</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {filteredUnits.map((unit) => (
                  <button
                    key={unit.id}
                    onClick={() => toggleUnit(unit.id)}
                    className={`text-left rounded-xl border-2 p-4 transition-all ${selectedUnits.has(unit.id) ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-zinc-200 dark:border-zinc-700 hover:border-primary'}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs font-mono text-zinc-400">{unit.id}</span>
                      {selectedUnits.has(unit.id) ? (
                        <CheckCircle2 size={18} className="text-primary dark:text-[#4edea3]" />
                      ) : (
                        <div className="w-[18px] h-[18px] rounded border-2 border-zinc-300 dark:border-zinc-600" />
                      )}
                    </div>
                    <span className="text-sm font-semibold text-zinc-900 dark:text-white block line-clamp-2 min-h-[2.5rem]">{unit.title}</span>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                      <span className="flex items-center gap-1"><BedDouble size={12} /> {unit.beds}</span>
                      <span className="flex items-center gap-1"><Bath size={12} /> {unit.baths}</span>
                      <span className="flex items-center gap-1"><Maximize2 size={12} /> {unit.size}</span>
                      <span>{unit.floor}</span>
                    </div>
                    <span className="text-sm font-bold text-primary dark:text-[#4edea3] mt-2 block">
                      {formatPrice(unit.price)} / {unit.pricePeriod === 'year' ? 'yr' : unit.pricePeriod}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Selected:</span>
              {selectedUnits.size > 0 ? (
                <span className="bg-primary/10 text-primary dark:text-[#4edea3] px-3 py-1 rounded-full text-xs font-bold">
                  {selectedUnits.size} {selectedUnits.size === 1 ? 'unit' : 'units'}
                </span>
              ) : (
                <span className="text-xs text-zinc-400">None selected</span>
              )}
            </div>
            <Button onClick={handleContinueStep1} disabled={!canProceedStep1} className="bg-primary hover:bg-[var(--sovereign-hover)] text-white">
              Continue <ArrowRight size={16} className="ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div>
              <h2 className="text-title-sm text-title-sm font-semibold text-zinc-900 dark:text-white">Listing Details and Media Syndication</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                Configure pricing, amenities, photo gallery, and escrow terms for marketplace syndication.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Listing Title</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} placeholder="e.g. Ultra-Luxury Waterfront Penthouse with Private Jetty Access" />
                <span className="text-[10px] text-zinc-400">{title.length}/120</span>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Listing Intent</label>
                <div className="relative">
                  <select value={intent} onChange={(e) => setIntent(e.target.value)} className="w-full h-11 rounded-lg bg-zinc-50 dark:bg-zinc-800 px-3.5 text-zinc-900 dark:text-white font-body-md appearance-none cursor-pointer border border-zinc-200 dark:border-zinc-700">
                    {LISTING_INTENTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Property Type</label>
                <div className="relative">
                  <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className="w-full h-11 rounded-lg bg-zinc-50 dark:bg-zinc-800 px-3.5 text-zinc-900 dark:text-white font-body-md appearance-none cursor-pointer border border-zinc-200 dark:border-zinc-700">
                    {PROPERTY_TYPES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Planning Period</label>
                <div className="relative">
                  <select value={period} onChange={(e) => setPeriod(e.target.value)} className="w-full h-11 rounded-lg bg-zinc-50 dark:bg-zinc-800 px-3.5 text-zinc-900 dark:text-white font-body-md appearance-none cursor-pointer border border-zinc-200 dark:border-zinc-700">
                    {PLANNING_PERIODS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Target Tenant Profile</label>
                <div className="relative">
                  <select value={targetTenant} onChange={(e) => setTargetTenant(e.target.value)} className="w-full h-11 rounded-lg bg-zinc-50 dark:bg-zinc-800 px-3.5 text-zinc-900 dark:text-white font-body-md appearance-none cursor-pointer border border-zinc-200 dark:border-zinc-700">
                    {TARGET_TENANTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Description</label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} placeholder="Specify unique architectural highlights, neighborhood access, and corporate lease eligibility." className="min-h-[80px] bg-zinc-50 dark:bg-zinc-800" />
                <span className="text-[10px] text-zinc-400">{description.length}/500</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900 rounded-xl p-4 shadow-sm">
            <Button variant="outline" onClick={handleBack} className="text-zinc-700 dark:text-zinc-300">
              <ArrowLeft size={16} className="mr-1" /> Back
            </Button>
            <Button onClick={handleSubmit} className="bg-primary hover:bg-[var(--sovereign-hover)] text-white">
              Create and Syndicate Listing <ArrowRight size={16} className="ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
