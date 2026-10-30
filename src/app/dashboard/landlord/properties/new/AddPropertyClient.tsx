'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateListing } from '@/hooks/useListings';
import { useCreateUnit } from '@/hooks/useUnits';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DroppableArea } from '@/components/ui/droppable-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  Loader2,
  X,
  Check,
  BadgePercent,
  Settings2,
  ShieldCheck,
  Upload,
  Film,
  ArrowRight,
  Building2,
  Trash2,
  Copy,
  CheckCircle,
} from 'lucide-react';

const listingSchema = z.object({
  title: z.string().min(5, 'Property name must be at least 5 characters').max(100),
  description: z.string().max(5000).optional().or(z.literal('')),
  propertyType: z.enum(['apartment', 'house', 'duplex', 'land', 'office', 'shop', 'warehouse']).optional(),
  address: z.string().min(5, 'Street address must be at least 5 characters'),
  area: z.string().min(2, 'Area is required').optional(),
  state: z.string().min(2).default('Lagos'),
  city: z.string().optional().or(z.literal('')),
  postalCode: z.string().optional().or(z.literal('')),
  floors: z.number().int().nonnegative().optional(),
  amenities: z.array(z.string()).optional(),
});

type ListingInput = z.infer<typeof listingSchema>;

type ListingIntent = 'rent' | 'short_let' | 'sale';

type UnitPeriod = 'month' | 'night' | 'total';

type UnitDraftType = {
  id: string;
  unitNumber: string;
  bedrooms: number;
  bathrooms: number;
  sizeSqm: number | undefined;
  listingType: ListingIntent;
  price: number;
  pricePeriod: UnitPeriod;
  minimumStay: number | undefined;
  cautionDeposit: number | undefined;
  serviceCharge: number | undefined;
  isListed: boolean;
};

const UnitDraft: UnitDraftType = {
  id: '',
  unitNumber: '',
  bedrooms: 1,
  bathrooms: 1,
  sizeSqm: undefined,
  listingType: 'rent',
  price: 0,
  pricePeriod: 'month',
  minimumStay: undefined,
  cautionDeposit: undefined,
  serviceCharge: undefined,
  isListed: false,
};

const newUnit = (num: number): UnitDraftType => ({
  id: `unit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${num}`,
  unitNumber: String(num),
  bedrooms: 1,
  bathrooms: 1,
  sizeSqm: undefined,
  listingType: 'rent',
  price: 0,
  pricePeriod: 'month',
  minimumStay: undefined,
  cautionDeposit: undefined,
  serviceCharge: undefined,
  isListed: false,
});

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
  'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi',
  'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun',
  'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
];

const CITIES_BY_STATE: Record<string, string[]> = {
  Lagos: ['Lekki', 'Victoria Island', 'Ikeja', 'Surulere', 'Yaba', 'Ikoyi'],
  Abuja: ['Garki', 'Wuse', 'Maitama', 'Asokoro', 'Jabi', 'Wuye'],
  Rivers: ['Port Harcourt', 'Obio-Akpor', 'Eleme'],
  Oyo: ['Ibadan', 'Oyo', 'Egbeda'],
  Kano: ['Nassarawa', 'Fagge', 'Gwale', 'Dala'],
  Kaduna: ['Kaduna', 'Zaria', 'Kafanchan'],
  Enugu: ['Enugu', 'Nsukka', 'Awgu'],
  Delta: ['Asaba', 'Warri', 'Sapele'],
  Edo: ['Benin City', 'Auchi', 'Ekpoma'],
  Ogun: ['Abeokuta', 'Sagamu', 'Ilaro'],
  Anambra: ['Awka', 'Onitsha', 'Nnewi'],
  Abia: ['Umuahia', 'Aba', 'Ohafia'],
  FCT: ['Garki', 'Wuse', 'Maitama', 'Asokoro'],
};

const PROPERTY_TYPE_OPTIONS = [
  { value: 'apartment', label: 'Residential' },
  { value: 'house', label: 'Hostel' },
  { value: 'shop', label: 'Shop' },
  { value: 'office', label: 'Commercial' },
];

const AMENITIES = [
  { id: 'parking', label: 'Parking' },
  { id: 'generator', label: 'Generator' },
  { id: 'borehole', label: 'Borehole' },
  { id: 'cctv', label: 'CCTV' },
  { id: 'security', label: 'Security' },
  { id: 'pool', label: 'Pool' },
  { id: 'gym', label: 'Gym' },
  { id: 'wifi', label: 'Wi-Fi' },
  { id: 'ac', label: 'Air Conditioning' },
  { id: 'fenced', label: 'Fenced' },
];

const RENT_PERIODS = [
  { value: 'year', label: 'Per year' },
  { value: 'month', label: 'Per month' },
  { value: 'day', label: 'Per day' },
];

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export default function AddPropertyClient({ orgId }: { orgId: string | null }) {
  const router = useRouter();
  const { toast } = useToast();
  const createListing = useCreateListing();
  const createUnit = useCreateUnit();
  const [submitting, setSubmitting] = useState(false);
  const [units, setUnits] = useState<UnitDraftType[]>([newUnit(1)]);
  const [nextUnitNum, setNextUnitNum] = useState(2);
  const [photos, setPhotos] = useState<{ file: File; progress: number; status: 'pending' | 'uploading' | 'completed' | 'error'; error?: string }[]>([]);
  const [videos, setVideos] = useState<{ file: File; progress: number; status: 'pending' | 'uploading' | 'completed' | 'error'; error?: string }[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  type UploadFile = { file: File; progress: number; status: 'pending' | 'uploading' | 'completed' | 'error'; error?: string };
  const [unitPhotos, setUnitPhotos] = useState<Record<string, UploadFile[]>>({});
  const [quickListingType, setQuickListingType] = useState<ListingIntent>('rent');
  const [quickPrice, setQuickPrice] = useState('');
  const [quickPeriod, setQuickPeriod] = useState('month');
  const [quickMinStay, setQuickMinStay] = useState('');
  const [defaultCaution, setDefaultCaution] = useState('');
  const [defaultService, setDefaultService] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  const form = useForm<ListingInput>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: '',
      description: '',
      propertyType: 'apartment',
      address: '',
      area: '',
      state: 'Lagos',
      city: '',
      postalCode: '',
      floors: undefined,
      amenities: [],
    },
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/verification/my');
        const data = await res.json();
        if (!cancelled) setVerificationStatus(data?.verification?.overallStatus || null);
      } catch {
        if (!cancelled) setVerificationStatus(null);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const watchedState = form.watch('state');
  const availableCities = useMemo(() => CITIES_BY_STATE[watchedState] || [], [watchedState]);

  const toggleAmenity = (id: string) => {
    setAmenities((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  };

  const applyQuickSetup = () => {
    const price = parseFloat(quickPrice);
    const cd = parseFloat(defaultCaution);
    const sc = parseFloat(defaultService);
    const ms = parseInt(quickMinStay, 10);
    const hasPrice = !isNaN(price) && price > 0;
    const hasFees = (!isNaN(cd) && cd >= 0) || (!isNaN(sc) && sc >= 0);
    if (!hasPrice && !hasFees) return;

    setUnits((cur) =>
      cur.map((u) => ({
        ...u,
        listingType: quickListingType,
        price: hasPrice ? price : u.price,
        pricePeriod:
          quickListingType === 'short_let'
            ? 'night'
            : quickListingType === 'sale'
              ? 'total'
              : quickPeriod,
        minimumStay:
          quickListingType === 'short_let' && !isNaN(ms) && ms > 0 ? ms : u.minimumStay,
        isListed: false,
        cautionDeposit: !isNaN(cd) ? cd : u.cautionDeposit,
        serviceCharge: !isNaN(sc) ? sc : u.serviceCharge,
      }))
    );
    toast({ title: 'Quick setup applied', description: 'Settings updated for all units.' });
  };

  const updateUnit = (id: string, patch: Partial<typeof UnitDraft>) => {
    setUnits((cur) => cur.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  };

  const addUnit = () => {
    setUnits((cur) => [...cur, newUnit(nextUnitNum)]);
    setNextUnitNum((n) => n + 1);
  };

  const removeUnit = (id: string) => {
    setUnits((cur) => cur.filter((u) => u.id !== id));
  };

  const onSubmit = async (data: ListingInput) => {
    setSubmitting(true);
    const getErrorMessage = (err: unknown) => {
      if (err && typeof err === 'object' && 'message' in err) {
        const message = (err as { message?: unknown }).message;
        if (typeof message === 'string' && message.trim()) return message;
      }
      if (err instanceof Error) return err.message;
      return 'Unexpected error';
    };

    try {
      const safeData = {
        ...data,
        city: data.city || undefined,
        postalCode: data.postalCode || undefined,
      };

      const hasPositivePrice = units.some((u) => Number(u.price || 0) > 0);
      const price = hasPositivePrice ? Math.max(...units.map((u) => Number(u.price || 0))) : 0;

      if (!hasPositivePrice || price <= 0) {
        throw new Error('Set a positive price for at least one unit before saving.');
      }

      if (units.length === 0) {
        throw new Error('Add at least one unit before saving this property.');
      }

      const basePayload = {
        ...safeData,
        price,
        listingType: 'rent' as const,
        area: safeData.area || safeData.address,
        amenities,
      };

      const listing = await createListing.mutateAsync(basePayload as any);

      toast({ title: 'Property saved', description: 'Building created. Units will be linked now.' });

      if (orgId) {
        try {
          const linkRes = await fetch(`/api/orgs/${encodeURIComponent(orgId)}/listings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ listingId: listing.id }),
          });
          if (!linkRes.ok) {
            const linkData = await linkRes.json().catch(() => ({}));
            if (linkRes.status !== 409) {
              throw new Error(linkData.error || 'Failed to link property to organization');
            }
          }

          const results = await Promise.allSettled(
            units.map((u) =>
              createUnit.mutateAsync({
                orgId,
                buildingName: data.title,
                unitNumber: u.unitNumber,
                type: data.propertyType || 'apartment',
                listingType: u.listingType,
                pricePeriod: u.pricePeriod,
                minimumStay: u.minimumStay,
                isListed: u.isListed,
                bedrooms: u.bedrooms,
                bathrooms: u.bathrooms,
                sizeSqm: u.sizeSqm,
                rent: u.price,
                cautionDeposit: u.cautionDeposit,
                serviceCharge: u.serviceCharge,
                status: 'AVAILABLE',
                occupancy: 'VACANT',
                listingId: listing.id,
              })
            )
          );

          const created = results.filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled').length;
          const failed = results.filter((r) => r.status === 'rejected');

          if (created > 0) {
            toast({ title: `${created} unit${created > 1 ? 's' : ''} linked`, description: failed.length > 0 ? `${failed.length} unit${(failed as any[]).length > 1 ? 's' : ''} could not be created.` : undefined });
          }
        } catch (unitError) {
          console.error('Unit creation error:', unitError);
          toast({ title: 'Units pending', description: unitError instanceof Error ? unitError.message : 'Property saved, but some units could not be linked.' });
        }
      } else {
        try {
          const orgRes = await fetch('/api/orgs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: `${data.title || 'Property'} Organisation`, planTier: 'starter' }) });
          if (!orgRes.ok) { const orgData = await orgRes.json().catch(() => ({})); throw new Error(orgData.error || 'Failed to create organisation'); }
          const orgJson = await orgRes.json();
          const newOrgId = orgJson?.data?.id;
          if (!newOrgId) throw new Error('Missing organisation id');

          const linkRes = await fetch(`/api/orgs/${encodeURIComponent(newOrgId)}/listings`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ listingId: listing.id }) });
          if (!linkRes.ok) { const linkData = await linkRes.json().catch(() => ({})); if (linkRes.status !== 409) throw new Error(linkData.error || 'Failed to link property to organization'); }

          const results = await Promise.allSettled(units.map((u) => createUnit.mutateAsync({ orgId: newOrgId, buildingName: data.title, unitNumber: u.unitNumber, type: data.propertyType || 'apartment', listingType: u.listingType, pricePeriod: u.pricePeriod, minimumStay: u.minimumStay, isListed: u.isListed, bedrooms: u.bedrooms, bathrooms: u.bathrooms, sizeSqm: u.sizeSqm, rent: u.price, cautionDeposit: u.cautionDeposit, serviceCharge: u.serviceCharge, status: 'AVAILABLE', occupancy: 'VACANT', listingId: listing.id })));
          const created = results.filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled').length;
          const failed = results.filter((r) => r.status === 'rejected');
          if (created > 0) toast({ title: `${created} unit${created > 1 ? 's' : ''} linked`, description: failed.length > 0 ? `${(failed as any[]).length} unit${(failed as any[]).length > 1 ? 's' : ''} could not be created.` : undefined });
        } catch (orgError) {
          console.error('Auto-org/units error:', orgError);
          toast({ title: 'Units pending', description: orgError instanceof Error ? orgError.message : 'Property saved, but we could not auto-create units.' });
        }
      }

      router.push('/dashboard/landlord/properties');
      router.refresh();
    } catch (error) {
      toast({ title: 'Failed to create property', description: getErrorMessage(error), variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6 bg-surface-container-lowest dark:bg-zinc-950 min-h-screen">
      {/* Breadcrumb & Status Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <nav className="flex items-center gap-2 text-xs text-surface-variant dark:text-surface-variant">
          <Link href="/dashboard/landlord" className="hover:text-on-primary-fixed transition-colors flex items-center gap-1">Home</Link>
          <span>/</span>
          <Link href="/dashboard/landlord/properties" className="hover:text-on-primary-fixed transition-colors">Properties</Link>
          <span>/</span>
          <span className="text-on-surface dark:text-white font-semibold">Add New Property</span>
        </nav>
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Registry Active
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="flex flex-col gap-1 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-on-primary-fixed dark:text-primary font-bold">Institutional Asset Intake</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface dark:text-white">Add Property</h1>
          <p className="text-sm text-surface-variant dark:text-surface-variant">Register institutional assets and configure rentable units.</p>
        </div>
      </div>

      {/* Step Progress Indicator */}
      <div className="bg-surface-container-low dark:bg-zinc-900 rounded-xl p-4 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
          <div className="hidden md:block absolute top-6 left-12 right-12 h-0.5 bg-surface-container-high dark:bg-zinc-700" />
          <div className="hidden md:block absolute top-6 left-12 h-0.5 bg-primary transition-all duration-500" style={{ width: `${((currentStep - 1) / 2) * 100}%`, maxWidth: 'calc(100% - 6rem)' }} />
          {[
            { num: 1, label: 'Property Details', sub: 'Title, footprint & specs' },
            { num: 2, label: 'Units Builder', sub: 'Rent matrix & amenities' },
            { num: 3, label: 'Confirmation', sub: 'Registry review & publish' },
          ].map((step) => (
            <button
              key={step.num}
              onClick={() => setCurrentStep(step.num)}
              className={`group text-left relative z-10 flex items-center md:flex-col md:items-start gap-3 transition-opacity ${currentStep === step.num ? '' : 'opacity-60'}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-md font-bold text-sm ${
                currentStep >= step.num ? 'bg-primary text-white' : 'bg-surface-container-high dark:bg-zinc-700 text-surface-variant dark:text-surface-variant'
              }`}>
                {currentStep > step.num ? <Check size={16} /> : step.num}
              </div>
              <div className="flex flex-col">
                <span className={`text-[10px] uppercase tracking-wider font-bold ${currentStep >= step.num ? 'text-on-primary-fixed dark:text-primary' : 'text-surface-variant dark:text-surface-variant'}`}>
                  Phase 0{step.num}
                </span>
                <span className="text-sm font-semibold text-on-surface dark:text-white">{step.label}</span>
                <span className="text-xs text-surface-variant dark:text-surface-variant hidden sm:inline">{step.sub}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* MAIN FORM BODY */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
          {/* STEP 1: PROPERTY DETAILS */}
          {currentStep === 1 && (
            <div className="flex flex-col gap-6">
              <div className="bg-surface-container-lowest dark:bg-zinc-900 rounded-xl border border-surface-variant dark:border-inverse-surface shadow-[0_1px_8px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="px-6 py-4 bg-surface-container-low dark:bg-zinc-800/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 size={20} className="text-on-primary-fixed dark:text-primary" />
                    <span className="font-semibold text-on-surface dark:text-white">Asset Identification & Demographics</span>
                  </div>
                </div>
                <div className="p-6 flex flex-col gap-4">
                  {/* Property Name */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium uppercase tracking-wider text-surface-variant dark:text-surface-variant">
                      Property Name / Building Name <span className="text-error">*</span>
                    </label>
                    <FormField control={form.control as unknown} name="title" render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="e.g. Sovereign Crest Tower II" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  {/* Address */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium uppercase tracking-wider text-surface-variant dark:text-surface-variant">
                      Physical Address <span className="text-error">*</span>
                    </label>
                    <FormField control={form.control as unknown} name="address" render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea rows={3} placeholder="Street, City, State, Country" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  {/* Grid of Property Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <FormField control={form.control as unknown} name="propertyType" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium uppercase tracking-wider text-surface-variant dark:text-surface-variant">Property Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                          <SelectContent>{PROPERTY_TYPE_OPTIONS.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control as unknown} name="floors" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium uppercase tracking-wider text-surface-variant dark:text-surface-variant">Floors</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} placeholder="e.g. 4" {...field} onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  {/* Description */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium uppercase tracking-wider text-surface-variant dark:text-surface-variant">Asset Description & Amenities</label>
                    <FormField control={form.control as unknown} name="description" render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea rows={4} placeholder="Describe the property..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 bg-surface-container-low dark:bg-zinc-800/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <Button type="button" variant="outline" className="w-full sm:w-auto">Save as Draft</Button>
                  <Button type="button" onClick={() => setCurrentStep(2)} className="w-full sm:w-auto bg-primary hover:bg-primary text-white shadow-md">
                    Continue to Units Builder <ArrowRight size={16} className="ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: UNITS BUILDER */}
          {currentStep === 2 && (
            <div className="flex flex-col gap-6">
              {/* Units Summary Ribbon */}
              <div className="bg-primary text-white rounded-xl p-4 shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-lowest/10 flex items-center justify-center">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-primary">Unit Matrix Overview</span>
                    <span className="text-lg font-semibold block">Total {units.length} Units Configured</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-2 bg-surface-container-lowest/10 px-4 py-2 rounded-lg">
                  <span className="text-xs text-primary">Combined Monthly:</span>
                  <span className="text-xl font-bold tracking-tight">₦ {units.reduce((s, u) => s + (u.price || 0), 0).toLocaleString()}</span>
                </div>
              </div>

              {/* Unit Rows */}
              <div className="flex flex-col gap-4">
                {units.map((u) => (
                  <div key={u.id} className="bg-surface-container-lowest dark:bg-zinc-900 rounded-xl border border-surface-variant dark:border-inverse-surface shadow-[0_1px_8px_rgba(0,0,0,0.04)] overflow-hidden">
                    <div className="px-4 py-3 bg-surface-container-low dark:bg-zinc-800/50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-on-primary-fixed dark:text-primary">#{u.unitNumber}</span>
                        <span className="text-sm font-semibold text-on-surface dark:text-white">Unit {u.unitNumber}</span>
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-on-primary-fixed dark:text-primary text-[10px] font-semibold">DRAFT</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {units.length > 1 && (
                          <button onClick={() => removeUnit(u.id)} className="p-1 rounded text-surface-variant hover:text-error transition-colors">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                      <div className="col-span-2 sm:col-span-1 lg:col-span-1">
                        <label className="text-[10px] font-medium text-surface-variant dark:text-surface-variant">Unit Name</label>
                        <Input value={u.unitNumber} onChange={(e) => updateUnit(u.id, { unitNumber: e.target.value })} className="mt-1" />
                      </div>
                      <div>
                        <label className="text-[10px] font-medium text-surface-variant dark:text-surface-variant">Bedrooms</label>
                        <Input type="number" min={0} value={u.bedrooms} onChange={(e) => updateUnit(u.id, { bedrooms: parseInt(e.target.value) || 0 })} className="mt-1" />
                      </div>
                      <div>
                        <label className="text-[10px] font-medium text-surface-variant dark:text-surface-variant">Bathrooms</label>
                        <Input type="number" min={0} value={u.bathrooms} onChange={(e) => updateUnit(u.id, { bathrooms: parseInt(e.target.value) || 0 })} className="mt-1" />
                      </div>
                      <div>
                        <label className="text-[10px] font-medium text-surface-variant dark:text-surface-variant">Size (sqm)</label>
                        <Input type="number" min={0} placeholder="Optional" value={u.sizeSqm ?? ''} onChange={(e) => updateUnit(u.id, { sizeSqm: e.target.value ? parseFloat(e.target.value) : undefined })} className="mt-1" />
                      </div>
                      <div>
                        <label className="text-[10px] font-medium text-on-primary-fixed dark:text-primary">Rent (₦/mo)</label>
                        <Input type="number" min={0} value={u.price || ''} onChange={(e) => updateUnit(u.id, { price: parseFloat(e.target.value) || 0 })} className="mt-1 font-semibold" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Unit Button */}
              <button onClick={addUnit} className="w-full py-3 rounded-xl bg-surface-container dark:bg-zinc-800 hover:bg-surface-container-high dark:hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2 text-on-primary-fixed dark:text-primary font-semibold text-sm">
                <Plus size={16} />
                Add Another Unit
              </button>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>Back</Button>
                <Button type="button" onClick={() => setCurrentStep(3)} className="bg-primary hover:bg-primary text-white">
                  Review & Confirm <ArrowRight size={16} className="ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: CONFIRMATION */}
          {currentStep === 3 && (
            <div className="bg-surface-container-lowest dark:bg-zinc-900 rounded-xl border border-surface-variant dark:border-inverse-surface shadow-[0_1px_8px_rgba(0,0,0,0.04)] p-6 flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <CheckCircle size={32} className="text-on-primary-fixed dark:text-primary" />
              </div>
              <h2 className="text-xl font-bold text-on-surface dark:text-white">Ready to Publish</h2>
              <p className="text-sm text-surface-variant dark:text-surface-variant max-w-md mt-2">
                Your property "{form.watch('title') || 'Untitled'}" with {units.length} unit{units.length !== 1 ? 's' : ''} is ready for registry review.
              </p>
              <div className="flex items-center gap-3 mt-6">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(2)}>Back to Units</Button>
                <Button type="submit" disabled={submitting} className="bg-primary hover:bg-primary text-white shadow-md">
                  {submitting ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Check size={16} className="mr-2" />}
                  {submitting ? 'Publishing...' : 'Publish Property'}
                </Button>
              </div>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
