'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateUnit } from '@/hooks/useUnits';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DroppableArea } from '@/components/ui/droppable-area';
import { toast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle,
  Building2,
  Home,
  Bed,
  Bath,
  Ruler,
  DollarSign,
  Shield,
  MapPin,
  Zap,
  Wifi,
  Car,
  Waves,
  Dumbbell,
  Trees,
  Lock,
  Sun,
  Wind,
  Plus,
  PartyPopper,
  Loader2,
} from 'lucide-react';

type Props = {
  listingId: string;
  orgId: string | null;
  listingTitle: string;
  existingUnits: string[];
};

function capitalizeWords(value: string) {
  return value.split(/[\s-]+/).map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join(' ');
}

const TYPE_OPTIONS = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'studio', label: 'Studio' },
  { value: 'duplex', label: 'Duplex' },
  { value: 'office', label: 'Commercial Space' },
  { value: 'shop', label: 'Shop' },
  { value: 'warehouse', label: 'Warehouse' },
  { value: 'land', label: 'Land' },
  { value: 'shared', label: 'Shared Room' },
] as const;

const LISTING_TYPE_OPTIONS = [
  { value: 'rent', label: 'For Rent' },
  { value: 'short_let', label: 'Short-Let' },
  { value: 'sale', label: 'For Sale' },
  { value: 'unlisted', label: 'Unlisted' },
] as const;

const RENT_CYCLE_OPTIONS = [
  { value: 'month', label: 'Per Month' },
  { value: 'year', label: 'Per Year' },
  { value: 'total', label: 'Total (One-time)' },
] as const;

export default function UnitAddClient({ listingId, orgId, listingTitle, existingUnits }: Props) {
  const router = useRouter();
  const createUnit = useCreateUnit();
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [unitNumber, setUnitNumber] = useState('');
  const [type, setType] = useState('apartment');
  const [listingType, setListingType] = useState<'rent' | 'short_let' | 'sale' | 'unlisted'>('rent');
  const [pricePeriod, setPricePeriod] = useState('month');
  const [bedrooms, setBedrooms] = useState(1);
  const [bathrooms, setBathrooms] = useState(1);
  const [sizeSqm, setSizeSqm] = useState('');
  const [rent, setRent] = useState('');
  const [cautionDeposit, setCautionDeposit] = useState('');
  const [serviceCharge, setServiceCharge] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);

  const priceLabel =
    listingType === 'short_let'
      ? 'Nightly Rate (NGN)'
      : listingType === 'sale'
        ? 'Outright Price (NGN)'
        : 'Rent Amount (NGN)';

  const showRentCycle = listingType === 'rent';
  const showPriceInput = listingType !== 'unlisted';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitNumber.trim()) {
      toast({ title: 'Unit number required', description: 'Enter a unit number for this unit.', variant: 'destructive' });
      return;
    }
    if (existingUnits.includes(unitNumber.trim())) {
      toast({ title: 'Duplicate unit', description: 'This unit number already exists on this property.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      let effectiveOrgId = orgId;

      if (!effectiveOrgId) {
        const orgRes = await fetch('/api/orgs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: `${listingTitle || 'Property'} Organisation`, planTier: 'starter' }),
        });
        if (!orgRes.ok) {
          const data = await orgRes.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to create organisation for this property');
        }
        const orgJson = await orgRes.json();
        effectiveOrgId = orgJson?.data?.id;
        if (!effectiveOrgId) throw new Error('Missing organisation id');
      }

      if (effectiveOrgId && listingId) {
        const linkRes = await fetch(`/api/orgs/${encodeURIComponent(effectiveOrgId)}/listings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ listingId }),
        });
        if (!linkRes.ok) {
          const linkData = await linkRes.json().catch(() => ({}));
          if (linkRes.status !== 409) {
            throw new Error(linkData.error || 'Failed to link property to organisation');
          }
        }
      }

      await createUnit.mutateAsync({
        orgId: effectiveOrgId,
        listingId,
        unitNumber: unitNumber.trim(),
        type,
        listingType,
        bedrooms,
        bathrooms,
        sizeSqm: sizeSqm ? Number(sizeSqm) : undefined,
        rent: showPriceInput ? Number(rent) : 0,
        pricePeriod: showRentCycle ? pricePeriod : undefined,
        cautionDeposit: cautionDeposit ? Number(cautionDeposit) : undefined,
        serviceCharge: serviceCharge ? Number(serviceCharge) : undefined,
        status: 'AVAILABLE',
        occupancy: 'VACANT',
      });

      toast({ title: 'Unit added', description: 'New unit has been added to this property.' });
      router.push('/dashboard/landlord/properties');
    } catch (error) {
      toast({
        title: 'Failed to add unit',
        description: error instanceof Error ? error.message : 'Unexpected error',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { num: 1, label: 'Structure' },
    { num: 2, label: 'Type' },
    { num: 3, label: 'Capacity' },
    { num: 4, label: 'Amenities' },
    { num: 5, label: 'Pricing' },
    { num: 6, label: 'Review' },
  ];

  const progressPct = (currentStep / steps.length) * 100;

  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-zinc-950 min-h-screen">
      {/* Header */}
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-4">
          <button onClick={() => router.back()} className="hover:text-emerald-600 transition-colors flex items-center gap-1">Home</button>
          <span>/</span>
          <span>Properties</span>
          <span>/</span>
          <span className="text-zinc-900 dark:text-white font-semibold">Add Unit</span>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Add Unit to {capitalizeWords(listingTitle || 'Property')}</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Configure a new rentable unit for this property.</p>
        </div>

        {/* Step Progress */}
        <div className="mb-6 bg-zinc-50 dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between relative px-2">
            <div className="absolute left-6 right-6 top-3 h-0.5 bg-zinc-200 dark:bg-zinc-700" />
            <div className="absolute left-6 top-3 h-0.5 bg-emerald-500 transition-all duration-500" style={{ width: `calc(${progressPct}% - ${progressPct * 0.06}rem)` }} />
            {steps.map((step) => {
              const isCompleted = step.num < currentStep;
              const isActive = step.num === currentStep;
              return (
                <button
                  key={step.num}
                  onClick={() => setCurrentStep(step.num)}
                  className="group relative z-10 flex flex-col items-center gap-1 focus:outline-none min-w-[40px]"
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow-sm text-[10px] font-bold transition-all ${
                    isCompleted ? 'bg-emerald-500 text-white' :
                    isActive ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/20' :
                    'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                  }`}>
                    {isCompleted ? <Check size={12} /> : step.num}
                  </div>
                  <span className={`text-[9px] whitespace-nowrap ${isActive ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-zinc-500 dark:text-zinc-400'}`}>
                    {step.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <form onSubmit={handleSubmit}>
          {/* STEP 1: Structure */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
                <Label className="text-sm font-medium text-zinc-900 dark:text-white">Unit Number / Name</Label>
                <Input value={unitNumber} onChange={(e) => setUnitNumber(e.target.value)} placeholder="e.g. Unit 401" />
              </div>
              <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
                <Label className="text-sm font-medium text-zinc-900 dark:text-white">Physical Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {TYPE_OPTIONS.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* STEP 2: Listing Type */}
          {currentStep === 2 && (
            <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
              <Label className="text-sm font-medium text-zinc-900 dark:text-white">Listing Intent</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {LISTING_TYPE_OPTIONS.map((opt) => (
                  <label key={opt.value} className={`p-4 rounded-xl border cursor-pointer transition-all ${listingType === opt.value ? 'border-emerald-500 bg-emerald-500/5' : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'}`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full border-2 ${listingType === opt.value ? 'border-emerald-500 bg-emerald-500' : 'border-zinc-300'}`} />
                      <span className="text-sm font-semibold text-zinc-900 dark:text-white">{opt.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Capacity */}
          {currentStep === 3 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Bedrooms', value: bedrooms, setter: setBedrooms, icon: Bed },
                { label: 'Bathrooms', value: bathrooms, setter: setBathrooms, icon: Bath },
                { label: 'Size (sqm)', value: sizeSqm, setter: setSizeSqm, icon: Ruler, isText: true },
              ].map((item) => (
                <div key={item.label} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-center">
                  <item.icon size={20} className="mx-auto text-zinc-400 mb-2" />
                  <div className="text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{item.label}</div>
                  {item.isText ? (
                    <Input value={item.value} onChange={(e) => (item.setter as (v: string) => void)(e.target.value)} className="mt-2 text-center" placeholder="—" />
                  ) : (
                    <>
                      <div className="text-xl font-bold text-zinc-900 dark:text-white mt-1">{item.value}</div>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <button type="button" onClick={() => (item.setter as (v: number) => void)(Math.max(0, Number(item.value) - 1))} className="w-6 h-6 rounded bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400">−</button>
                        <button type="button" onClick={() => (item.setter as (v: number) => void)(Number(item.value) + 1)} className="w-6 h-6 rounded bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400">+</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* STEP 4: Pricing */}
          {currentStep === 4 && (
            <div className="space-y-4">
              {showPriceInput && (
                <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
                  <Label className="text-sm font-medium text-zinc-900 dark:text-white">{priceLabel}</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-zinc-900 dark:text-white">₦</span>
                    <Input type="number" value={rent} onChange={(e) => setRent(e.target.value)} className="pl-8 text-lg font-bold" />
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <Label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Caution Deposit</Label>
                  <Input type="number" value={cautionDeposit} onChange={(e) => setCautionDeposit(e.target.value)} placeholder="Optional" />
                </div>
                <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <Label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Service Charge</Label>
                  <Input type="number" value={serviceCharge} onChange={(e) => setServiceCharge(e.target.value)} placeholder="Optional" />
                </div>
              </div>
              {showRentCycle && (
                <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <Label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Payment Cycle</Label>
                  <Select value={pricePeriod} onValueChange={setPricePeriod}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {RENT_CYCLE_OPTIONS.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: Photos */}
          {currentStep === 5 && (
            <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl p-8 text-center">
              <div className="text-sm text-zinc-500 dark:text-zinc-400">Drag & drop unit photos here, or click to browse</div>
              <p className="text-xs text-zinc-400 mt-1">PNG, JPG up to 10MB each</p>
            </div>
          )}

          {/* STEP 6: Review */}
          {currentStep === 6 && (
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle size={24} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 dark:text-white">Review & Confirm</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Verify all details before creating the unit.</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-500 dark:text-zinc-400">Unit Number</span>
                  <span className="font-semibold text-zinc-900 dark:text-white">{unitNumber || '—'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-500 dark:text-zinc-400">Type</span>
                  <span className="font-semibold text-zinc-900 dark:text-white capitalize">{type}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-500 dark:text-zinc-400">Listing</span>
                  <span className="font-semibold text-zinc-900 dark:text-white">{LISTING_TYPE_OPTIONS.find((o) => o.value === listingType)?.label}</span>
                </div>
                {showPriceInput && (
                  <div className="flex justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
                    <span className="text-zinc-500 dark:text-zinc-400">Rent</span>
                    <span className="font-semibold text-zinc-900 dark:text-white">₦{Number(rent || 0).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between py-2">
                  <span className="text-zinc-500 dark:text-zinc-400">Size</span>
                  <span className="font-semibold text-zinc-900 dark:text-white">{sizeSqm ? `${sizeSqm} m²` : '—'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pb-6">
            {currentStep > 1 ? (
              <Button type="button" variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                <ArrowLeft size={14} className="mr-1" /> Previous
              </Button>
            ) : <div />}
            {currentStep < steps.length ? (
              <Button type="button" onClick={() => setCurrentStep(currentStep + 1)} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                Next <ArrowRight size={14} className="ml-1" />
              </Button>
            ) : (
              <Button type="submit" disabled={submitting} className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-md">
                {submitting ? <Loader2 size={14} className="mr-2 animate-spin" /> : <PartyPopper size={14} className="mr-2" />}
                {submitting ? 'Creating...' : 'Create Unit'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
