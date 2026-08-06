'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Store,
  ShieldCheck,
  Loader2,
  Building2,
  Plus,
  ArrowLeft,
  CheckCircle2,
  Pencil,
} from 'lucide-react';
import WizardShell from '@/app/dashboard/landlord/listing/new/wizard/WizardShell';
import { useToast } from '@/hooks/use-toast';

type ListingUnit = {
  id: string;
  listingId: string;
  unitNumber: string;
  buildingName: string | null;
  type: string;
  bedrooms: number | null;
  bathrooms: number | null;
  sizeSqm: string | null;
  rent: string;
  cautionDeposit: string | null;
  serviceCharge: string | null;
  listingTitle: string;
  listingType: string;
  propertyType: string | null;
  address: string;
  area: string;
  state: string;
};

const listingSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100),
  description: z.string().min(50, 'Description must be at least 50 characters').max(5000),
  listingType: z.enum(['rent', 'sale', 'short_let', 'share', 'commercial']),
  propertyType: z.enum(['apartment', 'house', 'duplex', 'land', 'office', 'shop', 'warehouse']).optional(),
  address: z.string().min(5, 'Address is required'),
  area: z.string().min(2, 'Area is required'),
  state: z.string().min(2).default('Lagos'),
  price: z.number().positive('Price must be positive'),
  pricePeriod: z.enum(['night', 'month', 'year', 'total']).optional(),
  cautionDeposit: z.number().nonnegative().optional(),
  serviceCharge: z.number().nonnegative().optional(),
  bedrooms: z.number().int().nonnegative().optional(),
  bathrooms: z.number().int().nonnegative().optional(),
  toilets: z.number().int().nonnegative().optional(),
  sizeSqm: z.number().positive().optional(),
  floorLevel: z.number().int().nonnegative().optional(),
  furnished: z.boolean().default(false),
  parkingSpaces: z.number().int().nonnegative().default(0),
  amenities: z.array(z.string()).optional(),
  availableFrom: z.string().datetime().optional(),
  minimumStay: z.number().int().positive().optional(),
});

type ListingInput = z.infer<typeof listingSchema>;

type Props = {
  listings: Array<{
    id: string;
    title: string;
    address: string;
    area: string;
    state: string;
    listingType: string;
    propertyType: string | null;
  }>;
  vacantUnits: ListingUnit[];
};

export default function AddListingClient({ listings, vacantUnits }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  const [autoFilledSource, setAutoFilledSource] = useState<string | null>(null);
  const [clientErrors, setClientErrors] = useState<string[]>([]);
  const [wizardMode, setWizardMode] = useState(false);

  const form = useForm<ListingInput>({
    resolver: zodResolver(listingSchema) as any,
    defaultValues: {
      title: '',
      description: '',
      listingType: 'rent',
      propertyType: 'apartment',
      address: '',
      area: '',
      state: 'Lagos',
      price: 0,
      pricePeriod: 'month',
      cautionDeposit: undefined,
      serviceCharge: undefined,
      bedrooms: 0,
      bathrooms: 0,
      toilets: 0,
      sizeSqm: undefined,
      floorLevel: 0,
      furnished: false,
      parkingSpaces: 0,
      amenities: [],
      availableFrom: undefined,
      minimumStay: undefined,
    },
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/verification/my');
        const data = await res.json();
        const overallStatus = data?.verification?.overallStatus;
        if (!cancelled) setVerificationStatus(overallStatus || null);
      } catch {
        if (!cancelled) setVerificationStatus(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const unit = vacantUnits.find((u) => u.id === selectedUnitId);
    if (!unit) {
      setAutoFilledSource(null);
      return;
    }

    setAutoFilledSource(`${unit.listingTitle} - Unit ${unit.unitNumber}`);

    form.setValue('title', `${unit.listingTitle} - Unit ${unit.unitNumber}`);
    form.setValue('listingType', (unit.listingType as ListingInput['listingType']) || 'rent');
    form.setValue('propertyType', (unit.propertyType as ListingInput['propertyType']) || undefined);
    form.setValue('address', unit.address);
    form.setValue('area', unit.area);
    form.setValue('state', unit.state || 'Lagos');
    form.setValue('price', Number(unit.rent || 0));
    form.setValue('cautionDeposit', unit.cautionDeposit ? Number(unit.cautionDeposit) : undefined);
    form.setValue('serviceCharge', unit.serviceCharge ? Number(unit.serviceCharge) : undefined);
    form.setValue('bedrooms', unit.bedrooms ?? 0);
    form.setValue('bathrooms', unit.bathrooms ?? 0);
    form.setValue('sizeSqm', unit.sizeSqm ? Number(unit.sizeSqm) : undefined);
    form.setValue('propertyType', (unit.propertyType as ListingInput['propertyType']) || undefined);
  }, [selectedUnitId, vacantUnits, form]);

  useEffect(() => {
    const currentType = form.getValues('listingType');
    if (currentType === 'short_let') {
      const currentPeriod = form.getValues('pricePeriod');
      if (currentPeriod !== 'night' && currentPeriod !== 'total') {
        form.setValue('pricePeriod', 'night');
      }
      setWizardMode(true);
    }
  }, [form.watch('listingType')]);

  const validateClientSide = (): boolean => {
    const values = form.getValues();
    const errors: string[] = [];

    if (!values.title?.trim()) errors.push('Title is required');
    if (!values.address?.trim()) errors.push('Address is required');
    if (!values.area?.trim()) errors.push('Area is required');
    if (!values.price || values.price <= 0) errors.push('Price must be greater than 0');

    setClientErrors(errors);
    return errors.length === 0;
  };

  const handleSubmitClick = () => {
    if (!selectedUnitId) {
      toast({
        title: 'Select a unit',
        description: 'Please select a vacant unit before publishing.',
        variant: 'destructive',
      });
      return;
    }
    if (!validateClientSide()) {
      return;
    }
    form.handleSubmit(onSubmit, (errors) => {
      const first = Object.values(errors)[0];
      toast({
        title: 'Check the form',
        description: (first as any)?.message || 'Please fix the highlighted fields.',
        variant: 'destructive',
      });
    })();
  };

  const onSubmit = async (data: ListingInput) => {
    setSubmitting(true);
    try {
      const { availableFrom, minimumStay, ...rest } = data as any;
      const payload = {
        ...rest,
        ...(availableFrom ? { availableFrom } : {}),
        ...(minimumStay ? { minimumStay } : {}),
      };

      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, status: 'active', unitId: selectedUnitId }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to create listing');
      }

      const listing = await res.json();
      toast({
        title: 'Listed',
        description: 'Your property is now live on the marketplace.',
      });
      router.push(`/dashboard/landlord/properties/${listing.id}`);
    } catch (error) {
      toast({
        title: 'Listing failed',
        description: error instanceof Error ? error.message : 'Unexpected error',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const safeVacantUnits = Array.isArray(vacantUnits) ? vacantUnits : [];

  if (safeVacantUnits.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">List to Marketplace</h1>
          <p className="text-muted-foreground mt-2">
            Create a live marketplace listing from a vacant unit in your properties.
          </p>
        </div>
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-12 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted/40 flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">No Vacant Units Available</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            To publish a listing to the marketplace, you need at least one vacant unit in your property portfolio.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild>
              <Link href="/dashboard/landlord/properties/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Property
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/landlord/properties">
                <ArrowLeft className="mr-2 h-4 w-4" />
                View My Properties
              </Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            You can also add a unit to an existing property from your properties list.
          </p>
        </div>
      </div>
    );
  }

  if (wizardMode) {
    return (
      <WizardShell
        onComplete={(listing) => {
          toast({
            title: 'Listing created',
            description: 'Your shortlet listing has been created.',
          });
          router.push(`/dashboard/landlord/properties/${listing.id}`);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">List to Marketplace</h1>
        <p className="text-muted-foreground mt-2">
          Create a live marketplace listing from a vacant unit in your properties.
        </p>
      </div>

      {clientErrors.length > 0 && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4">
          <p className="text-sm font-medium text-destructive mb-2">Fix the following before publishing:</p>
          <ul className="list-disc pl-5 text-sm text-destructive space-y-1">
            {clientErrors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest">
        <div className="p-6 border-b border-outline-variant">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold text-foreground">Marketplace Listing Details</h2>
            <p className="text-sm text-muted-foreground">
              {selectedUnitId
                ? 'Review and adjust the auto-filled details from your property data.'
                : 'Select a vacant unit to prefill the listing from your existing property data.'}
            </p>
          </div>
          {verificationStatus && verificationStatus !== 'certified' ? (
            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={() => router.push('/dashboard/verification?type=property')}
            >
              <ShieldCheck className="mr-2 h-4 w-4" />
              Property Verification
            </Button>
          ) : null}
        </div>

        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
              const first = Object.values(errors)[0];
              toast({
                title: 'Check the form',
                description: (first as any)?.message || 'Please fix the highlighted fields.',
                variant: 'destructive',
              });
            })} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1">Vacant Unit</label>
                  <Select value={selectedUnitId} onValueChange={(value) => {
                    setSelectedUnitId(value);
                    setClientErrors([]);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a vacant unit from your properties" />
                    </SelectTrigger>
                    <SelectContent>
                      {listings.map((listing) => {
                        const units = vacantUnits.filter((u) => u.listingId === listing.id);
                        if (!units.length) return null;
                        return (
                          <div key={listing.id}>
                            <p className="px-2 py-1 text-xs text-muted-foreground uppercase tracking-wide">{listing.title}</p>
                            {units.map((unit) => (
                              <SelectItem key={unit.id} value={unit.id}>
                                Unit {unit.unitNumber} {unit.buildingName ? `• ${unit.buildingName}` : ''}
                              </SelectItem>
                            ))}
                          </div>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Choose a unit to populate listing details from your property data.
                  </p>
                </div>

                {autoFilledSource && (
                  <div className="md:col-span-2 flex items-center gap-2 rounded-lg border border-outline-variant bg-background p-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="text-xs text-muted-foreground">Auto-filled from</span>
                    <Badge variant="secondary" className="text-xs">{autoFilledSource}</Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="ml-auto h-7 gap-1"
                      onClick={() => {
                        setAutoFilledSource(null);
                        setSelectedUnitId('');
                      }}
                    >
                      <Pencil className="h-3 w-3" />
                      Edit manually
                    </Button>
                  </div>
                )}

                <FormField
                  control={form.control as any}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Modern 3-Bed Apartment in Lekki" {...field} className="placeholder:text-foreground/40" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control as any}
                  name="listingType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Listing Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select listing type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="rent">For Rent</SelectItem>
                          <SelectItem value="sale">For Sale</SelectItem>
                          <SelectItem value="short_let">Short Let</SelectItem>
                          <SelectItem value="share">Shared Apartment</SelectItem>
                          <SelectItem value="commercial">Commercial</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control as any}
                  name="propertyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select property type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="apartment">Apartment</SelectItem>
                          <SelectItem value="house">House</SelectItem>
                          <SelectItem value="duplex">Duplex</SelectItem>
                          <SelectItem value="land">Land</SelectItem>
                          <SelectItem value="office">Office</SelectItem>
                          <SelectItem value="shop">Shop</SelectItem>
                          <SelectItem value="warehouse">Warehouse</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1">Address</label>
                  <Input placeholder="Full street address" {...form.register('address')} className="placeholder:text-foreground/40" />
                  {form.formState.errors.address && <p className="text-xs text-destructive mt-1">{form.formState.errors.address.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Area</label>
                  <Input placeholder="e.g., Lekki Phase 1" {...form.register('area')} className="placeholder:text-foreground/40" />
                  {form.formState.errors.area && <p className="text-xs text-destructive mt-1">{form.formState.errors.area.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">State</label>
                  <Input placeholder="e.g., Lagos" {...form.register('state')} className="placeholder:text-foreground/40" />
                  {form.formState.errors.state && <p className="text-xs text-destructive mt-1">{form.formState.errors.state.message}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Price {form.watch('listingType') === 'short_let' ? '(per night)' : form.watch('listingType') === 'sale' ? '(total price)' : '(per month)'}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="relative sm:col-span-2">
                      <span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground text-sm">₦</span>
                      <Input
                        type="number"
                        placeholder={form.watch('listingType') === 'short_let' ? 'e.g., 25,000' : '500,000'}
                        className="pl-8 placeholder:text-foreground/40"
                        {...form.register('price', { valueAsNumber: true })}
                      />
                      {form.formState.errors.price && <p className="text-xs text-destructive mt-1">{form.formState.errors.price.message}</p>}
                    </div>
                    <Select value={form.watch('pricePeriod')} onValueChange={(value) => form.setValue('pricePeriod', value as ListingInput['pricePeriod'])}>
                      <SelectTrigger>
                        <SelectValue placeholder={form.watch('listingType') === 'short_let' ? 'Per Night' : 'Per Month'} />
                      </SelectTrigger>
                      <SelectContent>
                        {form.watch('listingType') === 'short_let' ? (
                          <>
                            <SelectItem value="night">Per Night</SelectItem>
                            <SelectItem value="total">Total (One-time)</SelectItem>
                          </>
                        ) : (
                          <>
                            <SelectItem value="month">Per Month</SelectItem>
                            <SelectItem value="year">Per Year</SelectItem>
                            <SelectItem value="total">Total (One-time)</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  {form.watch('listingType') === 'short_let' && (
                    <p className="text-xs text-muted-foreground mt-1">Short-let pricing is typically set per night. Use Total only for fixed-stay packages.</p>
                  )}
                </div>

                <FormField
                  control={form.control as any}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea rows={5} placeholder="Describe the property..." {...field} className="placeholder:text-foreground/40" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmitClick}
                  disabled={submitting || !selectedUnitId || safeVacantUnits.length === 0}
                >
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Store className="mr-2 h-4 w-4" />
                  Publish to Marketplace
                </Button>
              </div>
              {(!selectedUnitId || safeVacantUnits.length === 0) && (
                <p className="text-xs text-muted-foreground text-right">
                  {safeVacantUnits.length === 0 ? 'Add a vacant unit to enable publishing.' : 'Select a vacant unit to continue.'}
                </p>
              )}
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
