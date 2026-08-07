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
  isListed: true,
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
  isListed: true,
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
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
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
  const [unverifiedNotice, setUnverifiedNotice] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);

  const form = useForm<ListingInput>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: 'Maple Court Apartments',
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
    return () => {
      cancelled = true;
    };
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

  const applyDefaultFees = () => {
    const cd = parseFloat(defaultCaution);
    const sc = parseFloat(defaultService);
    if ((!isNaN(cd) && cd >= 0) || (!isNaN(sc) && sc >= 0)) {
      setUnits((cur) =>
        cur.map((u) => ({
          ...u,
          cautionDeposit: !isNaN(cd) ? cd : undefined,
          serviceCharge: !isNaN(sc) ? sc : undefined,
        }))
      );
      toast({ title: 'Default fees applied', description: 'Caution deposit and service charge updated for all units.' });
    }
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

      toast({
        title: 'Property saved',
        description: 'Building created. Units will be linked now.',
      });

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
            toast({
              title: `${created} unit${created > 1 ? 's' : ''} linked`,
              description: failed.length > 0 ? `${failed.length} unit${(failed as any[]).length > 1 ? 's' : ''} could not be created.` : undefined,
            });
          }
          if (failed.length > 0 && created === 0) {
            const reason = (failed[0] as any).reason?.message || 'Unexpected error';
            throw new Error(reason);
          }
        } catch (unitError) {
          console.error('Unit creation error:', unitError);
          toast({
            title: 'Units pending',
            description: unitError instanceof Error ? unitError.message : 'Property saved, but some units could not be linked. You can add them later.',
          });
        }
      } else {
        try {
          const orgRes = await fetch('/api/orgs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: `${data.title || 'Property'} Organisation`, planTier: 'starter' }),
          });
          if (!orgRes.ok) {
            const orgData = await orgRes.json().catch(() => ({}));
            throw new Error(orgData.error || 'Failed to create organisation');
          }
          const orgJson = await orgRes.json();
          const newOrgId = orgJson?.data?.id;
          if (!newOrgId) throw new Error('Missing organisation id');

          const linkRes = await fetch(`/api/orgs/${encodeURIComponent(newOrgId)}/listings`, {
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
                orgId: newOrgId,
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
            toast({
              title: `${created} unit${created > 1 ? 's' : ''} linked`,
              description: failed.length > 0 ? `${(failed as any[]).length} unit${(failed as any[]).length > 1 ? 's' : ''} could not be created.` : undefined,
            });
          }
          if (failed.length > 0 && created === 0) {
            const reason = (failed[0] as any).reason?.message || 'Unexpected error';
            throw new Error(reason);
          }
        } catch (orgError) {
          console.error('Auto-org/units error:', orgError);
          toast({
            title: 'Units pending',
            description: orgError instanceof Error ? orgError.message : 'Property saved, but we could not auto-create an organisation to store units. You can add them later from the property page.',
          });
        }
      }

      router.push('/dashboard/landlord/properties');
      router.refresh();
    } catch (error) {
      toast({
        title: 'Failed to create property',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-9 w-9"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Add property</h1>
            <p className="text-muted-foreground mt-1">Create a new building and its units</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" className="gap-2">
            <BadgePercent className="h-4 w-4" />
            Refer & earn
          </Button>
          <div className="flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-1.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold">
              ZX
            </div>
            <span className="text-sm font-medium text-foreground">ZX zero</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={verificationStatus === 'certified' ? 'default' : 'destructive'}
                size="sm"
                className="gap-1.5"
              >
                <ShieldCheck className="h-4 w-4" />
                {verificationStatus === 'certified' ? 'VERIFIED' : 'UNVERIFIED'}
                <ChevronDownIcon className="h-3.5 w-3.5 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Account Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href="/dashboard/landlord/verify">
                <DropdownMenuItem>Start Verification</DropdownMenuItem>
              </Link>
              <Link href="/dashboard/verification?type=property">
                <DropdownMenuItem>Verify Property</DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Details */}
          <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 md:p-8 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Basic Details</h2>
              <p className="text-sm text-muted-foreground mt-1">General information about the building.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField
                control={form.control as unknown}
                name="title"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Property name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Maple Court Apartments" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as unknown}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Textarea rows={4} placeholder="Anything tenants should know about the property." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as unknown}
                name="propertyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PROPERTY_TYPE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as unknown}
                name="floors"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Floors</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </section>

          {/* Address */}
          <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 md:p-8 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Address</h2>
              <p className="text-sm text-muted-foreground mt-1">Where is this property located?</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField
                control={form.control as unknown}
                name="address"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Street</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 12 Admiralty Way" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as unknown}
                name="area"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Area</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Lekki" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as unknown}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {NIGERIAN_STATES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as unknown}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={availableCities.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={availableCities.length > 0 ? 'Select city' : 'Pick a state first'} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableCities.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control as unknown}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal code (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 100001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </section>

          {/* Units */}
          <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 md:p-8 space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Units ({units.length})</h2>
                <p className="text-sm text-muted-foreground mt-1">Add address and details for each unit in this building.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button type="button" variant="secondary" onClick={addUnit} className="gap-2">
                  <Plus className="h-4 w-4" /> Add unit
                </Button>
              </div>
            </div>

            {/* Quick Setup Toolbar */}
            <div className="rounded-lg border border-outline-variant bg-surface-container-low p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Settings2 className="h-4 w-4" />
                <h3 className="text-sm font-semibold text-foreground">Quick setup</h3>
              </div>
              <p className="text-xs text-muted-foreground">Bulk-apply listing intent, price, and period to all units.</p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select value={quickListingType} onValueChange={(val) => setQuickListingType(val as ListingIntent)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Listing type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rent">For Rent</SelectItem>
                    <SelectItem value="short_let">Short-Let</SelectItem>
                    <SelectItem value="sale">For Sale</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="Base price (NGN)"
                  value={quickPrice}
                  onChange={(e) => setQuickPrice(e.target.value)}
                />
                {quickListingType === 'rent' && (
                  <Select value={quickPeriod} onValueChange={setQuickPeriod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RENT_PERIODS.map((rp) => (
                        <SelectItem key={rp.value} value={rp.value}>
                          {rp.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {quickListingType === 'short_let' && (
                  <Input
                    type="number"
                    placeholder="Min. stay (nights)"
                    value={quickMinStay}
                    onChange={(e) => setQuickMinStay(e.target.value)}
                  />
                )}
              </div>
              <Button type="button" size="sm" onClick={applyQuickSetup} className="w-full md:w-auto">
                Apply to all units
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {units.map((u) => (
                <div
                  key={u.id}
                  className="rounded-lg border border-outline-variant bg-surface-container-low p-5 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">Unit {u.unitNumber}</h3>
                    {units.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => removeUnit(u.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">Unit Name / No</label>
                      <Input
                        value={u.unitNumber}
                        onChange={(e) => updateUnit(u.id, { unitNumber: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">Bedrooms</label>
                      <Input
                        type="number"
                        min={0}
                        value={u.bedrooms}
                        onChange={(e) => updateUnit(u.id, { bedrooms: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">Bathrooms</label>
                      <Input
                        type="number"
                        min={0}
                        value={u.bathrooms}
                        onChange={(e) => updateUnit(u.id, { bathrooms: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">Size (M²)</label>
                      <Input
                        type="number"
                        min={0}
                        placeholder="Optional"
                        value={u.sizeSqm ?? ''}
                        onChange={(e) =>
                          updateUnit(u.id, {
                            sizeSqm: e.target.value ? parseFloat(e.target.value) : undefined,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Listing Intent</label>
                    <div className="flex flex-wrap gap-3 mt-2">
                      {['For Rent', 'Short-Let', 'For Sale'].map((intent) => {
                        const value = intent.toLowerCase().replace(' ', '_') as ListingIntent;
                        const active = u.listingType === value;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() =>
                              updateUnit(u.id, {
                                listingType: value,
                                isListed: false,
                                ...(value === 'short_let' ? { pricePeriod: 'night' } : {}),
                                ...(value === 'sale' ? { pricePeriod: 'total' } : {}),
                                ...(value === 'rent' ? { pricePeriod: 'month' } : {}),
                              })
                            }
                            className={[
                              'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                              active
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-outline-variant bg-surface-container-low text-foreground hover:bg-muted',
                            ].join(' ')}
                          >
                            {active && <Check className="h-4 w-4" />}
                            {intent}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {true && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">
                          {u.listingType === 'short_let'
                            ? 'Nightly Rate (NGN)'
                            : u.listingType === 'sale'
                              ? 'Outright Price (NGN)'
                              : 'Rent (NGN)'}
                        </label>
                        <Input
                          type="number"
                          min={0}
                          value={u.price || ''}
                          onChange={(e) => updateUnit(u.id, { price: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                      {u.listingType === 'rent' && (
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-muted-foreground">Period</label>
                          <Select value={u.pricePeriod} onValueChange={(val) => updateUnit(u.id, { pricePeriod: val })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {RENT_PERIODS.map((rp) => (
                                <SelectItem key={rp.value} value={rp.value}>
                                  {rp.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      {u.listingType === 'short_let' && (
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-muted-foreground">Min. Stay (nights)</label>
                          <Input
                            type="number"
                            min={1}
                            value={u.minimumStay ?? ''}
                            onChange={(e) =>
                              updateUnit(u.id, {
                                minimumStay: e.target.value ? parseInt(e.target.value) : undefined,
                              })
                            }
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Unit photos</label>
                    <DroppableArea
                      accept="image/jpeg,image/png,image/webp,image/heic"
                      maxSize={10 * 1024 * 1024}
                      multiple
                      files={unitPhotos[u.id] || []}
                      onFilesSelected={(files) =>
                        setUnitPhotos((cur) => ({
                          ...cur,
                          [u.id]: [...(cur[u.id] || []), ...files],
                        }))
                      }
                      onRemoveFile={(idx) =>
                        setUnitPhotos((cur) => ({
                          ...cur,
                          [u.id]: (cur[u.id] || []).filter((_, i) => i !== idx),
                        }))
                      }
                      className="min-h-[120px]"
                    >
                      <Upload className="h-5 w-5 mb-2 text-muted-foreground" />
                      <p className="font-medium text-sm text-foreground">Drop unit photos here, or click to browse</p>
                      <p className="text-xs text-muted-foreground">These images belong to this unit only.</p>
                    </DroppableArea>
                  </div>
                </div>
              ))}
            </div>

            {/* Default Fees */}
            <div className="rounded-lg border border-outline-variant bg-surface-container-low p-5 space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Default fees (applied when adding a tenant)</h3>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  placeholder="Caution deposit (NGN)"
                  value={defaultCaution}
                  onChange={(e) => setDefaultCaution(e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Service charge (NGN)"
                  value={defaultService}
                  onChange={(e) => setDefaultService(e.target.value)}
                />
              </div>
              <Button type="button" size="sm" onClick={applyDefaultFees} className="w-full md:w-auto">
                Apply to all units
              </Button>
            </div>
          </section>

          {/* Photos & Video */}
          <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 md:p-8 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Photos & Video</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Optional · helps listings stand out
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Photos</label>
                <DroppableArea
                  accept="image/jpeg,image/png,image/webp,image/heic"
                  maxSize={10 * 1024 * 1024}
                  multiple
                  files={photos}
                  onFilesSelected={(files) => setPhotos((cur) => [...cur, ...files.map((f) => ({ file: f, progress: 0, status: 'pending' }))])}
                  onRemoveFile={(idx) => setPhotos((cur) => cur.filter((_, i) => i !== idx))}
                  className="min-h-[180px]"
                >
                  <Upload className="h-6 w-6 mb-2 text-muted-foreground" />
                  <p className="font-medium text-sm text-foreground">Drop images here, or click to browse</p>
                  <p className="text-xs text-muted-foreground">JPEG, PNG, HEIC, or WebP up to 10MB</p>
                </DroppableArea>
              </div>
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Videos</label>
                <DroppableArea
                  accept="video/mp4,video/quicktime,video/webm"
                  maxSize={50 * 1024 * 1024}
                  multiple
                  files={videos}
                  onFilesSelected={(files) => setVideos((cur) => [...cur, ...files.map((f) => ({ file: f, progress: 0, status: 'pending' }))])}
                  onRemoveFile={(idx) => setVideos((cur) => cur.filter((_, i) => i !== idx))}
                  className="min-h-[180px]"
                >
                  <Film className="h-6 w-6 mb-2 text-muted-foreground" />
                  <p className="font-medium text-sm text-foreground">Drop videos here, or click to browse</p>
                  <p className="text-xs text-muted-foreground">MP4, MOV, or WebM up to 50MB</p>
                  <p className="text-xs text-muted-foreground mt-1">Short walk-around clips work best.</p>
                </DroppableArea>
              </div>
            </div>
          </section>

          {/* Amenities */}
          <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 md:p-8 space-y-5">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Amenities</h2>
              <p className="text-sm text-muted-foreground mt-1">Toggle features available in this building.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {AMENITIES.map((a) => {
                const active = amenities.includes(a.id);
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => toggleAmenity(a.id)}
                    className={[
                      'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                      active
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-outline-variant bg-surface-container-low text-foreground hover:bg-muted',
                    ].join(' ')}
                  >
                    {active && <Check className="h-4 w-4" />}
                    {a.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Footer */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => router.back()}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" size="lg" disabled={submitting || units.length === 0}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create property
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}