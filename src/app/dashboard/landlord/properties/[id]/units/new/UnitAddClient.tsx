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

type Props = {
  listingId: string;
  orgId: string | null;
  listingTitle: string;
  existingUnits: string[];
};

function capitalizeWords(value: string) {
  return value
    .split(/[\s-]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
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

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">
          Add Unit to {capitalizeWords(listingTitle || 'this property')}
        </h1>
        <p className="text-zinc-500 mt-1">
          Create a new unit under <span className="font-medium">{capitalizeWords(listingTitle || 'this property')}</span>.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="listingTitle">Parent Property</Label>
            <Input id="listingTitle" value={capitalizeWords(listingTitle || '')} disabled className="bg-muted" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="unitNumber">Unit Number / Name</Label>
            <Input id="unitNumber" value={unitNumber} onChange={(e) => setUnitNumber(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Physical Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="listingType">Listing Intent</Label>
            <Select value={listingType} onValueChange={(value) => setListingType(value as typeof listingType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select listing intent" />
              </SelectTrigger>
              <SelectContent>
                {LISTING_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-zinc-500">This controls how this unit is listed and priced.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bedrooms">Bedrooms</Label>
            <Input id="bedrooms" type="number" value={bedrooms} onChange={(e) => setBedrooms(Number(e.target.value))} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bathrooms">Bathrooms</Label>
            <Input id="bathrooms" type="number" value={bathrooms} onChange={(e) => setBathrooms(Number(e.target.value))} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sizeSqm">Size (sqm)</Label>
            <Input id="sizeSqm" type="number" value={sizeSqm} onChange={(e) => setSizeSqm(e.target.value)} />
          </div>

          {showPriceInput && (
            <div className="space-y-2">
              <Label htmlFor="rent">{priceLabel}</Label>
              <Input id="rent" type="number" value={rent} onChange={(e) => setRent(e.target.value)} required={showPriceInput} />
            </div>
          )}

          {showRentCycle && (
            <div className="space-y-2">
              <Label htmlFor="pricePeriod">Payment Cycle</Label>
              <Select value={pricePeriod} onValueChange={setPricePeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select cycle" />
                </SelectTrigger>
                <SelectContent>
                  {RENT_CYCLE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="cautionDeposit">Caution Deposit</Label>
            <Input id="cautionDeposit" type="number" value={cautionDeposit} onChange={(e) => setCautionDeposit(e.target.value)} />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="serviceCharge">Service Charge</Label>
            <Input id="serviceCharge" type="number" value={serviceCharge} onChange={(e) => setServiceCharge(e.target.value)} />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>Unit Photos</Label>
            <DroppableArea
              accept="image/*"
              maxFiles={10}
              multiple
              files={photos.map((file) => ({ file, progress: 0, status: 'pending' as const }))}
              onFilesSelected={setPhotos}
              onRemoveFile={(index) => setPhotos((prev) => prev.filter((_, i) => i !== index))}
              showFileList
            >
              <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-white/[0.08] p-6 text-center">
                <p className="text-sm text-zinc-500">Drag and drop unit photos here, or click to browse</p>
              </div>
            </DroppableArea>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : 'Add Unit'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
